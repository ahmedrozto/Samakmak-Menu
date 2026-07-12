// =========================================
// SAMAKMAK MENU
// =========================================

const container = document.getElementById("menuContainer");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter");

let menuData = {
    fish: [],
    side: [],
    salads: [],
    drinks: []
};
let currentFilter = "all"; // التأكد من أن الفلتر الافتراضي يعرض كل شيء

// =========================================
// LOAD JSON (نسخة مطورة ومحصنة ضد الأخطاء)
// =========================================

fetch("menu.json")
    .then(res => {
        if (!res.ok) {
            throw new Error(`تعذر تحميل ملف الـ JSON: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        // طباعة البيانات في الـ Console للتأكد من قراءتها بالكامل
        console.log("البيانات المحملة من الـ JSON:", data);

        // ربط البيانات بدقة مع معالجة أي اختلاف في المسميات
        menuData = {
            fish: data.fish || [],
            side: data.side_dishes || data.sides || [],
            salads: data.salads || [],
            drinks: data.drinks || []
        };

        console.log("البيانات بعد الترتيب داخلياً:", menuData);

        // استدعاء دالة الرسم
        renderMenu();
    })
    .catch(err => {
        console.error("حدث خطأ أثناء جلب البيانات:", err);
        if(container) {
            container.innerHTML = `<p style="color:red; text-align:center;">حدث خطأ في تحميل القائمة، يرجى مراجعة الـ Console</p>`;
        }
    });

// =========================================
// RENDER (النسخة المحدثة لإخفاء مساحة الصور من السلطات والمشروبات)
// =========================================

function renderMenu(search = "") {
    const searchString = String(search || "").trim().toLowerCase();
    container.innerHTML = "";

    const sections = [
        { key: "fish", title: "🐟 الأسماك", badge: "أسماك", hasImage: true },
        { key: "side", title: "🍤 الأطباق الجانبية", badge: "جانبي", hasImage: true },
        { key: "salads", title: "🥗 السلطات", badge: "سلطة", hasImage: false }, // بدون صور
        { key: "drinks", title: "🥤 المشروبات", badge: "مشروب", hasImage: false } // بدون صور
    ];

    sections.forEach(section => {
        if (currentFilter !== "all" && currentFilter !== section.key)
            return;

        const rawData = menuData[section.key];
        if (!rawData || !Array.isArray(rawData))
            return;

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

        let html = `
        <div class="category reveal">
            <h2 class="category-title">${section.title}</h2>
            <div class="items">
        `;

        items.forEach(item => {
            const displayName = item.name_ar || item.name || item.name_en || "صنف بدون اسم";
            const subName = item.name_ar ? (item.name_en || "") : "";

            // التحقق مما إذا كان القسم يدعم الصور وما إذا كانت الصورة موجودة فعلياً
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
                // إضافة كلاس اختياري للـ CSS في حال أردت تنسيق العناصر التي ليس بها صور بشكل خاص
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
                        <a href="https://wa.me/201110997766" class="order-btn">اطلب الآن</a>
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
// FILTER (تم تعديله لمنع الأخطاء)
// =========================================

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentFilter = btn.dataset.filter;

        // التأكد من جلب نص البحث الحالي بأمان، وإذا لم يوجد نرسل نصاً فارغاً
        const searchValue = searchInput ? searchInput.value : "";
        renderMenu(searchValue);
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
