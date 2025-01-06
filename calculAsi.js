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

    // Génération des mois dans l'ordre croissant
    for (let i = 1; i <= 3; i++) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - (4 - i)); // Mois précédents dans l'ordre croissant

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
            input.id = `${role.toLowerCase()}_${type}M${i}`;
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
            input.id = `${role.toLowerCase()}_custom${index}M${i}`;
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

    if (!statut || isNaN(dateEffet.getTime())) {
        return; // Ne rien calculer si les champs sont vides
    }

    let annee = dateEffet.getFullYear();
    const premierJanvier = new Date(annee, 0, 1);
    const premierAvril = new Date(annee, 3, 1);

    if (dateEffet >= premierJanvier && dateEffet < premierAvril) {
        annee -= 1;
    }

    const plafondAnnuel = plafonds[annee]?.[statut];
    const plafondTrimestriel = plafondAnnuel / 4;

    const result = document.getElementById("result");
    result.innerHTML = "";

    const demandeurRessources = calculateRessources("Demandeur", dateEffet);
    let conjointRessources = null;

    if (statut === "couple") {
        conjointRessources = calculateRessources("Conjoint", dateEffet);
    }

    const totalRessources = demandeurRessources.total + (conjointRessources ? conjointRessources.total : 0);
    const abattement = parseFloat(document.getElementById("abattement").value) || 0;
    const totalRessourcesApresAbattement = totalRessources - abattement;

    demandeurRessources.details.forEach(detail => {
        result.innerHTML += `<h5>${detail.mois}</h5><table><tr><td>Total mensuel</td><td>${detail.moisTotal.toFixed(2)} €</td></tr></table>`;
    });

    if (conjointRessources) {
        conjointRessources.details.forEach(detail => {
            result.innerHTML += `<h5>${detail.mois}</h5><table><tr><td>Total mensuel</td><td>${detail.moisTotal.toFixed(2)} €</td></tr></table>`;
        });
    }

    if (totalRessourcesApresAbattement > plafondTrimestriel) {
        result.innerHTML += `<p>Les ressources, soit ${totalRessourcesApresAbattement.toFixed(2)} €,
        étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, 
        l'ASI ne pouvait être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    } else {
        const montantASI = plafondTrimestriel - totalRessourcesApresAbattement;
        result.innerHTML += `<p>Le montant trimestriel à servir est de ${montantASI.toFixed(2)} €.</p>`;
    }
}
