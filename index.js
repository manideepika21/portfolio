/*** Animations*/
gsap.registerPlugin(ScrollTrigger)
gsap.to(".reveal-hero-text", {opacity: 0, y: "100%",})
gsap.to(".reveal-hero-img", {opacity: 0, y: "100%",})
gsap.to(".reveal-up", {opacity: 0, y: "100%",})

let bugChart;
let bugCategoryBarChart;

/* ====================================================================
   REFACTOR: SHARED COMPONENT RENDERERS
   ====================================================================
   These two functions used to be hand-copied HTML in tensorflow_bugs.html,
   pytorch_bugs.html and skill_badges.html. Now each page just supplies data
   (title/subtitle/stats, or a list of issues) and defines
   `window.initPageContent` to call these before the rest of the page's
   scripts (charts, badge counters, etc.) run. See index.js's early
   DOMContentLoaded listener below for the call site.
   ==================================================================== */

// Maps a short status key (as used in each page's data array) to the badge
// CSS class + label that used to be written out by hand on every <a> tag.
const STATUS_MAP = {
    confirmed: { cls: "badge-green", label: "Confirmed" },
    open: { cls: "badge-yellow", label: "Open" },
    rejected: { cls: "badge-red", label: "Rejected" },
    closed: { cls: "badge-violet", label: "Closed" },
};

/**
 * Renders the "scoreboard" header (home icon + title/subtitle + stat boxes)
 * that is identical in structure across tensorflow_bugs.html, pytorch_bugs.html
 * and skill_badges.html.
 *
 * @param {Object} opts
 * @param {string} opts.mountSelector - CSS selector for the empty container to fill.
 * @param {string} [opts.homeHref] - link back to the portfolio, defaults to "./index.html".
 * @param {string} opts.title
 * @param {string} opts.subtitle
 * @param {Array<{id:string, label:string, variant?:string}>} opts.stats - id is the
 *        element id later used by updateBugStats()/the badge counter to fill in the number.
 */
function renderScoreboard(opts) {
    const {
        mountSelector,
        homeHref = "./index.html",
        title,
        subtitle,
        stats = [],
    } = opts;

    const mount = document.querySelector(mountSelector);
    if (!mount) return;

    const statsHtml = stats.map(stat => `
        <div class="stat ${stat.variant || ""}">
            <div class="num" id="${stat.id}">0</div>
            <div class="label">${stat.label}</div>
        </div>
    `).join("");

    mount.innerHTML = `
        <div class="title-group">
            <a href="${homeHref}" class="profile-home" aria-label="Back to Portfolio">
                <img src="./assets/images/home.png" alt="Back to Portfolio" class="profile-avatar">
                <span class="material-icons home-icon">home</span>
                <span class="profile-tooltip">Back to Portfolio</span>
            </a>
            <div class="title-block">
                <h1>${title}</h1>
                <p>${subtitle}</p>
            </div>
        </div>
        <div class="stats">
            ${statsHtml}
        </div>
    `;
}

/**
 * Renders a list of <a class="issue-card"> entries into a scroll-card container,
 * replacing the hand-written duplicate markup in tensorflow_bugs.html / pytorch_bugs.html.
 *
 * @param {string} containerId - id of the element (e.g. "CompilerBugsList") to fill.
 * @param {Array<{number:string|number, description:string, url:string, status:keyof STATUS_MAP}>} issues
 */
function renderIssueList(containerId, issues = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = issues.map(issue => {
        const status = STATUS_MAP[issue.status] || STATUS_MAP.open;
        return `
            <a href="${issue.url}" target="_blank" class="issue-card">
                <span class="issue-id">#${issue.number}: ${issue.description}</span>
                <span class="badge ${status.cls}">${status.label}</span>
            </a>
        `;
    }).join("");
}

/* ====================================================================
   Runs first among all DOMContentLoaded listeners (registered first in the
   file, and DOMContentLoaded always fires after every synchronous script -
   including each page's own inline data script - has already executed).
   This guarantees the scoreboard header and any issue lists exist in the
   DOM before the badge-counter / chart code below tries to read them.
   Pages that don't need this (plain index.html) simply don't define
   window.initPageContent, so this is a no-op there.
   ==================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.initPageContent === "function") {
        window.initPageContent();
    }
});

/* ====================================================================
   Measures the sticky nav's real rendered height and exposes it as
   --nav-height so .hero-section can size itself to exactly "the rest of
   the screen below the nav" via calc(100vh - var(--nav-height)) in
   index.css, instead of guessing a fixed pixel number that would drift
   whenever the nav's own padding/font-size/breakpoint changes.
   ==================================================================== */
function updateNavHeightVar() {
    const nav = document.getElementById("section-nav");
    if (!nav) return;
    document.documentElement.style.setProperty("--nav-height", `${nav.offsetHeight}px`);
}

