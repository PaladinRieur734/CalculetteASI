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
    const periodeDebut = new Date(document.getElementById("periodeDebut").value);
    const periodeFin = new Date(document.getElementById("periodeFin").value);

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

    if (!statut || isNaN(dateEffet.getTime()) || isNaN(periodeDebut.getTime()) || isNaN(periodeFin.getTime())) {
        return; // Ne rien afficher si les champs sont vides
    }

    // Génération du tableau pour le demandeur
    const tableDemandeur = createRessourceTable("Demandeur", periodeDebut, periodeFin);
    ressourcesContainer.appendChild(tableDemandeur);

    // Génération du tableau pour le conjoint si le statut est "couple"
    if (statut === "couple") {
        const tableConjoint = createRessourceTable("Conjoint", periodeDebut, periodeFin);
        ressourcesContainer.appendChild(tableConjoint);
    }
}

function createRessourceTable(role, periodeDebut, periodeFin) {
    const tableContainer = document.createElement("div");
    tableContainer.classList.add("table-container");

    const title = document.createElement("h3");
    title.textContent = `Ressources du ${role}`;
    tableContainer.appendChild(title);

    const table = document.createElement("table");
    const header = document.createElement("tr");

    // Ajout des colonnes fixes
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

    // Ajout des colonnes personnalisées
    customColumns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        header.appendChild(th);
    });

    // Ajout du bouton pour ajouter une colonne
    const thPlus = document.createElement("th");
    const btnPlus = document.createElement("button");
    btnPlus.textContent = "+";
    btnPlus.classList.add("add-column-btn");
    btnPlus.onclick = () => addCustomColumn();
    thPlus.appendChild(btnPlus);
    header.appendChild(thPlus);

    table.appendChild(header);

    // Génération des lignes de la période
    let currentMonth = new Date(periodeDebut);
    while (currentMonth <= periodeFin) {
        const row = document.createElement("tr");

        // Mois
        const moisCell = document.createElement("td");
        moisCell.textContent = currentMonth.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        // Colonnes fixes
        ["invalidite", "salaires", "indemnites", "chomage", "bim"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_${type}_${currentMonth.getMonth()}_${currentMonth.getFullYear()}`;
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
            input.id = `${role.toLowerCase()}_custom${index}_${currentMonth.getMonth()}_${currentMonth.getFullYear()}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);

        // Passer au mois suivant
        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    tableContainer.appendChild(table);
    return tableContainer;
}

function addCustomColumn() {
    const colName = prompt("Nom de la colonne :");
    if (colName) {
        customColumns.push(colName);
        genererTableauRessources();
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
        const trimestreResult = getTrimesterResult(current, statut, dateEffet);
        result.appendChild(trimestreResult);
        current.setMonth(current.getMonth() + 3);
    }
}

function getTrimesterResult(startMonth, statut, dateEffet) {
    const resultSection = document.createElement("div");
    resultSection.classList.add("result-section");

    const annee = startMonth.getFullYear();
    const plafondAnnuel = plafonds[annee]?.[statut];
    const plafondTrimestriel = plafondAnnuel ? plafondAnnuel / 4 : 0;

    let trimestreDetails = []; // Ajouter les détails mois par mois ici
    let totalRessources = 0;

    // Calcul des ressources pour le trimestre
    for (let i = 0; i < 3; i++) {
        const mois = new Date(startMonth);
        mois.setMonth(mois.getMonth() + i);
        const ressourcesMois = calculateMonthlyResources("Demandeur", mois);
        totalRessources += ressourcesMois.total;
        trimestreDetails.push({ mois: mois.toLocaleString("fr-FR", { month: "long", year: "numeric" }), ...ressourcesMois });
    }

    const abattement = parseFloat(document.getElementById("abattement").value) || 0;
    const totalApresAbattement = totalRessources - abattement;

    const titreResultats = document.createElement("h2");
    titreResultats.textContent = `Droits ASI au ${startMonth.toLocaleDateString("fr-FR")}`;
    resultSection.appendChild(titreResultats);

    trimestreDetails.forEach(detail => {
        resultSection.innerHTML += `
            <h4>${detail.mois}</h4>
            <table>
                <tr><td>Pension d'invalidité</td><td>${detail.invalidite.toFixed(2)} €</td></tr>
                <tr><td>Salaires</td><td>${detail.salaires.toFixed(2)} €</td></tr>
                <tr><td>Indemnités journalières</td><td>${detail.indemnites.toFixed(2)} €</td></tr>
                <tr><td>Chômage</td><td>${detail.chomage.toFixed(2)} €</td></tr>
                <tr><td>BIM</td><td>${detail.bim.toFixed(2)} €</td></tr>
                <tr><td><strong>Total mensuel</strong></td><td><strong>${detail.total.toFixed(2)} €</strong></td></tr>
            </table>
        `;
    });

    // Conclusion
    const conclusion = document.createElement("p");
    if (totalApresAbattement > plafondTrimestriel) {
        conclusion.textContent = `Les ressources de l'intéressé(e) au cours du trimestre de référence, soit ${totalApresAbattement.toFixed(2)} € étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l’allocation supplémentaire d’invalidité ne pouvait pas lui être attribuée à effet du ${startMonth.toLocaleDateString("fr-FR")}.`;
    } else {
        const montantASI = plafondTrimestriel - totalApresAbattement;
        const montantMensuelASI = montant
                const montantMensuelASI = montantASI / 3;
        conclusion.textContent = `Le montant trimestriel de l’allocation supplémentaire à servir était donc de ${montantASI.toFixed(2)} € (${plafondTrimestriel.toFixed(2)} € [plafond] – ${totalApresAbattement.toFixed(2)} € [ressources]). Seuls des arrérages d’un montant mensuel de ${montantMensuelASI.toFixed(2)} € étaient dus à compter du ${startMonth.toLocaleDateString("fr-FR")}.`;
    }

    resultSection.appendChild(conclusion);
    return resultSection;
}

function calculateMonthlyResources(role, mois) {
    const invalidite = parseFloat(document.getElementById(`${role.toLowerCase()}_invalidite_${mois.getMonth()}_${mois.getFullYear()}`)?.value) || 0;
    const salaires = parseFloat(document.getElementById(`${role.toLowerCase()}_salaires_${mois.getMonth()}_${mois.getFullYear()}`)?.value) || 0;
    const indemnites = parseFloat(document.getElementById(`${role.toLowerCase()}_indemnites_${mois.getMonth()}_${mois.getFullYear()}`)?.value) || 0;
    const chomage = parseFloat(document.getElementById(`${role.toLowerCase()}_chomage_${mois.getMonth()}_${mois.getFullYear()}`)?.value) || 0;
    const bim = (parseFloat(document.getElementById(`${role.toLowerCase()}_bim_${mois.getMonth()}_${mois.getFullYear()}`)?.value) || 0) * 0.03 / 4;

    let customTotal = 0;
    customColumns.forEach((col, index) => {
        customTotal += parseFloat(document.getElementById(`${role.toLowerCase()}_custom${index}_${mois.getMonth()}_${mois.getFullYear()}`)?.value) || 0;
    });

    const total = invalidite + salaires + indemnites + chomage + bim + customTotal;
    return { invalidite, salaires, indemnites, chomage, bim, customTotal, total };
}

