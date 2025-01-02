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

let customColumns = [];

function genererTableauRessources() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const statut = document.getElementById("statut").value;
    const debutPeriode = new Date(document.getElementById("debutPeriode").value);
    const finPeriode = new Date(document.getElementById("finPeriode").value);

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

    if (!statut || isNaN(dateEffet.getTime()) || isNaN(debutPeriode.getTime()) || isNaN(finPeriode.getTime())) {
        return; // Ne rien afficher si les champs sont vides ou invalides
    }

    // Génération du tableau pour le demandeur
    const tableDemandeur = createRessourceTable("Demandeur", debutPeriode, finPeriode);
    ressourcesContainer.appendChild(tableDemandeur);

    // Génération du tableau pour le conjoint si le statut est "couple"
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

    // Ajouter les colonnes personnalisées dynamiques
    customColumns.forEach(colName => {
        const th = document.createElement("th");
        th.textContent = colName;
        header.appendChild(th);
    });

    // Ajouter la colonne "+" pour ajouter de nouvelles colonnes
    const addColumnButtonCell = document.createElement("th");
    const addButton = document.createElement("button");
    addButton.textContent = "+";
    addButton.classList.add("add-column-btn");
    addButton.onclick = () => addCustomColumn();
    addColumnButtonCell.appendChild(addButton);
    header.appendChild(addColumnButtonCell);

    table.appendChild(header);

    // Génération des mois entre la période spécifiée
    const current = new Date(debutPeriode);
    while (current <= finPeriode) {
        const row = document.createElement("tr");

        // Colonne pour le mois
        const moisCell = document.createElement("td");
        moisCell.textContent = current.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        // Colonnes pour les ressources
        ["invalidite", "salaires", "indemnites", "chomage", "bim"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_${type}_${current.getMonth()}_${current.getFullYear()}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        // Colonnes personnalisées
        customColumns.forEach((col, index) => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_custom${index}_${current.getMonth()}_${current.getFullYear()}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);
        current.setMonth(current.getMonth() + 1);
    }

    tableContainer.appendChild(table);

    return tableContainer;
}

function addCustomColumn() {
    const columnName = prompt("Nom de la nouvelle colonne:");
    if (columnName) {
        customColumns.push(columnName);
        genererTableauRessources(); // Regénérer le tableau avec la nouvelle colonne
    }
}

function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const debutPeriode = new Date(document.getElementById("debutPeriode").value);
    const finPeriode = new Date(document.getElementById("finPeriode").value);

    if (!statut || isNaN(dateEffet.getTime()) || isNaN(debutPeriode.getTime()) || isNaN(finPeriode.getTime())) {
        return; // Ne rien calculer si les champs sont vides
    }

    const result = document.getElementById("result");
    result.innerHTML = ""; // Réinitialiser les résultats

    let current = new Date(debutPeriode);
    while (current <= finPeriode) {
        const trimestre = getTrimester(current, dateEffet, statut);
        result.appendChild(trimestre);
        current.setMonth(current.getMonth() + 3);
    }
}

function getTrimester(startMonth, dateEffet, statut) {
    const resultSection = document.createElement("div");
    resultSection.classList.add("result-section");

    const annee = startMonth.getFullYear();
    const plafondAnnuel = plafonds[annee]?.[statut];
    const plafondTrimestriel = plafondAnnuel ? plafondAnnuel / 4 : 0;

    const trimestreDetails = []; // Ajouter les détails mois par mois ici
    const totalRessources = 0; // Calcul à compléter pour chaque trimestre
    const abattement = parseFloat(document.getElementById("abattement").value) || 0;
    const totalApresAbattement = totalRessources - abattement;

    const titreResultats = document.createElement("h2");
    titreResultats.textContent = `Droits ASI au ${startMonth.toLocaleDateString("fr-FR")}`;
    resultSection.appendChild(titreResultats);

    // Ajoutez ici les détails des ressources mois par mois...

    // Conclusion
    const conclusion = document.createElement("p");
    if (totalApresAbattement > plafondTrimestriel) {
        conclusion.textContent = `Les ressources trimestrielles, soit ${totalApresAbattement.toFixed(2)} €, dépassent le plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €. Aucun droit à l’ASI n’est attribué.`;
    } else {
        const montantASI = plafondTrimestriel - totalApresAbattement;
        const montantMensuelASI = montantASI / 3;
        conclusion.textContent = `Le montant trimestriel de l’ASI est de ${montantASI.toFixed(2)} € (${plafondTrimestriel.toFixed(2)} € - ${totalApresAbattement.toFixed(2)} €). Montant mensuel dû : ${montantMensuelASI.toFixed(2)} €.`;
    }
    resultSection.appendChild(conclusion);

    return resultSection;
}
