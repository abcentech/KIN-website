/**
 * Progress Tracker JavaScript
 * Handles streak counting and badge animations
 */

// ===================================
// LOCAL STORAGE FOR PROGRESS DATA
// ===================================

const ProgressTracker = {
    // Current state held in localStorage:
    // kindStreak: total daily consecutive action streak
    // lastKindComplete: date of last global action
    // kindAchievements: JSON object of earned badges
    // programProgress: JSON object { programId: { count: N, lastDate: Date } }

    // Get streak count from localStorage
    getStreak: function () {
        return parseInt(localStorage.getItem('kindStreak') || '0');
    },

    // Set streak count
    setStreak: function (count) {
        localStorage.setItem('kindStreak', count.toString());
        this.updateStreakDisplay();
    },

    // Get progress for a specific program
    getProgramProgress: function (programId) {
        const progress = JSON.parse(localStorage.getItem('programProgress') || '{}');
        return progress[programId] || { count: 0, lastDate: null };
    },

    // Mark an action as complete for a specific program
    completeAction: function (programId, programName) {
        // Special case for KIND: needs checklist
        if (programId === 'kind') {
            this.showCheckinModal();
            return;
        }
        this.performCompleteAction(programId, programName);
    },

    performCompleteAction: function (programId, programName, isGrace = false) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const globalLastComplete = localStorage.getItem('lastKindComplete');

        // 1. Update Global Streak (Attendance)
        const dayBeforeYesterday = new Date(Date.now() - 172800000).toDateString();

        if (globalLastComplete !== today) {
            // Standard streak continuation (yesterday) OR Grace rescue (late today or missed yesterday)
            const isConsecutive = globalLastComplete === yesterday;
            const isRescue = isGrace && (globalLastComplete === yesterday || globalLastComplete === dayBeforeYesterday);

            if (isConsecutive || isRescue) {
                // Keep the streak alive/bridge the gap
                this.setStreak(this.getStreak() + 1);
            } else {
                // Streak broken
                this.setStreak(1);
            }
            localStorage.setItem('lastKindComplete', today);
        }

        // 2. Update Specific Program Progress
        const allProgress = JSON.parse(localStorage.getItem('programProgress') || '{}');
        const prog = allProgress[programId] || { count: 0, lastDate: null };

        if (prog.lastDate !== today || programId === 'prayer') {
            prog.count += 1;
            prog.lastDate = today;
            allProgress[programId] = prog;
            localStorage.setItem('programProgress', JSON.stringify(allProgress));

            // Only show toast for non-prayer actions to avoid spamming if they pray for many people
            if (programId !== 'prayer') {
                this.showToast(`Attendance recorded for ${programName}!`);
            } else if (prog.count % 5 === 0) {
                // Show toast every 5 prayers supported
                this.showToast(`You've supported ${prog.count} prayers! 🙏`);
            }
        }

        this.checkAchievements();
        this.updateUI();
    },

    // Time window logic for WAT (UTC+1)
    isKINDWindow: function () {
        const now = new Date();
        const utcHour = now.getUTCHours();
        const watHour = (utcHour + 1) % 24;
        return watHour === 20; // 8:00 PM - 8:59 PM WAT
    },

    getWATTime: function () {
        const now = new Date();
        const utcHour = now.getUTCHours();
        const watHour = (utcHour + 1) % 24;
        const watMinutes = now.getUTCMinutes();
        return `${watHour.toString().padStart(2, '0')}:${watMinutes.toString().padStart(2, '0')} WAT`;
    },

    getGraceCode: function () {
        // Deterministic daily code (changes every night at midnight)
        const d = new Date().toDateString();
        let hash = 0;
        for (let i = 0; i < d.length; i++) {
            hash = ((hash << 5) - hash) + d.charCodeAt(i);
            hash |= 0;
        }
        return "KIN-" + Math.abs(hash).toString().slice(-4).padStart(4, '0');
    },

    // Update streak display and other UI elements
    updateStreakDisplay: function () {
        const streakElement = document.getElementById('streakCount');
        if (streakElement) {
            streakElement.textContent = this.getStreak();
        }
    },

    // Update all dynamic elements on progress page
    updateUI: function () {
        this.updateStreakDisplay();

        // Update progress bars if they exist (based on ID)
        const programs = ['kind', 'daniel', 'prayer', 'bible'];
        programs.forEach(id => {
            const prog = this.getProgramProgress(id);
            const bar = document.getElementById(`bar-${id}`);
            const text = document.getElementById(`text-${id}`);
            const percentText = document.getElementById(`percent-${id}`);

            if (bar && text) {
                // Example logic: KIND is 30 days, Daniel is 21
                let total = 30;
                if (id === 'daniel') total = 21;
                if (id === 'prayer') total = 100;
                if (id === 'bible') total = 365;

                const percent = Math.min(100, Math.round((prog.count / total) * 100));
                bar.style.width = percent + '%';
                percentText.textContent = percent + '%';
                text.textContent = `${prog.count} of ${total} units completed`;
            }
        });

        // Update Achievement Badges
        const streak = this.getStreak();
        const achievements = this.getAchievements();
        const milestones = [
            { id: 'ninetyDay', target: 90 },
            { id: 'oneEightyDay', target: 180 },
            { id: 'oneYear', target: 365 }
        ];

        milestones.forEach(m => {
            const badge = document.getElementById(`badge-${m.id}`);
            const fill = document.getElementById(`fill-${m.id}`);
            const text = document.getElementById(`text-${m.id}`);

            if (badge && fill && text) {
                if (achievements[m.id]) {
                    badge.classList.remove('locked');
                    badge.classList.add('earned');
                    badge.querySelector('.badge-icon').textContent = '🏆';
                    fill.style.width = '100%';
                    text.textContent = `Earned ${new Date(achievements[m.id].date).toLocaleDateString()}`;
                } else {
                    const percent = Math.min(100, Math.round((streak / m.target) * 100));
                    fill.style.width = percent + '%';
                    text.textContent = `${streak}/${m.target} days`;
                }
            }
        });
    },

    // Show a simple toast message
    showToast: function (message) {
        const toast = document.createElement('div');
        toast.className = 'progress-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Check and unlock achievements
    checkAchievements: function () {
        const streak = this.getStreak();
        const achievements = this.getAchievements();

        // Streak-based badges
        if (streak >= 7 && !achievements.sevenDay) this.unlockAchievement('sevenDay', '7-Day Warrior');
        if (streak >= 30 && !achievements.thirtyDay) this.unlockAchievement('thirtyDay', '30-Day Veteran');
        if (streak >= 90 && !achievements.ninetyDay) this.unlockAchievement('ninetyDay', 'Quarterly Overcomer');
        if (streak >= 180 && !achievements.oneEightyDay) this.unlockAchievement('oneEightyDay', 'Bi-Annual Guardian');
        if (streak >= 365 && !achievements.oneYear) this.unlockAchievement('oneYear', 'Yearly Legend');

        // Program-based badges
        const daniel = this.getProgramProgress('daniel');
        if (daniel.count >= 21 && !achievements.daniel) this.unlockAchievement('daniel', 'Fast Finisher');

        const prayer = this.getProgramProgress('prayer');
        if (prayer.count >= 20 && !achievements.prayerChamp) this.unlockAchievement('prayerChamp', 'Prayer Champion');
        if (prayer.count >= 50 && !achievements.intercessor) this.unlockAchievement('intercessor', 'Great Intercessor');
    },

    getAchievements: function () {
        return JSON.parse(localStorage.getItem('kindAchievements') || '{}');
    },

    unlockAchievement: function (achievementId, name) {
        const achievements = this.getAchievements();
        achievements[achievementId] = {
            earned: true,
            date: new Date().toISOString(),
            name: name
        };
        localStorage.setItem('kindAchievements', JSON.stringify(achievements));
        this.showAchievementPopup(name);
    },

    showAchievementPopup: function (name) {
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
        setTimeout(() => popup.classList.add('show'), 100);
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        }, 4000);
    },

    showCheckinModal: function () {
        // if (!this.isKINDWindow()) {
        //     this.showToast(`KIND Check-in is only available 8:00 PM - 9:00 PM WAT. Current: ${this.getWATTime()}`);
        //     return;
        // }

        const modal = document.createElement('div');
        modal.className = 'checkin-modal';
        const inWindow = this.isKINDWindow();

        modal.innerHTML = `
            <div class="checkin-modal-content">
                <div class="checkin-header">
                    <h3>Daily KIND Check-in</h3>
                    <p>${inWindow ? '8:00 PM - 9:00 PM WAT Verification' : 'Rescue Window (Grace Code Required)'}</p>
                </div>

                ${!inWindow ? `
                    <div class="form-group mb-lg">
                        <label style="color: var(--color-primary-gold); font-size: 14px;">Enter Daily Grace Code</label>
                        <input type="text" id="graceCodeInput" class="form-control" placeholder="KIN-XXXX" style="text-align: center; font-weight: bold; letter-spacing: 2px;">
                        <p id="graceError" style="color: #ff5252; font-size: 12px; margin-top: 5px; display: none;">Invalid Grace Code for Today</p>
                    </div>
                ` : ''}

                <div class="checkin-tasks" id="checkinTasks" style="${!inWindow ? 'opacity: 0.3; pointer-events: none;' : ''}">
                    <label class="checkin-task">
                        <input type="checkbox" class="task-check" data-task="1">
                        <span>1. Clocked in on telegram ✈️</span>
                    </label>
                    <label class="checkin-task">
                        <input type="checkbox" class="task-check" data-task="2">
                        <span>2. Unmuted Mic to Speak 🎙️</span>
                    </label>
                    <label class="checkin-task">
                        <input type="checkbox" class="task-check" data-task="3">
                        <span>3. Sent in my Notes 📝</span>
                    </label>
                    <label class="checkin-task">
                        <input type="checkbox" class="task-check" data-task="4">
                        <span>4. Watch video on youtube 📺</span>
                    </label>
                    <label class="checkin-task">
                        <input type="checkbox" class="task-check" data-task="5">
                        <span>5. Commented and Like 👍</span>
                    </label>
                </div>
                <button id="submitCheckin" class="btn btn-primary" disabled>Complete Check-in</button>
                <button class="btn btn-secondary mt-sm" onclick="this.closest('.checkin-modal').remove()">Later</button>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        const checks = modal.querySelectorAll('.task-check');
        const submitBtn = modal.getElementById('submitCheckin');
        const graceInput = modal.querySelector('#graceCodeInput');
        const tasksDiv = modal.querySelector('#checkinTasks');
        const graceError = modal.querySelector('#graceError');

        let usesGrace = false;

        const updateSubmitState = () => {
            const allChecked = Array.from(checks).every(c => c.checked);
            const graceValid = inWindow || (graceInput && graceInput.value.toUpperCase() === this.getGraceCode());

            if (!inWindow && graceInput) {
                if (graceInput.value.length >= 8) {
                    if (graceInput.value.toUpperCase() === this.getGraceCode()) {
                        tasksDiv.style.opacity = '1';
                        tasksDiv.style.pointerEvents = 'all';
                        graceError.style.display = 'none';
                        usesGrace = true;
                    } else {
                        graceError.style.display = 'block';
                    }
                }
            }

            submitBtn.disabled = !(allChecked && graceValid);
        };

        if (graceInput) {
            graceInput.addEventListener('input', updateSubmitState);
        }

        checks.forEach(check => {
            check.addEventListener('change', updateSubmitState);
        });

        submitBtn.addEventListener('click', () => {
            this.performCompleteAction('kind', 'Daily KIND', usesGrace);
            modal.remove();

            // Update the button that triggered it
            const triggerBtn = document.querySelector('[data-track-action="kind"]');
            if (triggerBtn) {
                triggerBtn.classList.add('completed');
                triggerBtn.innerHTML = '✓ Already Done Today';
                triggerBtn.disabled = true;
            }
        });
    }
};

// ===================================
// INITIALIZE ON PAGE LOAD
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Update UI elements
    ProgressTracker.updateUI();

    // Setup attendance buttons if they exist
    document.querySelectorAll('[data-track-action]').forEach(btn => {
        const programId = btn.getAttribute('data-track-action');
        const programName = btn.getAttribute('data-program-name') || 'Activity';

        const prog = ProgressTracker.getProgramProgress(programId);
        const today = new Date().toDateString();

        if (prog.lastDate === today) {
            btn.classList.add('completed');
            btn.innerHTML = '✓ Already Done Today';
            btn.disabled = true;
        } else if (programId === 'kind' && !ProgressTracker.isKINDWindow()) {
            btn.classList.add('grace-available');
            btn.innerHTML = `Locked till 8 PM WAT<br><small>Click for Grace Center</small>`;
        }

        btn.addEventListener('click', function () {
            const programId = this.getAttribute('data-track-action');
            const programName = this.getAttribute('data-program-name') || 'Activity';
            ProgressTracker.completeAction(programId, programName);
        });
    });
});

// ===================================
// ADDITIONAL STYLES (Inject)
// ===================================

const style = document.createElement('style');
style.textContent = `
    .progress-toast {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: var(--color-gray-800);
        color: var(--color-primary-gold);
        padding: 12px 24px;
        border-radius: 30px;
        border: 1px solid var(--color-primary-gold);
        z-index: 11000;
        transition: all 0.3s ease-out;
        opacity: 0;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .progress-toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
    .btn.completed {
        background: #2e7d32 !important;
        border-color: #2e7d32 !important;
        cursor: default;
    }
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

    .checkin-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 12000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .checkin-modal.show { opacity: 1; }
    .checkin-modal-content {
        background: var(--color-gray-900);
        border: 1px solid var(--color-primary-gold);
        border-radius: 20px;
        padding: var(--space-xl);
        width: 90%;
        max-width: 400px;
        box-shadow: 0 0 50px rgba(255, 215, 0, 0.2);
    }
    .checkin-header { text-align: center; margin-bottom: var(--space-xl); }
    .checkin-header h3 { color: var(--color-primary-gold); margin-bottom: var(--space-xs); }
    .checkin-header p { font-size: 12px; color: var(--color-gray-400); }
    .checkin-tasks { display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-xl); }
    .checkin-task {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm);
        background: rgba(255,255,255,0.05);
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.2s;
    }
    .checkin-task:hover { background: rgba(255,255,255,0.1); }
    .task-check { width: 20px; height: 20px; accent-color: var(--color-primary-gold); }
    .locked { opacity: 0.7; cursor: not-allowed; }
    .grace-available { border-style: dashed !important; background: rgba(255, 215, 0, 0.1) !important; color: var(--color-primary-gold) !important; cursor: pointer !important; }
`;
document.head.appendChild(style);
