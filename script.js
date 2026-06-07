fetch("menu.json")
.then(res => res.json())
.then(data => {

    const container = document.getElementById("menuContainer");

    function createCategory(title, items, hasImage){

        let html = `<div class="category"><h3>${title}</h3>`;

        items.forEach(item => {

            html += `<div class="item">`;

            html += `<div class="item-left">`;

            if(hasImage){
                html += `<img src="${item.image}">`;
            }

            html += `<span>${item.name}</span>`;
            html += `</div>`;

            html += `<span>${item.price ? item.price + " جنيه" : ""}</span>`;
            html += `</div>`;
        });

        html += `</div>`;
        container.innerHTML += html;
    }

    createCategory("🐟 الأسماك", data.fish, true);
    createCategory("🍤 الأطباق الجانبية", data.sides, true);
    createCategory("🥗 السلطات", data.salads, false);
    createCategory("🥤 المشروبات", data.drinks, false);

});
