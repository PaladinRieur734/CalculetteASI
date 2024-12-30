let resourceColumns = ['Pension (€)', 'Salaires (€)', 'Indemnités journalières (€)', 'Chômage (€)', 'BIM (€)', 'Autres ressources (€)'];

function updateTablePeriod() {
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;

    if (!startDateInput || !endDateInput) return;

    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    if (startDate >= endDate) {
        alert("La date de début doit être antérieure à la date de fin.");
        return;
    }

    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    const table = document.createElement('table');

    // Header row
    const headerRow = document.createElement('tr');
    const columnNames = ['Mois', ...resourceColumns, 'Total (€)'];
    columnNames.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Generate rows for each month
    const months = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        months.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    months.forEach((date, i) => {
        const row = document.createElement('tr');
        const monthCell = document.createElement('td');
        monthCell.textContent = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
        row.appendChild(monthCell);

        resourceColumns.forEach((colName, colIndex) => {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.name = `${colName}_${i}`;
            input.min = 0;
            input.oninput = () => calculateRowTotal(row);
            cell.appendChild(input);
            row.appendChild(cell);
        });

        const totalCell = document.createElement('td');
        totalCell.className = 'row-total';
        totalCell.textContent = '0';
        row.appendChild(totalCell);

        table.appendChild(row);
    });

    tableContainer.appendChild(table);
}

function addResourceColumn() {
    const newColumnName = document.getElementById('newColumnName').value.trim();
    if (!newColumnName) {
        alert("Veuillez entrer un nom pour la nouvelle colonne.");
        return;
    }

    resourceColumns.splice(resourceColumns.length - 1, 0, newColumnName + ' (€)'); // Add before "Autres"
    updateTablePeriod(); // Regenerate the table
}

function calculateRowTotal(row) {
    const inputs = row.querySelectorAll('input');
    let total = Array.from(inputs).reduce((sum, input) => {
        if (input.name.startsWith('BIM')) {
            // Ajoutez 3 % des BIM rapportés au trimestre
            return sum + (Number(input.value || 0) * 0.03) / 4;
        }
        return sum + Number(input.value || 0);
    }, 0);
    row.querySelector('.row-total').textContent = total.toFixed(2);
}

function calculateASI() {
    const dateEffet = new Date(document.getElementById('dateEffet').value);
    const year = dateEffet.getFullYear();

    const plafondAnnuel = 10000; // Exemple de plafond annuel
    const plafondTrimestriel = plafondAnnuel / 4;

    const rows = document.querySelectorAll('table tr');
    const trimestreRessources = Array(4).fill(0);

    rows.forEach((row, index) => {
        if (index === 0) return;
        const inputs = row.querySelectorAll('input');
        const total = Array.from(inputs).reduce((sum, input) => {
            if (input.name.startsWith('BIM')) {
                return sum + (Number(input.value || 0) * 0.03) / 4;
            }
            return sum + Number(input.value || 0);
        }, 0);
        const trimestreIndex = Math.floor(index / 3);
        trimestreRessources[trimestreIndex] += total;
    });

    let resultHTML = `<h3>Résultats trimestriels :</h3>`;
    trimestreRessources.forEach((total, i) => {
        const trimestreStart = new Date(dateEffet);
        trimestreStart.setMonth(trimestreStart.getMonth() + i * 3);
        const trimestreEnd = new Date(trimestreStart);
        trimestreEnd.setMonth(trimestreEnd.getMonth() + 3);
        trimestreEnd.setDate(trimestreEnd.getDate() - 1);

        const difference = plafondTrimestriel - total;
        resultHTML += `
            <p>Du ${trimestreStart.toLocaleDateString('fr-FR')} au ${trimestreEnd.toLocaleDateString('fr-FR')} :
            Ressources totales : ${total.toFixed(2)} € (Plafond : ${plafondTrimestriel.toFixed(2)} €)
            ${difference > 0 ? `Montant ASI : ${difference.toFixed(2)} €` : `Pas d'ASI due`}</p>`;
    });

    document.getElementById('result').innerHTML = resultHTML;
}
