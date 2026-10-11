registerProject({
    id: 'coinflip',
    title: 'Coin Flip',
    desc: 'Flip a coin, watch it spin, and chase your longest heads-or-tails streak.',
    tags: ['Game', 'Random'],
    markup: `
    <div class="mp" id="mp-coinflip">
        <style>
            #mp-coinflip .cf-head { margin-bottom: 12px; }
            #mp-coinflip .cf-stage { display: grid; place-items: center; padding: 12px 0 8px; perspective: 800px; }
            #mp-coinflip .cf-coin {
                width: 118px; height: 118px; border-radius: 50%;
                display: grid; place-items: center; font-size: 40px; font-weight: 900;
                color: #fff; background: linear-gradient(135deg, var(--primary), var(--primary-2));
                box-shadow: var(--shadow); backface-visibility: hidden;
                transition: box-shadow .2s;
            }
            #mp-coinflip .cf-coin.flip { animation: cf-spin .55s ease; }
            @keyframes cf-spin {
                0% { transform: rotateY(0) scale(1); }
                50% { transform: rotateY(360deg) scale(1.06); }
                100% { transform: rotateY(720deg) scale(1); }
            }
            #mp-coinflip .cf-heads { background: linear-gradient(135deg, var(--primary), var(--primary-2)); }
            #mp-coinflip .cf-tails { background: linear-gradient(135deg, var(--warn), var(--danger)); }
            #mp-coinflip .cf-track { margin-top: 14px; }
            #mp-coinflip .cf-legend { display: flex; justify-content: space-between; margin-bottom: 6px; }
        </style>
        <div class="mp-between cf-head">
            <div>
                <div class="mp-title">Flip the coin</div>
                <div class="mp-sub">Land the same side twice in a row to build a streak.</div>
            </div>
            <span class="mp-badge" id="mp-cf-best">Best streak 0</span>
        </div>
        <div class="cf-stage">
            <div class="cf-coin cf-heads" id="mp-cf-coin">?</div>
        </div>
        <div class="mp-row" style="justify-content:center">
            <button class="mp-btn lg" id="mp-cf-flip">Flip coin</button>
            <button class="mp-btn alt" id="mp-cf-reset">New game</button>
        </div>
        <div class="mp-out" id="mp-cf-result">Result: <b id="mp-cf-label">—</b></div>
        <div class="cf-track">
            <div class="cf-legend">
                <span class="mp-sub">Heads <b id="mp-cf-heads">0</b></span>
                <span class="mp-sub">Tails <b id="mp-cf-tails">0</b></span>
            </div>
            <div class="mp-progress"><i id="mp-cf-bar" style="width:50%"></i></div>
        </div>
        <div class="mp-grid-3" style="margin-top:12px">
            <div class="mp-stat"><b id="mp-cf-total">0</b><span>Total flips</span></div>
            <div class="mp-stat"><b id="mp-cf-streak">0</b><span>Current streak</span></div>
            <div class="mp-stat"><b id="mp-cf-ratio">—</b><span>Heads %</span></div>
        </div>
    </div>`,
    init: function (root) {
        var coin = root.querySelector('#mp-cf-coin');
        var labelEl = root.querySelector('#mp-cf-label');
        var headsEl = root.querySelector('#mp-cf-heads');
        var tailsEl = root.querySelector('#mp-cf-tails');
        var totalEl = root.querySelector('#mp-cf-total');
        var streakEl = root.querySelector('#mp-cf-streak');
        var ratioEl = root.querySelector('#mp-cf-ratio');
        var bestEl = root.querySelector('#mp-cf-best');
        var barEl = root.querySelector('#mp-cf-bar');
        var flipBtn = root.querySelector('#mp-cf-flip');
        var heads = 0, tails = 0, total = 0, streak = 0, last = '';
        var best = parseInt(localStorage.getItem('mp-coinflip-best') || '0', 10) || 0;
        var busy = false, timer = null;

        function renderBest() { bestEl.textContent = 'Best streak ' + best; }

        function update() {
            var pct = total ? Math.round((heads / total) * 100) : 0;
            headsEl.textContent = heads;
            tailsEl.textContent = tails;
            totalEl.textContent = total;
            streakEl.textContent = streak;
            ratioEl.textContent = total ? pct + '%' : '—';
            barEl.style.width = (total ? pct : 50) + '%';
        }

        function flip() {
            if (busy) return;
            busy = true;
            flipBtn.disabled = true;
            coin.classList.remove('flip');
            void coin.offsetWidth;
            coin.classList.add('flip');
            coin.textContent = '…';
            timer = setTimeout(function () {
                var isHeads = Math.random() < 0.5;
                var side = isHeads ? 'Heads' : 'Tails';
                if (isHeads) heads++; else tails++;
                total++;
                if (side === last) streak++; else streak = 1;
                last = side;
                if (streak > best) {
                    best = streak;
                    try { localStorage.setItem('mp-coinflip-best', String(best)); } catch (e) { /* ignore */ }
                    renderBest();
                }
                coin.textContent = isHeads ? 'H' : 'T';
                coin.className = 'cf-coin ' + (isHeads ? 'cf-heads' : 'cf-tails');
                labelEl.textContent = side;
                update();
                busy = false;
                flipBtn.disabled = false;
            }, 550);
        }

        function reset() {
            if (timer) { clearTimeout(timer); timer = null; }
            busy = false;
            flipBtn.disabled = false;
            heads = 0; tails = 0; total = 0; streak = 0; last = '';
            coin.textContent = '?';
            coin.className = 'cf-coin cf-heads';
            labelEl.textContent = '—';
            update();
        }

        flipBtn.addEventListener('click', flip);
        root.querySelector('#mp-cf-reset').addEventListener('click', reset);
        renderBest();
        update();

        return function cleanup() { if (timer) clearTimeout(timer); };
    }
});
