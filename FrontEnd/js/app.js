let works = [];

async function getWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error(`Response error: ${response.status}`);
        works = await response.json();
        displayGallery(works);
        displayModalGallery(works);
    } catch (error) {
        console.error(error.message);
    }
}

function displayGallery(list) {
    const gallery = document.querySelector("#gallery");
    gallery.innerHTML = "";
    list.forEach(work => {
        const figure = document.createElement("figure");
        figure.dataset.id = work.id;
        figure.dataset.category = work.categoryId;
        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;
        gallery.appendChild(figure);
    });
}

function displayModalGallery(list) {
    const modalGallery = document.querySelector("#modal-gallery");
    modalGallery.innerHTML = "";
    list.forEach(work => showWork(work));
}

function showWork(work) {
    const modalHTML = `
        <figure data-id="${work.id}">
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>éditer</figcaption>
            <button class="btn-del-icon" data-id="${work.id}">
                <i class="fa-solid fa-trash" style="color:white;"></i>
            </button>
        </figure>
    `;
    document.querySelector("#modal-gallery").insertAdjacentHTML("beforeend", modalHTML);
    const deleteBtn = document.querySelector(`#modal-gallery figure[data-id="${work.id}"] .btn-del-icon`);
    deleteBtn.addEventListener("click", () => deleteWork(work.id));
}

async function deleteWork(id) {
    try {
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
        });
        if (response.ok) {
            document.querySelectorAll(`figure[data-id="${id}"]`).forEach(item => item.remove());
            works = works.filter(work => work.id != id);
        } else {
            alert("Erreur lors de la suppression du projet.");
        }
    } catch (error) {
        console.log(error);
        alert("Une erreur est survenue lors de la suppression.");
    }
}

async function getCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) throw new Error(`Response error: ${response.status}`);
        const categories = await response.json();
        setFilterButton({ id: 0, name: "Tous" });
        categories.forEach(category => setFilterButton(category));
    } catch (error) {
        console.error(error.message);
    }
}

function setFilterButton(category) {
    const div = document.createElement("div");
    div.textContent = category.name;
    div.dataset.id = category.id;
    div.classList.add("category-button");
    div.addEventListener("click", () => applyFilter(category.id));
    document.querySelector("#div-container").append(div);
}

function applyFilter(categoryId) {
    if (categoryId == 0) displayGallery(works);
    else displayGallery(works.filter(work => work.categoryId == categoryId));
}

function checkLoginStatus() {
    const token = localStorage.getItem("token");
    const loginLink = document.querySelector("nav ul li:nth-child(3) a");
    if (token) {
        document.querySelector("#edit-banner").style.display = "block";
        document.querySelector("#div-container").style.display = "none";
        document.querySelector("#edit-button").style.display = "block";
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

const editBtn = document.getElementById("edit-button");
const modalContainer = document.getElementById("modal-container");
const closeBtn = document.getElementById("modal-close");
const backBtn = document.getElementById("modal-back");
const galleryZone = document.getElementById("modal-gallery");
const formZone = document.getElementById("modal-form");
const addPhotoBtn = document.getElementById("add-photo-btn");
const modalTitle = document.getElementById("modal-title");
const modalActions = document.getElementById("modal-actions");
const fileInput = document.getElementById("file-upload");
const previewContainer = document.querySelector(".upload-zone");

editBtn.addEventListener("click", () => {
    modalContainer.classList.remove("hidden");
    showGallery();
});

closeBtn.addEventListener("click", () => modalContainer.classList.add("hidden"));
modalContainer.addEventListener("click", e => { if (e.target === modalContainer) modalContainer.classList.add("hidden"); });

function showGallery() {
    modalTitle.textContent = "Galerie photo";
    galleryZone.classList.remove("hidden");
    modalActions.classList.remove("hidden");
    formZone.classList.add("hidden");
    backBtn.classList.add("hidden");
}

function showForm() {
    modalTitle.textContent = "Ajout photo";
    galleryZone.classList.add("hidden");
    modalActions.classList.add("hidden");
    formZone.classList.remove("hidden");
    backBtn.classList.remove("hidden");
}

addPhotoBtn.addEventListener("click", showForm);
backBtn.addEventListener("click", showGallery);

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(event){
            const existingPreview = previewContainer.querySelector("img.preview");
            if(existingPreview) existingPreview.remove();
            const img = document.createElement("img");
            img.src = event.target.result;
            img.classList.add("preview");
            img.style.maxWidth = "100%";
            img.style.maxHeight = "200px";
            previewContainer.appendChild(img);
        }
        reader.readAsDataURL(file);
    }
});

async function fillCategories(){
    try{
        const res = await fetch("http://localhost:5678/api/categories");
        const categories = await res.json();
        const select = document.getElementById("category-select");
        select.innerHTML = "<option value=''>-- Choisir une catégorie --</option>";
        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.name;
            select.appendChild(opt);
        });
    }catch(err){
        console.error(err);
    }
}
fillCategories();

const form = document.getElementById("add-work-form");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = form.title.value.trim();
    const category = form.category.value;
    const image = fileInput.files[0];
    if(!title || !category || !image){
        alert("Veuillez remplir tous les champs et sélectionner une image.");
        return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("image", image);
    try{
        const res = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: formData
        });
        if(res.ok){
            const newWork = await res.json();
            displayGallery([newWork]);
            showWork(newWork);
            alert("Projet ajouté avec succès !");
            form.reset();
            previewContainer.querySelector("img.preview")?.remove();
            showGallery();
        } else {
            alert("Erreur lors de l'ajout du projet.");
        }
    }catch(err){
        console.error(err);
        alert("Erreur lors de l'envoi du projet.");
    }
});

getWorks();
getCategories();
checkLoginStatus();
