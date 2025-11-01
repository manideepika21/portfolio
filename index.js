// initialization

const RESPONSIVE_WIDTH = 1024

let headerWhiteBg = false
let isHeaderCollapsed = window.innerWidth < RESPONSIVE_WIDTH
const collapseBtn = document.getElementById("collapse-btn")
const collapseHeaderItems = document.getElementById("collapsed-header-items")



function onHeaderClickOutside(e) {

    if (!collapseHeaderItems.contains(e.target)) {
        toggleHeader()
    }

}


function toggleHeader() {
    if (isHeaderCollapsed) {
        // collapseHeaderItems.classList.remove("max-md:tw-opacity-0")
        collapseHeaderItems.classList.add("opacity-100",)
        collapseHeaderItems.style.width = "60vw"
        collapseBtn.classList.remove("bi-list")
        collapseBtn.classList.add("bi-x", "max-lg:tw-fixed")
        isHeaderCollapsed = false

        setTimeout(() => window.addEventListener("click", onHeaderClickOutside), 1)

    } else {
        collapseHeaderItems.classList.remove("opacity-100")
        collapseHeaderItems.style.width = "0vw"
        collapseBtn.classList.remove("bi-x", "max-lg:tw-fixed")
        collapseBtn.classList.add("bi-list")
        isHeaderCollapsed = true
        window.removeEventListener("click", onHeaderClickOutside)

    }
}

function responsive() {
    if (window.innerWidth > RESPONSIVE_WIDTH) {
        collapseHeaderItems.style.width = ""

    } else {
        isHeaderCollapsed = true
    }
}

window.addEventListener("resize", responsive)


/**
 * Animations
 */

gsap.registerPlugin(ScrollTrigger)

gsap.to(".reveal-hero-text", {
    opacity: 0,
    y: "100%",
})

gsap.to(".reveal-hero-img", {
    opacity: 0,
    y: "100%",
})


gsap.to(".reveal-up", {
    opacity: 0,
    y: "100%",
})


window.addEventListener("load", () => {
    // animate from initial position
    gsap.to(".reveal-hero-text", {
        opacity: 1,
        y: "0%",
        duration: 0.8,
        // ease: "power3.out",
        stagger: 0.5, // Delay between each word's reveal,
        // delay: 3
    })

    gsap.to(".reveal-hero-img", {
        opacity: 1,
        y: "0%",
    })

    
})


// ------------- reveal section animations ---------------

const sections = gsap.utils.toArray("section")

sections.forEach((sec) => {

    const revealUptimeline = gsap.timeline({paused: true, 
                                            scrollTrigger: {
                                                            trigger: sec,
                                                            start: "10% 80%", // top of trigger hits the top of viewport
                                                            end: "20% 90%",
                                                            // markers: true,
                                                            // scrub: 1,
                                                        }})

    revealUptimeline.to(sec.querySelectorAll(".reveal-up"), {
        opacity: 1,
        duration: 0.8,
        y: "0%",
        stagger: 0.2,
        ease: "power2.out"
    })

    // Also animate any reveal-hero-text elements in sections (not just hero)
    const heroTextElements = sec.querySelectorAll(".reveal-hero-text")
    if (heroTextElements.length > 0 && !sec.classList.contains('hero-section')) {
        revealUptimeline.to(heroTextElements, {
            opacity: 1,
            duration: 0.8,
            y: "0%",
            stagger: 0.15,
            ease: "power2.out"
        }, "-=0.4") // Start slightly before the reveal-up elements finish
    }
})

// Collapsible education toggles
document.addEventListener('DOMContentLoaded', () => {
  const toggles = document.querySelectorAll('.edu-toggle');

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const panel = document.getElementById(targetId);
      if (!panel) return;

      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        // close
        panel.style.maxHeight = '0';
        btn.setAttribute('aria-expanded', 'false');
        const icon = btn.querySelector('.chev-icon');
        if (icon) icon.classList.remove('tw-rotate-180');
      } else {
        // open
        // set maxHeight to scrollHeight to animate open
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
        const icon = btn.querySelector('.chev-icon');
        if (icon) icon.classList.add('tw-rotate-180');
      }
    });

    // Optional: if you want keyboard users to toggle with Enter/Space on the button
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Optional: Fix maxHeight if images load later (recompute open panels)
  window.addEventListener('resize', () => {
    document.querySelectorAll('.edu-content').forEach(panel => {
      const parentBtn = document.querySelector(`.edu-toggle[data-target="${panel.id}"]`);
      if (parentBtn && parentBtn.getAttribute('aria-expanded') === 'true') {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
});

function openModal(projectId) {
  document.getElementById(`${projectId}-modal`).style.display = "flex";
}

function closeModal(projectId) {
  document.getElementById(`${projectId}-modal`).style.display = "none";
}

// Optional: close modal when clicking outside the box
window.onclick = function (event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};
const items = document.querySelectorAll(".timeline-item");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, { threshold: 0.2 });

  items.forEach((item) => observer.observe(item));

// Testimonial section start
  const carousel = document.getElementById('testimonial-carousel');
  const slides = carousel.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('testimonial-dots');

  let current = 0;
  let autoSlideInterval;

  // ✅ Create dots dynamically
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('button');

  // ✅ Core update function
  function updateSlides() {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
      dots[i].classList.toggle('active', i === current);
    });
  }

  // ✅ Go to specific slide
  function goToSlide(index) {
    current = index;
    updateSlides();
  }

  // ✅ Next/Previous navigation
  function nextSlide() {
    current = (current + 1) % slides.length;
    updateSlides();
  }

  function prevSlide() {
    current = (current - 1 + slides.length) % slides.length;
    updateSlides();
  }

  // ✅ Auto-slide logic
  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      nextSlide(); // this ensures dot updates *exactly* with each slide
    }, 5000); // every 5 seconds
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  // Start auto-slide on load
  startAutoSlide(nextSlide, 5000);

  // ✅ Pause on hover
  carousel.addEventListener('mouseenter', stopAutoSlide);
  carousel.addEventListener('mouseleave', startAutoSlide);
//Testimonial section end