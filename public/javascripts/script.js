
const bar=document.getElementById('bar');
const nav=document.getElementById('navbar');
const close=document.getElementById('close');

if(bar){
   bar.addEventListener('click',()=>{
        nav.classList.add('active');
    })
}
if(close){
   close.addEventListener('click',()=>{
        nav.classList.remove('active');
    })
}


// movimiento carta

const card = document.querySelector(".card");
const cardRect = card.getBoundingClientRect();

// Variable para detectar si el mouse está dentro de la carta
let isInsideCard = false;

card.addEventListener("mousemove", e => {
   // Verificar si el mouse está dentro de la carta
   if (!isInsideCard) {
       isInsideCard = true;
   }

   const xPosition = (e.clientX - cardRect.left) / cardRect.width;
   const yPosition = (e.clientY - cardRect.top) / cardRect.height - 0.6;
   const xOffset = -(xPosition - 0.6);
   const dxNorm = Math.min(Math.max(xOffset, -0.6), 0.6);

   // Aumenta los valores de rotación para mayor velocidad
   card.style.transform = `perspective(1000px)
       rotateY(${dxNorm * 100}deg)   /* Aumentado de 75 a 100 */
       rotateX(${yPosition * 100}deg)`; /* Aumentado de 75 a 100 */
});

card.addEventListener("mouseleave", () => {
   // Solo aplicar transform si el mouse sale de la carta
   if (isInsideCard) {
       card.style.transform = "none";
       isInsideCard = false;
   }
});


//movimiento mazo

var swiper = new Swiper(".swiper", {
   effect: "cards",
   grabcursor: true,
   initialSlide: 4,
   speed: 500,
   rotate: true,
   // autoplay: {
   //     delay: 1000,
   // },
   mousewheel: {
       invert: false,
   }
})