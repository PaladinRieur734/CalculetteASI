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
    ].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        header.appendChild(th);
    });
    table.appendChild(header);

    // Ajouter un bouton "+" pour ajouter une colonne
    const addColumnButton = document.createElement("button");
    addColumnButton.textContent = "+";
    addColumnButton.classList.add("add-column-btn");
    addColumnButton.onclick = function() {
        ajouterColonne(table, role);
    };
    tableContainer.appendChild(addColumnButton);

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
        ["invalidite", "salaires", "indemnites", "chomage", "bim"].forEach(type => {
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

function ajouterColonne(table, role) {
    const nomColonne = prompt("Nom de la nouvelle colonne :");
    if (!nomColonne) return;

    const header = table.querySelector("tr");
    const newHeaderCell = document.createElement("th");
    newHeaderCell.textContent = nomColonne;
    header.appendChild(newHeaderCell);

    const rows = table.querySelectorAll("tr");
    rows.forEach((row, index) => {
        if (index === 0) return; // Ne pas ajouter dans l'en-tête
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.id = `${role.toLowerCase()}_${nomColonne.toLowerCase().replace(" ", "_")}M${4 - (rows.length - index)}`;
        input.placeholder = "€";
        input.min = 0;
        cell.appendChild(input);
        row.appendChild(cell);
    });
}

function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);

    if (!statut || isNaN(dateEffet.getTime())) {
        return; // Ne rien calculer si les champs sont vides
    }

    const annee = dateEffet.getFullYear();
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

    // Calcul de l'ASI
    const asi = totalRessourcesApresAbattement <= plafondTrimestriel ? plafondTrimestriel - totalRessourcesApresAbattement : 0;
    const plafondRestant = plafondTrimestriel - totalRessourcesApresAbattement;

    const asiInfo = `
        <h4>Total des ressources (après abattement) : €${totalRessourcesApresAbattement.toFixed(2)}</h4>
        <h5>Plafond trimestriel : €${plafondTrimestriel.toFixed(2)}</h5>
        <h5>ASI accordée : €${asi.toFixed(2)}</h5>
        <h5>Plafond restant : €${plafondRestant.toFixed(2)}</h5>
    `;

    resultSection.innerHTML += asiInfo;

    result.appendChild(resultSection);
}

function calculateRessources(role, dateEffet) {
    const resources = {
        invalidite: 0,
        salaires: 0,
        indemnites: 0,
        chomage: 0,
        bim: 0,
        total: 0,
        details: [],
    };

    for (let i = 3; i >= 1; i--) {
        const month = new Date(dateEffet);
        month.setMonth(month.getMonth() - i);

        let totalMois = 0;
        const details = {
            mois: month.toLocaleString("fr-FR", { month: "long", year: "numeric" }),
            resources: {},
        };

        ["invalidite", "salaires", "indemnites", "chomage", "bim"].forEach(type => {
            const input = document.getElementById(`${role.toLowerCase()}_${type}M${4 - i}`);
            const value = parseFloat(input.value) || 0;
            details.resources[type] = value;
            totalMois += value;
        });

        resources.details.push(details);
        resources.total += totalMois;
    }

    return resources;
}

function generateMonthlyDetails(details, role) {
    let html = `<h4>Détails des mois pour le ${role}</h4><table><tr><th>Mois</th><th>Pension d'invalidité</th><th>Salaires</th><th>Indemnités journalières</th><th>Chômage</th><th>BIM</th><th>Total</th></tr>`;

    details.forEach(detail => {
        html += `
            <tr>
                <td>${detail.mois}</td>
                <td>${detail.resources.invalidite.toFixed(2)}</td>
                <td>${detail.resources.salaires.toFixed(2)}</td>
                <td>${detail.resources.indemnites.toFixed(2)}</td>
                <td>${detail.resources.chomage.toFixed(2)}</td>
                <td>${detail.resources.bim.toFixed(2)}</td>
                <td>${(detail.resources.invalidite + detail.resources.salaires + detail.resources.indemnites + detail.resources.chomage + detail.resources.bim).toFixed(2)}</td>
            </tr>
        `;
    });

    html += "</table>";
    return html;
}
