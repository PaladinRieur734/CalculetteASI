document.getElementById("calculateBtn").addEventListener("click", calculateASI);
document.getElementById("dateEffet").addEventListener("change", generateResourceTable);

function generateResourceTable() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    if (isNaN(dateEffet)) return;

    const resourcesContainer = document.getElementById("ressourcesContainer");
    resourcesContainer.innerHTML = "";

    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");

    const headers = ["Mois", "Pension d'invalidité", "Salaires", "IJ", "Chômage", "BIM", "Autres", "Total"];
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (let i = -3; i < 12; i++) {
        const row = document.createElement("tr");
        const currentMonth = new Date(dateEffet.getFullYear(), dateEffet.getMonth() + i);
        const monthCell = document.createElement("td");
        monthCell.textContent = months[currentMonth.getMonth()] + " " + currentMonth.getFullYear();
        row.appendChild(monthCell);

        for (let j = 0; j < headers.length - 2; j++) {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.min = "0";
            input.placeholder = "0 €";
            input.classList.add("resource-input");
            cell.appendChild(input);
            row.appendChild(cell);
        }

        const totalCell = document.createElement("td");
        totalCell.classList.add("total-cell");
        totalCell.textContent = "0 €";
        row.appendChild(totalCell);

        table.appendChild(row);
    }

    resourcesContainer.appendChild(table);
}

function calculateASI() {
    const resultatsContainer = document.getElementById("resultatsContainer");
    resultatsContainer.innerHTML = "<p>Calcul en cours...</p>";
    setTimeout(() => {
        resultatsContainer.innerHTML = "<p>Calcul terminé. Résultats affichés ici.</p>";
    }, 1000);
}

