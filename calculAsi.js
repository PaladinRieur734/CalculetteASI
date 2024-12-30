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
    const dateDebut = new Date(document.getElementById("dateDebut").value);
    const dateFin = new Date(document.getElementById("dateFin").value);
    const statut = document.getElementById("statut").value;

    if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
        alert("Veuillez entrer une période valide.");
        return;
    }

    if (dateDebut > dateFin) {
        alert("La date de début doit être antérieure à la date de fin.");
        return;
    }

    if (!statut) {
        alert("Veuillez sélectionner un statut.");
        return;
    }

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

    const tableDemandeur = createRessourceTable("Demandeur", dateDebut, dateFin);
    ressourcesContainer.appendChild(tableDemandeur);

    if (statut === "couple") {
        const tableConjoint = createRessourceTable("Conjoint", dateDebut, dateFin);
        ressourcesContainer.appendChild(tableConjoint);
    }
}

function createRessourceTable(role, dateDebut, dateFin) {
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

    let currentDate = new Date(dateFin);
    while (currentDate >= dateDebut) {
        const row = document.createElement("tr");
        const moisCell = document.createElement("td");
        moisCell.textContent = currentDate.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        ["invalidite", "salaires", "indemnites", "chomage", "bim", "autres"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_${type}_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);
        currentDate.setMonth(currentDate.getMonth() - 1);
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
    result.innerHTML = ""; // Réinitialise les résultats

    const demandeurRessources = calculateRessources("Demandeur", dateEffet);
    const conjointRessources = statut === "couple" ? calculateRessources("Conjoint", dateEffet) : null;

    const totalRessources = demandeurRessources.total + (conjointRessources ? conjointRessources.total : 0);
    const totalRessourcesApresAbattement = totalRessources - demandeurRessources.abattement;

    result.innerHTML += `<h3>Résumé des ressources</h3>`;
    demandeurRessources.details.forEach(detail => {
        result.innerHTML += detail;
    });

    if (conjointRessources) {
        result.innerHTML += `<h3>Ressources du conjoint</h3>`;
        conjointRessources.details.forEach(detail => {
            result.innerHTML += detail;
        });
    }

    result.innerHTML += `
        <h3>Total des ressources</h3>
        <table>
            <tr><td><strong>Total avant abattement</strong></td><td><strong>${totalRessources.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Abattement appliqué</strong></td><td><strong>${demandeurRessources.abattement.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Total après abattement</strong></td><td><strong>${totalRessourcesApresAbattement.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Plafond trimestriel applicable</strong></td><td><strong>${plafondTrimestriel.toFixed(2)} €</strong></td></tr>
        </table>`;

    // Conclusion
    if (totalRessourcesApresAbattement > plafondTrimestriel) {
        result.innerHTML += `<p>Les ressources de l'intéressé(e) au cours du trimestre de référence, soit ${totalRessourcesApresAbattement.toFixed(2)} € étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l’allocation supplémentaire d’invalidité ne pouvait pas lui être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    } else {
        const montantASI = plafondTrimestriel - totalRessourcesApresAbattement;
        const montantMensuelASI = montantASI / 3;
        result.innerHTML += `<p>Le montant trimestriel de l’allocation supplémentaire à servir à l'intéressé(e) était donc de ${montantASI.toFixed(2)} € (${plafondTrimestriel.toFixed(2)} € [plafond] – ${totalRessourcesApresAbattement.toFixed(2)} € [ressources]). Seuls des arrérages d’un montant mensuel de ${montantMensuelASI.toFixed(2)} € lui étaient dus à compter du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    }
}

function calculateRessources(role, dateEffet) {
    const resources = [];
    let total = 0;

    for (let i = 1; i <= 3; i++) {
        const invalidite = parseFloat(document.getElementById(`${role.toLowerCase()}_invaliditeM${i}`).value) || 0;
        const salaires = parseFloat(document.getElementById(`${role.toLowerCase()}_salairesM${i}`).value) || 0;
        const indemnites = parseFloat(document.getElementById(`${role.toLowerCase()}_indemnitesM${i}`).value) || 0;
        const chomage = parseFloat(document.getElementById(`${role.toLowerCase()}_chomageM${i}`).value) || 0;
        const bimBrut = parseFloat(document.getElementById(`${role.toLowerCase()}_bimM${i}`).value) || 0;
        const bim = (bimBrut * 0.03) / 4;
        const autres = parseFloat(document.getElementById(`${role.toLowerCase()}_autresM${i}`).value) || 0;

        const moisTotal = invalidite + salaires + indemnites + chomage + bim + autres;
        total += moisTotal;

        resources.push(`
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

    return { total, details: resources, abattement: 0 };
}
