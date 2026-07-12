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
// RENDER (النسخة المصلحة المتوافقة مع الـ JSON الخاص بك)
// =========================================

function renderMenu(search = "") {
    // تحويل قيمة البحث إلى نص دائمًا وبحروف صغيرة بأمان
    const searchString = String(search || "").trim().toLowerCase();

    // تفريغ الحاوية قبل إعادة الرسم
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
        // التحقق من الفلتر الحالي (التبويب النشط)
        if (currentFilter !== "all" && currentFilter !== section.key)
            return;

        // التأكد من أن القسم يحتوي على مصفوفة بيانات سليمة
        const rawData = menuData[section.key];
        if (!rawData || !Array.isArray(rawData))
            return;

        // فلترة العناصر بناءً على اسم عربي أو إنجليزي أو عام
        const items = rawData.filter(item => {
            const nameAr = String(item.name_ar || "").toLowerCase();
            const nameEn = String(item.name_en || "").toLowerCase();
            const nameGeneral = String(item.name || "").toLowerCase();

            // إذا كان نص البحث فارغاً، يعود بـ true ليعرض كل العناصر مباشرة
            if (!searchString) return true;

            // التحقق من مطابقة البحث في أي من الحقول الثلاثة
            return nameAr.includes(searchString) || 
                   nameEn.includes(searchString) || 
                   nameGeneral.includes(searchString);
        });

        // إذا لم يطابق البحث أي عنصر في هذا القسم، تخطاه
        if (items.length === 0) return;

        // بناء كود الـ HTML للقسم والعناصر التابعة له
        let html = `
        <div class="category reveal">
            <h2 class="category-title">${section.title}</h2>
            <div class="items">
        `;

        items.forEach(item => {
            // تحديد الاسم الأساسي للعرض (يفضل العربي ثم العام ثم الإنجليزي)
            const displayName = item.name_ar || item.name || item.name_en || "صنف بدون اسم";
            const subName = item.name_ar ? (item.name_en || "") : "";

            html += `
            <div class="item">
                <div class="item-image">
                    <img 
                        src="${item.image && item.image.trim() !== "images/fish/.jpg" && item.image.trim() !== "" ? item.image : "images/no-image.jpg"}" 
                        alt="${displayName}" 
                        loading="lazy">
                    <span class="badge">${section.badge}</span>
                </div>
                <div class="item-content">
                    <h3>${displayName}</h3>
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

        // إضافة القسم إلى الصفحة
        container.innerHTML += html;
    });

    // تشغيل أنيميشن الظهور التدريجي بعد الرسم
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
