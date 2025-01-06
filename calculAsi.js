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
    const periodeDebut = new Date(document.getElementById("periodeDebut").value);
    const periodeFin = new Date(document.getElementById("periodeFin").value);

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

    if (!statut || isNaN(dateEffet.getTime()) || isNaN(periodeDebut.getTime()) || isNaN(periodeFin.getTime())) {
        return; // Ne rien afficher si les champs sont vides
    }

    const tableDemandeur = createRessourceTable("Demandeur", periodeDebut, periodeFin);
    ressourcesContainer.appendChild(tableDemandeur);

    if (statut === "couple") {
        const tableConjoint = createRessourceTable("Conjoint", periodeDebut, periodeFin);
        ressourcesContainer.appendChild(tableConjoint);
    }
}

function createRessourceTable(role, periodeDebut, periodeFin) {
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

    customColumns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        header.appendChild(th);
    });

    const thPlus = document.createElement("th");
    const btnPlus = document.createElement("button");
    btnPlus.textContent = "+";
    btnPlus.classList.add("add-column-btn");
    btnPlus.onclick = () => addCustomColumn();
    thPlus.appendChild(btnPlus);
    header.appendChild(thPlus);

    table.appendChild(header);

    let currentMonth = new Date(periodeDebut);
    while (currentMonth <= periodeFin) {
        const row = document.createElement("tr");

        const moisCell = document.createElement("td");
        moisCell.textContent = currentMonth.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        ["invalidite", "salaires", "indemnites", "chomage"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_${type}_${currentMonth.getMonth()}_${currentMonth.getFullYear()}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        customColumns.forEach((col, index) => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_custom${index}_${currentMonth.getMonth()}_${currentMonth.getFullYear()}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);
        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    tableContainer.appendChild(table);
    return tableContainer;
}

function addCustomColumn() {
    const colName = prompt("Nom de la colonne :");
    if (colName) {
        customColumns.push(colName);
        genererTableauRessources();
    }
}

function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const periodeDebut = new Date(document.getElementById("periodeDebut").value);
    const periodeFin = new Date(document.getElementById("periodeFin").value);

    if (!statut || isNaN(dateEffet.getTime()) || isNaN(periodeDebut.getTime()) || isNaN(periodeFin.getTime())) {
        return;
    }

    const result = document.getElementById("result");
    result.innerHTML = "";

    const trimestreDetails = [];
    const plafondAnnuel = plafonds[dateEffet.getFullYear()]?.[statut];
    if (!plafondAnnuel) {
        alert("Plafond introuvable pour l'année sélectionnée.");
        return;
    }
    const plafondTrimestriel = plafondAnnuel / 4;

    // Récupérer la valeur des BIM de l'année N-1
    const bimPreviousYear = parseFloat(document.getElementById("bimPreviousYear").value) || 0;
    const bimsPercentage = (bimPreviousYear * 0.03) / 4;

    let currentQuarterStart = new Date(dateEffet);
    currentQuarterStart.setMonth(currentQuarterStart.getMonth() - 3);

    while (currentQuarterStart <= periodeFin) {
        const trimestreTotal = calculateQuarterlyResources(currentQuarterStart, statut, trimestreDetails);
        result.innerHTML += `<h4>Trimestre de ${currentQuarterStart.toLocaleString("fr-FR", { month: "long", year: "numeric" })}</h4>`;
        result.innerHTML += `<p>Total des ressources pour ce trimestre : €${trimestreTotal.toFixed(2)}</p>`;
        currentQuarterStart.setMonth(currentQuarterStart.getMonth() + 3);
    }
}

function calculateQuarterlyResources(quarterStart, statut, trimestreDetails) {
    let trimestreTotal = 0;
    const currentYear = quarterStart.getFullYear();

    // Récupérer la valeur des BIM de l'année N-1
    const bimPreviousYear = parseFloat(document.getElementById("bimPreviousYear").value) || 0;
    const bimsPercentage = (bimPreviousYear * 0.03) / 4;

    for (let i = 0; i < 3; i++) {
        const mois = new Date(quarterStart);
        mois.setMonth(quarterStart.getMonth() + i);

        const invalidite = parseFloat(document.getElementById(`demandeur_invalidite_${mois.getMonth()}_${mois.getFullYear()}`).value) || 0;
        const salaires = parseFloat(document.getElementById(`demandeur_salaires_${mois.getMonth()}_${mois.getFullYear()}`).value) || 0;
        const indemnites = parseFloat(document.getElementById(`demandeur_indemnites_${mois.getMonth()}_${mois.getFullYear()}`).value) || 0;

        trimestreTotal += invalidite + salaires + indemnites;

        trimestreDetails.push({
            mois: mois.toLocaleString("fr-FR", { month: "long", year: "numeric" }),
            invalidite,
            salaires,
            indemnites,
        });
    }

    // Ajouter les BIM au trimestre
    trimestreTotal += bimsPercentage;

    return trimestreTotal;
}
