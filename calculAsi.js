const ceilings = {
    seul: { 2017: 2300, 2018: 2400, 2019: 2500, 2020: 2600, 2021: 2700, 2022: 2800, 2023: 2900, 2024: 3000 },
    couple: { 2017: 3500, 2018: 3600, 2019: 3700, 2020: 3800, 2021: 3900, 2022: 4000, 2023: 4300, 2024: 4400 }
};

document.getElementById('statut').addEventListener('change', updatePlafond);
document.getElementById('dateEffet').addEventListener('change', () => {
    updatePlafond();
    generateTable();
});

function updatePlafond() {
    const statut = document.getElementById('statut').value;
    const dateEffet = new Date(document.getElementById('dateEffet').value);
    const year = dateEffet.getFullYear();
    const plafond = ceilings[statut][year] / 4 || 0; // Plafond trimestriel
    const plafondInput = document.getElementById('plafond');
    plafondInput.value = plafond.toFixed(2);
}

function generateTable() {
    const dateEffet = document.getElementById('dateEffet').value;
    if (!dateEffet) return;

    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';
    const table = document.createElement('table');

    const headerRow = document.createElement('tr');
    ['Mois', 'Pension Invalidité (€)', 'Salaires (€)', 'Abattement (€)', 'Indemnités journalières (€)', 'Chômage (€)', 'BIM (€)', 'Autres ressources (€)', 'Total (€)'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    const months = generateMonths(new Date(dateEffet));
    months.forEach((month, index) => {
        const row = document.createElement('tr');
        const monthCell = document.createElement('td');
        monthCell.textContent = month;
        row.appendChild(monthCell);

        ['invalidite', 'salaires', 'abattement', 'indemnites', 'chomage', 'bim', 'autres'].forEach(type => {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.name = `${type}_${index}`;
            input.min = 0;
            input.step = 0.01;
            input.oninput = () => calculateRowTotal(row);
            cell.appendChild(input);
            row.appendChild(cell);
        });

        const totalCell = document.createElement('td');
        totalCell.className = 'row-total';
        totalCell.textContent = '0.00';
        row.appendChild(totalCell);

        table.appendChild(row);
    });

    tableContainer.appendChild(table);
}

function generateMonths(dateEffet) {
    const months = [];
    const start = new Date(dateEffet);
    start.setMonth(start.getMonth() - 3); // Trimestre précédent
    for (let i = 0; i < 15; i++) { // Trimestre précédent + 12 mois suivants
        months.push(start.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }));
        start.setMonth(start.getMonth() + 1);
    }
    return months;
}

function calculateRowTotal(row) {
    const inputs = row.querySelectorAll('input');
    const invalidite = Number(inputs[0].value || 0);
    const salaire = Number(inputs[1].value || 0);
    const abattement = Number(inputs[2].value || 0);
    const indemnites = Number(inputs[3].value || 0);
    const chomage = Number(inputs[4].value || 0);
    const bim = Number(inputs[5].value || 0);
    const autres = Number(inputs[6].value || 0);

    const bimCalculated = (bim * 0.03) / 4; // BIM calculation
    const total = invalidite + salaire - abattement + indemnites + chomage + bimCalculated + autres;

    row.querySelector('.row-total').textContent = total.toFixed(2);
}

function calculateASI() {
    const plafond = parseFloat(document.getElementById('plafond').value || '0');
    const rows = document.querySelectorAll('table tr');
    let resultHTML = '<h3>Résultats Trimestriels :</h3>';
    let totalASI = 0;

    rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row

        const total = parseFloat(row.querySelector('.row-total').textContent || '0');
        const difference = plafond - total;
        const asiAmount = difference > 0 ? difference : 0;
        totalASI += asiAmount;

        resultHTML += `
            <p>
                <b>${row.cells[0].textContent}</b>: 
                Total des ressources : ${total.toFixed(2)} € | 
                Plafond : ${plafond.toFixed(2)} € | 
                ASI : ${asiAmount.toFixed(2)} €
            </p>
        `;
    });

    resultHTML += `<h4>Montant Total ASI sur la période de 12 mois : ${totalASI.toFixed(2)} €</h4>`;
    document.getElementById('result').innerHTML = resultHTML;
}

