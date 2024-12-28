const plafonds = {
    "2023": { seul: 10320.07, couple: 16548.23 },
    "2024": { seul: 10536.50, couple: 16890.35 },
};

// Fonction pour générer les mois précédant la date d'effet
function genererMoisPrecedents() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    if (isNaN(dateEffet.getTime())) return; // Si la date est invalide, ne rien faire

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise les champs

    const moisPrecedents = [];
    for (let i = 1; i <= 3; i++) {
        const date = new Date(dateEffet);
        date.setMonth(dateEffet.getMonth() - i);
        moisPrecedents.push(date);
    }

    moisPrecedents.reverse(); // Afficher dans l'ordre chronologique

    // Crée les champs pour chaque mois
    moisPrecedents.forEach((mois, index) => {
        const moisDiv = document.createElement("div");
        moisDiv.className = "mois";
        moisDiv.innerHTML = `
            <h3>${mois.toLocaleString("fr-FR", { month: "long", year: "numeric" })}</h3>
            <label for="salairesM${index + 1}">Salaires :</label>
            <input type="number" id="salairesM${index + 1}" placeholder="Montant en €">

            <label for="indemnitesM${index + 1}">Indemnités journalières :</label>
            <input type="number" id="indemnitesM${index + 1}" placeholder="Montant en €">

            <label for="chomageM${index + 1}">Chômage :</label>
            <input type="number" id="chomageM${index + 1}" placeholder="Montant en €">

            <label for="invaliditeM${index + 1}">Pension d'invalidité :</label>
            <input type="number" id="invaliditeM${index + 1}" placeholder="Montant en €">

            <label for="autresM${index + 1}">Autres ressources :</label>
            <input type="number" id="autresM${index + 1}" placeholder="Montant en €">
        `;

        ressourcesContainer.appendChild(moisDiv);
    });
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

