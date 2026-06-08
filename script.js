fetch("menu.json")
  .then(res => res.json())
  .then(data => {

    const container = document.getElementById("menuContainer");

    function render(title, items) {

      let html = <div class="category"><h3>${title}</h3>;

      items.forEach(i => {

        html += `
          <div class="item">

            <div class="item-left">

              ${i.image ? <img src="${i.image}"> : ""}

              <span>
                ${i.name_ar || i.name || i.name_en || "بدون اسم"}
              </span>

            </div>

            <span>
              ${i.price ? i.price + " جنيه" : ""}
            </span>

          </div>
        `;
      });

      html += </div>;

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
let i = 0;

if (slides.length > 0) {
  setInterval(() => {
    slides[i].classList.remove("active");
    i = (i + 1) % slides.length;
    slides[i].classList.add("active");
  }, 3500);
}

/* SCROLL ANIMATION */
window.addEventListener("scroll", () => {
  document.querySelectorAll(".title").forEach(el => {
    let pos = el.getBoundingClientRect().top;
    if (pos < 600) el.classList.add("show");
  });
});
