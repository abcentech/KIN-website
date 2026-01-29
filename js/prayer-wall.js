const PrayerWall = {
    prayers: [],
    filters: 'all',

    init: function () {
        this.loadPrayers();
        this.renderFilters();
        this.renderFeed();
        this.setupEventListeners();
    },

    loadPrayers: function () {
        const stored = localStorage.getItem('kinPrayers');
        if (stored) {
            this.prayers = JSON.parse(stored);
        } else {
            // Starter Data
            this.prayers = [
                {
                    id: 1,
                    name: "Samuel O.",
                    age: "12",
                    category: "school",
                    text: "Please pray for my upcoming exams. I want to do my best and honor God with my grades.",
                    date: new Date(Date.now() - 86400000).toISOString(),
                    prayedCount: 24,
                    prayedByMe: false
                },
                {
                    id: 2,
                    name: "Sarah W.",
                    age: "9",
                    category: "family",
                    text: "Praying for my grandma who is in the hospital. We trust Jesus for her healing!",
                    date: new Date(Date.now() - 172800000).toISOString(),
                    prayedCount: 56,
                    prayedByMe: false
                },
                {
                    id: 3,
                    name: "David T.",
                    age: "15",
                    category: "mission",
                    text: "Praying that many children in our community will join the KIND devotionals and know Jesus.",
                    date: new Date(Date.now() - 43200000).toISOString(),
                    prayedCount: 89,
                    prayedByMe: false
                }
            ];
            this.savePrayers();
        }
    },

    savePrayers: function () {
        localStorage.setItem('kinPrayers', JSON.stringify(this.prayers));
    },

    addPrayer: function (name, age, category, text) {
        const newPrayer = {
            id: Date.now(),
            name: name || "Anonymous",
            age: age,
            category: category,
            text: text,
            date: new Date().toISOString(),
            prayedCount: 0,
            prayedByMe: false
        };
        this.prayers.unshift(newPrayer);
        this.savePrayers();
        this.renderFeed();

        // Record attendance/action
        if (typeof ProgressTracker !== 'undefined') {
            ProgressTracker.completeAction('prayer', 'Prayer Wall');
        }
    },

    togglePrayed: function (id) {
        const prayer = this.prayers.find(p => p.id === id);
        if (prayer) {
            if (!prayer.prayedByMe) {
                prayer.prayedCount++;
                prayer.prayedByMe = true;
                this.savePrayers();
                this.renderFeed();

                // Achievement check/Action record
                if (typeof ProgressTracker !== 'undefined') {
                    ProgressTracker.completeAction('prayer', 'Intercessory Prayer');
                }
            }
        }
    },

    setFilter: function (cat) {
        this.filters = cat;
        this.renderFilters();
        this.renderFeed();
    },

    renderFilters: function () {
        const categories = ['all', 'family', 'school', 'health', 'mission', 'general'];
        const filterContainer = document.getElementById('prayerFilters');
        if (!filterContainer) return;

        filterContainer.innerHTML = categories.map(cat => `
            <button class="filter-btn ${this.filters === cat ? 'active' : ''}" 
                    onclick="PrayerWall.setFilter('${cat}')">
                ${cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
        `).join('');
    },

    renderFeed: function () {
        const feed = document.getElementById('prayerFeed');
        if (!feed) return;

        const filtered = this.filters === 'all'
            ? this.prayers
            : this.prayers.filter(p => p.category === this.filters);

        if (filtered.length === 0) {
            feed.innerHTML = `<div class="text-center py-xl" style="grid-column: 1/-1">
                <p style="color: var(--color-gray-500)">No prayer requests in this category yet. Be the first!</p>
            </div>`;
            return;
        }

        feed.innerHTML = filtered.map(p => `
            <div class="prayer-card" style="animation-delay: ${Math.random() * 0.3}s">
                <div class="prayer-card-header">
                    <span class="prayer-category cat-${p.category}">${p.category}</span>
                    <span class="user-info">
                        <span class="date">${this.formatDate(p.date)}</span>
                    </span>
                </div>
                <div class="prayer-card-content">
                    <p>"${p.text}"</p>
                </div>
                <div class="prayer-card-footer">
                    <div class="prayer-user">
                        <div class="user-avatar">${p.name.charAt(0)}</div>
                        <div class="user-info">
                            <span class="name">${p.name}</span>
                            <span class="date">${p.age ? p.age + ' years old' : 'Community Member'}</span>
                        </div>
                    </div>
                    <div class="pray-action">
                        <button class="pray-btn ${p.prayedByMe ? 'active' : ''}" 
                                onclick="PrayerWall.togglePrayed(${p.id})">
                             ❤️ ${p.prayedByMe ? 'Prayed' : 'Pray'}
                        </button>
                        <span class="prayer-count">${p.prayedCount} supporters</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    formatDate: function (isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        if (diff < 3600000) return 'Just now';
        if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
        return date.toLocaleDateString();
    },

    setupEventListeners: function () {
        const form = document.getElementById('prayerForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('p_name').value;
                const age = document.getElementById('p_age').value;
                const category = document.getElementById('p_cat').value;
                const text = document.getElementById('p_text').value;

                this.addPrayer(name, age, category, text);
                form.reset();

                // Scroll to feed
                document.getElementById('prayerFeed').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    PrayerWall.init();
});
