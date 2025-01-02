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

        // Colonnes personnalisées
        customColumns.forEach((col, index) => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_custom${index}M${4 - i}`;
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
function calculerASI() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const statut = document.getElementById("statut").value;
    const abattement = parseFloat(document.getElementById("abattement").value) || 0;

    if (!statut || isNaN(dateEffet.getTime())) {
        document.getElementById("result").innerHTML = "<div class='error-message'>Veuillez saisir une date d'effet valide et un statut.</div>";
        return;
    }

    let resourcesTotal = 0;
    const ressourcesContainer = document.getElementById("ressourcesContainer");
    const rows = ressourcesContainer.querySelectorAll("table tr");

    rows.forEach((row, index) => {
        if (index === 0) return; // Ignore header row

        const cells = row.querySelectorAll("td");
        let rowTotal = 0;

        cells.forEach((cell, i) => {
            if (i >= 1 && i <= 5) { // On ne prend en compte que les ressources numérotées (pension, salaire, etc.)
                const input = cell.querySelector("input");
                if (input && input.value) {
                    rowTotal += parseFloat(input.value);
                }
            }
        });

        resourcesTotal += rowTotal;
    });

    // Appliquer l'abattement
    resourcesTotal -= abattement;

    // Identifier l'année de la date d'effet
    const year = dateEffet.getFullYear();
    let plafond = plafonds[year][statut];

    // Calcul du plafond pour l'année en cours
    const resultText = document.createElement("div");
    if (resourcesTotal <= plafond) {
        resultText.innerHTML = `
            <h2>Résultat du calcul de l'ASI :</h2>
            <p>Montant des ressources après abattement: ${resourcesTotal.toFixed(2)} €</p>
            <p>Plafond applicable: ${plafond.toFixed(2)} €</p>
            <p><strong>L'ASI est attribuée.</strong></p>
        `;
    } else {
        resultText.innerHTML = `
            <h2>Résultat du calcul de l'ASI :</h2>
            <p>Montant des ressources après abattement: ${resourcesTotal.toFixed(2)} €</p>
            <p>Plafond applicable: ${plafond.toFixed(2)} €</p>
            <p><strong>L'ASI n'est pas attribuée, car les ressources dépassent le plafond.</strong></p>
        `;
    }

    // Affichage des résultats
    document.getElementById("result").innerHTML = '';
    document.getElementById("result").appendChild(resultText);
}

document.getElementById("ajouterColonne").addEventListener("click", function() {
    const columnName = prompt("Nom de la nouvelle colonne personnalisée :");
    if (columnName) {
        customColumns.push(columnName);
        genererTableauRessources(); // Regénérer le tableau pour inclure la nouvelle colonne
    }
});

document.getElementById("dateEffet").addEventListener("change", genererTableauRessources);
document.getElementById("statut").addEventListener("change", genererTableauRessources);
document.getElementById("abattement").addEventListener("input", genererTableauRessources);

// Appel initial pour générer le tableau à l'ouverture de la page
genererTableauRessources();
