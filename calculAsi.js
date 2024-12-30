const ceilings = {
    seul: { 2023: 2540, 2024: 2600 },
    couple: { 2023: 4000, 2024: 4100 }
};

// Initialisation des événements
document.addEventListener("DOMContentLoaded", () => {
    const dateEffetInput = document.getElementById('dateEffet');
    const calculateBtn = document.getElementById('calculateBtn');

    dateEffetInput.addEventListener('change', generateTable);
    calculateBtn.addEventListener('click', calculateASI);
});

function generateTable() {
    const dateEffet = document.getElementById('dateEffet').value;
    if (!dateEffet) return;

    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = ''; // Reset table

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const headers = ['Mois', 'Salaires (€)', 'Indemnités journalières (€)', 'Chômage (€)', 'Autres ressources (€)', 'Total (€)'];

    // Crée les en-têtes de table
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (let i = 0; i < 12; i++) {
        const row = document.createElement('tr');

        // Colonne des mois
        const monthCell = document.createElement('td');
        const date = new Date(dateEffet);
        date.setMonth(date.getMonth() - i);
        monthCell.textContent = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
        row.appendChild(monthCell);

        // Colonnes des ressources
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

        // Colonne du total
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
    if (isNaN(dateEffet)) {
        alert("Veuillez sélectionner une date valide.");
        return;
    }

    const year = dateEffet.getFullYear();
    const plafond = ceilings[statut]?.[year] || 0;

    if (!plafond) {
        alert(`Plafond non défini pour l'année ${year} et le statut sélectionné.`);
        return;
    }

    const rows = document.querySelectorAll('table tr');
    let resultHTML = '<h3>Résultats :</h3>';
    let hasRights = false;

    rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row
        const total = parseFloat(row.querySelector('.row-total').textContent || '0');
        const eligible = plafond > total;

        if (eligible) hasRights = true;

        resultHTML += `<p>Mois ${index}: Total des ressources : ${total.toFixed(2)} € | ASI : ${eligible ? 'Oui' : 'Non'}</p>`;
    });

    if (!hasRights) {
        resultHTML += '<p>Le bénéficiaire n’a pas droit à l’ASI pour cette période.</p>';
    }

    document.getElementById('result').innerHTML = resultHTML;
}
