document.addEventListener("DOMContentLoaded", function () {
    const statutSelect = document.getElementById("statut");
    const dateEffetInput = document.getElementById("date-effet");
    const tableauSection = document.getElementById("tableau-section");
    const tableauContainer = document.getElementById("tableau-container");
    const ajouterColonneBtn = document.getElementById("ajouter-colonne");
    const calculerDroitsBtn = document.getElementById("calculer-droits");
    const resultatsContainer = document.getElementById("resultats");

    const plafonds = {
        "Personne seule": [
            { date: "2017-04-01", valeur: 9658.13 },
            { date: "2018-04-01", valeur: 9820.46 },
            { date: "2019-04-01", valeur: 9951.84 },
            { date: "2020-04-01", valeur: 10068.00 },
            { date: "2021-04-01", valeur: 10183.20 },
            { date: "2022-04-01", valeur: 10265.16 },
            { date: "2023-04-01", valeur: 10320.07 },
            { date: "2024-04-01", valeur: 10536.50 },
        ],
        "Couple": [
            { date: "2017-04-01", valeur: 15592.07 },
            { date: "2018-04-01", valeur: 15872.24 },
            { date: "2019-04-01", valeur: 16091.92 },
            { date: "2020-04-01", valeur: 16293.12 },
            { date: "2021-04-01", valeur: 16396.49 },
            { date: "2022-04-01", valeur: 16512.93 },
            { date: "2023-04-01", valeur: 16548.23 },
            { date: "2024-04-01", valeur: 16890.35 },
        ],
    };

    function getPlafond(statut, dateEffet) {
        if (!plafonds[statut]) return 0;

        const date = new Date(dateEffet);
        const plafond = plafonds[statut].find(
            (p) => new Date(p.date) <= date
        );

        return plafond ? plafond.valeur : 0;
    }

    function afficherTableau() {
        if (statutSelect.value && dateEffetInput.value) {
            tableauSection.style.display = "block";
            creerTableau();
        } else {
            tableauSection.style.display = "none";
        }
    }

    function creerTableau() {
        tableauContainer.innerHTML = "";

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        ["Ressources 1", "Ressources 2", "Ressources 3"].forEach((header) => {
            const th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);

        const tbody = document.createElement("tbody");
        const bodyRow = document.createElement("tr");

        ["", "", ""].forEach(() => {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.placeholder = "Valeur";
            td.appendChild(input);
            bodyRow.appendChild(td);
        });

        tbody.appendChild(bodyRow);

        table.appendChild(thead);
        table.appendChild(tbody);
        tableauContainer.appendChild(table);
    }

    function ajouterColonne() {
        const table = tableauContainer.querySelector("table");

        if (table) {
            const thead = table.querySelector("thead tr");
            const tbody = table.querySelector("tbody tr");

            const newHeader = document.createElement("th");
            newHeader.textContent = `Nouvelle Ressource`;
            thead.appendChild(newHeader);

            const newCell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.placeholder = "Valeur";
            newCell.appendChild(input);
            tbody.appendChild(newCell);
        }
    }

    function calculerDroits() {
        resultatsContainer.innerHTML = "";

        const inputs = tableauContainer.querySelectorAll("tbody tr td input");
        let totalRessources = 0;

        inputs.forEach((input) => {
            totalRessources += parseFloat(input.value) || 0;
        });

        const statut = statutSelect.value;
        const dateEffet = dateEffetInput.value;

        const plafond = getPlafond(statut, dateEffet);
        let droits = plafond - totalRessources;
        droits = droits < 0 ? 0 : droits;

        const resultMessage = `Total des ressources : ${totalRessources} €. Plafond : ${plafond} €. Droits calculés : ${droits} €.`;

        resultatsContainer.textContent = resultMessage;
    }

    statutSelect.addEventListener("change", afficherTableau);
    dateEffetInput.addEventListener("input", afficherTableau);
    ajouterColonneBtn.addEventListener("click", ajouterColonne);
    calculerDroitsBtn.addEventListener("click", calculerDroits);
});
