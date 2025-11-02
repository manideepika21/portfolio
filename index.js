/*** Animations*/

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

// Section Navigation Script
  document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
            
    // Function to update active nav link
    function updateActiveNav() {
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
      if (window.pageYOffset >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
                });
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === current) {
                        link.classList.add('active');
                    }
                });
            }
            
            // Smooth scrolling for nav links
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('data-section');
                    const targetSection = document.getElementById(targetId);
                    
                    if (targetSection) {
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
            
            // Update active nav on scroll
            window.addEventListener('scroll', updateActiveNav);
            
            // Set initial active state
            updateActiveNav();
        });
// Section Navigation ends</script>