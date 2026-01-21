
// Variable globale qui stocke la liste des travaux récupérés depuis l'API
let works = [];
 
// Fonction asynchrone qui récupère tous les travaux depuis le serveur
async function getWorks() {
 // Envoie une requête GET à l'API pour récupérer les travaux
    const res = await fetch("http://localhost:5678/api/works");
    // Transforme la réponse JSON en objet JavaScript et la stocke dans la variable globale works
    works = await res.json();
    // Affiche les travaux dans la galerie principale de la page
    displayGallery(works);
    // Affiche les travaux dans la galerie du modal d'édition
    displayModalGallery(works);
}

// Fonction qui affiche la galerie principale avec tous les travaux
function displayGallery(list) {
    // Récupère l'élément HTML avec l'id "gallery" (la zone d'affichage des travaux)
    const gallery = document.querySelector("#gallery");
    // Vide complètement la galerie avant d'ajouter les nouveaux éléments
    gallery.innerHTML = "";
    // Boucle sur chaque travail dans la liste
    list.forEach(work => {
        // Crée un nouvel élément <figure> pour chaque travail
        const figure = document.createElement("figure");
        // Ajoute l'image et le titre du travail à l'intérieur du <figure>
        figure.innerHTML = `<img src="${work.imageUrl}"><figcaption>${work.title}</figcaption>`;
        // Ajoute la figure dans la galerie
        gallery.appendChild(figure);
    });
}

// Fonction qui affiche la galerie dans le modal d'édition (avec boutons de suppression)
function displayModalGallery(list) {
    // Récupère l'élément HTML avec l'id "modal-gallery" (galerie du modal)
    const modalGallery = document.querySelector("#modal-gallery");
    // Vide complètement la galerie du modal avant d'ajouter les nouveaux éléments
    modalGallery.innerHTML = "";
    // Boucle sur chaque travail dans la liste
    list.forEach(work => {
        // Crée un nouvel élément <figure> pour chaque travail
        const figure = document.createElement("figure");
        // Ajoute l'image et un bouton de suppression (icône poubelle) au <figure>
        figure.innerHTML = `<img src="${work.imageUrl}"><button class="btn-del-icon"><i class="fa-solid fa-trash"></i></button>`;
        // Récupère le bouton de suppression et ajoute une action au clic
        figure.querySelector("button").onclick = () => deleteWork(work.id);
        // Ajoute la figure dans la galerie du modal
        modalGallery.appendChild(figure);
    });
}

