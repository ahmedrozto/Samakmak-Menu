// ===============================
// Samakmak V2
// Developed for Menu Redesign
// ===============================

const container = document.getElementById("menuContainer");
const searchInput = document.getElementById("searchInput");

let menuData = {};
let currentFilter = "all";

// ===============================
// إنشاء كارت
// ===============================

function createCard(item) {

    const image = item.image && item.image.trim() !== ""
        ? item.image
        : "images/no-image.png";

    const name =
        item.name_ar ||
        item.name ||
        item.name_en ||
        "بدون اسم";

    return `

<div class="menu-card">

    <div class="image-box">

        <img
            src="${image}"
            alt="${name}"
            loading="lazy">

    </div>

    <div class="card-body">

        <h3>${name}</h3>

        <div class="price">

            ${item.price || ""}

            <span>جنيه</span>

        </div>

        <a
        class="order-btn"
        target="_blank"
        href="https://wa.me/201110997766?text=${encodeURIComponent(
            "السلام عليكم، أريد طلب " + name
        )}">

        اطلب عبر واتساب

        </a>

    </div>

</div>

`;

}

// ===============================
// عرض قسم
// ===============================

function renderCategory(title, items, key) {

    if (!items || items.length === 0) return;

    let html = `

<section class="menu-section"
data-category="${key}">

<h2 class="category-title">

${title}

</h2>

<div class="cards">

`;

    items.forEach(item => {

        html += createCard(item);

    });

    html += `

</div>

</section>

`;

    container.innerHTML += html;

}

// ===============================
// تحميل ملف المنيو
// ===============================

fetch("menu.json")

.then(response => response.json())

.then(data => {

    menuData = data;

    drawMenu();

})

.catch(error => {

    console.error(error);

});

// ===============================
// رسم المنيو
// ===============================

function drawMenu(){

    container.innerHTML = "";

    if(currentFilter === "all" || currentFilter === "fish"){

        renderCategory(
            "🐟 الأسماك",
            menuData.fish,
            "fish"
        );

    }

    if(currentFilter === "all" || currentFilter === "side"){

        renderCategory(
            "🍤 الأطباق الجانبية",
            menuData.side_dishes || menuData.sides,
            "side"
        );

    }

    if(currentFilter === "all" || currentFilter === "salads"){

        renderCategory(
            "🥗 السلطات",
            menuData.salads,
            "salads"
        );

    }

    if(currentFilter === "all" || currentFilter === "drinks"){

        renderCategory(
            "🥤 المشروبات",
            menuData.drinks,
            "drinks"
        );

    }

}

// ===============================
// البحث
// ===============================

searchInput.addEventListener("keyup", () => {

    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    document.querySelectorAll(".menu-card").forEach(card => {

        const title = card.querySelector("h3")
            .textContent
            .toLowerCase();

        if (title.includes(keyword)) {

            card.style.display = "flex";

        } else {

            card.style.display = "none";

        }

    });

});

// ===============================
// أزرار الفلترة
// ===============================

document.querySelectorAll(".filter").forEach(btn => {

    btn.addEventListener("click", () => {

        document
            .querySelectorAll(".filter")
            .forEach(x => x.classList.remove("active"));

        btn.classList.add("active");

        currentFilter = btn.dataset.filter;

        drawMenu();

    });

});

// ===============================
// Hero Slider
// ===============================

const slides = document.querySelectorAll(".slide");

let currentSlide = 0;

if (slides.length > 0) {

    setInterval(() => {

        slides[currentSlide].classList.remove("active");

        currentSlide++;

        if (currentSlide >= slides.length) {

            currentSlide = 0;

        }

        slides[currentSlide].classList.add("active");

    }, 4000);

}

// ===============================
// Scroll Animation
// ===============================

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {

    threshold: .2

});

document.querySelectorAll(".title,.category-title,.menu-card,.branch")
.forEach(el => observer.observe(el));
