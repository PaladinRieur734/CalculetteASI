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
            input.id = `${role.toLowerCase()}_${type}M${4 - i}`;
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

    // Vérifier si les champs sont remplis correctement
    if (!statut || isNaN(dateEffet.getTime())) {
        return; // Ne rien calculer si les champs sont vides
    }

    // Récupérer l'année et déterminer si on doit prendre l'année précédente (avant avril)
    let annee = dateEffet.getFullYear();
    if (dateEffet.getMonth() < 3) { // Avant avril
        annee -= 1;
    }

    console.log("Année calculée : " + annee);  // Afficher l'année calculée
    console.log("Statut choisi : " + statut);  // Afficher le statut choisi

    // Vérification du plafond pour l'année obtenue
    const plafondAnnuel = plafonds[annee]?.[statut];
    console.log("Plafond pour l'année " + annee + " et statut " + statut + " : " + plafondAnnuel);

    // Si le plafond est défini, calculer sinon prendre 0
    const plafondTrimestriel = plafondAnnuel ? plafondAnnuel / 4 : 0;

    // Récupérer la référence à l'élément résultat
    const result = document.getElementById("result");
    const resultSection = document.createElement("div");
    resultSection.classList.add("result-section");

    // Titre des résultats
    const titreResultats = document.createElement("h2");
    titreResultats.textContent = `Droits ASI au ${dateEffet.toLocaleDateString("fr-FR")}`;
    resultSection.appendChild(titreResultats);

    // Calcul des ressources pour le demandeur
    const demandeurRessources = calculateRessources("Demandeur", dateEffet);
    let conjointRessources = null;

    if (statut === "couple") {
        conjointRessources = calculateRessources("Conjoint", dateEffet);
    }

    // Calcul du total des ressources après abattement
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

// Exemple de fonction pour calculer les ressources (il faut l'adapter selon vos besoins)
function calculateRessources(type, dateEffet) {
    // Simule les ressources pour un demandeur ou conjoint, à adapter
    let total = 0;
    let details = [];

    // Exemple de calculs mensuels
    for (let i = 0; i < 12; i++) {
        details.push({ mois: new Date(dateEffet.getFullYear(), i, 1), montant: Math.random() * 1000 });
        total += details[i].montant;

        details.push({
            mois: mois.toLocaleString("fr-FR", { month: "long", year: "numeric" }),
            invalidite,
            salaires,
            indemnites,
            chomage,
            bim,
            autres,
            moisTotal,
        });
    }

    return { total, details };
}

/ Exemple de fonction pour générer les détails mensuels
function generateMonthlyDetails(details, type) {
    let html = `<h3>Détails pour ${type}</h3><table><tr><th>Mois</th><th>Montant</th></tr>`;
    details.forEach(detail => {
        html += `<tr><td>${detail.mois.toLocaleDateString("fr-FR")}</td><td>${detail.montant.toFixed(2)} €</td></tr>`;
    });
    html += "</table>";
    return html;
}
