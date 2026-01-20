/**
 * Progress Tracker JavaScript
 * Handles streak counting and badge animations
 */

// ===================================
// LOCAL STORAGE FOR PROGRESS DATA
// ===================================

const ProgressTracker = {
    // Get streak count from localStorage
    getStreak: function () {
        return parseInt(localStorage.getItem('kindStreak') || '0');
    },

    // Set streak count
    setStreak: function (count) {
        localStorage.setItem('kindStreak', count.toString());
        this.updateStreakDisplay();
    },

    // Check if devotional was done today
    checkTodayComplete: function () {
        const lastComplete = localStorage.getItem('lastKindComplete');
        const today = new Date().toDateString();
        return lastComplete === today;
    },

    // Mark today's devotional as complete
    completeToday: function () {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const lastComplete = localStorage.getItem('lastKindComplete');

        if (lastComplete === today) {
            return; // Already completed today
        }

        if (lastComplete === yesterday) {
            // Consecutive day - increase streak
            this.setStreak(this.getStreak() + 1);
        } else if (!lastComplete) {
            // First time
            this.setStreak(1);
        } else {
            // Streak broken - restart at 1
            this.setStreak(1);
        }

        localStorage.setItem('LastKindComplete', today);
        this.checkAchievements();
    },

    // Update streak display on page
    updateStreakDisplay: function () {
        const streakElement = document.getElementById('streakCount');
        if (streakElement) {
            const currentStreak = this.getStreak();
            streakElement.textContent = currentStreak;

            // Animate on update
            streakElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
                streakElement.style.transform = 'scale(1)';
            }, 300);
        }
    },

    // Check and unlock achievements
    checkAchievements: function () {
        const streak = this.getStreak();
        const achievements = this.getAchievements();

        // 7-Day Warrior
        if (streak >= 7 && !achievements.sevenDay) {
            this.unlockAchievement('sevenDay', '7-Day Warrior');
        }

        // 30-Day Veteran
        if (streak >= 30 && !achievements.thirtyDay) {
            this.unlockAchievement('thirtyDay', '30-Day Veteran');
        }

        // 100-Day Legend
        if (streak >= 100 && !achievements.hundredDay) {
            this.unlockAchievement('hundredDay', '100-Day Legend');
        }
    },

    // Get all achievements from localStorage
    getAchievements: function () {
        const stored = localStorage.getItem('kindAchievements');
        return stored ? JSON.parse(stored) : {};
    },

    // Unlock an achievement
    unlockAchievement: function (achievementId, name) {
        const achievements = this.getAchievements();
        achievements[achievementId] = {
            earned: true,
            date: new Date().toISOString(),
            name: name
        };
        localStorage.setItem('kindAchievements', JSON.stringify(achievements));

        // Show celebration notification
        this.showAchievementPopup(name);
    },

    // Show achievement unlock popup
    showAchievementPopup: function (name) {
        // Create popup element
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-popup-content">
                <div class="achievement-popup-icon">🏆</div>
                <h3>Achievement Unlocked!</h3>
                <p>${name}</p>
            </div>
        `;

        document.body.appendChild(popup);

        // Add animation
        setTimeout(() => popup.classList.add('show'), 100);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        }, 4000);
    }
};

// ===================================
// INITIALIZE ON PAGE LOAD
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Update streak display
    ProgressTracker.updateStreakDisplay();

    // Example: Complete today button (you can add this to your devotional pages)
    const completeButton = document.getElementById('completeDevotional');
    if (completeButton) {
        completeButton.addEventListener('click', () => {
            ProgressTracker.completeToday();
            completeButton.textContent = '✓ Completed!';
            completeButton.disabled = true;
        });
    }
});

// ===================================
// ACHIEVEMENT POPUP STYLES (Inject)
// ===================================

const style = document.createElement('style');
style.textContent = `
    .achievement-popup {
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s ease-out;
    }
    
    .achievement-popup.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .achievement-popup-content {
        background: linear-gradient(135deg, #FFD700, #FFC107);
        color: #000;
        padding: 24px 32px;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(255, 215, 0, 0.5);
        text-align: center;
        min-width: 280px;
    }
    
    .achievement-popup-icon {
        font-size: 64px;
        margin-bottom: 12px;
        animation: bounce 0.6s ease;
    }
    
    .achievement-popup-content h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: bold;
    }
    
    .achievement-popup-content p {
        margin: 0;
        font-size: 16px;
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }
    
    @media (max-width: 767px) {
        .achievement-popup {
            right: 10px;
            left: 10px;
            top: 80px;
        }
        
        .achievement-popup-content {
            min-width: auto;
        }
    }
`;
document.head.appendChild(style);
