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

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

    if (!statut || isNaN(dateEffet.getTime())) {
        return; // Ne rien afficher si les champs sont vides
    }

    // Génération du tableau pour le demandeur
    const tableDemandeur = createRessourceTable("Demandeur", dateEffet);
    ressourcesContainer.appendChild(tableDemandeur);

    // Génération du tableau pour le conjoint si le statut est "couple"
    if (statut === "couple") {
        const tableConjoint = createRessourceTable("Conjoint", dateEffet);
        ressourcesContainer.appendChild(tableConjoint);
    }
}

function createRessourceTable(role, dateEffet) {
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
        "Chômage"
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

    // Génération des mois dans l'ordre inversé pour le trimestre
    const moisStart = getPreviousQuarter(dateEffet);
    for (let i = 0; i < 3; i++) {
        const mois = new Date(moisStart);
        mois.setMonth(mois.getMonth() + i);

        const row = document.createElement("tr");

        // Colonne pour le mois
        const moisCell = document.createElement("td");
        moisCell.textContent = mois.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        // Colonnes pour les ressources
        ["invalidite", "salaires", "indemnites", "chomage"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_${type}M${i + 1}`;
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
            input.id = `${role.toLowerCase()}_custom${index}M${i + 1}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);
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

function getPreviousQuarter(dateEffet) {
    const mois = dateEffet.getMonth();
    const trimestre = Math.floor(mois / 3);
    const moisStart = trimestre * 3 - 3;
    return new Date(dateEffet.getFullYear(), moisStart, 1);
}

function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);

    if (!statut || isNaN(dateEffet.getTime())) {
        return; // Ne rien calculer si les champs sont vides
    }

    // Obtenir l'année de la date d'effet
    let annee = dateEffet.getFullYear();

    // Vérifier si la date d'effet est dans le premier trimestre
    const premierJanvier = new Date(annee, 0, 1); // 1er janvier de l'année
    const premierAvril = new Date(annee, 3, 1); // 1er avril de l'année

    // Si la date est dans le premier trimestre, on utilise l'année précédente
    if (dateEffet >= premierJanvier && dateEffet < premierAvril) {
        annee -= 1; // Utiliser l'année précédente
    }

    // Vérifier si l'année existe dans les plafonds
    if (!plafonds[annee]) {
        alert("Le plafond pour l'année " + annee + " n'est pas défini.");
        return; // Sortir si l'année n'a pas de plafond défini
    }

    // Récupérer le plafond de l'année
    const plafondAnnuel = plafonds[annee]?.[statut];
    const plafondTrimestriel = plafondAnnuel ? plafondAnnuel / 4 : 0;

    const result = document.getElementById("result");
    const resultSection = document.createElement("div");
    resultSection.classList.add("result-section");

    // Titre des résultats
    const titreResultats = document.createElement("h2");
    titreResultats.textContent = `Droits ASI au ${dateEffet.toLocaleDateString("fr-FR")}`;
    resultSection.appendChild(titreResultats);

    const demandeurRessources = calculateRessources("Demandeur", dateEffet);
    let conjointRessources = null;

    if (statut === "couple") {
        conjointRessources = calculateRessources("Conjoint", dateEffet);
    }

    const totalRessources = demandeurRessources.total + (conjointRessources ? conjointRessources.total : 0);
    const abattement = parseFloat(document.getElementById("abattement").value) || 0;
    const totalRessourcesApresAbattement = totalRessources - abattement;

    // Détails mois par mois pour le demandeur
    resultSection.innerHTML += generateMonthlyDetails(demandeurRessources.details, "Demandeur");

    // Détails mois par mois pour le conjoint (si applicable)
    if (conjointRessources) {
        resultSection.innerHTML += generateMonthlyDetails(conjointRessources.details, "Conjoint");
    }

    // Résumé trimestriel
    resultSection.innerHTML += `
        <h3>Résumé du trimestre</h3>
        <table>
            <tr><td><strong>Total avant abattement</strong></td><td><strong>${totalRessources.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Abattement appliqué</strong></td><td><strong>${abattement.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Total après abattement</strong></td><td><strong>${totalRessourcesApresAbattement.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Plafond trimestriel applicable</strong></td><td><strong>${plafondTrimestriel.toFixed(2)} €</strong></td></tr>
        </table>`;

    // Conclusion
    if (totalRessourcesApresAbattement > plafondTrimestriel) {
        resultSection.innerHTML += `<p>Les ressources combinées au cours du trimestre de référence, soit ${totalRessourcesApresAbattement.toFixed(2)} € étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l’allocation supplémentaire d’invalidité ne pouvait pas être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    } else {
        const montantASI = plafondTrimestriel - totalRessourcesApresAbattement;
        const montantMensuelASI = montantASI / 3;
        resultSection.innerHTML += `<p>Le montant trimestriel de l’allocation supplémentaire à servir était donc de ${montantASI.toFixed(2)} € (${plafondTrimestriel.toFixed(2)} € [plafond] – ${totalRessourcesApresAbattement.toFixed(2)} € [ressources]). Seuls des arrérages d’un montant mensuel de ${montantMensuelASI.toFixed(2)} € étaient dus à compter du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    }

    result.appendChild(resultSection);
}

function calculateRessources(role, dateEffet) {
    const details = [];
    let total = 0;

    const moisStart = getPreviousQuarter(dateEffet);
    for (let i = 0; i < 3; i++) {
        const mois = new Date(moisStart);
        mois.setMonth(mois.getMonth() + i);

        const invalidite = parseFloat(document.getElementById(`${role.toLowerCase()}_invaliditeM${i + 1}`).value) || 0;
        const salaires = parseFloat(document.getElementById(`${role.toLowerCase()}_salairesM${i + 1}`).value) || 0;
        const indemnites = parseFloat(document.getElementById(`${role.toLowerCase()}_indemnitesM${i + 1}`).value) || 0;
        const chomage = parseFloat(document.getElementById(`${role.toLowerCase()}_chomageM${i + 1}`).value) || 0;

        let customTotal = 0;
        customColumns.forEach((col, index) => {
            const customInput = parseFloat(document.getElementById(`${role.toLowerCase()}_custom${index}M${i + 1}`).value) || 0;
            customTotal += customInput;
        });

        const moisTotal = invalidite + salaires + indemnites + chomage + customTotal;
        total += moisTotal;

        details.push({
            mois: mois.toLocaleString("fr-FR", { month: "long", year: "numeric" }),
            invalidite,
            salaires,
            indemnites,
            chomage,
            customTotal,
            moisTotal,
        });
    }

    return { total, details };
}

function generateMonthlyDetails(details, role) {
    let html = `<h4>Détails des ressources pour ${role}</h4>`;
    details.forEach(detail => {
        html += `
            <h5>${detail.mois}</h5>
            <table>
                <tr><td>Pension d'invalidité</td><td>${detail.invalidite.toFixed(2)} €</td></tr>
                <tr><td>Salaires</td><td>${detail.salaires.toFixed(2)} €</td></tr>
                <tr><td>Indemnités journalières</td><td>${detail.indemnites.toFixed(2)} €</td></tr>
                <tr><td>Chômage</td><td>${detail.chomage.toFixed(2)} €</td></tr>
                ${detail.customTotal > 0 ? `<tr><td>Colonnes personnalisées</td><td>${detail.customTotal.toFixed(2)} €</td></tr>` : ''}
                <tr><td><strong>Total du mois</strong></td><td><strong>${detail.moisTotal.toFixed(2)} €</strong></td></tr>
            </table>
        `;
    });
    return html;
}
