const plafonds = {
    "2017": { seul: 9658.13, couple: 15592.07 },
    "2018": { seul: 9820.46, couple: 15872.24 },
    "2019": { seul: 9951.84, couple: 16091.92 },
    "2020": { seul: 10068.00, couple: 16293.12 },
    "2021": { seul: 10183.20, couple: 16396.49 },
    "2022": { seul: 10265.16, couple: 16512.93 },
    "2023": { seul: 10320.07, couple: 16548.23 },
    "2024": { seul: 10536.50, couple: 16890.35 },
};

function genererTableauRessources() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const debutPeriode = new Date(document.getElementById("debutPeriode").value);
    const finPeriode = new Date(document.getElementById("finPeriode").value);
    const statut = document.getElementById("statut").value;

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

    if (!statut || isNaN(dateEffet.getTime()) || isNaN(debutPeriode.getTime()) || isNaN(finPeriode.getTime())) {
        return; // Ne rien afficher si les champs sont vides
    }

    // Générer le tableau pour le demandeur
    const tableDemandeur = createRessourceTable("Demandeur", debutPeriode, finPeriode);
    ressourcesContainer.appendChild(tableDemandeur);

    // Générer le tableau pour le conjoint si nécessaire
    if (statut === "couple") {
        const tableConjoint = createRessourceTable("Conjoint", debutPeriode, finPeriode);
        ressourcesContainer.appendChild(tableConjoint);
    }
}

function createRessourceTable(role, debutPeriode, finPeriode) {
    const tableContainer = document.createElement("div");
    tableContainer.classList.add("table-container");

    const title = document.createElement("h3");
    title.textContent = `Ressources du ${role}`;
    tableContainer.appendChild(title);

    const table = document.createElement("table");
    const header = document.createElement("tr");
    [
        "Mois",
        "Pension d'invalidité",
        "Salaires",
        "Indemnités journalières",
        "Chômage",
        "BIM (Capitaux placés)"
    ].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        header.appendChild(th);
    });
    table.appendChild(header);

    // Génération des mois dans la période
    let currentDate = new Date(debutPeriode);
    while (currentDate <= finPeriode) {
        const row = document.createElement("tr");

        // Colonne pour le mois
        const moisCell = document.createElement("td");
        moisCell.textContent = currentDate.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        // Colonnes pour les ressources
        ["invalidite", "salaires", "indemnites", "chomage", "bim"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_${type}_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);
        currentDate.setMonth(currentDate.getMonth() + 1); // Mois suivant
    }

    tableContainer.appendChild(table);
    return tableContainer;
}

function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const debutPeriode = new Date(document.getElementById("debutPeriode").value);
    const finPeriode = new Date(document.getElementById("finPeriode").value);

    if (!statut || isNaN(dateEffet.getTime()) || isNaN(debutPeriode.getTime()) || isNaN(finPeriode.getTime())) {
        alert("Veuillez saisir tous les champs nécessaires.");
        return;
    }

    const annee = dateEffet.getFullYear();
    const plafondAnnuel = plafonds[annee]?.[statut];
    if (!plafondAnnuel) {
        alert("Plafond introuvable pour l'année sélectionnée.");
        return;
    }
    const plafondTrimestriel = plafondAnnuel / 4;

    const result = document.getElementById("result");
    result.innerHTML = ""; // Réinitialise les résultats

    let currentDate = new Date(dateEffet);
    currentDate.setMonth(currentDate.getMonth() - currentDate.getMonth() % 3); // Début du trimestre
    const endOfCalculations = new Date(finPeriode);

    while (currentDate <= endOfCalculations) {
        const trimestreDetails = calculateQuarterlyRessources("Demandeur", currentDate);
        let totalTrimestre = trimestreDetails.total;

        if (statut === "couple") {
            const conjointDetails = calculateQuarterlyRessources("Conjoint", currentDate);
            totalTrimestre += conjointDetails.total;
        }

        const abattement = parseFloat(document.getElementById("abattement").value) || 0;
        const totalApresAbattement = totalTrimestre - abattement;

        // Affichage des résultats pour le trimestre
        const resultSection = document.createElement("div");
        resultSection.classList.add("result-section");
        resultSection.innerHTML = `
            <h2>Droits ASI au ${currentDate.toLocaleDateString("fr-FR")}</h2>
            <p>Total avant abattement : ${totalTrimestre.toFixed(2)} €</p>
            <p>Abattement : ${abattement.toFixed(2)} €</p>
            <p>Total après abattement : ${totalApresAbattement.toFixed(2)} €</p>
            <p>Plafond trimestriel applicable : ${plafondTrimestriel.toFixed(2)} €</p>
        `;

        if (totalApresAbattement > plafondTrimestriel) {
            resultSection.innerHTML += `<p>Pas de droits à l'ASI pour ce trimestre.</p>`;
        } else {
            const montantASI = plafondTrimestriel - totalApresAbattement;
            resultSection.innerHTML += `<p>Montant ASI : ${montantASI.toFixed(2)} €</p>`;
        }

        result.appendChild(resultSection);
        currentDate.setMonth(currentDate.getMonth() + 3); // Trimestre suivant
    }
}

function calculateQuarterlyRessources(role, startDate) {
    let total = 0;
    for (let i = 0; i < 3; i++) {
        const currentDate = new Date(startDate);
        currentDate.setMonth(startDate.getMonth() + i);

        ["invalidite", "salaires", "indemnites", "chomage", "bim"].forEach(type => {
            const input = document.getElementById(
                `${role.toLowerCase()}_${type}_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}`
            );
            total += parseFloat(input?.value) || 0;
        });
    }
    return { total };
}
