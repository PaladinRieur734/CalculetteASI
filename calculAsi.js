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
    const statut = document.getElementById("statut").value;

    if (isNaN(dateEffet.getTime())) {
        alert("Veuillez entrer une date d'effet valide.");
        return;
    }

    if (!statut) {
        alert("Veuillez sélectionner un statut.");
        return;
    }

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

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
        "Chômage",
        "BIM (Capitaux placés)",
        "Autres ressources",
    ].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        header.appendChild(th);
    });
    table.appendChild(header);

    // Génération des mois dans l'ordre inversé
    for (let i = 3; i >= 1; i--) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const row = document.createElement("tr");

        // Colonne pour le mois
        const moisCell = document.createElement("td");
        moisCell.textContent = mois.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        // Colonnes pour les ressources
        ["invalidite", "salaires", "indemnites", "chomage", "bim", "autres"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_${type}M${4 - i}`; // Identifiant unique par rôle
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

function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);

    if (isNaN(dateEffet.getTime())) {
        alert("Veuillez entrer une date d'effet valide.");
        return;
    }

    if (!statut) {
        alert("Veuillez sélectionner un statut.");
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

    // Nouvelle section pour les résultats successifs
    const resultSection = document.createElement("div");
    resultSection.classList.add("result-section");

    // Calcul des ressources pour le demandeur
    const demandeurRessources = calculateRessources("Demandeur", dateEffet);

    // Calcul des ressources pour le conjoint si le statut est "couple"
    let conjointRessources = null;
    if (statut === "couple") {
        conjointRessources = calculateRessources("Conjoint", dateEffet);
    }

    // Total des ressources
    const totalRessources = demandeurRessources.total + (conjointRessources ? conjointRessources.total : 0);
    const totalRessourcesApresAbattement = totalRessources - demandeurRessources.abattement;

    // Résultat détaillé pour le demandeur
    let resultHTML = `<h3>Ressources détaillées pour le demandeur</h3>`;
    demandeurRessources.details.forEach(detail => {
        resultHTML += detail;
    });

    // Résultat détaillé pour le conjoint (si applicable)
    if (conjointRessources) {
        resultHTML += `<h3>Ressources détaillées pour le conjoint</h3>`;
        conjointRessources.details.forEach(detail => {
            resultHTML += detail;
        });
    }

    // Résumé des calculs
    resultHTML += `
        <h3>Résumé du trimestre</h3>
        <table>
            <tr><td><strong>Total avant abattement</strong></td><td><strong>${totalRessources.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Abattement appliqué</strong></td><td><strong>${demandeurRessources.abattement.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Total après abattement</strong></td><td><strong>${totalRessourcesApresAbattement.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Plafond trimestriel applicable</strong></td><td><strong>${plafondTrimestriel.toFixed(2)} €</strong></td></tr>
        </table>`;

    // Conclusion
    if (totalRessourcesApresAbattement > plafondTrimestriel) {
        resultHTML += `<p>Les ressources combinées au cours du trimestre de référence, soit ${totalRessourcesApresAbattement.toFixed(2)} € étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l’allocation supplémentaire d’invalidité ne pouvait pas être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    } else {
        const montantASI = plafondTrimestriel - totalRessourcesApresAbattement;
        const montantMensuelASI = montantASI / 3;
        resultHTML += `<p>Le montant trimestriel de l’allocation supplémentaire à servir était donc de ${montantASI.toFixed(2)} € (${plafondTrimestriel.toFixed(2)} € [plafond] – ${totalRessourcesApresAbattement.toFixed(2)} € [ressources]). Seuls des arrérages d’un montant mensuel de ${montantMensuelASI.toFixed(2)} € étaient dus à compter du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    }

    resultSection.innerHTML = resultHTML;
    result.appendChild(resultSection); // Ajoute les résultats à la suite
}

function calculateRessources(role, dateEffet) {
    const details = [];
    let total = 0;

    for (let i = 3; i >= 1; i--) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const invalidite = parseFloat(document.getElementById(`${role.toLowerCase()}_invaliditeM${4 - i}`).value) || 0;
        const salaires = parseFloat(document.getElementById(`${role.toLowerCase()}_salairesM${4 - i}`).value) || 0;
        const indemnites = parseFloat(document.getElementById(`${role.toLowerCase()}_indemnitesM${4 - i}`).value) || 0;
        const chomage = parseFloat(document.getElementById(`${role.toLowerCase()}_chomageM${4 - i}`).value) || 0;
        const bimBrut = parseFloat(document.getElementById(`${role.toLowerCase()}_bimM${4 - i}`).value) || 0;
        const bim = (bimBrut * 0.03) / 4;
        const autres = parseFloat(document.getElementById(`${role.toLowerCase()}_autresM${4 - i}`).value) || 0;

        const moisTotal = invalidite + salaires + indemnites + chomage + bim + autres;
        total += moisTotal;

        details.push(`
            <h4>${mois.toLocaleString("fr-FR", { month: "long", year: "numeric" })}</h4>
            <table>
                <tr><td>Pension d'invalidité</td><td>${invalidite.toFixed(2)} €</td></tr>
                <tr><td>Salaires</td><td>${salaires.toFixed(2)} €</td></tr>
                <tr><td>Indemnités journalières</td><td>${indemnites.toFixed(2)} €</td></tr>
                <tr><td>Chômage</td><td>${chomage.toFixed(2)} €</td></tr>
                <tr><td>BIM (Capitaux placés)</td><td>${bim.toFixed(2)} €</td></tr>
                <tr><td>Autres ressources</td><td>${autres.toFixed(2)} €</td></tr>
                <tr><td><strong>Total mensuel</strong></td><td><strong>${moisTotal.toFixed(2)} €</strong></td></tr>
            </table>
        `);
    }

    return { total, details, abattement: 0 }; // Abattement peut être modifié si nécessaire
}
