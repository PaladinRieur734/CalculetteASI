function calculerASI() {
    // Récupérer les champs
    const pension = parseFloat(document.getElementById("pension").value) || 0;
    const salaire = parseFloat(document.getElementById("salaire").value) || 0;
    const indemnites = parseFloat(document.getElementById("indemnites").value) || 0;
    const foncier = parseFloat(document.getElementById("foncier").value) || 0;
    const autres = parseFloat(document.getElementById("autres").value) || 0;
    const abattement = parseFloat(document.getElementById("abattement").value) || 0;
    const plafond = parseFloat(document.getElementById("plafond").value) || 0;

    // Calcul des ressources totales avant abattement
    const totalAnnuelBrut = pension + salaire + indemnites + foncier + autres;

    // Application de l'abattement
    const totalAnnuelNet = Math.max(0, totalAnnuelBrut - abattement);

    // Comparaison avec le plafond
    const resultDiv = document.getElementById("result");
    if (totalAnnuelNet <= plafond) {
        const allocation = plafond - totalAnnuelNet;
        resultDiv.innerHTML = `✅ Vous êtes éligible à l'ASI. Montant estimé annuel : <strong>${allocation.toFixed(2)} €</strong>.`;
    } else {
        resultDiv.innerHTML = `❌ Vous n'êtes pas éligible à l'ASI. Vos ressources annuelles après abattement (${totalAnnuelNet.toFixed(2)} €) dépassent le plafond de ${plafond.toFixed(2)} €.`;
    }
}
