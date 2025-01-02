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

    if (!statut || isNaN(dateEffet.getTime())) {
        return; // Ne rien calculer si les champs sont vides
    }

    // Calcul de l'année applicable pour le plafond
    let annee = dateEffet.getFullYear();
    const premierJanvier = new Date(annee, 0, 1); // 1er janvier
    const premierAvril = new Date(annee, 3, 1); // 1er avril

    if (dateEffet >= premierJanvier && dateEffet < premierAvril) {
        annee -= 1; // Utiliser l'année précédente pour les dates avant le 1er avril
    }

    if (!plafonds[annee]) {
        alert("Le plafond pour l'année " + annee + " n'est pas défini.");
        return;
    }

    // Récupération du plafond annuel et trimestriel
    const plafondAnnuel = plafonds[annee]?.[statut];
    const plafondTrimestriel = plafondAnnuel ? plafondAnnuel / 4 : 0;

    // Calcul des mois du trimestre précédent
    const moisTrimestrePrecedent = getMoisTrimestrePrecedent(dateEffet);

    // Filtrer les ressources pour le trimestre précédent
    const demandeurRessources = calculateRessourcesTrimestre("Demandeur", moisTrimestrePrecedent);
    let conjointRessources = null;

    if (statut === "couple") {
        conjointRessources = calculateRessourcesTrimestre("Conjoint", moisTrimestrePrecedent);
    }

    // Calcul des ressources totales
    const totalRessources = demandeurRessources.total + (conjointRessources ? conjointRessources.total : 0);
    const abattement = parseFloat(document.getElementById("abattement").value) || 0;
    const totalRessourcesApresAbattement = totalRessources - abattement;

    const result = document.getElementById("result");
    const resultSection = document.createElement("div");
    resultSection.classList.add("result-section");

    // Titre des résultats
    const titreResultats = document.createElement("h2");
    titreResultats.textContent = `Droits ASI au ${dateEffet.toLocaleDateString("fr-FR")}`;
    resultSection.appendChild(titreResultats);

    // Résumé trimestriel
    resultSection.innerHTML += `
        <h3>Résumé du trimestre précédent</h3>
        <table>
            <tr><td><strong>Total avant abattement</strong></td><td><strong>${totalRessources.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Abattement appliqué</strong></td><td><strong>${abattement.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Total après abattement</strong></td><td><strong>${totalRessourcesApresAbattement.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Plafond trimestriel applicable</strong></td><td><strong>${plafondTrimestriel.toFixed(2)} €</strong></td></tr>
        </table>`;

    // Conclusion
    if (totalRessourcesApresAbattement > plafondTrimestriel) {
        resultSection.innerHTML += `<p>Les ressources combinées au cours du trimestre précédent, soit ${totalRessourcesApresAbattement.toFixed(2)} € étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l’allocation supplémentaire d’invalidité ne pouvait pas être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    } else {
        const montantASI = plafondTrimestriel - totalRessourcesApresAbattement;
        const montantMensuelASI = montantASI / 3;
        resultSection.innerHTML += `<p>Le montant trimestriel de l’allocation supplémentaire à servir était donc de ${montantASI.toFixed(2)} € (${plafondTrimestriel.toFixed(2)} € [plafond] – ${totalRessourcesApresAbattement.toFixed(2)} € [ressources]). Seuls des arrérages d’un montant mensuel de ${montantMensuelASI.toFixed(2)} € étaient dus à compter du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    }

    result.appendChild(resultSection);
}

// Fonction pour obtenir les mois du trimestre précédent
function getMoisTrimestrePrecedent(dateEffet) {
    const mois = dateEffet.getMonth();
    const annee = dateEffet.getFullYear();
    let moisDebut, moisFin;

    if (mois >= 0 && mois <= 2) { // Janvier à mars
        moisDebut = 9; // Octobre
        moisFin = 11; // Décembre
        return { annee: annee - 1, moisDebut, moisFin };
    } else if (mois >= 3 && mois <= 5) { // Avril à juin
        moisDebut = 0; // Janvier
        moisFin = 2; // Mars
    } else if (mois >= 6 && mois <= 8) { // Juillet à septembre
        moisDebut = 3; // Avril
        moisFin = 5; // Juin
    } else { // Octobre à décembre
        moisDebut = 6; // Juillet
        moisFin = 8; // Septembre
    }

    return { annee, moisDebut, moisFin };
}

// Fonction pour calculer les ressources pour le trimestre précédent
function calculateRessourcesTrimestre(type, { annee, moisDebut, moisFin }) {
    const ressources = document.querySelectorAll(`.ressources-${type.toLowerCase()}`);
    let total = 0;
    const details = [];

    ressources.forEach((ressource) => {
        const mois = parseInt(ressource.dataset.mois, 10);
        const anneeRessource = parseInt(ressource.dataset.annee, 10);
        const montant = parseFloat(ressource.value) || 0;

        if (anneeRessource === annee && mois >= moisDebut && mois <= moisFin) {
            total += montant;
            details.push({ mois, annee, montant });
        }
    });

    return { total, details };
}

