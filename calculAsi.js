// Partie 1/4 : Déclaration des plafonds et gestion des ressources

// Plafonds annuels pour chaque année
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

// Fonction pour générer le tableau de ressources pour un rôle (Demandeur ou Conjoint)
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
    table.appendChild(header);

    // Génération des mois dans l'ordre inversé
    for (let i = 3; i >= 1; i--) {
        const mois = new Date(dateEffet.getFullYear(), dateEffet.getMonth() - i, 1);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${mois.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</td>
            <td><input type="number" class="ressource" data-role="${role}" data-moins="${mois.getMonth()}" placeholder="€"></td>
            <td><input type="number" class="ressource" data-role="${role}" data-moins="${mois.getMonth()}" placeholder="€"></td>
            <td><input type="number" class="ressource" data-role="${role}" data-moins="${mois.getMonth()}" placeholder="€"></td>
            <td><input type="number" class="ressource" data-role="${role}" data-moins="${mois.getMonth()}" placeholder="€"></td>
            <td><input type="number" class="ressource" data-role="${role}" data-moins="${mois.getMonth()}" placeholder="€"></td>
        `;
        table.appendChild(row);
    }
    tableContainer.appendChild(table);
    return tableContainer;
}

function genererTableauRessources() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const statut = document.getElementById("statut").value;
    
    console.log('Date d\'effet:', dateEffet);
    console.log('Statut:', statut);

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

// Partie 2/4 : Fonction de calcul des ressources et des droits ASI

// Fonction pour calculer les ressources totales
function calculerRessources() {
    const abattement = parseFloat(document.getElementById("abat").value);
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const statut = document.getElementById("statut").value;

    if (!abattement || isNaN(dateEffet.getTime()) || !statut) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    // Calcul des ressources
    const totalRessources = Array.from(document.querySelectorAll(".ressource")).reduce((total, input) => {
        return total + parseFloat(input.value) || 0;
    }, 0);

    // Calcul du plafond
    const year = dateEffet.getFullYear();
    const plafond = plafonds[year] && plafonds[year][statut];

    const resultContainer = document.getElementById("resultats");
    resultContainer.innerHTML = ""; // Réinitialise le contenu

    if (plafond) {
        const result = totalRessources - abattement;
        const droitsASI = result > plafond ? result - plafond : 0;

        const resultHtml = `
            <div class="result">
                <h2>Résultats du calcul</h2>
                <table>
                    <tr><td><strong>Ressources totales après abattement</strong></td><td>${totalRessources - abattement} €</td></tr>
                    <tr><td><strong>Plafond pour cette année</strong></td><td>${plafond} €</td></tr>
                    <tr><td><strong>Droits ASI</strong></td><td>${droitsASI} €</td></tr>
                </table>
            </div>
        `;
        resultContainer.innerHTML = resultHtml;
    } else {
        resultContainer.innerHTML = "<p>Plafond non disponible pour cette année.</p>";
    }
}
// Partie 3/4 : Ajout des événements et logique de calcul

// Ajouter un événement sur le bouton pour lancer le calcul
document.getElementById("calculate").addEventListener("click", calculerRessources);

// Mettre à jour dynamiquement le tableau lors du changement de statut ou de date
document.getElementById("dateEffet").addEventListener("input", genererTableauRessources);
document.getElementById("statut").addEventListener("change", genererTableauRessources);

// Fonction pour afficher les résultats mensuels
function generateMonthlyDetails(details, role) {
    let html = `<h4>Détails des ressources pour ${role}</h4>`;
    details.forEach(detail => {
        html += `
            <h5>${detail.mois}</h5>
            <table>
                <tr><td>Pension d'invalidité</td><td>${detail.invalidite.toFixed(2)} €</td></tr>
                <tr><td>Salaires</td><td>${detail.salaires.toFixed(2)} €</td></tr>
                <tr><td>Indemnités journalières</td><td>${detail.indemnites.toFixed(2)} €</td></tr>
                <tr><td>Chômage</td><td>${detail.chomage.toFixed(2)} €</td></tr>
                <tr><td>BIM (Capitaux placés)</td><td>${detail.bim.toFixed(2)} €</td></tr>
                <tr><td><strong>Total mensuel</strong></td><td><strong>${detail.moisTotal.toFixed(2)} €</strong></td></tr>
            </table>`;
    });
    return html;
}
// Partie 4/4 : Calcul final des droits ASI, conclusion et finalisation

// Fonction pour calculer l'ASI et afficher les résultats
function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const abattement = parseFloat(document.getElementById("abat").value) || 0;

    if (!statut || isNaN(dateEffet.getTime())) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    const annee = dateEffet.getFullYear();
    const plafondAnnuel = plafonds[annee] && plafonds[annee][statut];
    if (!plafondAnnuel) {
        alert("Plafond non disponible pour l'année sélectionnée.");
        return;
    }

    const ressourcesTotales = Array.from(document.querySelectorAll(".ressource")).reduce((total, input) => {
        return total + parseFloat(input.value) || 0;
    }, 0);

    const ressourcesApresAbattement = ressourcesTotales - abattement;
    const droitsASI = ressourcesApresAbattement > plafondAnnuel ? ressourcesApresAbattement - plafondAnnuel : 0;

    const resultDiv = document.getElementById("resultats");
    resultDiv.innerHTML = `
        <h3>Calcul des Droits ASI</h3>
        <p><strong>Ressources totales après abattement:</strong> ${ressourcesApresAbattement.toFixed(2)} €</p>
        <p><strong>Plafond pour ${statut} (${annee}):</strong> ${plafondAnnuel.toFixed(2)} €</p>
        <p><strong>Droits ASI:</strong> ${droitsASI.toFixed(2)} €</p>
    `;
}
