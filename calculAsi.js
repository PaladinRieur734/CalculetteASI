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

// Liste des abattements par année
const abattements = {
    "2017": { seul: 900, couple: 1800 },
    "2018": { seul: 950, couple: 1900 },
    "2019": { seul: 975, couple: 1950 },
    "2020": { seul: 1000, couple: 2000 },
    "2021": { seul: 1025, couple: 2050 },
    "2022": { seul: 1050, couple: 2100 },
    "2023": { seul: 1100, couple: 2200 },
    "2024": { seul: 1150, couple: 2300 },
};

// Fonction pour récupérer le plafond applicable
function obtenirPlafond(dateEffet, statut) {
    const annee = dateEffet.getFullYear();
    const mois = dateEffet.getMonth() + 1;
    const anneePlafond = mois < 4 ? annee - 1 : annee;

    return plafonds[anneePlafond]?.[statut] || 0;
}

// Fonction pour récupérer l'abattement applicable
function obtenirAbattement(dateEffet, totalSalaires, statut) {
    const annee = dateEffet.getFullYear();
    const abattementBase = abattements[annee]?.[statut] || 0;

    return Math.min(totalSalaires, abattementBase);
}

// Fonction pour générer le tableau des ressources
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
// Fonction pour créer le tableau des ressources
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

    // Ajouter un bouton "+" pour une nouvelle colonne
    const addColumnButton = document.createElement("th");
    const button = document.createElement("button");
    button.textContent = "+";
    button.className = "add-column-btn";
    button.onclick = () => addColumnToTable(role.toLowerCase());
    addColumnButton.appendChild(button);
    header.appendChild(addColumnButton);

    table.appendChild(header);

    // Génération des lignes pour les mois du trimestre précédent
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

// Ajouter une colonne personnalisée
function addColumnToTable(role) {
    const table = document.getElementById(`${role.toLowerCase()}Table`);
    if (!table) return;

    const columnIndex = table.rows[0].cells.length - 1;
    const headerCell = document.createElement("th");
    const inputHeader = document.createElement("input");
    inputHeader.type = "text";
    inputHeader.placeholder = `Ressource ${columnIndex - 4}`;
    headerCell.appendChild(inputHeader);
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
}
// Calcul des ressources pour chaque mois
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
        const customDetails = [];
        customColumns.forEach((col, index) => {
            const customInput = parseFloat(document.getElementById(`${role.toLowerCase()}_custom${index}M${4 - i}`).value) || 0;
            customDetails.push({ nom: col, montant: customInput });
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
            customDetails,
            moisTotal,
        });
    }

    return { total, details };
}

// Fonction pour calculer les droits ASI
function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const montantBIM = parseFloat(document.getElementById("montantBIM").value) || 0;

    if (isNaN(dateEffet.getTime())) return;

    const plafondAnnuel = obtenirPlafond(dateEffet, statut);
    const plafondTrimestriel = plafondAnnuel / 4;

    const demandeurRessources = calculateMonthlyResources("Demandeur", dateEffet);
    let conjointRessources = { total: 0, details: [] };

    if (statut === "couple") {
        conjointRessources = calculateMonthlyResources("Conjoint", dateEffet);
    }

    const totalSalaires = demandeurRessources.details.reduce((acc, mois) => acc + mois.salaires, 0) +
                          conjointRessources.details.reduce((acc, mois) => acc + mois.salaires, 0);

    const abattement = obtenirAbattement(dateEffet, totalSalaires, statut);

    const totalRessourcesBrutes = demandeurRessources.total + conjointRessources.total + (montantBIM * 0.03) / 4;
    const totalRessourcesApresAbattement = totalRessourcesBrutes - abattement;

    afficherResultats(
        dateEffet,
        plafondTrimestriel,
        totalRessourcesBrutes,
        totalRessourcesApresAbattement,
        abattement,
        demandeurRessources.details,
        conjointRessources.details
    );
}
// Fonction pour afficher les résultats
function afficherResultats(
    dateEffet,
    plafondTrimestriel,
    totalRessourcesBrutes,
    totalRessourcesApresAbattement,
    abattement,
    demandeurDetails,
    conjointDetails
) {
    const result = document.getElementById("result");
    result.innerHTML = "";

    // Résumé des ressources
    const resumeSection = document.createElement("div");
    resumeSection.classList.add("resume-section");

    resumeSection.innerHTML = `
        <h3>Résumé des ressources</h3>
        <table>
            <tr>
                <td><strong>Total avant abattement</strong></td>
                <td>${totalRessourcesBrutes.toFixed(2)} €</td>
            </tr>
            <tr>
                <td><strong>Abattement appliqué</strong></td>
                <td>${abattement.toFixed(2)} €</td>
            </tr>
            <tr>
                <td><strong>Total après abattement</strong></td>
                <td>${totalRessourcesApresAbattement.toFixed(2)} €</td>
            </tr>
            <tr>
                <td><strong>Plafond trimestriel applicable</strong></td>
                <td>${plafondTrimestriel.toFixed(2)} €</td>
            </tr>
        </table>
    `;

    // Détails des ressources
    const detailsSection = document.createElement("div");
    detailsSection.classList.add("details-section");

    detailsSection.innerHTML = `
        <h3>Détails des ressources</h3>
        ${genererDetailsHTML("Demandeur", demandeurDetails)}
        ${conjointDetails.length > 0 ? genererDetailsHTML("Conjoint", conjointDetails) : ""}
    `;

    // Conclusion
    const conclusion = document.createElement("p");
    if (totalRessourcesApresAbattement > plafondTrimestriel) {
        conclusion.innerHTML = `
            Les ressources combinées au cours du trimestre de référence, soit ${totalRessourcesApresAbattement.toFixed(2)} €, 
            étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, 
            l’allocation supplémentaire d’invalidité ne pouvait pas être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.
        `;
    } else {
        const montantASI = plafondTrimestriel - totalRessourcesApresAbattement;
        const montantMensuelASI = montantASI / 3;

        conclusion.innerHTML = `
            Le montant trimestriel de l’allocation supplémentaire à servir était donc de ${montantASI.toFixed(2)} € 
            (${plafondTrimestriel.toFixed(2)} € [plafond] – ${totalRessourcesApresAbattement.toFixed(2)} € [ressources]). 
            Seuls des arrérages d’un montant mensuel de ${montantMensuelASI.toFixed(2)} € étaient dus à compter du ${dateEffet.toLocaleDateString("fr-FR")}.
        `;
    }

    result.appendChild(detailsSection);
    result.appendChild(resumeSection);
    result.appendChild(conclusion);
}

// Générer le HTML pour les détails des ressources
function genererDetailsHTML(role, details) {
    let html = `<h4>Détails pour ${role}</h4>`;
    details.forEach(detail => {
        html += `
            <h5>${detail.mois}</h5>
            <ul>
                <li>Pension d'invalidité : ${detail.invalidite.toFixed(2)} €</li>
                <li>Salaires : ${detail.salaires.toFixed(2)} €</li>
                <li>Indemnités journalières : ${detail.indemnites.toFixed(2)} €</li>
                <li>Chômage : ${detail.chomage.toFixed(2)} €</li>
                ${
                    detail.customDetails.length > 0
                        ? detail.customDetails
                              .map(col => `<li>${col.nom} : ${col.montant.toFixed(2)} €</li>`)
                              .join("")
                        : ""
                }
                <li><strong>Total mensuel :</strong> ${detail.moisTotal.toFixed(2)} €</li>
            </ul>
        `;
    });
    return html;
}
