
const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const close = document.getElementById('close');

if (bar) {
  bar.addEventListener('click', () => {
    nav.classList.add('active');
  })
}
if (close) {
  close.addEventListener('click', () => {
    nav.classList.remove('active');
  })
}


const card = document.querySelector(".card");
const cardRect = card.getBoundingClientRect();
let isInsideCard = false;

card.addEventListener("mousemove", e => {
    if (!isInsideCard) {
        isInsideCard = true;
    }

    const xPosition = (e.clientX - cardRect.left) / cardRect.width;
    const yPosition = (e.clientY - cardRect.top) / cardRect.height - 0.4; // Centra verticalmente un poco más arriba
    const xOffset = -(xPosition - 0.5); // Centra horizontalmente
    const dxNorm = Math.min(Math.max(xOffset, -0.4), 0.4); // Limita la rotación horizontal

    card.style.transform = `perspective(700px)      /* Perspectiva un poco más fuerte */
        rotateY(${dxNorm * 120}deg)   /* Rotación Y más sensible */
        rotateX(${yPosition * 90}deg)`;  /* Rotación X ligeramente más sensible */
});

card.addEventListener("mouseleave", () => {
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

// addCart

document.querySelectorAll('.button').forEach(button => button.addEventListener('click', e => {
  if (!button.classList.contains('loading')) {

    button.classList.add('loading');

    setTimeout(() => button.classList.remove('loading'), 3700);

  }
  e.preventDefault();
}));


// sproducts



