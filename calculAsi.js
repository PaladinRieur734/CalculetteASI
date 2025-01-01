document.addEventListener("DOMContentLoaded", function () {
    const statutSelect = document.getElementById("statut");
    const dateEffetInput = document.getElementById("date-effet");
    const tableauSection = document.getElementById("tableau-section");
    const tableauContainer = document.getElementById("tableau-container");
    const ajouterColonneBtn = document.getElementById("ajouter-colonne");
    const calculerDroitsBtn = document.getElementById("calculer-droits");
    const resultatsContainer = document.getElementById("resultats");

    // Plafonds détaillés selon le statut et la date
    const plafonds = {
        "Personne seule": [
            { date: "2024-01-01", valeur: 9000 },
            { date: "2024-04-01", valeur: 9100 },
            { date: "2024-07-01", valeur: 9200 },
        ],
        "Couple": [
            { date: "2024-01-01", valeur: 14000 },
            { date: "2024-04-01", valeur: 14100 },
            { date: "2024-07-01", valeur: 14200 },
        ],
    };

    // Trouve le plafond applicable en fonction de la date
    function getPlafond(statut, dateEffet) {
        if (!plafonds[statut]) return 0;

        const date = new Date(dateEffet);
        const plafond = plafonds[statut].find(
            (p) => new Date(p.date) <= date
        );

        return plafond ? plafond.valeur : 0;
    }

    // Affiche ou masque le tableau en fonction des champs remplis
    function afficherTableau() {
        if (statutSelect.value && dateEffetInput.value) {
            tableauSection.style.display = "block";
            creerTableau();
        } else {
            tableauSection.style.display = "none";
        }
    }

    // Crée un tableau avec des colonnes par défaut
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

    // Ajoute dynamiquement une colonne au tableau
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

    // Calcule les droits en fonction des ressources saisies
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

    // Événements
    statutSelect.addEventListener("change", afficherTableau);
    dateEffetInput.addEventListener("input", afficherTableau);
    ajouterColonneBtn.addEventListener("click", ajouterColonne);
    calculerDroitsBtn.addEventListener("click", calculerDroits);
});
