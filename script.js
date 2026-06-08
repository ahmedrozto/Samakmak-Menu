fetch("menu.json")
  .then(res => res.json())
  .then(data => {

    const container = document.getElementById("menuContainer");

    function render(title, items) {

      if (!items || items.length === 0) return;

      let html = `<div class="category"><h3>${title}</h3>`;

      items.forEach(item => {

        html += `
          <div class="item">

            <div class="item-left">

              ${item.image ? `<img src="${item.image}" alt="${item.name_ar || item.name || ''}">` : ""}

              <span>
                ${item.name_ar || item.name || item.name_en || "بدون اسم"}
              </span>

            </div>

            <span>
              ${item.price ? item.price + " جنيه" : ""}
            </span>

          </div>
        `;
      });

      html += `</div>`;

      container.innerHTML += html;
    }

    render("🐟 الأسماك", data.fish);
    render("🍤 الأطباق الجانبية", data.side_dishes || data.sides);
    render("🥗 السلطات", data.salads);
    render("🥤 المشروبات", data.drinks);

  })
  .catch(err => console.error("JSON Error:", err));

/* SLIDER */
let slides = document.querySelectorAll(".slide");
let currentSlide = 0;

if (slides.length > 0) {
  setInterval(() => {
    slides[currentSlide].classList.remove("active");

    currentSlide = (currentSlide + 1) % slides.length;

    slides[currentSlide].classList.add("active");
  }, 3500);
}

/* SCROLL ANIMATION */
window.addEventListener("scroll", () => {
  document.querySelectorAll(".title").forEach(el => {
    let pos = el.getBoundingClientRect().top;

    if (pos < 600) {
      el.classList.add("show");
    }
  });
});
