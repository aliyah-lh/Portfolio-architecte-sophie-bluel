// Récupère le formulaire de connexion dans la page (cherche le <form> à l'intérieur de l'élément #login)
const loginForm = document.querySelector("#login form");

// Ajoute un écouteur d'événement sur la soumission du formulaire (quand l'utilisateur clique sur "Connexion")
loginForm.addEventListener("submit", async (e) => {
    // Empêche le comportement par défaut du formulaire (qui rechargerait la page)
    e.preventDefault();

    // Récupère la valeur saisie dans le champ email (l'utilisateur tape son adresse email)
    const email = document.querySelector("#email").value;

    // Récupère la valeur saisie dans le champ password (l'utilisateur tape son mot de passe)
    const password = document.querySelector("#password").value;

    // Démarre un bloc try pour gérer les erreurs potentielles
    try {
        // Envoie une requête POST à l'API de connexion avec les identifiants
        const response = await fetch("http://localhost:5678/api/users/login", {
            // Spécifie que c'est une requête POST (envoi de données)
            method: "POST",
            // Ajoute un header pour indiquer que les données sont en JSON
            headers: {
                "Content-Type": "application/json"
            },
            // Transforme l'email et le mot de passe en JSON et l'envoie au serveur
            body: JSON.stringify({ email, password })
        });

        // Vérifie si la réponse du serveur est OK (statut 200-299)
        if (response.ok) {
            // Récupère les données retournées par le serveur (contient le token)
            const data = await response.json();

            // Stocke le token dans le localStorage du navigateur pour l'utiliser plus tard
            // (le token sert à authentifier l'utilisateur pour les requêtes futures)
            localStorage.setItem("token", data.token);

            // Redirige l'utilisateur vers la page d'accueil (index.html) après connexion réussie
            window.location.href = "index.html";
        }
        // Si la réponse n'est pas OK (mauvais identifiants)
        else {
            // Affiche une alerte à l'utilisateur indiquant que les identifiants sont incorrects
            alert("Identifiant ou mot de passe incorrect");
        }
    }
    // Capture les erreurs réseau ou autres exceptions
    catch (error) {
        // Affiche l'erreur dans la console du navigateur pour le débogage
        console.error("Erreur : ", error);

        // Affiche une alerte à l'utilisateur indiquant qu'une erreur est survenue
        alert("Une erreur est survenue, réessayez plus tard.");
    }
});
