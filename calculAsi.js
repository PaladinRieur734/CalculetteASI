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

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

    if (!statut || isNaN(dateEffet.getTime())) return;

    const trimestre = obtenirTrimestrePrecedent(dateEffet);
    const tableDemandeur = creerTableRessources("Demandeur", trimestre);
    ressourcesContainer.appendChild(tableDemandeur);

    if (statut === "couple") {
        const tableConjoint = creerTableRessources("Conjoint", trimestre);
        ressourcesContainer.appendChild(tableConjoint);
    }
}

function obtenirTrimestrePrecedent(dateEffet) {
    const moisEffet = dateEffet.getMonth();
    const anneeEffet = dateEffet.getFullYear();
    const trimestre = [];

    for (let i = 1; i <= 3; i++) {
        const mois = new Date(anneeEffet, moisEffet - i, 1);
        trimestre.push(mois.toLocaleString("fr-FR", { month: "long", year: "numeric" }));
    }

    return trimestre;
}

function creerTableRessources(role, trimestre) {
    const tableContainer = document.createElement("div");
    const table = document.createElement("table");

    const headerRow = document.createElement("tr");
    ["Mois", "Pension", "Salaires", "Indemnités", "Chômage", "BIM"].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    trimestre.forEach(mois => {
        const row = document.createElement("tr");
        const moisCell = document.createElement("td");
        moisCell.textContent = mois;
        row.appendChild(moisCell);

        ["pension", "salaire", "indemnite", "chomage", "bim"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.min = 0;
            input.placeholder = "€";
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);
    });

    tableContainer.appendChild(table);
    return tableContainer;
}

function calculerASI() {
    const statut = document.getElementById("statut").value;
    const abattement = parseFloat(document.getElementById("abattement").value) || 0;
    const result = document.getElementById("result");

    result.innerHTML = ""; // Réinitialise les résultats
    const sectionResultat = document.createElement("div");
    sectionResultat.textContent = `À venir : calculs et résultats à afficher.`;
    result.appendChild(sectionResultat);
}
function calculateRessources(role, trimestre) {
    const details = [];
    let total = 0;

    trimestre.forEach((mois, index) => {
        const pension = parseFloat(document.querySelector(`#${role.toLowerCase()}_pensionM${index + 1}`).value) || 0;
        const salaire = parseFloat(document.querySelector(`#${role.toLowerCase()}_salaireM${index + 1}`).value) || 0;
        const indemnite = parseFloat(document.querySelector(`#${role.toLowerCase()}_indemniteM${index + 1}`).value) || 0;
        const chomage = parseFloat(document.querySelector(`#${role.toLowerCase()}_chomageM${index + 1}`).value) || 0;
        const bim = parseFloat(document.querySelector(`#${role.toLowerCase()}_bimM${index + 1}`).value) || 0;

        const moisTotal = pension + salaire + indemnite + chomage + bim;
        total += moisTotal;

        details.push({
            mois,
            pension,
            salaire,
            indemnite,
            chomage,
            bim,
            moisTotal,
        });
    });

    return { total, details };
}

function generateMonthlyDetails(details, role) {
    let html = `<h4>Détails des ressources pour ${role}</h4>`;
    details.forEach(detail => {
        html += `
            <h5>${detail.mois}</h5>
            <table>
                <tr><td>Pension</td><td>${detail.pension.toFixed(2)} €</td></tr>
                <tr><td>Salaires</td><td>${detail.salaire.toFixed(2)} €</td></tr>
                <tr><td>Indemnités journalières</td><td>${detail.indemnite.toFixed(2)} €</td></tr>
                <tr><td>Chômage</td><td>${detail.chomage.toFixed(2)} €</td></tr>
                <tr><td>BIM</td><td>${detail.bim.toFixed(2)} €</td></tr>
                <tr><td><strong>Total mensuel</strong></td><td><strong>${detail.moisTotal.toFixed(2)} €</strong></td></tr>
            </table>`;
    });
    return html;
}
function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);

    if (!statut || isNaN(dateEffet.getTime())) {
        alert("Veuillez sélectionner un statut et une date d'effet valides.");
        return;
    }

    const trimestre = getPreviousTrimestre(dateEffet);

    const demandeurRessources = calculateRessources("Demandeur", trimestre);
    let conjointRessources = null;

    if (statut === "couple") {
        conjointRessources = calculateRessources("Conjoint", trimestre);
    }

    const totalRessources = demandeurRessources.total + (conjointRessources ? conjointRessources.total : 0);
    const plafondAnnuel = getPlafondAnnuel(dateEffet, statut);
    const plafondTrimestriel = plafondAnnuel / 4;
    const abattement = parseFloat(document.getElementById("abattement").value) || 0;
    const totalApresAbattement = totalRessources - abattement;

    const result = document.getElementById("result");
    const resultSection = document.createElement("div");
    resultSection.classList.add("result-section");

    // Titre des résultats
    const titreResultats = document.createElement("h2");
    titreResultats.textContent = `Droits ASI au ${dateEffet.toLocaleDateString("fr-FR")}`;
    resultSection.appendChild(titreResultats);

    // Ajout des détails des ressources
    resultSection.innerHTML += generateMonthlyDetails(demandeurRessources.details, "Demandeur");
    if (conjointRessources) {
        resultSection.innerHTML += generateMonthlyDetails(conjointRessources.details, "Conjoint");
    }

    // Résumé des ressources trimestrielles
    resultSection.innerHTML += `
        <h3>Résumé du trimestre</h3>
        <table>
            <tr><td><strong>Total avant abattement</strong></td><td><strong>${totalRessources.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Abattement</strong></td><td><strong>${abattement.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Total après abattement</strong></td><td><strong>${totalApresAbattement.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Plafond trimestriel</strong></td><td><strong>${plafondTrimestriel.toFixed(2)} €</strong></td></tr>
        </table>`;

    // Conclusion
    if (totalApresAbattement > plafondTrimestriel) {
        resultSection.innerHTML += `<p>Les ressources trimestrielles, soit ${totalApresAbattement.toFixed(2)} €, étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l’allocation supplémentaire d’invalidité ne pouvait pas être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    } else {
        const montantASI = plafondTrimestriel - totalApresAbattement;
        const montantMensuel = montantASI / 3;
        resultSection.innerHTML += `<p>Le montant trimestriel de l’allocation supplémentaire à servir était donc de ${montantASI.toFixed(2)} € (${plafondTrimestriel.toFixed(2)} € [plafond] – ${totalApresAbattement.toFixed(2)} € [ressources]). Seuls des arrérages mensuels de ${montantMensuel.toFixed(2)} € étaient dus à partir du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    }

    result.appendChild(resultSection);
}
function getPreviousTrimestre(dateEffet) {
    const trimestre = [];
    for (let i = 3; i >= 1; i--) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);
        trimestre.push(mois.toLocaleString("fr-FR", { month: "long", year: "numeric" }));
    }
    return trimestre;
}

function getPlafondAnnuel(dateEffet, statut) {
    let annee = dateEffet.getFullYear();

    const premierJanvier = new Date(annee, 0, 1);
    const premierAvril = new Date(annee, 3, 1);

    if (dateEffet >= premierJanvier && dateEffet < premierAvril) {
        annee -= 1; 
    }

    return plafonds[annee]?.[statut] || 0;
}