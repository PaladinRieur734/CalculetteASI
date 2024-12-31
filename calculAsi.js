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

function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);

    if (isNaN(dateEffet.getTime())) {
        alert("Veuillez entrer une date d'effet valide.");
        return;
    }

    if (!statut) {
        alert("Veuillez sélectionner un statut.");
        return;
    }

    const annee = dateEffet.getFullYear();
    const plafondAnnuel = plafonds[annee]?.[statut];
    if (!plafondAnnuel) {
        alert("Plafond introuvable pour l'année sélectionnée.");
        return;
    }
    const plafondTrimestriel = plafondAnnuel / 4;

    const result = document.getElementById("result");
    result.innerHTML = ""; // Réinitialise les résultats

    // Calcul des ressources pour le demandeur
    const demandeurRessources = calculateRessources("Demandeur", dateEffet);

    // Calcul des ressources pour le conjoint si le statut est "couple"
    let conjointRessources = null;
    if (statut === "couple") {
        conjointRessources = calculateRessources("Conjoint", dateEffet);
    }

    // Total des ressources
    const totalRessources = demandeurRessources.total + (conjointRessources ? conjointRessources.total : 0);
    const totalRessourcesApresAbattement = totalRessources - demandeurRessources.abattement;

    // Résultat détaillé
    result.innerHTML += `<h3>Ressources détaillées</h3>`;
    demandeurRessources.details.forEach(detail => {
        result.innerHTML += detail;
    });

    if (conjointRessources) {
        result.innerHTML += `<h3>Ressources du conjoint</h3>`;
        conjointRessources.details.forEach(detail => {
            result.innerHTML += detail;
        });
    }

    // Résumé des calculs
    result.innerHTML += `
        <h3>Résumé du trimestre</h3>
        <table>
            <tr><td><strong>Total avant abattement</strong></td><td><strong>${totalRessources.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Abattement appliqué</strong></td><td><strong>${demandeurRessources.abattement.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Total après abattement</strong></td><td><strong>${totalRessourcesApresAbattement.toFixed(2)} €</strong></td></tr>
            <tr><td><strong>Plafond trimestriel applicable</strong></td><td><strong>${plafondTrimestriel.toFixed(2)} €</strong></td></tr>
        </table>`;

    // Conclusion
    if (totalRessourcesApresAbattement > plafondTrimestriel) {
        result.innerHTML += `<p>Les ressources combinées au cours du trimestre de référence, soit ${totalRessourcesApresAbattement.toFixed(2)} € étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l’allocation supplémentaire d’invalidité ne pouvait pas être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    } else {
        const montantASI = plafondTrimestriel - totalRessour
