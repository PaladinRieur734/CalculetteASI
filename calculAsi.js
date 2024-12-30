const ceilings = {
    seul: { 2023: 9687.96, 2024: 9890.04 },
    couple: { 2023: 15749.28, 2024: 16103.52 }
};

function generateTable() {
    const dateEffet = document.getElementById('dateEffet').value;
    if (!dateEffet) return;

    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    const table = document.createElement('table');

    const headerRow = document.createElement('tr');
    ['Mois', 'Pension (€)', 'Salaires (€)', 'Indemnités journalières (€)', 'Chômage (€)', 'Autres ressources (€)', 'Total (€)'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (let i = 0; i < 12; i++) {
        const row = document.createElement('tr');
        const monthCell = document.createElement('td');
        const date = new Date(dateEffet);
        date.setMonth(date.getMonth() - i - 1);
        monthCell.textContent = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
        row.appendChild(monthCell);

        ['pension', 'salaires', 'indemnites', 'chomage', 'autres'].forEach(type => {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.name = `${type}_${i}`;
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
    }

    tableContainer.appendChild(table);
}

function calculateRowTotal(row) {
    const inputs = row.querySelectorAll('input');
    const total = Array.from(inputs).reduce((sum, input) => sum + Number(input.value || 0), 0);
    row.querySelector('.row-total').textContent = total.toFixed(2);
}

function calculateASI() {
    const statut = document.getElementById('statut').value;
    const dateEffet = new Date(document.getElementById('dateEffet').value);
    const year = dateEffet.getFullYear();

    const plafondAnnuel = ceilings[statut][year];
    const plafondTrimestriel = plafondAnnuel / 4;

    const rows = document.querySelectorAll('table tr');
    const trimestreRessources = Array(4).fill(0);

    rows.forEach((row, index) => {
        if (index === 0) return;
        const total = parseFloat(row.querySelector('.row-total').textContent || '0');
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
