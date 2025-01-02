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

    ["Mois", "Pension d'invalidité", "Salaires", "Indemnités journalières", "Chômage", "BIM (Capitaux placés)"].forEach(col => {
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

        ["invalidite", "salaires", "indemnites", "chomage", "bim"].forEach(type => {
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

    // Correction de la date de début du trimestre : prendre le trimestre précédent la date d'effet
    let currentQuarterStart = new Date(dateEffet);
    currentQuarterStart.setMonth(currentQuarterStart.getMonth() - 3);
    currentQuarterStart.setDate(1); // Assurer que c'est le premier jour du mois du trimestre précédent
    let currentQuarterEnd = new Date(currentQuarterStart);
    currentQuarterEnd.setMonth(currentQuarterEnd.getMonth() + 2); // Fin du trimestre

    // Vérifier si la période de début de l'ASI inclut le trimestre précédent
    if (currentQuarterStart > periodeFin || currentQuarterEnd < periodeDebut) {
        alert("La période sélectionnée ne couvre pas le trimestre précédent la date d'effet.");
        return;
    }

    const trimestreTotal = calculateQuarterlyResources(currentQuarterStart, statut, trimestreDetails);
    const abattement = parseFloat(document.getElementById("abattement").value) || 0;
    const totalAfterDeduction = trimestreTotal - abattement;

    result.innerHTML += `
        <h2 class="result-title">Droits ASI au ${currentQuarterStart.toLocaleDateString("fr-FR")}</h2>
        ${generateMonthlyDetails(trimestreDetails)}
        <h3>Résumé du trimestre</h3>
        <p>Total trimestriel avant abattement : ${trimestreTotal.toFixed(2)} €</p>
        <p>Total après abattement : ${totalAfterDeduction.toFixed(2)} €</p>
        <p>Plafond trimestriel : ${plafondTrimestriel.toFixed(2)} €</p>`;

    if (totalAfterDeduction > plafondTrimestriel) {
        result.innerHTML += `<p>Les ressources combinées, soit ${totalAfterDeduction.toFixed(2)} €, étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l'allocation supplémentaire d'invalidité n'est pas attribuée à effet du ${currentQuarterStart.toLocaleDateString("fr-FR")}.</p>`;
    } else {
        const montantASI = plafondTrimestriel - totalAfterDeduction;
        result.innerHTML += `<p>Montant trimestriel de l'ASI : ${montantASI.toFixed(2)} €.</p>`;
    }
}

function calculateQuarterlyResources(quarterStart, statut, trimestreDetails) {
    let trimestreTotal = 0;

    for (let i = 0; i < 3; i++) {
        const mois = new Date(quarterStart);
        mois.setMonth(quarterStart.getMonth() + i);

        const invalidite = parseFloat(document.getElementById(`demandeur_invalidite_${mois.getMonth()}_${mois.getFullYear()}`).value) || 0;
        const salaires = parseFloat(document.getElementById(`demandeur_salaires_${mois.getMonth()}_${mois.getFullYear()}`).value) || 0;
        const indemnites = parseFloat(document.getElementById(`demandeur_indemnites_${mois.getMonth()}_${mois.getFullYear()}`).value) || 0;
        const bim = parseFloat(document.getElementById(`demandeur_bim_${mois.getMonth()}_${mois.getFullYear()}`).value) || 0;

        trimestreTotal += invalidite + salaires + indemnites + bim;

        trimestreDetails.push({
            mois: mois.toLocaleString("fr-FR", { month: "long", year: "numeric" }),
            invalidite,
            salaires,
            indemnites,
            bim,
        });
    }

    return trimestreTotal;
}

function generateMonthlyDetails(details) {
    let html = "<h4>Détails des ressources mois par mois</h4>";
    details.forEach(detail => {
        html += `
            <table>
                <tr><td>${detail.mois}</td></tr>
                <tr><td>Pension d'invalidité</td><td>${detail.invalidite.toFixed(2)} €</td></tr>
                <tr><td>Salaires</td><td>${detail.salaires.toFixed(2)} €</td></tr>
                <tr><td>Indemnités journalières</td><td>${detail.indemnites.toFixed(2)} €</td></tr>
                <tr><td>BIM</td><td>${detail.bim.toFixed(2)} €</td></tr>
                <tr><td><strong>Total mensuel</strong></td><td><strong>${(detail.invalidite + detail.salaires + detail.indemnites + detail.bim).toFixed(2)} €</strong></td></tr>
            </table>`;
    });
    return html;
}
