const plafonds = {
    "2023": { seul: 10320.07, couple: 16548.23 },
    "2024": { seul: 10536.50, couple: 16890.35 },
};

// Fonction pour calculer les droits ASI
function calculerASI() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const statut = document.getElementById("statut").value; // "seul" ou "couple"
    const abattement = parseFloat(document.getElementById("abattement").value) || 0;

    // Récupération des ressources trimestrielles
    const ressourcesTrimestrielles = [
        parseFloat(document.getElementById("ressourceT1").value) || 0,
        parseFloat(document.getElementById("ressourceT2").value) || 0,
        parseFloat(document.getElementById("ressourceT3").value) || 0,
        parseFloat(document.getElementById("ressourceT4").value) || 0,
    ];

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<h3>Résultats trimestriels :</h3>";

    // Calculer les plafonds et droits pour chaque trimestre (12 mois après la date d'effet)
    let trimestreCourant = Math.floor(dateEffet.getMonth() / 3); // Trimestre d'effet
    let annee = dateEffet.getFullYear();
    let droitsTotal = 0;

    for (let i = 0; i < 4; i++) {
        // Déterminer le plafond trimestriel
        const plafond = plafonds[annee][statut] / 4;
        const ressourceTrimestre = ressourcesTrimestrielles[trimestreCourant] || 0;
        const netTrimestriel = Math.max(0, ressourceTrimestre - abattement / 4);

        // Calcul des droits
        if (netTrimestriel <= plafond) {
            const droit = plafond - netTrimestriel;
            droitsTotal += droit;
            resultDiv.innerHTML += `✅ Trimestre ${i + 1} (${annee}) : Droits ASI = <strong>${droit.toFixed(2)} €</strong>.<br>`;
        } else {
            resultDiv.innerHTML += `❌ Trimestre ${i + 1} (${annee}) : Pas de droits (Ressources : ${netTrimestriel.toFixed(2)} €).<br>`;
        }

        // Passer au trimestre suivant
        trimestreCourant = (trimestreCourant + 1) % 4;
        if (trimestreCourant === 0) annee++; // Nouvelle année
    }

    resultDiv.innerHTML += `<br><strong>Droits totaux sur 12 mois :</strong> ${droitsTotal.toFixed(2)} €`;
}
