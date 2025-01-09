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

// Gestion des abattements en fonction des salaires
const abattements = {
    "2017": 1400,
    "2018": 1500,
    "2019": 1500,
    "2020": 1500,
    "2021": 1600,
    "2022": 1600,
    "2023": 1700,
    "2024": 1800,
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

// Fonction pour récupérer l'abattement applicable
function obtenirAbattement(dateEffet, totalSalaires) {
    const annee = dateEffet.getFullYear();
    const mois = dateEffet.getMonth() + 1;

    // Si la date est avant le 1er avril, on utilise l'année précédente
    const anneeAbattement = mois < 4 ? annee - 1 : annee;

    const abattementApplicable = abattements[anneeAbattement] || 0;

    // Si les salaires sont inférieurs à l'abattement, on applique le montant des salaires comme abattement
    return totalSalaires <= abattementApplicable ? totalSalaires : abattementApplicable;
}

let customColumns = []; // Colonnes personnalisées ajoutées par l'utilisateur

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
    ["Mois", "Pension d'invalidité", "Salaires", "Indemnités journalières", "Chômage"].forEach(col => {
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

    // Ajouter le bouton "+" pour ajouter une colonne
    const addColumnButton = document.createElement("th");
    const button = document.createElement("button");
    button.textContent = "+";
    button.className = "add-column-btn";
    button.title = "Ajouter une ressource";
    button.onclick = event => {
        event.preventDefault();
        addColumnToTable(role.toLowerCase());
    };
    addColumnButton.appendChild(button);
    header.appendChild(addColumnButton);

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

function addColumnToTable(role) {
    const table = document.getElementById(`${role.toLowerCase()}Table`);
    if (!table) return;

    const columnIndex = customColumns.length;
    const headerCell = document.createElement("th");

    const headerInput = document.createElement("input");
    headerInput.type = "text";
    headerInput.placeholder = `Nom ressource ${columnIndex + 1}`;
    headerInput.addEventListener("change", () => {
        customColumns[columnIndex] = headerInput.value || `Ressource ${columnIndex + 1}`;
    });
    headerCell.appendChild(headerInput);
    table.rows[0].appendChild(headerCell);

    for (let i = 1; i < table.rows.length; i++) {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.placeholder = "€";
        input.min = 0;
        input.id = `${role.toLowerCase()}_custom${columnIndex}M${4 - i}`;
        cell.appendChild(input);
        table.rows[i].appendChild(cell);
    }

    customColumns.push(`Ressource ${columnIndex + 1}`);
}

function calculateRessources(role, dateEffet) {
    const details = [];
    let total = 0;

    for (let i = 3; i >= 1; i--) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const invalidite = parseFloat(document.getElementById(`${role.toLowerCase()}_invaliditeM${4 - i}`).value) || 0;
        const salaires = parseFloat(document.getElementById(`${role.toLowerCase()}_salairesM${4 - i}`).value) || 0;
        const indemnites = parseFloat(document.getElementById(`${role.toLowerCase()}_indemnitesM${4 - i}`).value) || 0;
        const chomage = parseFloat(document.getElementById(`${role.toLowerCase()}_chomageM${4 - i}`).value) || 0;

        let customTotal = 0;
        customColumns.forEach((col, index) => {
            const customInput = parseFloat(document.getElementById(`${role.toLowerCase()}_custom${index}M${4 - i}`).value) || 0;
            customTotal += customInput;
        });

        const moisTotal = invalidite + salaires + indemnites + chomage + customTotal;
        total += moisTotal;

        details.push({
            mois: mois.toLocaleString("fr-FR", { month: "long", year: "numeric" }),
            invalidite,
            salaires,
            indemnites,
            chomage,
            customDetails: customColumns.map((col, index) => ({
                nom: col,
                montant: parseFloat(document.getElementById(`${role.toLowerCase()}_custom${index}M${4 - i}`).value) || 0,
            })),
            moisTotal,
        });
    }

    // Ajout des BIM pour le calcul total
    const bimNmoins1 = parseFloat(document.getElementById("bimNmoins1").value) || 0;
    const bimTrimestre = (bimNmoins1 * 0.03) / 4;
    total += bimTrimestre;

    return { total, details, bimTrimestre };
}
// Fonction principale pour calculer les droits ASI
function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);

    if (!statut || isNaN(dateEffet.getTime())) return;

    const annee = dateEffet.getFullYear();
    const plafondAnnuel = obtenirPlafond(dateEffet, statut);
    const plafondTrimestriel = plafondAnnuel / 4;

    const demandeurRessources = calculateRessources("Demandeur", dateEffet);
    let conjointRessources = null;

    if (statut === "couple") {
        conjointRessources = calculateRessources("Conjoint", dateEffet);
    }

    const totalRessources = demandeurRessources.total + (conjointRessources ? conjointRessources.total : 0);
    const totalSalaires = demandeurRessources.details.reduce((acc, curr) => acc + curr.salaires, 0)
        + (conjointRessources ? conjointRessources.details.reduce((acc, curr) => acc + curr.salaires, 0) : 0);

    const abattement = obtenirAbattement(dateEffet, totalSalaires);
    const totalRessourcesApresAbattement = totalRessources - abattement;

    const result = document.getElementById("result");
    result.innerHTML = "";

    // Détails mois par mois
    result.innerHTML += generateMonthlyDetails(demandeurRessources.details, "Demandeur");
    if (conjointRessources) {
        result.innerHTML += generateMonthlyDetails(conjointRessources.details, "Conjoint");
    }

    // Résumé trimestriel
    result.innerHTML += `
        <h5>Résumé du trimestre</h5>
        <table>
            <tr><td><strong>Total des ressources (avant abattement)</strong></td><td>${totalRessources.toFixed(2)} €</td></tr>
            <tr><td><strong>Abattement appliqué</strong></td><td>${abattement.toFixed(2)} €</td></tr>
            <tr><td><strong>Total des ressources (après abattement)</strong></td><td>${totalRessourcesApresAbattement.toFixed(2)} €</td></tr>
            <tr><td><strong>Plafond trimestriel</strong></td><td>${plafondTrimestriel.toFixed(2)} €</td></tr>
        </table>`;

    // Conclusion
    if (totalRessourcesApresAbattement > plafondTrimestriel) {
        result.innerHTML += `<p>Les ressources combinées au cours du trimestre de référence, soit ${totalRessourcesApresAbattement.toFixed(2)} € étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l’allocation supplémentaire d’invalidité ne pouvait pas être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    } else {
        const montantASI = plafondTrimestriel - totalRessourcesApresAbattement;
        const montantMensuelASI = montantASI / 3;
        result.innerHTML += `<p>Le montant trimestriel de l’allocation supplémentaire à servir était donc de ${montantASI.toFixed(2)} € (${plafondTrimestriel.toFixed(2)} € [plafond] – ${totalRessourcesApresAbattement.toFixed(2)} € [ressources]). Seuls des arrérages d’un montant mensuel de ${montantMensuelASI.toFixed(2)} € étaient dus à compter du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    }
}
// Fonction pour générer les détails mensuels
function generateMonthlyDetails(details, role) {
    let html = `<h4>Détails des ressources pour ${role}</h4>`;
    details.forEach(detail => {
        html += `
            <h5>${detail.mois}</h5>
            <ul>
                <li>Pension d'invalidité : ${detail.invalidite.toFixed(2)} €</li>
                <li>Salaires : ${detail.salaires.toFixed(2)} €</li>
                <li>Indemnités journalières : ${detail.indemnites.toFixed(2)} €</li>
                <li>Chômage : ${detail.chomage.toFixed(2)} €</li>`;

        if (detail.customDetails && detail.customDetails.length > 0) {
            detail.customDetails.forEach(custom => {
                html += `<li>${custom.nom} : ${custom.montant.toFixed(2)} €</li>`;
            });
        }

        html += `
                <li><strong>Total mensuel :</strong> ${detail.moisTotal.toFixed(2)} €</li>
            </ul>`;
    });

    return html;
}

