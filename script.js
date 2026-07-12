// =========================================
// SAMAKMAK MENU
// =========================================

const container = document.getElementById("menuContainer");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter");

let menuData = {};
let currentFilter = "all";

// =========================================
// LOAD JSON
// =========================================

fetch("menu.json")
    .then(res => res.json())
    .then(data => {

        menuData = {

            fish: data.fish || [],
            side: data.side_dishes || data.sides || [],
            salads: data.salads || [],
            drinks: data.drinks || []

        };

        renderMenu();

    })

    .catch(err => console.error(err));

// =========================================
// RENDER
// =========================================

function renderMenu(search = "") {

    container.innerHTML = "";

    const sections = [

        {
            key: "fish",
            title: "🐟 الأسماك",
            badge: "أسماك"
        },

        {
            key: "side",
            title: "🍤 الأطباق الجانبية",
            badge: "جانبي"
        },

        {
            key: "salads",
            title: "🥗 السلطات",
            badge: "سلطة"
        },

        {
            key: "drinks",
            title: "🥤 المشروبات",
            badge: "مشروب"
        }

    ];

    sections.forEach(section => {

        if (currentFilter !== "all" && currentFilter !== section.key)
            return;

        const items = menuData[section.key].filter(item => {

            const name =
                (
                    item.name_ar ||
                    item.name ||
                    item.name_en ||
                    ""
                ).toLowerCase();

            return name.includes(search.toLowerCase());

        });

        if (!items.length) return;

        let html = `

        <div class="category reveal">

            <h2 class="category-title">

                ${section.title}

            </h2>

            <div class="items">

        `;

        items.forEach(item => {

            html += `

            <div class="item">

                <div class="item-image">

                    <img

                        src="${item.image || "images/no-image.jpg"}"

                        alt="${item.name_ar || ""}"

                        loading="lazy">

                    <span class="badge">

                        ${section.badge}

                    </span>

                </div>

                <div class="item-content">

                    <h3>

                        ${item.name_ar || item.name || item.name_en}

                    </h3>

                    <p>

                        ${item.name_en || ""}

                    </p>

                    <div class="item-footer">

                        <span class="price">

                            ${item.price || "--"} جنيه

                        </span>

                        <a

                        href="https://wa.me/201110997766"

                        class="order-btn">

                            اطلب الآن

                        </a>

                    </div>

                </div>

            </div>

            `;

        });

        html += `

            </div>

        </div>

        `;

        container.innerHTML += html;

    });

    revealItems();

}

// =========================================
// SEARCH
// =========================================

if (searchInput) {

    searchInput.addEventListener("input", e => {

        renderMenu(e.target.value);

    });

}

// =========================================
// FILTER
// =========================================

filterButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        filterButtons.forEach(b =>
            b.classList.remove("active"));

        btn.classList.add("active");

        currentFilter = btn.dataset.filter;

        renderMenu(searchInput.value);

    });

});

// =========================================
// SCROLL TITLES
// =========================================

window.addEventListener("scroll", () => {

    document.querySelectorAll(".title").forEach(el => {

        if (el.getBoundingClientRect().top < 550) {

            el.classList.add("show");

        }

    });

});

// =========================================
// REVEAL
// =========================================

function revealItems() {

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, {

        threshold: .15

    });

    document.querySelectorAll(".reveal").forEach(el => {

        observer.observe(el);

    });

}

// =========================================
// NAVBAR
// =========================================

window.addEventListener("scroll", () => {

    const nav = document.querySelector("nav");

    if (window.scrollY > 80)

        nav.classList.add("scrolled");

    else

        nav.classList.remove("scrolled");

});


const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.links');

mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// إغلاق القائمة تلقائياً عند الضغط على أي رابط داخلها
document.querySelectorAll('.links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
    });
});
