<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calcul des Droits ASI</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Calcul des Droits ASI</h1>
            <p>Saisissez la date d’effet et complétez les ressources pour le trimestre précédent.</p>
        </header>

        <form id="asiForm">
            <!-- Section Date d'effet -->
            <section class="date-section">
                <h2>Date d'effet</h2>
                <label for="dateEffet">Date d'effet :</label>
                <input type="date" id="dateEffet" required onchange="genererTableauRessources()">
            </section>

            <!-- Section Statut -->
            <section class="statut-section">
                <h2>Statut</h2>
                <label for="statut">Statut :</label>
                <select id="statut">
                    <option value="seul">Personne seule</option>
                    <option value="couple">Couple</option>
                </select>
            </section>

            <!-- Section Tableau des ressources -->
            <section class="ressources-section">
                <h2>Tableau des ressources trimestrielles</h2>
                <div id="ressourcesContainer">
                    <p class="info">Le tableau des ressources pour le trimestre précédent apparaîtra ici :</p>
                </div>
            </section>

            <!-- Section Abattement -->
            <section class="abattement-section">
                <h2>Abattement</h2>
                <label for="abattement">Montant de l'abattement :</label>
                <input type="number" id="abattement" placeholder="Montant en €" min="0">
            </section>

            <!-- Bouton Calcul -->
            <button type="button" class="btn" onclick="calculerASI()">Calculer les droits</button>
        </form>

        <!-- Résultats -->
        <div id="result" class="result"></div>
    </div>
    <script src="calculAsi.js"></script>
</body>
</html>
