const plafonds = {
    "2017": { seul: 9658.13, couple: 15592.07 },
    "2018": { seul: 9820.46, couple: 15872.24 },
    "2019": { seul: 9951.84, couple: 16091.92 },
    "2020": { seul: 10068.00, couple: 16293.12 },
    "2021": { seul: 10183.20, couple: 16396.49 },
    "2022": { seul: 10265.16, couple: 16512.93 },
    "2023": { seul: 10320.07, couple: 16548.23 },
    "2024": { seul: 10536.50, couple: 16890.35 },
};

function genererTableauRessources() {
    const dateDebut = new Date(document.getElementById("dateDebut").value);
    const dateFin = new Date(document.getElementById("dateFin").value);
    const statut = document.getElementById("statut").value;

    if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
        alert("Veuillez entrer une période valide.");
        return;
    }

    if (dateDebut > dateFin) {
        alert("La date de début doit être antérieure à la date de fin.");
        return;
    }

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

    const demandeurTable = createRessourceTable("Demandeur", dateDebut, dateFin);
    ressourcesContainer.appendChild(demandeurTable);

    if (statut === "couple") {
        const conjointTable = createRessourceTable("Conjoint", dateDebut, dateFin);
        ressourcesContainer.appendChild(conjointTable);
    }
}

function createRessourceTable(role, dateDebut, dateFin) {
    const tableContainer = document.createElement("div");
    tableContainer.classList.add("table-container");

    const title = document.createElement("h3");
    title.textContent = `Ressources du ${role}`;
    tableContainer.appendChild(title);

    const table = document.createElement("table");
    const header = document.createElement("tr");
    [
        "Mois",
        "Pension d'invalidité",
        "Salaires",
        "Indemnités journalières",
        "Chômage",
        "BIM (Capitaux placés)",
        "Autres ressources",
    ].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        header.appendChild(th);
    });
    table.appendChild(header);

    let currentDate = new Date(dateFin);
    while (currentDate >= dateDebut) {
        const row = document.createElement("tr");

        // Mois
        const moisCell = document.createElement("td");
        moisCell.textContent = currentDate.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        // Colonnes des ressources
        ["invalidite", "salaires", "indemnites", "chomage", "bim", "autres"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_${type}_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);
        currentDate.setMonth(currentDate.getMonth() - 1); // Reculer au mois précédent
    }

    tableContainer.appendChild(table);
    return tableContainer;
}
