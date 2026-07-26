// =========================================
// SAMAKMAK MENU - JavaScript Core v2.5 (Fixed Images & Fallbacks)
// =========================================

const container = document.getElementById("menuContainer");
const paginationWrapper = document.getElementById("paginationWrapper");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter");

// متغيرات القائمة والصفحات
let menuData = {
    fish: [],
    side: [],
    salads: [],
    drinks: []
};

// جعل قسم "الأسماك" هو الافتراضي
let currentFilter = "fish"; 
let currentPage = 1;
const itemsPerPage = 8;

// =========================================
// 1. FETCH & LOAD JSON 
// =========================================

fetch("menu.json")
    .then(res => {
        if (!res.ok) {
            throw new Error(`تعذر تحميل ملف الـ JSON: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log("البيانات المحملة بنجاح:", data);

        menuData = {
            fish: data.fish || [],
            side: data.side_dishes || data.sides || [],
            salads: data.salads || [],
            drinks: data.drinks || []
        };

        renderMenu(); 
    })
    .catch(err => {
        console.error("حدث خطأ أثناء جلب البيانات:", err);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; color: #ff5252; padding: 40px; background: rgba(255,82,82,0.1); border-radius: 15px; margin: 20px 0;">
                    <h3>⚠️ تعذر تحميل القائمة حالياً</h3>
                    <p style="margin-top: 10px; font-size: 0.9rem;">يرجى التأكد من تشغيل السيرفر المحلي أو التأكد من وجود ملف menu.json</p>
                </div>
            `;
        }
    });


// =========================================
// 2. MAIN RENDER FUNCTION
// =========================================

function renderMenu(search = "") {
    const searchString = String(search || "").trim().toLowerCase();
    
    container.innerHTML = "";
    if(paginationWrapper) paginationWrapper.innerHTML = ""; 

    // تعريف الأقسام مع إضافة الأيقونات المخصصة
    const sections = [
        { key: "fish", title: "🐟🦐 قائمة الأسماك الطازجة", badge: "أسماك", hasImage: true },
        { key: "side", title: "🍤 الأطباق الجانبية", badge: "جانبي", hasImage: true },
        { key: "salads", title: "🥗 السلطات", badge: "سلطة", hasImage: false }, 
        { key: "drinks", title: "🥤 المشروبات", badge: "مشروب", hasImage: false } 
    ];

    let totalFilteredItems = 0;
    let menuHTML = "";

    sections.forEach(section => {
        if (searchString === "" && currentFilter !== "all" && currentFilter !== section.key) return;

        const rawData = menuData[section.key];
        if (!rawData || !Array.isArray(rawData)) return;

        const items = rawData.filter(item => {
            const nameAr = String(item.name_ar || "").toLowerCase();
            const nameEn = String(item.name_en || "").toLowerCase();
            const nameGeneral = String(item.name || "").toLowerCase();

            if (!searchString) return true;

            return nameAr.includes(searchString) || 
                   nameEn.includes(searchString) || 
                   nameGeneral.includes(searchString);
        });

        if (items.length === 0) return;

        totalFilteredItems += items.length;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = items.slice(startIndex, endIndex);

        if (paginatedItems.length === 0) return;

        menuHTML += `
        <div class="category reveal show">
            <h2 class="category-title">${section.title}</h2>
            <div class="items">
        `;

        paginatedItems.forEach(item => {
            const displayName = item.name_ar || item.name || item.name_en || "صنف بدون اسم";
            const subName = item.name_ar ? (item.name_en || "") : "";

            let imageHtml = "";
            let noImageClass = "";

            if (section.hasImage) {
                const isValidImage = item.image && item.image.trim() !== "images/fish/.jpg" && item.image.trim() !== "";
                const imgSrc = isValidImage ? item.image : "images/logo.png";
                
                imageHtml = `
                <div class="item-image">
                    <img src="${imgSrc}" alt="${displayName}" loading="lazy" onerror="this.src='images/logo.png'">
                    <span class="badge">${section.badge}</span>
                </div>
                `;
            } else {
                noImageClass = "no-image-layout"; 
            }

            menuHTML += `
            <div class="item ${noImageClass}">
                ${imageHtml}
                <div class="item-content">
                    ${!section.hasImage ? `
                    <div class="no-image-content">
                        <div class="item-header">
                            <h3>${displayName}</h3>
                            <span class="badge-inline">${section.badge}</span>
                        </div>
                        <p>${subName}</p>
                        <div class="item-footer">
                            <span class="price">${item.price || "--"} جنيه</span>
                        </div>
                    </div>
                    ` : `
                    <div>
                        <div class="item-header">
                            <h3>${displayName}</h3>
                        </div>
                        <p>${subName}</p>
                    </div>
                    <div class="item-footer">
                        <span class="price">${item.price || "--"} جنيه</span>
                    </div>
                    `}
                </div>
            </div>
            `;
        });

        menuHTML += `
            </div>
        </div>
        `;
    });

    if (totalFilteredItems === 0) {
        menuHTML = `
            <div style="text-align:center; padding: 60px 20px; color: var(--muted);" class="reveal show">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px; color: var(--primary);"></i>
                <h3 style="color:#fff;">عذراً، لم نجد أي نتائج تطابق بحثك</h3>
                <p>جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً</p>
            </div>
        `;
    }

    container.innerHTML = menuHTML;

    if (totalFilteredItems > 0) {
        renderPaginationControls(totalFilteredItems);
    }

    revealItems();
}

// =========================================
// 3. PAGINATION CONTROLS
// =========================================

function renderPaginationControls(totalItems) {
    if (!paginationWrapper) return;
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage > totalPages && totalPages > 0) {
        currentPage = 1;
        renderMenu(searchInput ? searchInput.value : "");
        return;
    }

    if (totalPages <= 1) return;

    let paginationHtml = `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-right"></i> السابق
        </button>
    `;

    paginationHtml += `<div class="page-numbers">`;
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `
            <button class="page-num ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    paginationHtml += `</div>`;

    paginationHtml += `
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            التالي <i class="fas fa-chevron-left"></i>
        </button>
    `;

    paginationWrapper.innerHTML = paginationHtml;
}

window.changePage = function(newPage) {
    currentPage = newPage;
    const searchValue = searchInput ? searchInput.value : "";
    renderMenu(searchValue);

    const menuSection = document.getElementById("menu");
    if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth" });
    }
};

// =========================================
// 4. REVEAL SYSTEM
// =========================================

function revealItems() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: "50px"
    });

    document.querySelectorAll(".reveal").forEach(el => {
        observer.observe(el);
    });
}

// =========================================
// 5. EVENTS (SEARCH, FILTER, SCROLL, MENU)
// =========================================

if (searchInput) {
    searchInput.addEventListener("input", e => {
        currentPage = 1;
        const val = e.target.value.trim();
        
        if (val !== "") {
            filterButtons.forEach(b => b.classList.remove("active"));
        } else {
            currentFilter = "fish";
            filterButtons.forEach(b => {
                b.classList.remove("active");
                if(b.dataset.filter === "fish") b.classList.add("active");
            });
        }
        
        renderMenu(val);
    });
}

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if(searchInput) searchInput.value = "";

        currentFilter = btn.dataset.filter;
        currentPage = 1;

        renderMenu("");
    });
});

window.addEventListener("scroll", () => {
    document.querySelectorAll(".title").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
            el.classList.add("show");
        }
    });

    const nav = document.querySelector("nav");
    if (nav) {
        if (window.scrollY > 80)
            nav.classList.add("scrolled");
        else
            nav.classList.remove("scrolled");
    }
});

const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.links');

if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}