document.addEventListener("DOMContentLoaded", updateNavHeightVar);
window.addEventListener("load", updateNavHeightVar);
window.addEventListener("resize", updateNavHeightVar);

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

    const totalEl = document.getElementById("stat-total");
    const acceptedEl = document.getElementById("stat-mastered");

    // Guarded: on skill_badges.html these same ids are populated by the badge
    // counter below instead, so only write here if this is a bugs page.
    if (totalEl && document.querySelector(".bugs-dashboard")) {
        totalEl.textContent = total;
    }
    if (acceptedEl && document.querySelector(".bugs-dashboard")) {
        acceptedEl.textContent = accepted;
    }
}

/* === CONTACT FORM === */

document.addEventListener("DOMContentLoaded", () => {

    const contactForm = document.getElementById(
        "portfolio-contact-form"
    );

    if (!contactForm) return;
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = document.getElementById("contact-name").value;
        const email =
            document.getElementById("contact-email").value;

        const phone =
            document.getElementById("contact-phone").value;

        const company =
            document.getElementById("contact-company").value;

        const interest =
            document.querySelector(
                'input[name="interest"]:checked'
            )?.value || "Not specified";

        const message =
            document.getElementById("contact-message").value;


        const subject =
            encodeURIComponent(
                `Portfolio Contact - ${name}`
            );


        const body =
            encodeURIComponent(
`Hi Manideepika,

Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company}
Interested in: ${interest}

Message:
${message}

Thank you!`
            );


        window.location.href =
            `mailto:mmyaka@ncsu.edu?subject=${subject}&body=${body}`;

    });

});

// FAQ accordion toggle
document.addEventListener("DOMContentLoaded", () => {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        question.addEventListener("click", () => {
            const isOpen = item.classList.contains("active");

            // close all other items (accordion behavior)
            faqItems.forEach(other => {
                other.classList.remove("active");
                other.querySelector(".faq-answer").style.maxHeight = null;
            });

            // open this one if it wasn't already open
            if (!isOpen) {
                item.classList.add("active");
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
});

/* =========================================================
   HERO STATS: auto-computed from other pages
========================================================= */
async function updateSkillBadgeStat() {
    const el = document.getElementById("stat-skill-badges");
    if (!el) return;

    try {
        const res = await fetch("./skill_badges.html");
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const count = doc.querySelectorAll(".badge.earned").length;
        if (count > 0) el.textContent = `${count}+`;
    } catch (err) {
        console.warn("Could not compute skill badge count:", err);
    }
}

async function updateBugsFoundStat() {
    const el = document.getElementById("stat-bugs-found");
    if (!el) return;

    try {
        const [tfHtml, ptHtml] = await Promise.all([
            fetch("./tensorflow_bugs.html").then(r => r.text()),
            fetch("./pytorch_bugs.html").then(r => r.text()),
        ]);

        // Each bug entry has exactly one "status:" field in its object literal
        const countEntries = (html) => (html.match(/status:\s*"/g) || []).length;
        const total = countEntries(tfHtml) + countEntries(ptHtml);

        if (total > 0) el.textContent = `${total}+`;
    } catch (err) {
        console.warn("Could not compute bugs found count:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Only runs on the homepage, where these elements exist
    if (document.getElementById("stat-skill-badges") || document.getElementById("stat-bugs-found")) {
        updateSkillBadgeStat();
        updateBugsFoundStat();
    }
});

document.addEventListener("DOMContentLoaded", () => {

    // Guard: this block is only meaningful on skill_badges.html (the
    // tech-dashboard page with earned/unearned badge categories). It used to
    // run unconditionally and throw on the bugs pages, since .card-progress
    // and .bar-fill only exist inside .tech-dashboard cards.
    if (!document.querySelector(".tech-dashboard")) return;

    const badges = document.querySelectorAll(".badge");
    const earnedBadges = document.querySelectorAll(".badge.earned");
    const cards = document.querySelectorAll(".card");

    // Total badges
    const statTotalEl = document.getElementById("stat-total");
    if (statTotalEl && statTotalEl.firstChild) {
        statTotalEl.firstChild.textContent = earnedBadges.length;
    }

    // Categories mastered
    let mastered = 0;

    cards.forEach(card => {
        const total = card.querySelectorAll(".badge").length;
        const earned = card.querySelectorAll(".badge.earned").length;

        const progress = card.querySelector(".card-progress");
        if (progress) progress.innerHTML = `<b>${earned}</b>`;

        const fill = card.querySelector(".bar-fill");
        if (fill && total > 0) fill.style.width = `${earned / total * 100}%`;

        if (total > 0 && earned === total) mastered++;
    });

    const statMasteredEl = document.getElementById("stat-mastered");
    if (statMasteredEl && statMasteredEl.firstChild) {
        statMasteredEl.firstChild.textContent = mastered;
    }

    const statScoreEl = document.getElementById("stat-score");
    if (statScoreEl && statScoreEl.firstChild && badges.length > 0) {
        const score = Math.round((earnedBadges.length / badges.length) * 100);
        statScoreEl.firstChild.textContent = score;
    }

});
// Section Navigation ends