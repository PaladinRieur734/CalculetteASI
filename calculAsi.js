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

function genererMoisPrecedents() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    if (isNaN(dateEffet.getTime())) {
        alert("Veuillez entrer une date d'effet valide.");
        return; // Si la date est invalide, ne rien faire
    }

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise les champs

    // Génère les 3 mois précédant la date d'effet
    for (let i = 1; i <= 3; i++) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const moisDiv = document.createElement("div");
        moisDiv.className = "mois";
        moisDiv.innerHTML = `
            <h3>${mois.toLocaleString("fr-FR", { month: "long", year: "numeric" })}</h3>
            <label for="salairesM${i}">Salaires :</label>
            <input type="number" id="salairesM${i}" placeholder="Montant en €">

            <label for="indemnitesM${i}">Indemnités journalières :</label>
            <input type="number" id="indemnitesM${i}" placeholder="Montant en €">

            <label for="chomageM${i}">Chômage :</label>
            <input type="number" id="chomageM${i}" placeholder="Montant en €">

            <label for="invaliditeM${i}">Pension d'invalidité :</label>
            <input type="number" id="invaliditeM${i}" placeholder="Montant en €">

            <label for="autresM${i}">Autres ressources :</label>
            <input type="number" id="autresM${i}" placeholder="Montant en €">
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

    for (let i = 1; i <= 3; i++) {
        const ressources = [
            parseFloat(document.getElementById(`salairesM${i}`).value) || 0,
            parseFloat(document.getElementById(`indemnitesM${i}`).value) || 0,
            parseFloat(document.getElementById(`chomageM${i}`).value) || 0,
            parseFloat(document.getElementById(`invaliditeM${i}`).value) || 0,
            parseFloat(document.getElementById(`autresM${i}`).value) || 0,
        ];

        const totalRessources = ressources.reduce((sum, value) => sum + value, 0);
        const plafondMensuel = plafonds[dateEffet.getFullYear()][statut] / 12;

        if (totalRessources <= plafondMensuel) {
            const droit = plafondMensuel - totalRessources;
            droitsTotal += droit * 3; // Mois vers trimestre
            resultDiv.innerHTML += `✅ ${i} mois avant : Droits = <strong>${droit.toFixed(2)} €</strong>.<br>`;
        } else {
            resultDiv.innerHTML += `❌ ${i} mois avant : Pas de droits (Ressources : ${totalRessources.toFixed(2)} €).<br>`;
        }
    }

    resultDiv.innerHTML += `<br><strong>Droits totaux sur 3 mois :</strong> ${droitsTotal.toFixed(2)} €`;
}


