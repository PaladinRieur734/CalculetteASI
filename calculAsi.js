document.addEventListener("DOMContentLoaded", function () {
    const statut = document.getElementById("statut");
    const dateEffet = document.getElementById("dateEffet");
    const abat = document.getElementById("abat");
    const calculateButton = document.getElementById("calculate");
    const tableContainer = document.getElementById("tableContainer");
    const resultats = document.getElementById("resultats");

    // Fonction pour afficher le tableau
    function afficherTableau() {
        const table = document.createElement("table");
        const headerRow = document.createElement("tr");

        const columns = ["Ressource", "Montant (€)", "+"];
        columns.forEach((col) => {
            const th = document.createElement("th");
            th.textContent = col;
            headerRow.appendChild(th);
        });

        table.appendChild(headerRow);

        // Ligne de base
        const row = document.createElement("tr");
        for (let i = 0; i < columns.length; i++) {
            const cell = document.createElement("td");
            if (i === 0) {
                cell.textContent = "Nouvelle ressource";
            } else if (i === 1) {
                const input = document.createElement("input");
                input.type = "number";
                input.placeholder = "Montant";
                cell.appendChild(input);
            } else {
                const addButton = document.createElement("button");
                addButton.textContent = "+";
                addButton.onclick = ajouterLigne;
                cell.appendChild(addButton);
            }
            row.appendChild(cell);
        }
        table.appendChild(row);

        tableContainer.innerHTML = ""; // Réinitialise le tableau
        tableContainer.appendChild(table);
    }

    // Fonction pour ajouter une ligne
    function ajouterLigne() {
        const table = tableContainer.querySelector("table");
        const newRow = document.createElement("tr");

        for (let i = 0; i < 3; i++) {
            const cell = document.createElement("td");
            if (i === 0) {
                cell.textContent = "Nouvelle ressource";
            } else if (i === 1) {
                const input = document.createElement("input");
                input.type = "number";
                input.placeholder = "Montant";
                cell.appendChild(input);
            } else {
                const addButton = document.createElement("button");
                addButton.textContent = "+";
                addButton.onclick = ajouterLigne;
                cell.appendChild(addButton);
            }
            newRow.appendChild(cell);
        }

        table.appendChild(newRow);
    }

    // Fonction pour calculer les droits
    function calculerDroits() {
        const inputs = tableContainer.querySelectorAll("input[type='number']");
        let total = 0;

        inputs.forEach((input) => {
            total += parseFloat(input.value) || 0;
        });

        const abattement = parseFloat(abat.value) || 0;
        total -= abattement;

        resultats.innerHTML = `
            <h2>Droits ASI au ${dateEffet.value}</h2>
            <p>Total après abattement : ${total.toFixed(2)} €</p>
        `;
    }

    // Événements
    calculateButton.addEventListener("click", calculerDroits);
    statut.addEventListener("change", afficherTableau);
    dateEffet.addEventListener("change", afficherTableau);

    // Initialisation
    afficherTableau();
});
