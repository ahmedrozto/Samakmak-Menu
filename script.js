window.addEventListener('scroll',()=>{
document.querySelectorAll('.reveal').forEach(el=>{
if(el.getBoundingClientRect().top<window.innerHeight-80){el.classList.add('active')}
})
})
function filterCards(cat){
document.querySelectorAll('.card').forEach(c=>{
c.style.display=(cat==='all'||c.classList.contains(cat))?'block':'none'
})
}
function openLightbox(src){
document.getElementById('lightbox').style.display='flex';
document.getElementById('lightboxImg').src=src;
}
function closeLightbox(){
document.getElementById('lightbox').style.display='none';
}
