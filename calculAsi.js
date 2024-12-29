const ceilings = {
    seul: { 2017: 2300, 2018: 2400, 2019: 2500, 2020: 2600, 2021: 2700, 2022: 2800, 2023: 2900, 2024: 3000 },
    couple: { 2017: 3700, 2018: 3800, 2019: 3900, 2020: 4000, 2021: 4100, 2022: 4200, 2023: 4300, 2024: 4400 }
};

document.getElementById('statut').addEventListener('change', updatePlafond);
document.getElementById('dateEffet').addEventListener('change', generateTable);

function updatePlafond() {
    const statut = document.getElementById('statut').value;
    const dateEffet = new Date(document.getElementById('dateEffet').value);
    const year = dateEffet.getFullYear();
    const plafond = ceilings[statut][year] / 4;
    document.getElementById('plafond').value = plafond;
}

function generateTable() {
    const dateEffet = document.getElementById('dateEffet').value;
    if (!dateEffet) return;

    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    const table = document.createElement('table');

    const headerRow = document.createElement('tr');
    ['Mois', 'Salaires (€)', 'Abattement (€)', 'Indemnités journalières (€)', 'Chômage (€)', 'Autres ressources (€)', 'BIM (€)', 'Total (€)'].forEach(header => {
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

        // Add resource input cells
        ['salaires', 'abattement', 'indemnites', 'chomage', 'autres', 'bim'].forEach(type => {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.name = `${type}_${i}`;
            input.min = 0;
            input.oninput = () => calculateRowTotal(row, type);
            cell.appendChild(input);
            row.appendChild(cell);
        });

        // Total column
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
    const abattement = Number(inputs[1].value || 0);
    const salaire = Number(inputs[0].value || 0);
    const bim = Number(inputs[5].value || 0);

    const total = Array.from(inputs).reduce((sum, input, index) => {
        if (index === 0) return sum + (Number(input.value || 0) - abattement);
        if (index === 5) return sum + (bim * 0.03) / 4;
        return sum + Number(input.value || 0);
    }, 0);

    row.querySelector('.row-total').textContent = total.toFixed(2);
}

function calculateASI() {
    const plafond = parseFloat(document.getElementById('plafond').value || '0');
    const rows = document.querySelectorAll('table tr');
    let resultHTML = '<h3>Résultats :</h3>';
    let hasRights = false;

    rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        const total = parseFloat(row.querySelector('.row-total').textContent || '0');
        const eligible = plafond > total;
        if (eligible) hasRights = true;
        resultHTML += `<p>${row.cells[0].textContent}: Total des ressources : ${total} € | ASI : ${eligible ? 'Oui' : 'Non'}</p>`;
    });

    if (!hasRights) {
        resultHTML += '<p>Le bénéficiaire n’a pas droit à l’ASI pour cette période.</p>';
    }

    document.getElementById('result').innerHTML = resultHTML;
}