// Fonction pour ajouter les BIM dans les résultats
function ajouterBIM(details, bimTrimestre) {
    details.push({
        mois: "Calcul BIM Trimestriel",
        invalidite: 0,
        salaires: 0,
        indemnites: 0,
        chomage: 0,
        customDetails: [],
        moisTotal: bimTrimestre,
    });
}
// Fonction pour initialiser l'application
document.addEventListener("DOMContentLoaded", () => {
    // Lien entre le bouton "Calculer ASI" et la fonction de calcul
    const boutonCalcul = document.querySelector(".btn");
    boutonCalcul.addEventListener("click", calculerASI);

    // Ajout des colonnes personnalisées dynamiquement
    document.querySelectorAll(".add-column-btn").forEach(button => {
        button.addEventListener("click", event => {
            const role = event.target.closest("table").id.replace("Table", "");
            addColumnToTable(role);
        });
    });

    // Initialisation des tableaux de ressources dès le chargement de la page
    genererTableauRessources();

    // Gestion du champ BIM N-1
    const bimField = document.getElementById("bimNmoins1");
    bimField.addEventListener("input", () => {
        const bimValue = parseFloat(bimField.value) || 0;
        console.log(`BIM au 31/12 de l'année N-1 : ${bimValue} €`);
    });
});
// Fonction utilitaire : Obtenir l'abattement applicable
function obtenirAbattement(dateEffet, totalSalaires) {
    const annee = dateEffet.getFullYear();
    const mois = dateEffet.getMonth() + 1;

    // Si la date est avant le 1er avril, on utilise les abattements de l'année précédente
    const anneeAbattement = mois < 4 ? annee - 1 : annee;

    const abattement = abattements[anneeAbattement];

    // Si les ressources totales sont inférieures ou égales à l'abattement, on les ramène à la valeur des salaires
    return totalSalaires <= abattement ? totalSalaires : abattement;
}

