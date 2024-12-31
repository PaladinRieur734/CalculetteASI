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

    // Ajout du bouton pour ajouter une colonne
    const addColumnButton = document.createElement("button");
    addColumnButton.textContent = "+ Ajouter une colonne";
    addColumnButton.className = "add-column-btn";
    addColumnButton.onclick = () => addColumn(table, role.toLowerCase());
    tableContainer.appendChild(addColumnButton);

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

function addColumn(table, role) {
    const newColumnIndex = table.rows[0].cells.length; // Position de la nouvelle colonne
    const headerCell = document.createElement("th");
    headerCell.textContent = `Ressource personnalisée ${newColumnIndex - 6}`;
    table.rows[0].appendChild(headerCell);

    // Ajout de la nouvelle colonne pour chaque ligne
    for (let i = 1; i < table.rows.length; i++) {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.id = `${role}_custom${newColumnIndex - 6}M${4 - i}`;
        input.placeholder = "€";
        input.min = 0;
        cell.appendChild(input);
        table.rows[i].appendChild(cell);
    }
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

    let resultHTML = `
        <h3>Résumé du trimestre</h3>
        <p>Total avant abattement : ${totalRessources.toFixed(2)} €</p>
        <p>Abattement appliqué : ${abattement.toFixed(2)} €</p>
        <p>Total après abattement : ${totalRessourcesApresAbattement.toFixed(2)} €</p>
        <p>Plafond trimestriel : ${plafondTrimestriel.toFixed(2)} €</p>`;

    if (totalRessourcesApresAbattement > plafondTrimestriel) {
        resultHTML += `<p>Les ressources combinées au cours du trimestre de référence, soit ${totalRessourcesApresAbattement.toFixed(2)} €, sont supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €. L'allocation supplémentaire d'invalidité ne peut pas être attribuée.</p>`;
    } else {
        const montantASI = plafondTrimestriel - totalRessourcesApresAbattement;
        resultHTML += `<p>Le montant trimestriel de l'ASI à servir est de ${montantASI.toFixed(2)} € (${plafondTrimestriel.toFixed(2)} € - ${totalRessourcesApresAbattement.toFixed(2)} €).</p>`;
    }

    resultSection.innerHTML += resultHTML;
    result.appendChild(resultSection);
}

function calculateRessources(role, dateEffet) {
    let total = 0;

    for (let i = 3; i >= 1; i--) {
        const rowTotal = Array.from(document.querySelectorAll(`#${role.toLowerCase()}_M${4 - i}`))
            .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
        total += rowTotal;
    }

    return { total };
}
