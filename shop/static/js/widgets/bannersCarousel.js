document.addEventListener("DOMContentLoaded", async function () {
    setupImageCarousel();
});
// function setupImageCarousel() {
//
//     function cycleItems() {
//
//
//         requestAnimationFrame(() => {
//             // This slight delay ensures the browser has time to apply the above styles
//             setTimeout(() => {
//                 currentItem.style.display = "none";
//             }, 500);
//         });
//
//         // Use requestAnimationFrame to ensure the next frame starts the fade-in
//         requestAnimationFrame(() => {
//             // This slight delay ensures the browser has time to apply the above styles
//             setTimeout(() => {
//                 nextItem.style.opacity = 1;
//             }, 20);
//         });
//
//
//     }
//
//     setInterval(cycleItems, 8000); // Adjusted timing for visual clarity
// }
function setupImageCarousel() {
  let currentIndex = 0;
  const items = document.querySelectorAll('.carousel-item');
  const itemAmount = items.length;
  let autoTimer;

  items[0].style.display = "block";
  items[0].style.opacity = '1';

  startAutoCycle();
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  let isNavCooldown = false;
  function handleNav(offset) {
      if (isNavCooldown) return;
      isNavCooldown = true;

      stopAutoCycle();

      setTimeout(() => {
        showSlide((currentIndex + offset + itemAmount) % itemAmount);
        startAutoCycle();

        isNavCooldown = false;
      }, 220);
    }


  prevBtn.addEventListener('click', () => handleNav(-1));
  nextBtn.addEventListener('click', () => handleNav(+1));



  function showSlide(newIndex) {
    const prev = items[currentIndex];
    const next = items[newIndex];

    prev.style.opacity = '0';
    requestAnimationFrame(() => {
        setTimeout(() => {
            prev.style.display = "none";
        }, 500);
    });

    next.style.opacity = '0';
    next.style.display = "block";
    next.classList.add('active');
    requestAnimationFrame(() => {
        setTimeout(() => {
            next.style.opacity = '1';
        }, 20);
    });
    currentIndex = newIndex;
  }

  function cycleItems() {
    showSlide((currentIndex + 1) % itemAmount);
  }

  function startAutoCycle() {
    autoTimer = setInterval(cycleItems, 8000);
  }

  function stopAutoCycle() {
    clearInterval(autoTimer);
  }
}
