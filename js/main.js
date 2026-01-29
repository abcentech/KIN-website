/**
 * KidsInspiring Nation - Main JavaScript
 * Core functionality for navigation, scroll effects, and animations
 */

// ===================================
// NAVIGATION
// ===================================

const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Mobile Menu Toggle
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add scrolled class for background change
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Don't prevent default for empty href
        if (href === '#' || href === '#!') return;

        e.preventDefault();

        const target = document.querySelector(href);
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// SCROLL ANIMATIONS (FADE IN ON SCROLL)
// ===================================

const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all mission cards and program cards
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.mission-card, .program-card, .stat-item, .video-container'
    );

    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// ===================================
// LOADING STATE
// ===================================

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ===================================
// MOBILE SPIRIT MODAL
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    const spiritTab = document.getElementById('spiritTab');
    const spiritModal = document.getElementById('spiritModal');

    if (spiritTab && spiritModal) {
        spiritTab.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing immediately
            spiritModal.classList.toggle('active');
            spiritTab.classList.toggle('active');
        });

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (!spiritModal.contains(e.target) && !spiritTab.contains(e.target)) {
                spiritModal.classList.remove('active');
                spiritTab.classList.remove('active');
            }
        });

        // Close when clicking a link inside
        spiritModal.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                spiritModal.classList.remove('active');
                spiritTab.classList.remove('active');
            });
        });
    }
});
