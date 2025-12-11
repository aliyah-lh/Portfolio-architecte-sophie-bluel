const loginForm = document.querySelector("#login form");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); 
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            window.location.href = "index.html";
        } else {
            alert("Identifiant ou mot de passe incorrect");
        }
    } catch (error) {
        console.error("Erreur : ", error);
        alert("Une erreur est survenue, réessayez plus tard.");
    }
});
