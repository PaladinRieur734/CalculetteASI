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

function genererTableauRessources() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    if (isNaN(dateEffet.getTime())) {
        alert("Veuillez entrer une date d'effet valide.");
        return;
    }

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

    const table = document.createElement("table");
    const header = document.createElement("tr");
    ["Mois", "Salaires", "Indemnités journalières", "Chômage", "Pension d'invalidité", "Autres ressources"].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        header.appendChild(th);
    });
    table.appendChild(header);

    for (let i = 1; i <= 3; i++) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const row = document.createElement("tr");
        const moisCell = document.createElement("td");
        moisCell.textContent = mois.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        ["salaires", "indemnites", "chomage", "invalidite", "autres"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${type}M${i}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);
    }

    ressourcesContainer.appendChild(table);
}

function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    if (isNaN(dateEffet.getTime())) {
        alert("Veuillez entrer une date d'effet valide.");
        return;
    }

    const annee = dateEffet.getFullYear();
    const plafondAnnuel = plafonds[annee]?.[statut];
    if (!plafondAnnuel) {
        alert("Plafond introuvable pour l'année sélectionnée.");
        return;
    }
    const plafondTrimestriel = plafondAnnuel / 4;

    let totalRessources = 0;
    for (let i = 1; i <= 3; i++) {
        const salaires = parseFloat(document.getElementById(`salairesM${i}`).value) || 0;
        const indemnites = parseFloat(document.getElementById(`indemnitesM${i}`).value) || 0;
        const chomage = parseFloat(document.getElementById(`chomageM${i}`).value) || 0;
        const invalidite = parseFloat(document.getElementById(`invaliditeM${i}`).value) || 0;
        const autres = parseFloat(document.getElementById(`autresM${i}`).value) || 0;

        totalRessources += salaires + indemnites + chomage + invalidite + autres;
    }

    const abattement = parseFloat(document.getElementById("abattement").value) || 0;
    totalRessources -= abattement;

    const result = document.getElementById("result");
    result.innerHTML = "";

    if (totalRessources <= plafondTrimestriel) {
        result.innerHTML = `<p>Droits à l'ASI accordés. Ressources totales : ${totalRessources.toFixed(2)} €</p>`;
    } else {
        result.innerHTML = `<p>Aucun droit à l'ASI. Ressources totales : ${totalRessources.toFixed(2)} €</p>`;
    }
}
