/*** Animations*/
gsap.registerPlugin(ScrollTrigger)
gsap.to(".reveal-hero-text", {opacity: 0, y: "100%",})
gsap.to(".reveal-hero-img", {opacity: 0, y: "100%",})
gsap.to(".reveal-up", {opacity: 0, y: "100%",})

let bugChart;
let bugCategoryBarChart;

window.addEventListener("load", () => {

    // Hero animations
    gsap.to(".reveal-hero-text", {
        opacity: 1,
        y: "0%",
        duration: 0.8,
        stagger: 0.5,
    });

    gsap.to(".reveal-hero-img", {
        opacity: 1,
        y: "0%",
    });

    // Create bug chart
    createBugChart();
    createBarChart();
    updateBugStats();

    // Watch for badge changes
    const badgeObserver = new MutationObserver(() => {
        updateBugChart();
        updateBarChart();
        updateBugStats();
    });

    document.querySelectorAll(".issue-card .badge").forEach(badge => {
        badgeObserver.observe(badge, {
            childList: true,
            characterData: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        });
    });

});

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
if (carousel) {
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
      nextSlide();
    }, 5000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  // Start auto-slide on load
  startAutoSlide(nextSlide, 5000);

  // ✅ Pause on hover
  carousel.addEventListener('mouseenter', stopAutoSlide);
  carousel.addEventListener('mouseleave', startAutoSlide);
}

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

// Count bug statuses from all badges
function getBugStatusCounts() {
    const counts = {
        Closed: 0,
        Confirmed: 0,
        Rejected: 0,
        Open: 0
    };

    document.querySelectorAll(".issue-card .badge").forEach(badge => {

        // Count by CSS class
        if (badge.classList.contains("badge-violet")) {
            counts.Closed++;
        }
        else if (badge.classList.contains("badge-green")) {
            counts.Confirmed++;
        }
        else if (badge.classList.contains("badge-red")) {
            counts.Rejected++;
        }
        else if (badge.classList.contains("badge-yellow")) {
            counts.Open++;
        }

    });

    return counts;
}

// Create the chart
function createBugChart() {

    const canvas = document.getElementById("bugAnalysisdonut");

    if (!canvas) return;

    const counts = getBugStatusCounts();

    bugChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: ["Closed", "Confirmed", "Rejected", "Open"],
            datasets: [{
                data: [
                    counts.Closed,
                    counts.Confirmed,
                    counts.Rejected,
                    counts.Open
                ],
                backgroundColor: [
                    "#8b5cf6",
                    "#22c55e",
                    "#ef4444",
                    "#f59e0b"
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update chart data
function updateBugChart() {

    if (!bugChart) return;

    const counts = getBugStatusCounts();

    bugChart.data.datasets[0].data = [
        counts.Closed,
        counts.Confirmed,
        counts.Rejected,
        counts.Open
    ];

    bugChart.update();
}

// Count Confirmed/Rejected/Open per category (Compiler/RBFuzzer/XLA)
function getCategoryStatusCounts() {
    const categories = {
        Compiler: "CompilerBugsList",
        RBFuzzer: "RBFuzzerList",
        XLA: "XLABugsList"
    };

    const statusClasses = {
        Closed: "badge-violet",
        Confirmed: "badge-green",
        Rejected: "badge-red",
        Open: "badge-yellow"
    };

    const result = {};

    Object.entries(categories).forEach(([catName, listId]) => {
        const list = document.getElementById(listId);
        const counts = { Closed: 0, Confirmed: 0, Rejected: 0, Open: 0 };

        if (list) {
            list.querySelectorAll(".badge").forEach(badge => {
                Object.entries(statusClasses).forEach(([status, cls]) => {
                    if (badge.classList.contains(cls)) counts[status]++;
                });
            });
        }

        result[catName] = counts;
    });

    return result;
}

function createBarChart() {
    const canvas = document.getElementById("bugCategoryBar");
    if (!canvas) return;

    const data = getCategoryStatusCounts();
    const categories = Object.keys(data);
    const statuses = ["Closed", "Confirmed", "Rejected", "Open"];
    const colors = {
        Closed: "#8b5cf6",
        Confirmed: "#22c55e",
        Rejected: "#ef4444",
        Open: "#f59e0b"
    };

    bugCategoryBarChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: categories,
            datasets: statuses.map(status => ({
                label: status,
                data: categories.map(cat => data[cat][status]),
                backgroundColor: colors[status],
                borderRadius: 4
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true, grid: { display: false } },
                y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateBarChart() {
    if (!bugCategoryBarChart) return;
    const data = getCategoryStatusCounts();
    const statuses = ["Closed", "Confirmed", "Rejected", "Open"];
    bugCategoryBarChart.data.datasets.forEach((ds, i) => {
        ds.data = Object.keys(data).map(cat => data[cat][statuses[i]]);
    });
    bugCategoryBarChart.update();
}

function updateBugStats() {
    const counts = getBugStatusCounts();

    // Total = Open + Confirmed + Rejected + Closed
    const total =
        counts.Open +
        counts.Confirmed +
        counts.Rejected +
        counts.Closed;

    // Accepted = Confirmed + Closed
    const accepted =
        counts.Confirmed +
        counts.Closed;

    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-mastered").textContent = accepted;
}

document.addEventListener("DOMContentLoaded", () => {

    const badges = document.querySelectorAll(".badge");
    const earnedBadges = document.querySelectorAll(".badge.earned");
    const cards = document.querySelectorAll(".card");

    // Total badges
    document.getElementById("stat-total").firstChild.textContent =
        earnedBadges.length;

    // Categories mastered
    let mastered = 0;

    cards.forEach(card => {
        const total = card.querySelectorAll(".badge").length;
        const earned = card.querySelectorAll(".badge.earned").length;

        const progress = card.querySelector(".card-progress");
        progress.innerHTML = `<b>${earned}</b>`;

        const fill = card.querySelector(".bar-fill");
        fill.style.width = `${earned / total * 100}%`;

        if (earned === total) mastered++;
    });

    document.getElementById("stat-mastered").firstChild.textContent = mastered;

    const score = Math.round((earnedBadges.length / badges.length) * 100);

    document.getElementById("stat-score").firstChild.textContent = score;

});
// Section Navigation ends</script>