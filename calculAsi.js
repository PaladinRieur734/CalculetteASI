document.addEventListener("DOMContentLoaded", () => {
    const statut = document.getElementById("statut");
    const dateEffet = document.getElementById("dateEffet");
    const tableContainer = document.getElementById("tableContainer");
    const addColumnButton = document.createElement("button");
    const calculateButton = document.getElementById("calculate");
    const resultats = document.getElementById("resultats");

    // Créer le tableau dynamiquement
    let table;

    function createTable() {
        table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        ["Revenus", "Charges"].forEach((headerText) => {
            const th = document.createElement("th");
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);
        tableContainer.appendChild(table);

        // Bouton "+" intégré au tableau
        addColumnButton.id = "addColumnButton";
        addColumnButton.textContent = "+";
        tableContainer.appendChild(addColumnButton);

        const tbody = document.createElement("tbody");
        table.appendChild(tbody);
    }

    function clearTable() {
        tableContainer.innerHTML = "";
    }

    // Ajouter une colonne
    addColumnButton.addEventListener("click", () => {
        const rows = table.querySelectorAll("tr");
        rows.forEach((row, index) => {
            const cell = document.createElement(index === 0 ? "th" : "td");
            cell.textContent = index === 0 ? `Nouvelle colonne` : "";
            row.appendChild(cell);
        });
    });

    // Afficher le tableau lorsqu'un statut et une date d'effet sont sélectionnés
    statut.addEventListener("change", () => {
        if (statut.value && dateEffet.value) {
            clearTable();
            createTable();
        }
    });

    dateEffet.addEventListener("change", () => {
        if (statut.value && dateEffet.value) {
            clearTable();
            createTable();
        }
    });

    // Calculer les droits
    calculateButton.addEventListener("click", () => {
        resultats.innerHTML = `<h3>Résultats</h3><p>Les droits ont été calculés.</p>`;
    });
});
