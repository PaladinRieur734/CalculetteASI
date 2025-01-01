// Fonction pour générer le tableau des ressources en fonction de la date d'effet et du statut
function genererTableauRessources() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const statut = document.getElementById("statut").value;
    const ressourcesContainer = document.getElementById("ressourcesContainer");
    const errorMessage = document.querySelector(".error-message");

    if (errorMessage) errorMessage.remove(); // Supprime le message d'erreur précédent

    if (!statut || isNaN(dateEffet.getTime())) {
        const error = document.createElement("p");
        error.classList.add("error-message");
        error.textContent = "Veuillez remplir tous les champs correctement.";
        ressourcesContainer.appendChild(error);
        return;
    }

    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu
    // Génération du tableau des ressources (demandeur et conjoint)
    const tableDemandeur = createRessourceTable("Demandeur", dateEffet);
    ressourcesContainer.appendChild(tableDemandeur);

    if (statut === "couple") {
        const tableConjoint = createRessourceTable("Conjoint", dateEffet);
        ressourcesContainer.appendChild(tableConjoint);
    }
}

// Fonction pour créer un tableau des ressources
function createRessourceTable(type, dateEffet) {
    const table = document.createElement("table");
    const header = table.createTHead();
    const headerRow = header.insertRow();
    headerRow.innerHTML = "<th>Ressource</th><th>Montant</th>";

    const body = table.createTBody();
    const ressources = ["Salaire", "Aides", "Autres"]; // Exemple de ressources

    ressources.forEach((ressource) => {
        const row = body.insertRow();
        row.innerHTML = `<td>${ressource}</td><td><input type="number" placeholder="Montant en €"></td>`;
    });

    const caption = document.createElement("caption");
    caption.textContent = `${type} (Date d'effet : ${dateEffet.toLocaleDateString()})`;
    table.appendChild(caption);

    return table;
}

// Fonction pour calculer les droits ASI
function calculerASI() {
    const abattement = parseFloat(document.getElementById("abattement").value);
    if (isNaN(abattement) || abattement < 0) {
        alert("Veuillez entrer un abattement valide.");
        return;
    }

    // Exemple de calcul (à ajuster selon la logique métier)
    const result = abattement * 0.8; // Exemple de calcul de droits

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<h2>Calcul des droits ASI</h2>
                           <h4>Montant de l'abattement: ${abattement} €</h4>
                           <h5>Droits ASI calculés: ${result} €</h5>`;
}
