async function getWorks() {
    const url = "http://localhost:5678/api/works";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response error: ${response.status}`);
        }
        const works = await response.json();

        works.forEach(work => displayWork(work));

    } catch (error) {
        console.error(error.message);
    }
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

        setFilters({ name: "Tous" });

        
        categories.forEach(category => setFilters(category));

    } catch (error) {
        console.error(error.message);
    }
}

function setFilters(data) {
    const div = document.createElement("div");
    div.textContent = data.name;
    div.classList.add("category-button"); 
    document.querySelector("#div-container").append(div);
}

getWorks();
getCategories();
