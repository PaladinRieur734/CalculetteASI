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

    for (let i = 1; i <= 3; i++) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const row = document.createElement("tr");
        const moisCell = document.createElement("td");
        moisCell.textContent = mois.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        ["invalidite", "salaires", "indemnites", "chomage", "bim", "autres"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${type}M${i}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);
    }

    ressourcesContainer.appendChild(table);
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

    let totalRessources = 0;
    const trimestreDetails = [];
    const result = document.getElementById("result");
    result.innerHTML = ""; // Réinitialise les résultats

    let trimestreTotal = 0;

    for (let i = 1; i <= 3; i++) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const invalidite = parseFloat(document.getElementById(`invaliditeM${i}`).value) || 0;
        const salaires = parseFloat(document.getElementById(`salairesM${i}`).value) || 0;
        const indemnites = parseFloat(document.getElementById(`indemnitesM${i}`).value) || 0;
        const chomage = parseFloat(document.getElementById(`chomageM${i}`).value) || 0;

        // BIM calculé comme 3% des capitaux placés divisé par 4
        const bimBrut = parseFloat(document.getElementById(`bimM${i}`).value) || 0;
        const bim = (bimBrut * 0.03) / 4;

        const autres = parseFloat(document.getElementById(`autresM${i}`).value) || 0;

        const moisTotal = invalidite + salaires + indemnites + chomage + bim + autres;
        trimestreTotal += moisTotal;

        trimestreDetails.push({
            mois: mois.toLocaleString("fr-FR", { month: "long", year: "numeric" }),
            invalidite,
            salaires,
            indemnites,
            chomage,
            bim,
            autres,
            moisTotal
        });
    }

    const abattement = parseFloat(document.getElementById("abattement").value) || 0;
    const totalRessourcesApresAbattement = trimestreTotal - abattement;

    // Présentation détaillée des calculs par trimestre
    trimestreDetails.forEach((detail, index) => {
        result.innerHTML += `<h3>${detail.mois}</h3>`;
        result.innerHTML += `
            <table>
                <tr><td>Pension d'invalidité</td><td>${detail.invalidite.toFixed(2)} €</td></tr>
                <tr><td>Salaires</td><td>${detail.salaires.toFixed(2)} €</td></tr>
                <tr><td>Indemnités journalières</td><td>${detail.indemnites.toFixed(2)} €</td></tr>
                <tr><td>Chômage</td><td>${detail.chomage.toFixed(2)} €</td></tr>
                <tr><td>BIM (Capitaux placés)</td><td>${detail.bim.toFixed(2)} €</td></tr>
                <tr><td>Autres ressources</td><td>${detail.autres.toFixed(2)} €</td></tr>
                <tr><td><strong>Total mensuel</strong></td><td><strong>${detail.moisTotal.toFixed(2)} €</strong></td></tr>
            </table>`;
    });

    result.innerHTML += `
        <h3>Résumé du trimestre</h3>
        <table>
            <tr><td><strong>Total des ressources trimestrielles</strong></td><td><strong>${trimestreTotal.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Abattement appliqué</strong></td><td><strong>${abattement.toFixed(2)} €</strong></td></tr>
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
