// Variables globales
const moisFrancais = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];

// Plafonds ASI par année (valeurs depuis 2017, en euros)
const plafonds = {
    2017: { personneSeule: 1128.70, couple: 1859.10 },
    2018: { personneSeule: 1144.60, couple: 1885.60 },
    2019: { personneSeule: 1160.04, couple: 1911.74 },
    2020: { personneSeule: 1173.77, couple: 1935.98 },
    2021: { personneSeule: 1183.25, couple: 1951.78 },
    2022: { personneSeule: 1163.92, couple: 1919.04 },
    2023: { personneSeule: 1177.44, couple: 1939.57 },
    2024: { personneSeule: 1189.22, couple: 1958.56 },
};

// Fonction pour récupérer le plafond selon l'année
function getPlafond(dateEffet, statut) {
    const annee = dateEffet.getFullYear();
    const plafondsAnnee = plafonds[annee] || plafonds[2024];
    return statut === "personneSeule" ? plafondsAnnee.personneSeule : plafondsAnnee.couple;
}
function genererTableau(dateEffet) {
    const tableBody = document.getElementById("table-ressources");
    tableBody.innerHTML = ""; // Réinitialiser le tableau
    const date = new Date(dateEffet);
    date.setMonth(date.getMonth() - 1); // Commencer au mois précédent la date d'effet

    for (let i = 0; i < 3; i++) {
        const row = document.createElement("tr");
        
        // Ajouter les mois dans l'ordre décroissant
        const moisCell = document.createElement("td");
        const mois = moisFrancais[date.getMonth()] + " " + date.getFullYear();
        moisCell.textContent = mois;
        row.appendChild(moisCell);

        // Colonnes pour les ressources
        ["pension", "salaire", "indemnites", "chomage"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.placeholder = "€";
            input.dataset.type = type;
            input.dataset.mois = mois;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
        date.setMonth(date.getMonth() - 1); // Reculer d'un mois
    }
}

// Gestion de l'ajout de lignes
document.getElementById("ajouter-ligne").addEventListener("click", (e) => {
    e.preventDefault();
    genererTableau(new Date(document.getElementById("date-effet").value));
});
function calculerASI() {
    const dateEffet = new Date(document.getElementById("date-effet").value);
    const statut = document.getElementById("statut").value;
    const plafondTrimestriel = getPlafond(dateEffet, statut) * 3;

    // Récupérer les ressources
    const ressources = [];
    document.querySelectorAll("#table-ressources tr").forEach(row => {
        const mois = row.cells[0].textContent;
        let total = 0;
        ["pension", "salaire", "indemnites", "chomage"].forEach((type, index) => {
            const valeur = parseFloat(row.cells[index + 1].querySelector("input").value) || 0;
            total += valeur;
        });
        ressources.push({ mois, total });
    });

    // Calcul des droits
    const resultats = ressources.map(({ mois, total }) => {
        const asi = Math.max(0, plafondTrimestriel - total);
        return { mois, total, asi: asi.toFixed(2) };
    });

    afficherResultats(resultats, plafondTrimestriel);
}
function afficherResultats(resultats, plafondTrimestriel) {
    const resultatsContainer = document.getElementById("resultats");
    resultatsContainer.innerHTML = ""; // Réinitialiser les résultats

    // Tableau des résultats
    const table = document.createElement("table");
    table.className = "result-table";

    // Entêtes du tableau
    const headerRow = document.createElement("tr");
    ["Mois", "Total Ressources", "ASI due"].forEach(texte => {
        const headerCell = document.createElement("th");
        headerCell.textContent = texte;
        headerRow.appendChild(headerCell);
    });
    table.appendChild(headerRow);

    // Lignes des résultats
    resultats.forEach(({ mois, total, asi }) => {
        const row = document.createElement("tr");

        const moisCell = document.createElement("td");
        moisCell.textContent = mois;
        row.appendChild(moisCell);

        const totalCell = document.createElement("td");
        totalCell.textContent = `${total.toFixed(2)} €`;
        row.appendChild(totalCell);

        const asiCell = document.createElement("td");
        asiCell.textContent = `${asi} €`;
        row.appendChild(asiCell);

        table.appendChild(row);
    });

    resultatsContainer.appendChild(table);

    // Ajouter la conclusion
    const conclusion = document.createElement("p");
    conclusion.className = "conclusion";
    conclusion.textContent = `Le montant trimestriel maximum de l'ASI est de ${plafondTrimestriel.toFixed(2)} €.`;
    resultatsContainer.appendChild(conclusion);
}
document.getElementById("date-effet").addEventListener("change", () => {
    const dateEffet = document.getElementById("date-effet").value;
    genererTableau(dateEffet);
});

document.getElementById("calculer").addEventListener("click", (e) => {
    e.preventDefault();
    calculerASI();
});
