/**
 * Liste globale des travaux récupérés depuis l'API.
 * Type: Array<Object>
 * Chaque élément contient { id, title, imageUrl, categoryId, ... }
 * Initialisé vide et rempli par la fonction async getWorks().
 */
let works = []; 

/**
 * Récupère la liste des travaux depuis l'API et met à jour la galerie.
 * Effectue une requête GET sur /api/works, met à jour la variable globale
 * `works` puis appelle displayGallery(works).
 *
 * Side effects:
 *  - met à jour la variable globale `works`
 *  - modifie le DOM via displayGallery
 *
 * Throws: affiche une erreur dans la console si la requête échoue.
 *
 * @async
 * @returns {Promise<void>}
 */
async function getWorks() {
    const url = "http://localhost:5678/api/works";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response error: ${response.status}`);
        }

        works = await response.json(); 
        displayGallery(works);

    } catch (error) {
        console.error(error.message);
    }
}

/**
 * Vide la galerie (`#gallery`) et affiche la liste de travaux fournie.
 * Appelle displayWork pour chaque élément de la liste.
 *
 * @param {Array<Object>} list - Tableau d'objets work à afficher.
 * @returns {void}
 */
function displayGallery(list) {
    const gallery = document.querySelector("#gallery");
    gallery.innerHTML = ""; 

    list.forEach(work => displayWork(work));
}

/**
 * Crée un élément <figure> pour un work et l'ajoute à la galerie.
 *
 * @param {Object} work - Objet de travail contenant au minimum { imageUrl, title }.
 * @returns {void}
 */
function displayWork(work) {
    const figure = document.createElement("figure");
    figure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
    `;
    document.querySelector("#gallery").append(figure);
}

/**
 * Récupère les catégories depuis l'API et crée les boutons de filtre.
 * Ajoute également un bouton "Tous" avec id 0.
 *
 * Side effects:
 *  - modifie le DOM en ajoutant des éléments dans `#div-container` via setFilterButton
 *
 * @async
 * @returns {Promise<void>}
 */
async function getCategories() {
    const url = "http://localhost:5678/api/categories";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response error: ${response.status}`);
        }

        const categories = await response.json();

        setFilterButton({ id: 0, name: "Tous" });

        categories.forEach(category => setFilterButton(category));

    } catch (error) {
        console.error(error.message);
    }
}

/**
 * Crée un bouton de filtre pour une catégorie et l'ajoute dans `#div-container`.
 * Le bouton déclenche applyFilter(category.id) au clic.
 *
 * @param {{id: number, name: string}} category - Objet catégorie retourné par l'API.
 * @returns {void}
 */
function setFilterButton(category) {
    const div = document.createElement("div");
    div.textContent = category.name;
    div.dataset.id = category.id;
    div.classList.add("category-button");

    div.addEventListener("click", () => {
        applyFilter(category.id);
    });

    document.querySelector("#div-container").append(div);
}

/**
 * Filtre la variable globale `works` selon l'id de catégorie et met à jour la galerie.
 * Si categoryId == 0, affiche tous les travaux.
 *
 * @param {number} categoryId - Identifiant de la catégorie à filtrer.
 * @returns {void}
 */
function applyFilter(categoryId) {
    if (categoryId == 0) {
        displayGallery(works);
    } else {
        const filtered = works.filter(work => work.categoryId == categoryId);
        displayGallery(filtered);
    }
}

//bouton de filtre

getWorks();
getCategories();

//lance tout 

/**
 * Vérifie l'état de connexion en regardant la présence d'un token dans localStorage.
 * Si l'utilisateur est connecté (token présent), affiche des contrôles d'édition
 * et remplace le lien "login" par "logout" (qui supprime le token et recharge la page).
 * Sinon remet l'interface en mode public (cacher les contrôles d'édition).
 *
 * Side effects:
 *  - modifie le DOM (affichage de #edit-banner, #edit-button, #div-container)
 *  - ajoute un listener sur le lien de navigation pour déconnexion
 *
 * @returns {void}
 */
function checkLoginStatus() {
    const token = localStorage.getItem("token");
    const loginLink = document.querySelector("nav ul li:nth-child(3) a");

    if (token) {
        document.querySelector("#edit-banner").style.display = "block";

        // Cacher filtres
        document.querySelector("#div-container").style.display = "none";

        // Afficher bouton modifier
        document.querySelector("#edit-button").style.display = "block";

        // Transformer "login" en "logout"
        loginLink.textContent = "logout";

        loginLink.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.reload();
        });

    } else {
        document.querySelector("#edit-banner").style.display = "none";
        document.querySelector("#edit-button").style.display = "none";
        document.querySelector("#div-container").style.display = "flex";
    }
}

checkLoginStatus();

