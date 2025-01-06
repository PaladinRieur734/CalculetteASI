const plafonds = {
    "2017": { seul: 9658.13, couple: 15592.07 },
    "2018": { seul: 9820.46, couple: 15872.24 },
    "2019": { seul: 9951.84, couple: 16091.92 },
    "2020": { seul: 10068.00, couple: 16293.12 },
    "2021": { seul: 10183.20, couple: 16396.49 },
    "2022": { seul: 10265.16, couple: 16512.93 },
    "2023": {
        seul: { avantAvril: 10320.07, apresAvril: 10536.50 },
        couple: { avantAvril: 16548.23, apresAvril: 16890.35 },
    },
    "2024": {
        seul: { avantAvril: 10536.50, apresAvril: 10768.00 },
        couple: { avantAvril: 16890.35, apresAvril: 17232.70 },
    },
};

function genererTrimestrePrecedent() {
    const statut = document.getElementById("statut").value; // "seul" ou "couple"
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    if (isNaN(dateEffet.getTime())) {
        alert("Veuillez entrer une date d'effet valide.");
        return; // Si la date est invalide, ne rien faire
    }

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise les champs

    // Génère les ressources pour le trimestre précédent la date d'effet
    const mois = [];
    for (let i = 1; i <= 3; i++) {
        const moisPrecedent = new Date(dateEffet);
        moisPrecedent.setMonth(moisPrecedent.getMonth() - i);
        mois.push(moisPrecedent.toLocaleString("fr-FR", { month: "long", year: "numeric" }));
    }

    const trimestreDiv = document.createElement("div");
    trimestreDiv.className = "trimestre";
    trimestreDiv.innerHTML = `
        <h3>Ressources du trimestre précédent (${mois.reverse().join(", ")})</h3>
        <label for="salaires">Salaires :</label>
        <input type="number" id="salaires" placeholder="Montant total en €">

        <label for="indemnites">Indemnités journalières :</label>
        <input type="number" id="indemnites" placeholder="Montant total en €">

        <label for="chomage">Chômage :</label>
        <input type="number" id="chomage" placeholder="Montant total en €">

        <label for="invalidite">Pension d'invalidité :</label>
        <input type="number" id="invalidite" placeholder="Montant total en €">

        <label for="autres">Autres ressources :</label>
        <input type="number" id="autres" placeholder="Montant total en €">
    `;
    ressourcesContainer.appendChild(trimestreDiv);
}

// Fonction pour calculer les droits ASI
function calculerASI() {
    const statut = document.getElementById("statut").value; // "seul" ou "couple"
    const dateEffet = new Date(document.getElementById("dateEffet").value);

    if (isNaN(dateEffet.getTime())) {
        alert("Veuillez entrer une date d'effet valide.");
        return;
    }

    const annee = dateEffet.getFullYear();
    const moisEffet = dateEffet.getMonth() + 1; // Janvier = 0

    // Déterminer le plafond applicable (avant ou après avril)
    const plafond = (moisEffet < 4)
        ? plafonds[annee - 1][statut] || plafonds[annee][statut] // Si avant avril, prendre l'année précédente
        : plafonds[annee][statut];

    const plafondTrimestriel = (moisEffet >= 4 && plafonds[annee]?.[statut]?.apresAvril)
        ? plafond.apresAvril / 4
        : plafond.avantAvril
        ? plafond.avantAvril / 4
        : plafond / 4;

    const ressources = [
        parseFloat(document.getElementById("salaires").value) || 0,
        parseFloat(document.getElementById("indemnites").value) || 0,
        parseFloat(document.getElementById("chomage").value) || 0,
        parseFloat(document.getElementById("invalidite").value) || 0,
        parseFloat(document.getElementById("autres").value) || 0,
    ];

    const totalRessources = ressources.reduce((sum, value) => sum + value, 0);

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<h3>Résultats :</h3>";

    if (totalRessources <= plafondTrimestriel) {
        const droit = plafondTrimestriel - totalRessources;
        resultDiv.innerHTML += `✅ Droits accordés : <strong>${droit.toFixed(2)} €</strong> pour le trimestre.<br>`;
    } else {
        resultDiv.innerHTML += `❌ Pas de droits (Ressources : ${totalRessources.toFixed(2)} €, Plafond trimestriel : ${plafondTrimestriel.toFixed(2)} €).<br>`;
    }
}
