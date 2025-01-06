// script.js

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

    const tableDemandeur = createRessourceTable("Demandeur", dateEffet);
    ressourcesContainer.appendChild(tableDemandeur);

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
    ["Mois", "Pension d'invalidité", "Salaires", "Indemnités journalières", "Chômage"].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        header.appendChild(th);
    });

    customColumns.forEach(colName => {
        const th = document.createElement("th");
        th.textContent = colName;
        header.appendChild(th);
    });

    const addColumnButtonCell = document.createElement("th");
    const addButton = document.createElement("button");
    addButton.textContent = "+";
    addButton.classList.add("add-column-btn");
    addButton.onclick = () => addCustomColumn();
    addColumnButtonCell.appendChild(addButton);
    header.appendChild(addColumnButtonCell);

    table.appendChild(header);

    for (let i = 3; i >= 1; i--) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const row = document.createElement("tr");

        const moisCell = document.createElement("td");
        moisCell.textContent = mois.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        ["invalidite", "salaires", "indemnites", "chomage"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_${type}M${4 - i}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

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
    const columnName = prompt("Nom de la nouvelle colonne :");
    if (columnName) {
        customColumns.push(columnName);
        genererTableauRessources();
    }
}

function calculerASI() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const statut = document.getElementById("statut").value;

    if (!statut || isNaN(dateEffet.getTime())) {
        alert("Veuillez renseigner la date d'effet et le statut.");
        return;
    }

    const plafondAnnuel = plafonds[dateEffet.getFullYear()]?.[statut];
    if (!plafondAnnuel) {
        alert("Aucun plafond trouvé pour l'année et le statut sélectionnés.");
        return;
    }

    const plafondTrimestriel = plafondAnnuel / 4;

    // Calcul des ressources trimestrielles
    const ressourcesDemandeur = calculerRessourcesTrimestrielles("demandeur");
    const ressourcesConjoint = statut === "couple" ? calculerRessourcesTrimestrielles("conjoint") : 0;

    const ressourcesTotales = ressourcesDemandeur + ressourcesConjoint;

    // Calcul de l'ASI
    const asi = Math.max(0, plafondTrimestriel - ressourcesTotales);

    afficherResultat(ressourcesTotales, plafondTrimestriel, asi);
}

function calculerRessourcesTrimestrielles(role) {
    let totalTrimestriel = 0;

    for (let i = 1; i <= 3; i++) {
        const invalidite = parseFloat(document.getElementById(`${role}_invaliditeM${i}`).value) || 0;
        const salaires = parseFloat(document.getElementById(`${role}_salairesM${i}`).value) || 0;
        const indemnites = parseFloat(document.getElementById(`${role}_indemnitesM${i}`).value) || 0;
        const chomage = parseFloat(document.getElementById(`${role}_chomageM${i}`).value) || 0;

        // Ajout des ressources spécifiques à chaque mois
        const totalMois = invalidite + salaires + indemnites + chomage;

        // Prise en compte des colonnes personnalisées
        customColumns.forEach((col, index) => {
            const customValue = parseFloat(document.getElementById(`${role}_custom${index}M${i}`).value) || 0;
            totalMois += customValue;
        });

        totalTrimestriel += totalMois;
    }

    // Application de la logique des 3 %
    return totalTrimestriel * 0.97;
}

function afficherResultat(ressourcesTotales, plafondTrimestriel, asi) {
    const resultSection = document.querySelector(".result-section");
    resultSection.innerHTML = `
        <h2>Résultat du calcul de l'ASI</h2>
        <table>
            <tr>
                <th>Total des ressources trimestrielles</th>
                <td>${ressourcesTotales.toFixed(2)} €</td>
            </tr>
            <tr>
                <th>Plafond trimestriel</th>
                <td>${plafondTrimestriel.toFixed(2)} €</td>
            </tr>
            <tr>
                <th>Montant ASI</th>
                <td>${asi.toFixed(2)} €</td>
            </tr>
        </table>
    `;
    resultSection.scrollIntoView({ behavior: "smooth" });
}
