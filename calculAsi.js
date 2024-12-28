const plafonds = {
    "2023": { seul: 10320.07, couple: 16548.23 },
    "2024": { seul: 10536.50, couple: 16890.35 },
};

// Fonction pour générer les trimestres en fonction de la date d'effet
function genererTrimestres() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    if (isNaN(dateEffet.getTime())) return; // Si la date est invalide, ne rien faire

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise les champs

    let trimestreCourant = Math.floor((dateEffet.getMonth() - 1) / 3); // Trimestre précédent
    let annee = dateEffet.getFullYear();

    // Générer les champs pour les 4 trimestres précédents
    for (let i = 0; i < 4; i++) {
        if (trimestreCourant < 0) {
            trimestreCourant = 3; // Revenir au dernier trimestre de l'année précédente
            annee--;
        }

        const trimestreDiv = document.createElement("div");
        trimestreDiv.className = "trimestre";
        trimestreDiv.innerHTML = `
            <h3>Trimestre ${trimestreCourant + 1} (${annee})</h3>
            <label for="invaliditeT${i + 1}">Pension d'invalidité :</label>
            <input type="number" id="invaliditeT${i + 1}" placeholder="Montant en €">

            <label for="salairesT${i + 1}">Salaires :</label>
            <input type="number" id="salairesT${i + 1}" placeholder="Montant en €">

            <label for="indemnitesT${i + 1}">Indemnités journalières :</label>
            <input type="number" id="indemnitesT${i + 1}" placeholder="Montant en €">

            <label for="chomageT${i + 1}">Chômage :</label>
            <input type="number" id="chomageT${i + 1}" placeholder="Montant en €">

            <label for="autresT${i + 1}">Autres ressources :</label>
            <input type="number" id="autresT${i + 1}" placeholder="Montant en €">
        `;

        ressourcesContainer.appendChild(trimestreDiv);

        trimestreCourant--;
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
    resultDiv.innerHTML = "<h3>Résultats trimestriels :</h3>";

    let trimestreCourant = Math.floor((dateEffet.getMonth() - 1) / 3); // Trimestre précédent
    let annee = dateEffet.getFullYear();
    let droitsTotal = 0;

    // Calcul des droits pour chaque trimestre
    for (let i = 0; i < 4; i++) {
        if (trimestreCourant < 0) {
            trimestreCourant = 3;
            annee--;
        }

        const plafond = plafonds[annee][statut] / 4;

        // Somme des ressources pour ce trimestre
        const ressources = [
            parseFloat(document.getElementById(`invaliditeT${i + 1}`).value) || 0,
            parseFloat(document.getElementById(`salairesT${i + 1}`).value) || 0,
            parseFloat(document.getElementById(`indemnitesT${i + 1}`).value) || 0,
            parseFloat(document.getElementById(`chomageT${i + 1}`).value) || 0,
            parseFloat(document.getElementById(`autresT${i + 1}`).value) || 0,
        ];

        const totalRessources = ressources.reduce((sum, value) => sum + value, 0);

        if (totalRessources <= plafond) {
            const droit = plafond - totalRessources;
            droitsTotal += droit;
            resultDiv.innerHTML += `✅ Trimestre ${trimestreCourant + 1} (${annee}) : Droits ASI = <strong>${droit.toFixed(2)} €</strong>.<br>`;
        } else {
            resultDiv.innerHTML += `❌ Trimestre ${trimestreCourant + 1} (${annee}) : Pas de droits (Ressources : ${totalRessources.toFixed(2)} €).<br>`;
        }

        trimestreCourant--;
    }

    resultDiv.innerHTML += `<br><strong>Droits totaux sur 12 mois :</strong> ${droitsTotal.toFixed(2)} €`;
}
