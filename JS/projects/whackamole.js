registerProject({
    id: 'whackamole',
    title: 'Whack-a-Mole',
    desc: 'Whack the mole before it disappears. You have 30 seconds to score.',
    tags: ['Game', 'Timed'],
    markup: `
    <div class="mp" id="mp-whackamole">
        <style>
            #mp-whackamole .wm-head { margin-bottom: 12px; }
            #mp-whackamole .wm-board {
                display: grid; grid-template-columns: repeat(3, 1fr);
                gap: 9px; max-width: 300px; margin: 0 auto;
            }
            #mp-whackamole .wm-hole {
                aspect-ratio: 1 / 1; display: grid; place-items: center;
                border: 1px solid var(--border); border-radius: 14px;
                background: var(--surface-2); font-size: 34px; cursor: pointer;
                user-select: none; transition: transform .12s, background .12s, border-color .12s;
            }
            #mp-whackamole .wm-hole:hover { background: var(--primary-soft); border-color: var(--primary); }
            #mp-whackamole .wm-hole.up { animation: wm-pop .18s ease; }
            @keyframes wm-pop { from { transform: scale(.4); } to { transform: none; } }
            #mp-whackamole .wm-hole.hit { background: var(--ok-soft); border-color: var(--ok); }
            #mp-whackamole .wm-meta { margin: 12px 0 8px; }
        </style>
        <div class="mp-between wm-head">
            <div>
                <div class="mp-title">Whack-a-Mole</div>
                <div class="mp-sub">Tap the mole the moment it pops up.</div>
            </div>
            <span class="mp-badge" id="mp-wm-best">Best 0</span>
        </div>
        <div class="wm-board" id="mp-wm-board">
            <div class="wm-hole" data-index="0"></div><div class="wm-hole" data-index="1"></div><div class="wm-hole" data-index="2"></div>
            <div class="wm-hole" data-index="3"></div><div class="wm-hole" data-index="4"></div><div class="wm-hole" data-index="5"></div>
            <div class="wm-hole" data-index="6"></div><div class="wm-hole" data-index="7"></div><div class="wm-hole" data-index="8"></div>
        </div>
        <div class="wm-meta">
            <div class="mp-between" style="margin-bottom:6px">
                <span class="mp-sub">Time left <b id="mp-wm-time">30</b>s</span>
                <span class="mp-chip" id="mp-wm-status">Press start</span>
            </div>
            <div class="mp-progress"><i id="mp-wm-bar" style="width:100%"></i></div>
        </div>
        <div class="mp-grid-2">
            <div class="mp-stat"><b id="mp-wm-score">0</b><span>Score</span></div>
            <div class="mp-stat"><b id="mp-wm-beststat">0</b><span>Best</span></div>
        </div>
        <div class="mp-row" style="justify-content:center;margin-top:14px">
            <button class="mp-btn lg" id="mp-wm-start">Start game</button>
        </div>
    </div>`,
    init: function (root) {
        var holes = root.querySelectorAll('#mp-whackamole .wm-hole');
        var scoreEl = root.querySelector('#mp-wm-score');
        var bestStatEl = root.querySelector('#mp-wm-beststat');
        var bestBadge = root.querySelector('#mp-wm-best');
        var timeEl = root.querySelector('#mp-wm-time');
        var barEl = root.querySelector('#mp-wm-bar');
        var status = root.querySelector('#mp-wm-status');
        var startBtn = root.querySelector('#mp-wm-start');
        var moleTimer = null, countTimer = null, hitTimer = null, active = -1, running = false, score = 0, timeLeft = 30;
        var best = parseInt(localStorage.getItem('mp-whackamole-best') || '0', 10) || 0;

        function renderBest() {
            bestBadge.textContent = 'Best ' + best;
            bestStatEl.textContent = best;
        }

        function clearMole() {
            if (active !== -1) {
                holes[active].textContent = '';
                holes[active].classList.remove('up', 'hit');
            }
            active = -1;
        }

        function tick() {
            clearMole();
            active = Math.floor(Math.random() * 9);
            holes[active].textContent = '🐹';
            holes[active].classList.add('up');
        }

        function stopTimers() {
            if (moleTimer) { clearInterval(moleTimer); moleTimer = null; }
            if (countTimer) { clearInterval(countTimer); countTimer = null; }
            if (hitTimer) { clearTimeout(hitTimer); hitTimer = null; }
        }

        function end() {
            running = false;
            stopTimers();
            clearMole();
            startBtn.disabled = false;
            startBtn.textContent = 'Play again';
            timeEl.textContent = '0';
            barEl.style.width = '0%';
            status.textContent = 'Time up! Score: ' + score;
            status.className = 'mp-badge warn';
            if (score > best) {
                best = score;
                try { localStorage.setItem('mp-whackamole-best', String(best)); } catch (e) { /* ignore */ }
                renderBest();
            }
        }

        function start() {
            stopTimers();
            clearMole();
            running = true; score = 0; timeLeft = 30;
            scoreEl.textContent = '0';
            timeEl.textContent = '30';
            barEl.style.width = '100%';
            status.textContent = 'Go!';
            status.className = 'mp-chip';
            startBtn.disabled = true;
            startBtn.textContent = 'Playing…';
            tick();
            moleTimer = setInterval(tick, 750);
            countTimer = setInterval(function () {
                timeLeft--;
                timeEl.textContent = timeLeft;
                barEl.style.width = Math.max(0, Math.round((timeLeft / 30) * 100)) + '%';
                if (timeLeft <= 0) end();
            }, 1000);
        }

        root.addEventListener('click', function (e) {
            if (e.target.closest('#mp-wm-start')) { start(); return; }
            var hole = e.target.closest('#mp-whackamole .wm-hole');
            if (!hole || !running) return;
            if (+hole.getAttribute('data-index') === active) {
                score++;
                scoreEl.textContent = score;
                var idx = active;
                holes[idx].textContent = '💥';
                holes[idx].classList.add('hit');
                active = -1;
                hitTimer = setTimeout(function () {
                    holes[idx].textContent = '';
                    holes[idx].classList.remove('up', 'hit');
                }, 180);
            }
        });

        renderBest();
        return function cleanup() { stopTimers(); };
    }
});
