let works = [];

// =====================
// WORKS
// =====================
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
    list.forEach(showWork);
}

function showWork(work) {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;

    figure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <button class="btn-del-icon">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    figure.querySelector(".btn-del-icon").addEventListener("click", () => {
        deleteWork(work.id);
    });

    document.querySelector("#modal-gallery").appendChild(figure);
}

async function deleteWork(id) {
    const res = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (res.ok) {
        works = works.filter(work => work.id !== id);
        displayGallery(works);
        displayModalGallery(works);
    }
}

// =====================
// CATEGORIES
// =====================
async function getCategories() {
    const res = await fetch("http://localhost:5678/api/categories");
    const categories = await res.json();

    document.querySelector("#div-container").innerHTML = "";
    setFilterButton({ id: 0, name: "Tous" });
    categories.forEach(setFilterButton);

    fillCategorySelect(categories);
}

function setFilterButton(category) {
    const div = document.createElement("div");
    div.textContent = category.name;
    div.dataset.id = category.id;
    div.classList.add("category-button");

    div.addEventListener("click", () => applyFilter(category.id));

    document.querySelector("#div-container").appendChild(div);
}

function applyFilter(categoryId) {
    if (categoryId === 0) {
        displayGallery(works);
    } else {
        displayGallery(works.filter(w => w.categoryId === categoryId));
    }
}

function fillCategorySelect(categories) {
    const select = document.getElementById("category-select");
    select.innerHTML = "";

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// =====================
// LOGIN
// =====================
function checkLoginStatus() {
    const token = localStorage.getItem("token");
    const loginLink = document.querySelector("nav ul li:nth-child(3) a");

    if (token) {
        document.querySelector("#edit-banner").style.display = "block";
        document.querySelector("#div-container").style.display = "none";
        document.querySelector("#edit-button").style.display = "block";

        loginLink.textContent = "logout";
        loginLink.onclick = () => {
            localStorage.removeItem("token");
            location.reload();
        };
    }
}

// =====================
// MODAL
// =====================
const editBtn = document.getElementById("edit-button");
const modalContainer = document.getElementById("modal-container");
const closeBtn = document.getElementById("modal-close");
const backBtn = document.getElementById("modal-back");
const galleryZone = document.getElementById("modal-gallery");
const formZone = document.getElementById("modal-form");
const addPhotoBtn = document.getElementById("add-photo-btn");
const modalTitle = document.getElementById("modal-title");
const modalActions = document.getElementById("modal-actions");

editBtn.onclick = () => {
    modalContainer.classList.remove("hidden");
    showGallery();
};

closeBtn.onclick = () => modalContainer.classList.add("hidden");
modalContainer.onclick = e => {
    if (e.target === modalContainer) modalContainer.classList.add("hidden");
};

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

addPhotoBtn.onclick = showForm;
backBtn.onclick = showGallery;

// =====================
// IMAGE PREVIEW
// =====================
const fileInput = document.getElementById("file-upload");
const uploadZone = document.querySelector(".upload-zone");

fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    uploadZone.querySelector("i").classList.add("hidden");
    uploadZone.querySelector("label").classList.add("hidden");
    uploadZone.querySelector("p").classList.add("hidden");
    uploadZone.querySelector(".preview")?.remove();

    const reader = new FileReader();
    reader.onload = evt => {
        const img = document.createElement("img");
        img.src = evt.target.result;
        img.classList.add("preview");
        img.style.maxWidth = "100%";
        img.style.maxHeight = "200px";
        uploadZone.appendChild(img);
    };
    reader.readAsDataURL(file);
});

// =====================
// ADD WORK
// =====================
const form = document.getElementById("add-work-form");

form.addEventListener("submit", async e => {
    e.preventDefault();

    const title = form.title.value.trim();
    const category = form.category.value;
    const image = fileInput.files[0];

    if (!title || !category || !image) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("image", image);

    const res = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
    });

    if (res.ok) {
        const newWork = await res.json();
        works.push(newWork);
        displayGallery(works);
        displayModalGallery(works);

        form.reset();
        uploadZone.querySelector(".preview")?.remove();
        uploadZone.querySelector("i").classList.remove("hidden");
        uploadZone.querySelector("label").classList.remove("hidden");
        uploadZone.querySelector("p").classList.remove("hidden");

        showGallery();
    }
});

// =====================
// INIT
// =====================
getWorks();
getCategories();
checkLoginStatus();
