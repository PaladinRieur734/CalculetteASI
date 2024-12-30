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
    const header = `
        <tr>
            <th>Mois</th>
            <th>Salaires</th>
            <th>Indemnités journalières</th>
            <th>Chômage</th>
            <th>Pension d'invalidité</th>
            <th>Autres ressources</th>
        </tr>`;
    table.innerHTML = header;

    for (let i = 0; i < 12; i++) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const row = `
        <tr>
            <td>${mois.toLocaleString("fr-FR", { month: "long", year: "numeric" })}</td>
            <td><input type="number" id="salairesM${i}" placeholder="€"></td>
            <td><input type="number" id="indemnitesM${i}" placeholder="€"></td>
            <td><input type="number" id="chomageM${i}" placeholder="€"></td>
            <td><input type="number" id="invaliditeM${i}" placeholder="€"></td>
            <td><input type="number" id="autresM${i}" placeholder="€"></td>
        </tr>`;
        table.innerHTML += row;
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

    const plafondAnnuel = plafonds[dateEffet.getFullYear()][statut];
    const plafondTrimestriel = plafondAnnuel / 4;

    let totalTrimestres = [0, 0, 0, 0];

    for (let i = 0; i < 12; i++) {
        const moisRessources = [
            parseFloat(document.getElementById(`salairesM${i}`).value) || 0,
            parseFloat(document.getElementById(`indemnitesM${i}`).value) || 0,
            parseFloat(document.getElementById(`chomageM${i}`).value) || 0,
            parseFloat(document.getElementById(`invaliditeM${i}`).value) || 0,
            parseFloat(document.getElementById(`autresM${i}`).value) || 0,
        ];
        const totalMois = moisRessources.reduce((sum, value) => sum + value, 0);
        totalTrimestres[Math.floor(i / 3)] += totalMois;
    }

    const droits = totalTrimestres.map(trimestre => 
        trimestre <= plafondTrimestriel ? plafondTrimestiel - trimestre : 0
    );

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
        <p><strong>Droits ASI Trimestre 1 :</strong> ${droits[0].toFixed(2)} €</p>
        <p><strong>Droits ASI Trimestre 2 :</strong> ${droits[1].toFixed(2)} €</p>
        <p><strong>Droits ASI Trimestre 3 :</strong> ${droits[2].toFixed(2)} €</p>
        <p><strong>Droits ASI Trimestre 4 :</strong> ${droits[3].toFixed(2)} €</p>
    `;
}
