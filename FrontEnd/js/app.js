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

getWorks();
getCategories();
