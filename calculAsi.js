// Définition des plafonds, qui changent au 1er avril chaque année
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

// Fonction pour récupérer le plafond applicable en fonction de la date d'effet
function obtenirPlafond(dateEffet, statut) {
    const annee = dateEffet.getFullYear();
    const mois = dateEffet.getMonth() + 1;

    // Si la date est avant le 1er avril, on utilise le plafond de l'année précédente
    const anneePlafond = mois < 4 ? annee - 1 : annee;

    // Retourne le plafond correspondant à l'année déterminée
    return plafonds[anneePlafond]?.[statut] || 0;
}
function genererTableauRessources() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const statut = document.getElementById("statut").value;

    if (isNaN(dateEffet.getTime())) return;

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

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
    table.id = `${role.toLowerCase()}Table`;

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

    for (let i = 3; i >= 1; i--) {
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
function addColumnToTable(role) {
    const table = document.getElementById(`${role.toLowerCase()}Table`);
    if (!table) return;

    const columnIndex = table.rows[0].cells.length;

    const headerCell = document.createElement("th");
    const headerInput = document.createElement("input");
    headerInput.type = "text";
    headerInput.placeholder = `Ressource ${columnIndex - 6}`;
    headerInput.style.wordWrap = "break-word";
    headerInput.style.whiteSpace = "normal";
    headerCell.appendChild(headerInput);
    table.rows[0].appendChild(headerCell);

    for (let i = 1; i < table.rows.length; i++) {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.placeholder = "€";
        input.min = 0;
        input.id = `${role}_custom${columnIndex - 6}M${4 - i}`;
        cell.appendChild(input);
        table.rows[i].appendChild(cell);
    }
}

function calculateRessources(role, dateEffet) {
    const details = [];
    let total = 0;

    for (let i = 3; i >= 1; i--) {
        const rowTotal = Array.from(document.querySelectorAll(`#${role.toLowerCase()}Table tr:nth-child(${i + 1}) td input`))
            .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);

        total += rowTotal;

        details.push({
            mois: new Date(dateEffet).toLocaleString("fr-FR", { month: "long", year: "numeric" }),
            total: rowTotal,
        });
    }

    return { total, details };
}
function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);

    if (isNaN(dateEffet.getTime())) return;

    const plafondAnnuel = obtenirPlafond(dateEffet, statut);
    const plafondTrimestriel = plafondAnnuel / 4;

    const result = document.getElementById("result");
    result.innerHTML = ""; // Réinitialise la section des résultats

    const demandeurRessources = calculateRessources("Demandeur", dateEffet);
    let conjointRessources = null;

    if (statut === "couple") {
        conjointRessources = calculateRessources("Conjoint", dateEffet);
    }

    const totalRessources = demandeurRessources.total + (conjointRessources ? conjointRessources.total : 0);
    const abattement = parseFloat(document.getElementById("abattement").value) || 0;
    const totalRessourcesApresAbattement = totalRessources - abattement;

    result.innerHTML = `
        <h2>Droits ASI au ${dateEffet.toLocaleDateString("fr-FR")}</h2>
        <p>Total avant abattement : ${totalRessources.toFixed(2)} €</p>
        <p>Abattement : ${abattement.toFixed(2)} €</p>
        <p>Total après abattement : ${totalRessourcesApresAbattement.toFixed(2)} €</p>
        <p>Plafond trimestriel : ${plafondTrimestriel.toFixed(2)} €</p>`;

    if (totalRessourcesApresAbattement > plafondTrimestriel) {
        result.innerHTML += `<p>Les ressources sont supérieures au plafond trimestriel. Pas d'ASI attribuée.</p>`;
    } else {
        const montantASI = plafondTrimestriel - totalRessourcesApresAbattement;
        const montantMensuelASI = montantASI / 3;
        result.innerHTML += `<p>Montant mensuel ASI attribué : ${montantMensuelASI.toFixed(2)} €.</p>`;
    }
}
