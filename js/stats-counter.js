/**
 * KidsInspiring Nation - Stats Counter Animation
 * Animated counting for community statistics
 */

// ===================================
// COUNTER ANIMATION
// ===================================

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
        current += increment;

        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// ===================================
// INTERSECTION OBSERVER FOR STATS
// ===================================

const statsSection = document.getElementById('stats');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
            // Trigger counter animations
            const statNumbers = document.querySelectorAll('.stat-number');

            statNumbers.forEach((stat, index) => {
                const target = parseInt(stat.getAttribute('data-target'));
                // Stagger the animations
                setTimeout(() => {
                    animateCounter(stat, target, 2000);
                }, index * 100);
            });

            statsAnimated = true;
            statsObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.5
});

// Start observing when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});
