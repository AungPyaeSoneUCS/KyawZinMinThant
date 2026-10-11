registerProject({
    id: 'starrating',
    title: 'Star Rating',
    desc: 'Click the stars to rate, preview on hover, and save your feedback with a live average.',
    tags: ['UI Component'],
    markup: `
    <div class="mp" id="mp-starrating">
        <style>
            #mp-starrating .sr-head { margin-bottom: 12px; }
            #mp-starrating .sr-card {
                padding: 20px; border-radius: var(--radius); text-align: center;
                background: var(--surface); border: 1px solid var(--border);
                box-shadow: var(--shadow-sm);
            }
            #mp-starrating .sr-stars { display: flex; gap: 6px; justify-content: center; font-size: 44px; line-height: 1; }
            #mp-starrating .sr-star {
                padding: 0; border: 0; background: transparent; cursor: pointer;
                color: var(--border); font-size: inherit; line-height: 1;
                transition: transform .12s, color .12s;
            }
            #mp-starrating .sr-star.on { color: #f59e0b; }
            #mp-starrating .sr-star:hover { transform: scale(1.18) rotate(-4deg); }
            #mp-starrating .sr-label { font-weight: 800; font-size: 16px; margin-top: 12px; }
            #mp-starrating .sr-card .mp-row { justify-content: center; margin-top: 14px; }
        </style>
        <div class="mp-between sr-head">
            <div>
                <div class="mp-title">Star Rating</div>
                <div class="mp-sub">Rate, then submit to update the average.</div>
            </div>
            <span class="mp-badge" id="mp-sr-saved">Not saved</span>
        </div>
        <div class="sr-card">
            <div class="sr-stars" id="mp-sr-stars" role="group" aria-label="Choose a rating">
                <button class="sr-star" data-v="1" aria-label="1 star">★</button>
                <button class="sr-star" data-v="2" aria-label="2 stars">★</button>
                <button class="sr-star" data-v="3" aria-label="3 stars">★</button>
                <button class="sr-star" data-v="4" aria-label="4 stars">★</button>
                <button class="sr-star" data-v="5" aria-label="5 stars">★</button>
            </div>
            <div class="sr-label" id="mp-sr-label">Not rated</div>
            <div class="mp-row">
                <button class="mp-btn" id="mp-sr-submit">Submit rating</button>
                <button class="mp-btn alt" id="mp-sr-reset">Reset</button>
            </div>
        </div>
        <div class="mp-grid-3" style="margin-top:14px">
            <div class="mp-stat"><b id="mp-sr-yours">0</b><span>Your rating</span></div>
            <div class="mp-stat"><b id="mp-sr-avg">—</b><span>Average</span></div>
            <div class="mp-stat"><b id="mp-sr-votes">0</b><span>Votes</span></div>
        </div>
    </div>`,
    init: function (root) {
        var stars = root.querySelectorAll('#mp-starrating .sr-star');
        var labelEl = root.querySelector('#mp-sr-label');
        var savedEl = root.querySelector('#mp-sr-saved');
        var yoursEl = root.querySelector('#mp-sr-yours');
        var avgEl = root.querySelector('#mp-sr-avg');
        var votesEl = root.querySelector('#mp-sr-votes');
        var labels = ['Not rated', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
        var rating = 0;
        var votes = [];

        try {
            var saved = JSON.parse(localStorage.getItem('mp-starrating-votes') || '[]');
            if (Array.isArray(saved)) votes = saved.filter(function (n) { return n >= 1 && n <= 5; });
        } catch (e) { /* ignore */ }

        function persist() {
            try { localStorage.setItem('mp-starrating-votes', JSON.stringify(votes)); } catch (e) { /* ignore */ }
        }

        function paint(n) {
            for (var i = 0; i < stars.length; i++) {
                stars[i].className = 'sr-star' + (i < n ? ' on' : '');
            }
        }

        function renderStats() {
            yoursEl.textContent = rating || 0;
            votesEl.textContent = votes.length;
            if (votes.length) {
                var sum = 0;
                for (var i = 0; i < votes.length; i++) sum += votes[i];
                avgEl.textContent = (Math.round((sum / votes.length) * 10) / 10).toFixed(1);
            } else {
                avgEl.textContent = '—';
            }
            savedEl.textContent = rating ? 'Rated ' + rating + '/5' : 'Not saved';
            savedEl.className = 'mp-badge' + (rating ? ' ok' : '');
        }

        function setRating(n) {
            rating = n;
            labelEl.textContent = labels[rating] || labels[0];
            paint(rating);
            renderStats();
        }

        root.addEventListener('click', function (e) {
            var star = e.target.closest('#mp-starrating .sr-star');
            if (star) { setRating(+star.getAttribute('data-v')); return; }
            if (e.target.closest('#mp-sr-submit')) {
                if (!rating) { labelEl.textContent = 'Pick a rating first'; return; }
                votes.push(rating);
                persist();
                renderStats();
                savedEl.textContent = 'Thanks for rating!';
                savedEl.className = 'mp-badge ok';
                return;
            }
            if (e.target.closest('#mp-sr-reset')) {
                votes = [];
                persist();
                setRating(0);
                labelEl.textContent = 'Not rated';
            }
        });

        root.addEventListener('mouseover', function (e) {
            var star = e.target.closest('#mp-starrating .sr-star');
            if (star) paint(+star.getAttribute('data-v'));
        });

        root.addEventListener('mouseleave', function () { paint(rating); });

        setRating(0);
    }
});