// Tableau des abattements par année
const abattements = {
    "2017": 1200,
    "2018": 1300,
    "2019": 1400,
    "2020": 1500,
    "2021": 1600,
    "2022": 1700,
    "2023": 1800,
    "2024": 1900,
};

// Fonction utilitaire : Ajouter une colonne personnalisée au tableau
function addColumnToTable(role) {
    const table = document.getElementById(`${role.toLowerCase()}Table`);
    if (!table) return;

    const columnIndex = table.rows[0].cells.length - 1;

    const headerCell = document.createElement("th");
    const headerInput = document.createElement("input");
    headerInput.type = "text";
    headerInput.placeholder = `Ressource ${columnIndex - 4}`;
    headerCell.appendChild(headerInput);
    table.rows[0].insertBefore(headerCell, table.rows[0].lastChild);

    for (let i = 1; i < table.rows.length; i++) {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.placeholder = "€";
        input.min = 0;
        input.id = `${role}_custom${columnIndex - 4}M${4 - i}`;
        cell.appendChild(input);
        table.rows[i].insertBefore(cell, table.rows[i].lastChild);
    }

    customColumns.push(`Ressource ${columnIndex - 4}`);
}

// Fonction utilitaire : Calculer les ressources mensuelles
function calculateMonthlyResources(role, dateEffet) {
    const details = [];
    let total = 0;

    for (let i = 3; i >= 1; i--) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const invalidite = parseFloat(document.getElementById(`${role.toLowerCase()}_invaliditeM${4 - i}`).value) || 0;
        const salaires = parseFloat(document.getElementById(`${role.toLowerCase()}_salairesM${4 - i}`).value) || 0;
        const indemnites = parseFloat(document.getElementById(`${role.toLowerCase()}_indemnitesM${4 - i}`).value) || 0;
        const chomage = parseFloat(document.getElementById(`${role.toLowerCase()}_chomageM${4 - i}`).value) || 0;

        let customTotal = 0;
        customColumns.forEach((col, index) => {
            const customInput = parseFloat(document.getElementById(`${role.toLowerCase()}_custom${index}M${4 - i}`).value) || 0;
            customTotal += customInput;
        });

        const moisTotal = invalidite + salaires + indemnites + chomage + customTotal;
        total += moisTotal;

        details.push({
            mois: mois.toLocaleString("fr-FR", { month: "long", year: "numeric" }),
            invalidite,
            salaires,
            indemnites,
            chomage,
            customDetails: customColumns.map((col, index) => ({
                nom: col,
                montant: parseFloat(document.getElementById(`${role.toLowerCase()}_custom${index}M${4 - i}`).value) || 0,
            })),
            moisTotal,
        });
    }

    return { total, details };
}
