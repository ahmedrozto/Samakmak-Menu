// =========================================
// SAMAKMAK MENU - JavaScript Core v2.0
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

let currentFilter = "all";
let currentPage = 1;
const itemsPerPage = 8; // عدد الوجبات/العناصر المعروضة في الصفحة الواحدة (يمكنك تعديل الرقم)

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

        // رسم المنيو لأول مرة
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
// 2. MAIN RENDER FUNCTION (مع الـ Pagination)
// =========================================

function renderMenu(search = "") {
    const searchString = String(search || "").trim().toLowerCase();
    container.innerHTML = "";

    const sections = [
        { key: "fish", title: "🐟 الأسماك", badge: "أسماك", hasImage: true },
        { key: "side", title: "🍤 الأطباق الجانبية", badge: "جانبي", hasImage: true },
        { key: "salads", title: "🥗 السلطات", badge: "سلطة", hasImage: false }, 
        { key: "drinks", title: "🥤 المشروبات", badge: "مشروب", hasImage: false } 
    ];

    let totalFilteredItems = 0;

    sections.forEach(section => {
        // فلترة حسب الزر النشط (الجميع، أسماك، سلطات...)
        if (currentFilter !== "all" && currentFilter !== section.key) return;

        const rawData = menuData[section.key];
        if (!rawData || !Array.isArray(rawData)) return;

        // فلترة عناصر القسم بناءً على كلمة البحث
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

        // حساب عدد العناصر الكلي للـ Pagination
        totalFilteredItems += items.length;

        // تطبيق Pagination على العناصر
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = items.slice(startIndex, endIndex);

        if (paginatedItems.length === 0) return;

        // بناء الـ HTML لكل قسم
        let html = `
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

            html += `
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
                        <a href="https://wa.me/201110997766?text=أود%20طلب:%20${encodeURIComponent(displayName)}" target="_blank" class="order-btn">
                            <i class="fab class-whatsapp"></i> اطلب الآن
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

    // حالة عدم وجود أية نتائج بحث
    if (totalFilteredItems === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 60px 20px; color: var(--muted);" class="reveal show">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px; color: var(--primary);"></i>
                <h3 style="color:#fff;">عذراً، لم نجد أي نتائج تطابق بحثك</h3>
                <p>جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً</p>
            </div>
        `;
    }

    // رسم أزرار التنقل بين الصفحات (Pagination)
    renderPaginationControls(totalFilteredItems);

    // تشغيل أنيميشن الظهور الذكي
    revealItems();
}

// =========================================
// 3. PAGINATION CONTROLS (إنشاء أزرار التنقل)
// =========================================

function renderPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // إذا كانت الصفحة الحالية أكبر من إجمالي الصفحات المتوفرة (مثلاً عند البحث)
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = 1;
        renderMenu(searchInput ? searchInput.value : "");
        return;
    }

    // إذا كان عدد الصفحات صفراً أو 1 لا داعي لإظهار أزرار التنقل
    if (totalPages <= 1) return;

    let paginationHtml = `<div class="pagination-wrapper reveal">`;

    // زر الصفحة السابقة
    paginationHtml += `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-right"></i> السابق
        </button>
    `;

    // أرقام الصفحات
    paginationHtml += `<div class="page-numbers">`;
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `
            <button class="page-num ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    paginationHtml += `</div>`;

    // زر الصفحة التالية
    paginationHtml += `
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            التالي <i class="fas fa-chevron-left"></i>
        </button>
    `;

    paginationHtml += `</div>`;

    container.innerHTML += paginationHtml;
}

// دالة تغيير الصفحة
window.changePage = function(newPage) {
    currentPage = newPage;
    const searchValue = searchInput ? searchInput.value : "";
    renderMenu(searchValue);

    // التمرير لأعلى قسم المنيو بسلاسة
    const menuSection = document.getElementById("menu");
    if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth" });
    }
};

// =========================================
// 4. REVEAL SYSTEM (أنيميشن الظهور)
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
// 5. SEARCH EVENTS (البحث)
// =========================================

if (searchInput) {
    searchInput.addEventListener("input", e => {
        currentPage = 1; // إعادة الضبط للصفحة الأولى عند كتابة بحث جديد
        renderMenu(e.target.value);
    });
}

// =========================================
// 6. FILTER BUTTONS (أزرار التصفية)
// =========================================

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentFilter = btn.dataset.filter;
        currentPage = 1; // إعادة الضبط للصفحة الأولى عند تغيير القسم

        const searchValue = searchInput ? searchInput.value : "";
        renderMenu(searchValue);
    });
});

// =========================================
// 7. SCROLL TITLES & NAVBAR
// =========================================

window.addEventListener("scroll", () => {
    // أنيميشن العناوين عند السكرول
    document.querySelectorAll(".title").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
            el.classList.add("show");
        }
    });

    // الهيدر والـ Navbar عند السكرول
    const nav = document.querySelector("nav");
    if (nav) {
        if (window.scrollY > 80)
            nav.classList.add("scrolled");
        else
            nav.classList.remove("scrolled");
    }
});

// =========================================
// 8. MOBILE MENU TOGGLE
// =========================================

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
