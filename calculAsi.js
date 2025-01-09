// Début du code JavaScript complet pour le calcul ASI

// Définition des plafonds de ressources
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
    "2017": 1200,
    "2018": 1300,
    "2019": 1400,
    "2020": 1500,
    "2021": 1600,
    "2022": 1700,
    "2023": 1800,
    "2024": 1900,
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
    const abattementBase = abattements[annee] || { seul: 0, couple: 0 };

    // Si les salaires sont inférieurs ou égaux à l'abattement, utiliser les salaires comme abattement
    return Math.min(totalSalaires, abattementBase.seul);
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

// Fonction pour créer un tableau des ressources
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
        "Chômage"
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

        table.appendChild(row);
    }

    tableContainer.appendChild(table);
    return tableContainer;
}
// Fonction pour calculer les droits ASI
function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const bimN1 = parseFloat(document.getElementById("bimN1").value) || 0;

    if (isNaN(dateEffet.getTime())) return;

    const plafondAnnuel = obtenirPlafond(dateEffet, statut);
    const plafondTrimestriel = plafondAnnuel / 4;
    const result = document.getElementById("result");

    result.innerHTML = ""; // Réinitialiser les résultats

    // Calcul des ressources pour le demandeur et le conjoint (si applicable)
    const demandeurRessources = calculateMonthlyResources("Demandeur", dateEffet);
    const conjointRessources = statut === "couple" ? calculateMonthlyResources("Conjoint", dateEffet) : null;

    // Calcul des BIM à inclure
    const bimTrimestriel = (bimN1 * 0.03) / 4;

    // Total des ressources après ajout des BIM
    const totalRessources =
        demandeurRessources.total + (conjointRessources ? conjointRessources.total : 0) + bimTrimestriel;

    const totalSalaires = demandeurRessources.details.reduce((sum, d) => sum + d.salaires, 0) +
        (conjointRessources ? conjointRessources.details.reduce((sum, d) => sum + d.salaires, 0) : 0);

    const abattement = obtenirAbattement(dateEffet, totalSalaires);
    const totalRessourcesApresAbattement = totalRessources - abattement;

    // Génération des résultats
    result.innerHTML += generateMonthlyDetails(demandeurRessources.details, "Demandeur");
    if (conjointRessources) {
        result.innerHTML += generateMonthlyDetails(conjointRessources.details, "Conjoint");
    }

    // Résumé des ressources
    result.innerHTML += `
        <h3>Résumé des ressources</h3>
        <table>
            <tr><td>Total avant abattement</td><td>${totalRessources.toFixed(2)} €</td></tr>
            <tr><td>Abattement appliqué</td><td>${abattement.toFixed(2)} €</td></tr>
            <tr><td>Total après abattement</td><td>${totalRessourcesApresAbattement.toFixed(2)} €</td></tr>
            <tr><td>Plafond trimestriel applicable</td><td>${plafondTrimestriel.toFixed(2)} €</td></tr>
        </table>
    `;

    // Conclusion
    if (totalRessourcesApresAbattement > plafondTrimestriel) {
        result.innerHTML += `<p>Les ressources combinées au cours du trimestre de référence, soit ${totalRessourcesApresAbattement.toFixed(2)} €, étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l’allocation supplémentaire d’invalidité ne pouvait pas être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
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
                <li>Chômage : ${detail.chomage.toFixed(2)} €</li>
                ${
                    detail.customDetails.map(cd => `<li>${cd.nom} : ${cd.montant.toFixed(2)} €</li>`).join('')
                }
                <li><strong>Total mensuel :</strong> ${detail.moisTotal.toFixed(2)} €</li>
            </ul>
        `;
    });
    return html;
}

// Fonction pour calculer les ressources mensuelles
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

        let customDetails = [];
        let customTotal = 0;

        const customColumns = document.querySelectorAll(`#${role.toLowerCase()}Table input[type="text"]`);
        customColumns.forEach((col, index) => {
            const customInput = parseFloat(document.getElementById(`${role.toLowerCase()}_custom${index}M${4 - i}`).value) || 0;
            customDetails.push({ nom: col.value, montant: customInput });
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

// Initialisation des événements
window.onload = () => {
    document.getElementById("calculASIButton").onclick = calculerASI;
    document.getElementById("dateEffet").onchange = genererTableauRessources;
    document.getElementById("statut").onchange = genererTableauRessources;
};
