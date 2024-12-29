const ceilings = {
    seul: { 2017: 2300, 2018: 2400, 2019: 2500, 2020: 2600, 2021: 2700, 2022: 2800, 2023: 2900, 2024: 3000 },
    couple: { 2017: 3700, 2018: 3800, 2019: 3900, 2020: 4000, 2021: 4100, 2022: 4200, 2023: 4300, 2024: 4400 }
};

function generateTable() {
    const dateEffet = document.getElementById('dateEffet').value;
    if (!dateEffet) return;

    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    const table = document.createElement('table');

    const headerRow = document.createElement('tr');
    ['Mois', 'Salaires (€)', 'Indemnités journalières (€)', 'Chômage (€)', 'Autres ressources (€)', 'Total (€)'].forEach(header => {
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

        ['salaires', 'indemnites', 'chomage', 'autres'].forEach(type => {
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

    const plafond = ceilings[statut][year] / 4; // Plafond trimestriel
    const rows = document.querySelectorAll('table tr');

    let resultHTML = '<h3>Résultats :</h3>';
    let hasRights = false;

    rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        const total = parseFloat(row.querySelector('.row-total').textContent || '0');
        const eligible = plafond > total;
        if (eligible) hasRights = true;
        resultHTML += `<p>Mois ${index}: Total des ressources : ${total} € | ASI : ${eligible ? 'Oui' : 'Non'}</p>`;
    });

    if (!hasRights) {
        resultHTML += '<p>Le bénéficiaire n’a pas droit à l’ASI pour cette période.</p>';
    }

    document.getElementById('result').innerHTML = resultHTML;
}