// Fonction asynchrone qui supprime un travail via l'API
async function deleteWork(id) {
    // Envoie une requête DELETE à l'API avec le token d'authentification
    const res = await fetch(`http://localhost:5678/api/works/${id}`, {
        // Spécifie que c'est une requête de suppression
        method: "DELETE",
        // Ajoute le header d'authentification avec le token stocké dans localStorage
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    // Si la suppression a réussi sur le serveur
    if (res.ok) {
        // Supprime le travail de la liste locale (filtre le travail par son id)
        works = works.filter(w => w.id !== id);
        // Rafraîchit l'affichage de la galerie principale
        displayGallery(works);
        // Rafraîchit l'affichage de la galerie du modal
        displayModalGallery(works);
    }
}

// Fonction asynchrone qui récupère toutes les catégories depuis l'API
async function getCategories() {
    // Envoie une requête GET à l'API pour récupérer les catégories
    const res = await fetch("http://localhost:5678/api/categories");
    // Transforme la réponse JSON en objet JavaScript et la stocke dans une variable
    const categories = await res.json();
    // Vide complètement la zone des filtres avant d'ajouter les nouveaux filtres
    document.querySelector("#div-container").innerHTML = "";
    // Crée un filtre "Tous" qui affiche tous les travaux
    createFilter({ id: 0, name: "Tous" });
    // Crée un filtre pour chaque catégorie
    categories.forEach(createFilter);
    // Remplit le menu déroulant du formulaire avec les catégories
    fillSelect(categories);
}

// Fonction qui crée un filtre cliquable pour une catégorie
function createFilter(cat) {
    // Crée un nouvel élément <div> pour le filtre
    const div = document.createElement("div");
    // Ajoute le nom de la catégorie comme texte du filtre
    div.textContent = cat.name;
    // Ajoute une action quand on clique sur le filtre
    div.onclick = () => {
        // Si le filtre est "Tous" (id = 0), affiche tous les travaux
        if (cat.id === 0) displayGallery(works);
        // Sinon affiche seulement les travaux de cette catégorie
        else displayGallery(works.filter(w => w.categoryId === cat.id));
    };
    // Ajoute le filtre dans la zone des filtres
    document.querySelector("#div-container").appendChild(div);
}

// Fonction qui remplit le menu déroulant du formulaire avec les catégories
function fillSelect(categories) {
    // Récupère l'élément <select> du formulaire
    const select = document.querySelector("#category-select");
    // Ajoute une option par défaut "Choisir une catégorie"
    select.innerHTML = `<option value="">Choisir une catégorie</option>`;
    // Boucle sur chaque catégorie
    categories.forEach(cat => {
        // Crée une nouvelle option pour cette catégorie
        const option = document.createElement("option");
        // Définit la valeur de l'option (l'id de la catégorie)
        option.value = cat.id;
        // Définit le texte visible de l'option (le nom de la catégorie)
        option.textContent = cat.name;
        // Ajoute l'option dans le menu déroulant
        select.appendChild(option);
    });
}

// Fonction qui vérifie si l'utilisateur est connecté et adapte l'affichage
function checkLoginStatus() {
    // Récupère le token d'authentification stocké dans le navigateur
    const token = localStorage.getItem("token");
    // Récupère le bouton de connexion
    const loginBtn = document.querySelector("#login-btn");
    // Récupère le bouton de déconnexion
    const logoutBtn = document.querySelector("#logout-btn");
    // Si l'utilisateur est connecté (token existe)
    if (token) {
        // Affiche la bannière d'édition (bannière admin)
        document.querySelector("#edit-banner").style.display = "block";
        // Cache les filtres publics (car l'admin n'en a pas besoin)
        document.querySelector("#div-container").style.display = "none";
        // Affiche le bouton d'édition
        document.querySelector("#edit-button").style.display = "block";
        // Ajoute la classe "hidden" au bouton de connexion pour le cacher
        loginBtn.classList.add("hidden");
        // Retire la classe "hidden" du bouton de déconnexion pour l'afficher
        logoutBtn.classList.remove("hidden");
        // Ajoute une action au clic sur le bouton de déconnexion
        logoutBtn.onclick = () => {
            // Supprime le token du navigateur
            localStorage.removeItem("token");
            // Recharge la page pour appliquer les changements
            location.reload();
        };
    }
    // Si l'utilisateur n'est pas connecté
    else {
        // Retire la classe "hidden" du bouton de connexion pour l'afficher
        loginBtn.classList.remove("hidden");
        // Ajoute la classe "hidden" au bouton de déconnexion pour le cacher
        logoutBtn.classList.add("hidden");
        // Ajoute une action au clic sur le bouton de connexion
        loginBtn.onclick = () => location.href = "./login.html"; // Redirige vers la page de connexion
    }
}

// Récupère l'élément du modal (fenêtre modale)
const modal = document.querySelector("#modal-container");
// Récupère le bouton qui ouvre le modal d'édition
const editBtn = document.querySelector("#edit-button");
// Récupère le bouton qui ferme le modal
const closeBtn = document.querySelector("#modal-close");
// Récupère le bouton de retour dans le modal
const backBtn = document.querySelector("#modal-back");
// Récupère la zone de la galerie à l'intérieur du modal
const galleryZone = document.querySelector("#modal-gallery");
// Récupère la zone du formulaire d'ajout à l'intérieur du modal
const formZone = document.querySelector("#modal-form");
// Récupère le bouton pour ajouter une nouvelle photo
const addBtn = document.querySelector("#add-photo-btn");
// Récupère le titre du modal (texte qui change selon la vue)
const title = document.querySelector("#modal-title");
// Récupère la zone des actions du modal
const actions = document.querySelector("#modal-actions");

// Ajoute une action quand on clique sur le bouton d'édition
editBtn.onclick = () => {
    // Retire la classe "hidden" au modal pour l'afficher
    modal.classList.remove("hidden");
    // Affiche la vue galerie du modal
    showGallery();
};

// Ajoute une action quand on clique sur le bouton de fermeture
closeBtn.onclick = () => modal.classList.add("hidden"); // Ajoute la classe "hidden" pour cacher le modal

// Fonction qui affiche la vue "Galerie photo" dans le modal
function showGallery() {
    // Change le titre du modal en "Galerie photo"
    title.textContent = "Galerie photo";
    // Affiche la galerie en retirant la classe "hidden"
    galleryZone.classList.remove("hidden");
    // Affiche les actions en retirant la classe "hidden"
    actions.classList.remove("hidden");
    // Cache le formulaire en ajoutant la classe "hidden"
    formZone.classList.add("hidden");
    // Cache le bouton "Retour" en ajoutant la classe "hidden"
    backBtn.classList.add("hidden");
}

// Fonction qui affiche la vue "Ajout photo" (formulaire) dans le modal
function showForm() {
    // Change le titre du modal en "Ajout photo"
    title.textContent = "Ajout photo";
    // Cache la galerie en ajoutant la classe "hidden"
    galleryZone.classList.add("hidden");
    // Cache les actions en ajoutant la classe "hidden"
    actions.classList.add("hidden");
    // Affiche le formulaire en retirant la classe "hidden"
    formZone.classList.remove("hidden");
    // Affiche le bouton "Retour" en retirant la classe "hidden"
    backBtn.classList.remove("hidden");
}

// Ajoute une action au clic sur le bouton "Ajouter une photo" : affiche le formulaire
addBtn.onclick = showForm;
// Ajoute une action au clic sur le bouton "Retour" : affiche la galerie
backBtn.onclick = showGallery;

// Récupère le champ d'upload de fichier
const fileInput = document.querySelector("#file-upload");
// Récupère la zone d'upload (la zone visuelle où on voit l'aperçu)
const uploadZone = document.querySelector(".upload-zone");

// Ajoute une action quand un fichier est choisi
fileInput.onchange = e => {
    // Récupère le premier fichier choisi par l'utilisateur
    const file = e.target.files[0];
    // Si aucun fichier n'a été choisi, on sort de la fonction
    if (!file) return;
    // Cache l'icône de la zone d'upload
    uploadZone.querySelector("i").style.display = "none";
    // Cache le label de la zone d'upload
    uploadZone.querySelector("label").style.display = "none";
    // Cache le texte de la zone d'upload
    uploadZone.querySelector("p").style.display = "none";
    // Supprime la vieille image d'aperçu s'il en existe une
    uploadZone.querySelector("img")?.remove();
    // Crée un lecteur de fichier pour lire l'image
    const reader = new FileReader();
    // Définit ce qui se passe une fois que le fichier est lu
    reader.onload = ev => {
        // Crée un nouvel élément <img>
        const img = document.createElement("img");
        // Définit la source de l'image comme les données lues (aperçu)
        img.src = ev.target.result;
        // Limite la hauteur maximale de l'aperçu à 200px
        img.style.maxHeight = "200px";
        // Ajoute l'aperçu dans la zone d'upload
        uploadZone.appendChild(img);
    };
    // Lit le fichier choisi et le convertit en URL pour l'aperçu
    reader.readAsDataURL(file);
};

// Récupère le formulaire d'ajout d'une photo
const form = document.querySelector("#add-work-form");

// Ajoute une action quand on soumet le formulaire
form.onsubmit = async e => {
    // Empêche le rechargement de la page au submit du formulaire
    e.preventDefault();
    // Récupère le titre saisi par l'utilisateur et supprime les espaces inutiles
    const title = form.title.value.trim();
    // Récupère la catégorie choisie par l'utilisateur
    const category = form.category.value;
    // Récupère le fichier image choisi par l'utilisateur
    const image = fileInput.files[0];
    // Si l'un des trois champs est vide, on ne fait rien et on sort
    if (!title || !category || !image) return;
    // Crée un objet FormData pour envoyer le formulaire avec le fichier
    const data = new FormData();
    // Ajoute le titre au formulaire
    data.append("title", title);
    // Ajoute la catégorie au formulaire
    data.append("category", category);
    // Ajoute l'image au formulaire
    data.append("image", image);
    // Envoie une requête POST à l'API pour ajouter le travail
    const res = await fetch("http://localhost:5678/api/works", {
        // Spécifie que c'est une requête POST (création)
        method: "POST",
        // Ajoute le header d'authentification avec le token
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        // Définit le corps de la requête comme le formulaire avec le fichier
        body: data
    });
    // Si l'ajout a réussi sur le serveur
    if (res.ok) {
        // Récupère le nouvel objet travail retourné par l'API
        const newWork = await res.json();
        // Ajoute le nouveau travail à la liste locale
        works.push(newWork);
        // Rafraîchit l'affichage de la galerie principale
        displayGallery(works);
        // Rafraîchit l'affichage de la galerie du modal
        displayModalGallery(works);
        // Réinitialise tous les champs du formulaire
        form.reset();
        // Supprime l'aperçu de l'image de la zone d'upload
        uploadZone.querySelector("img")?.remove();
        // Réaffiche l'icône de la zone d'upload
        uploadZone.querySelector("i").style.display = "block";
        // Réaffiche le label de la zone d'upload
        uploadZone.querySelector("label").style.display = "block";
        // Réaffiche le texte de la zone d'upload
        uploadZone.querySelector("p").style.display = "block";
        // Revient à la vue galerie du modal
        showGallery();
    }
};

// Appel de getWorks() : charge et affiche les travaux au chargement de la page
getWorks();
// Appel de getCategories() : charge les catégories et crée les filtres au chargement
getCategories();
// Appel de checkLoginStatus() : vérifie si l'utilisateur est connecté et adapte l'affichage
checkLoginStatus();
