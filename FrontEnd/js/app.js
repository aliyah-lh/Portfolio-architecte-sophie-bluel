let works = []; 

async function getWorks() {
    const url = "http://localhost:5678/api/works";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response error: ${response.status}`);
        }

        works = await response.json(); 
        displayGallery(works);
        //reçoit les projets et Affiche tous si papa tu regarde c'est moi qui a mis sa pour bien comprendre et m'en souvenir :D

    } catch (error) {
        console.error(error.message);
    }
}

function displayGallery(list) {
    const gallery = document.querySelector("#gallery");
    gallery.innerHTML = ""; 

    list.forEach(work => displayWork(work));
}

function displayWork(work) {
    const figure = document.createElement("figure");
    figure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
    `;
    document.querySelector("#gallery").append(figure);
}

//appel image et son text qui vas avec

async function getCategories() {
    const url = "http://localhost:5678/api/categories";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response error: ${response.status}`);
        }

        //

        const categories = await response.json();

        setFilterButton({ id: 0, name: "Tous" });

        categories.forEach(category => setFilterButton(category));

    } catch (error) {
        console.error(error.message);
    }
}

//chercher les catégories dans l’API

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
