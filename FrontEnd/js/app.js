let works = [];

async function getWorks() {
    const res = await fetch("http://localhost:5678/api/works");
    works = await res.json();
    displayGallery(works);
    displayModalGallery(works);
}

function displayGallery(list) {
    const gallery = document.querySelector("#gallery");
    gallery.innerHTML = "";
    list.forEach(work => {
        const figure = document.createElement("figure");
        figure.innerHTML = `
            <img src="${work.imageUrl}">
            <figcaption>${work.title}</figcaption>
        `;
        gallery.appendChild(figure);
    });
}

function displayModalGallery(list) {
    const modalGallery = document.querySelector("#modal-gallery");
    modalGallery.innerHTML = "";
    list.forEach(work => {
        const figure = document.createElement("figure");
        figure.innerHTML = `
            <img src="${work.imageUrl}">
            <button class="btn-del-icon">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        figure.querySelector("button").onclick = () => deleteWork(work.id);
        modalGallery.appendChild(figure);
    });
}

async function deleteWork(id) {
    const res = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
    if (res.ok) {
        works = works.filter(w => w.id !== id);
        displayGallery(works);
        displayModalGallery(works);
    }
}

async function getCategories() {
    const res = await fetch("http://localhost:5678/api/categories");
    const categories = await res.json();
    document.querySelector("#div-container").innerHTML = "";
    createFilter({ id: 0, name: "Tous" });
    categories.forEach(createFilter);
    fillSelect(categories);
}

function createFilter(cat) {
    const div = document.createElement("div");
    div.textContent = cat.name;
    div.onclick = () => {
        if (cat.id === 0) displayGallery(works);
        else displayGallery(works.filter(w => w.categoryId === cat.id));
    };
    document.querySelector("#div-container").appendChild(div);
}

function fillSelect(categories) {
    const select = document.querySelector("#category-select");
    select.innerHTML = `<option value="">Choisir une catégorie</option>`;
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

function checkLoginStatus() {
    const token = localStorage.getItem("token");
    if (token) {
        document.querySelector("#edit-banner").style.display = "block";
        document.querySelector("#div-container").style.display = "none";
        document.querySelector("#edit-button").style.display = "block";
    }
}

const modal = document.querySelector("#modal-container");
const editBtn = document.querySelector("#edit-button");
const closeBtn = document.querySelector("#modal-close");
const backBtn = document.querySelector("#modal-back");
const galleryZone = document.querySelector("#modal-gallery");
const formZone = document.querySelector("#modal-form");
const addBtn = document.querySelector("#add-photo-btn");
const title = document.querySelector("#modal-title");
const actions = document.querySelector("#modal-actions");

editBtn.onclick = () => {
    modal.classList.remove("hidden");
    showGallery();
};

closeBtn.onclick = () => modal.classList.add("hidden");

function showGallery() {
    title.textContent = "Galerie photo";
    galleryZone.classList.remove("hidden");
    actions.classList.remove("hidden");
    formZone.classList.add("hidden");
    backBtn.classList.add("hidden");
}

function showForm() {
    title.textContent = "Ajout photo";
    galleryZone.classList.add("hidden");
    actions.classList.add("hidden");
    formZone.classList.remove("hidden");
    backBtn.classList.remove("hidden");
}

addBtn.onclick = showForm;
backBtn.onclick = showGallery;

const fileInput = document.querySelector("#file-upload");
const uploadZone = document.querySelector(".upload-zone");

fileInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    uploadZone.querySelector("i").style.display = "none";
    uploadZone.querySelector("label").style.display = "none";
    uploadZone.querySelector("p").style.display = "none";

    uploadZone.querySelector("img")?.remove();

    const reader = new FileReader();
    reader.onload = ev => {
        const img = document.createElement("img");
        img.src = ev.target.result;
        img.style.maxHeight = "200px";
        uploadZone.appendChild(img);
    };
    reader.readAsDataURL(file);
};

const form = document.querySelector("#add-work-form");

form.onsubmit = async e => {
    e.preventDefault();

    const title = form.title.value.trim();
    const category = form.category.value;
    const image = fileInput.files[0];

    if (!title || !category || !image) return;

    const data = new FormData();
    data.append("title", title);
    data.append("category", category);
    data.append("image", image);

    const res = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: data
    });

    if (res.ok) {
        const newWork = await res.json();
        works.push(newWork);
        displayGallery(works);
        displayModalGallery(works);
        form.reset();
        uploadZone.querySelector("img")?.remove();
        uploadZone.querySelector("i").style.display = "block";
        uploadZone.querySelector("label").style.display = "block";
        uploadZone.querySelector("p").style.display = "block";
        showGallery();
    }
};

getWorks();
getCategories();
checkLoginStatus();
