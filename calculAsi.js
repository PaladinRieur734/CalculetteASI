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

// Fonction pour générer les mois du trimestre précédent
function genererMoisPrecedents() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    if (isNaN(dateEffet.getTime())) {
        alert("Veuillez entrer une date d'effet valide.");
        return; // Si la date est invalide, ne rien faire
    }

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise les champs

    // Calcule le début du trimestre précédent
    const moisDebut = new Date(dateEffet);
    moisDebut.setMonth(moisDebut.getMonth() - 3); // Début du trimestre (3 mois avant)
    moisDebut.setDate(1); // Premier jour du mois

    // Génère les 3 mois du trimestre précédent
    for (let i = 0; i < 3; i++) {
        const mois = new Date(moisDebut);
        mois.setMonth(moisDebut.getMonth() + i);

        const moisDiv = document.createElement("div");
        moisDiv.className = "mois";
        moisDiv.innerHTML = `
            <h3>${mois.toLocaleString("fr-FR", { month: "long", year: "numeric" })}</h3>
            <label for="salairesM${i + 1}">Salaires :</label>
            <input type="number" id="salairesM${i + 1}" placeholder="Montant en €" min="0">

            <label for="indemnitesM${i + 1}">Indemnités journalières :</label>
            <input type="number" id="indemnitesM${i + 1}" placeholder="Montant en €" min="0">

            <label for="chomageM${i + 1}">Chômage :</label>
            <input type="number" id="chomageM${i + 1}" placeholder="Montant en €" min="0">

            <label for="invaliditeM${i + 1}">Pension d'invalidité :</label>
            <input type="number" id="invaliditeM${i + 1}" placeholder="Montant en €" min="0">

            <label for="autresM${i + 1}">Autres ressources :</label>
            <input type="number" id="autresM${i + 1}" placeholder="Montant en €" min="0">
        `;
        ressourcesContainer.appendChild(moisDiv);
    }
}

// Fonction pour calculer les droits ASI
function calculerASI() {
    const statut = document.getElementById("statut").value; // "seul" ou "couple"
    const dateEffet = new Date(document.getElementById("dateEffet").value);

    if (isNaN(dateEffet.getTime())) {
        alert("Veuillez entrer une date d'effet valide.");
        return;
    }

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<h3>Résultats mensuels :</h3>";

    let droitsTotal = 0;

    // Récupération du plafond trimestriel pour l'année de la date d'effet
    const plafondTrimestriel = plafonds[dateEffet.getFullYear()][statut] / 4;

    // Calcul des ressources totales pour le trimestre précédent
    let ressourcesTrimestre = 0;
    for (let i = 1; i <= 3; i++) {
        const ressources = [
            parseFloat(document.getElementById(`salairesM${i}`).value) || 0,
            parseFloat(document.getElementById(`indemnitesM${i}`).value) || 0,
            parseFloat(document.getElementById(`chomageM${i}`).value) || 0,
            parseFloat(document.getElementById(`invaliditeM${i}`).value) || 0,
            parseFloat(document.getElementById(`autresM${i}`).value) || 0,
        ];

        const totalMois = ressources.reduce((sum, value) => sum + value, 0);
        ressourcesTrimestre += totalMois;

        resultDiv.innerHTML += `<p>${i}e mois avant : Ressources = <strong>${totalMois.toFixed(2)} €</strong>.</p>`;
    }

    // Calcul du droit ASI
    if (ressourcesTrimestre <= plafondTrimestriel) {
        const droit = plafondTrimestriel - ressourcesTrimestre;
        droitsTotal += droit;
        resultDiv.innerHTML += `<h4>✅ Droits totaux pour le trimestre : <strong>${droit.toFixed(2)} €</strong>.</h4>`;
    } else {
        resultDiv.innerHTML += `<h4>❌ Pas de droits (Ressources trimestrielles : ${ressourcesTrimestre.toFixed(2)} €, Plafond trimestriel : ${plafondTrimestriel.toFixed(2)} €).</h4>`;
    }
}
