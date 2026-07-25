// =========================================
// SAMAKMAK MENU - JavaScript Core v2.2
// =========================================

const container = document.getElementById("menuContainer");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter");

// متغيرات القائمة والصفحات
let menuData = {
    fish: [],
    side: [],
    salads: [],
    drinks: []
};

let currentFilter = "none"; // تغيير الفلتر الافتراضي حتى لا يعرض "الكل" تلقائياً
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

        // تم إلغاء renderMenu() من هنا كي لا تظهر الكروت تلقائياً عند الفتح
        showInitialPlaceholder();
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
// 2. INITIAL PLACEHOLDER (رسالة البداية)
// =========================================

function showInitialPlaceholder() {
    if (!container) return;
    container.innerHTML = `
        <div style="text-align:center; padding: 60px 20px; color: var(--muted);" class="reveal show">
            <i class="fas fa-utensils" style="font-size: 3.5rem; margin-bottom: 20px; color: var(--primary);"></i>
            <h3 style="color:#fff; font-size: 1.5rem;">مرحباً بك في قائمة سمكمك! 🐟</h3>
            <p style="margin-top: 10px; font-size: 1rem;">اختر تصنيفاً من الأعلى أو ابحث عن وجبتك المفضلة للبدء.</p>
        </div>
    `;
}

// =========================================
// 3. MAIN RENDER FUNCTION
// =========================================

function renderMenu(search = "") {
    const searchString = String(search || "").trim().toLowerCase();
    
    // إذا لم يحدد المستخدم أي قسم ولم يكتب شيئاً في البحث، اترك الرسالة الترحيبية
    if (currentFilter === "none" && !searchString) {
        showInitialPlaceholder();
        return;
    }

    container.innerHTML = "";

    const sections = [
        { key: "fish", title: "🐟 الأسماك", badge: "أسماك", hasImage: true },
        { key: "side", title: "🍤 الأطباق الجانبية", badge: "جانبي", hasImage: true },
        { key: "salads", title: "🥗 السلطات", badge: "سلطة", hasImage: false }, 
        { key: "drinks", title: "🥤 المشروبات", badge: "مشروب", hasImage: false } 
    ];

    let totalFilteredItems = 0;
    let menuHTML = "";

    sections.forEach(section => {
        // فلترة حسب القسم (إذا اختار "all" سيتم عرض الكل)
        if (currentFilter !== "all" && currentFilter !== "none" && currentFilter !== section.key) return;

        const rawData = menuData[section.key];
        if (!rawData || !Array.isArray(rawData)) return;

        // فلترة عناصر القسم بناءً على البحث
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

        // تطبيق Pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = items.slice(startIndex, endIndex);

        if (paginatedItems.length === 0) return;

        // بناء الـ HTML
        menuHTML += `
        <div class="category reveal">
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
                const imgSrc = isValidImage ? item.image : "images/no-image.jpg";
                
                imageHtml = `
                <div class="item-image">
                    <img src="${imgSrc}" alt="${displayName}" loading="lazy">
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
                    <div class="item-header">
                        <h3>${displayName}</h3>
                        ${!section.hasImage ? `<span class="badge-inline">${section.badge}</span>` : ""}
                    </div>
                    <p>${subName}</p>
                    <div class="item-footer">
                        <span class="price">${item.price || "--"} جنيه</span>
                        <a href="https://wa.me/201110997766?text=أود%20طلب:%20${encodeURIComponent(displayName)}" target="_blank" class="order-btn">اطلب الآن</a>
                    </div>
                </div>
            </div>
            `;
        });

        menuHTML += `
            </div>
        </div>
        `;
    });

    // حالة عدم وجود نتائج عند البحث
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

    // إضافة أزرار الصفحات
    if (totalFilteredItems > 0) {
        renderPaginationControls(totalFilteredItems);
    }

    revealItems();
}

// =========================================
// 4. PAGINATION CONTROLS
// =========================================

function renderPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage > totalPages && totalPages > 0) {
        currentPage = 1;
        renderMenu(searchInput ? searchInput.value : "");
        return;
    }

    if (totalPages <= 1) return;

    let paginationHtml = `<div class="pagination-wrapper reveal">`;

    paginationHtml += `
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

    paginationHtml += `</div>`;

    container.insertAdjacentHTML('beforeend', paginationHtml);
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
// 5. REVEAL SYSTEM
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
// 6. EVENTS (SEARCH, FILTER, SCROLL, MENU)
// =========================================

if (searchInput) {
    searchInput.addEventListener("input", e => {
        currentPage = 1;
        
        // إذا بدأ المستخدم في الكتابة وهو على وضع "none"، سنحول الفلتر إلى "all" لتشمل البحث كل الأصناف
        if (currentFilter === "none" && e.target.value.trim() !== "") {
            currentFilter = "all";
        }
        
        renderMenu(e.target.value);
    });
}

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentFilter = btn.dataset.filter;
        currentPage = 1;

        const searchValue = searchInput ? searchInput.value : "";
        renderMenu(searchValue);
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
