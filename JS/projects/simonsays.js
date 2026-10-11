registerProject({
    id: 'simonsays',
    title: 'Simon Says',
    desc: 'Watch the color sequence grow, then repeat it. One wrong click ends the game.',
    tags: ['Game', 'Memory'],
    markup: `
    <div class="mp" id="mp-simonsays">
        <style>
            #mp-simonsays .ss-head { margin-bottom: 12px; }
            #mp-simonsays .ss-board {
                display: grid; grid-template-columns: repeat(2, 1fr);
                gap: 10px; max-width: 264px; margin: 0 auto;
            }
            #mp-simonsays .ss-pad {
                aspect-ratio: 1 / 1; border: 0; border-radius: 18px; cursor: pointer;
                opacity: .5; transition: opacity .12s, transform .12s, box-shadow .12s;
            }
            #mp-simonsays .ss-pad:hover { opacity: .8; }
            #mp-simonsays .ss-pad.lit { opacity: 1; transform: scale(1.05); box-shadow: 0 10px 26px -10px currentColor; }
            #mp-simonsays .ss-pad:disabled { cursor: default; }
            #mp-simonsays .ss-p0 { background: #ef4444; color: #ef4444; }
            #mp-simonsays .ss-p1 { background: #3b82f6; color: #3b82f6; }
            #mp-simonsays .ss-p2 { background: #22c55e; color: #22c55e; }
            #mp-simonsays .ss-p3 { background: #f59e0b; color: #f59e0b; }
            #mp-simonsays .ss-meta { margin: 14px 0 10px; }
        </style>
        <div class="mp-between ss-head">
            <div>
                <div class="mp-title">Simon Says</div>
                <div class="mp-sub">Repeat the growing sequence without a mistake.</div>
            </div>
            <span class="mp-badge" id="mp-ss-best">Best 0</span>
        </div>
        <div class="ss-board" id="mp-ss-board">
            <button class="ss-pad ss-p0" data-pad="0" aria-label="Red pad"></button>
            <button class="ss-pad ss-p1" data-pad="1" aria-label="Blue pad"></button>
            <button class="ss-pad ss-p2" data-pad="2" aria-label="Green pad"></button>
            <button class="ss-pad ss-p3" data-pad="3" aria-label="Yellow pad"></button>
        </div>
        <div class="ss-meta">
            <div class="mp-between" style="margin-bottom:6px">
                <span class="mp-sub">Level <b id="mp-ss-level">0</b></span>
                <span class="mp-chip" id="mp-ss-status">Press start</span>
            </div>
            <div class="mp-progress"><i id="mp-ss-bar" style="width:0%"></i></div>
        </div>
        <div class="mp-grid-2">
            <div class="mp-stat"><b id="mp-ss-score">0</b><span>Score</span></div>
            <div class="mp-stat"><b id="mp-ss-beststat">0</b><span>Best</span></div>
        </div>
        <div class="mp-row" style="justify-content:center;margin-top:14px">
            <button class="mp-btn lg" id="mp-ss-start">Start game</button>
        </div>
    </div>`,
    init: function (root) {
        var pads = root.querySelectorAll('#mp-simonsays .ss-pad');
        var status = root.querySelector('#mp-ss-status');
        var scoreEl = root.querySelector('#mp-ss-score');
        var levelEl = root.querySelector('#mp-ss-level');
        var barEl = root.querySelector('#mp-ss-bar');
        var bestStatEl = root.querySelector('#mp-ss-beststat');
        var bestBadge = root.querySelector('#mp-ss-best');
        var startBtn = root.querySelector('#mp-ss-start');
        var sequence = [], input = [], accepting = false, score = 0, timers = [];
        var best = parseInt(localStorage.getItem('mp-simonsays-best') || '0', 10) || 0;

        function renderBest() {
            bestBadge.textContent = 'Best ' + best;
            bestStatEl.textContent = best;
        }

        function setBar(pct) { barEl.style.width = Math.max(0, Math.min(100, pct)) + '%'; }

        function flash(i, ms, cb) {
            pads[i].classList.add('lit');
            timers.push(setTimeout(function () {
                pads[i].classList.remove('lit');
                if (cb) cb();
            }, ms || 420));
        }

        function playSequence() {
            accepting = false;
            status.textContent = 'Watch closely…';
            status.className = 'mp-chip';
            setBar(0);
            for (var i = 0; i < sequence.length; i++) {
                (function (k) {
                    timers.push(setTimeout(function () { flash(sequence[k], 380); }, 560 * k + 350));
                })(i);
            }
            timers.push(setTimeout(function () {
                accepting = true;
                input = [];
                setBar(0);
                status.textContent = 'Your turn!';
                status.className = 'mp-badge ok';
            }, 560 * sequence.length + 420));
        }

        function next() {
            sequence.push(Math.floor(Math.random() * 4));
            levelEl.textContent = sequence.length;
            playSequence();
        }

        function gameOver() {
            accepting = false;
            status.textContent = 'Wrong pad! Score: ' + score;
            status.className = 'mp-badge err';
            setBar(0);
            startBtn.textContent = 'Play again';
            startBtn.disabled = false;
            if (score > best) {
                best = score;
                try { localStorage.setItem('mp-simonsays-best', String(best)); } catch (e) { /* ignore */ }
                renderBest();
            }
        }

        function start() {
            for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
            timers = [];
            sequence = []; input = []; score = 0; accepting = false;
            scoreEl.textContent = '0';
            levelEl.textContent = '0';
            startBtn.textContent = 'Restart';
            setBar(0);
            next();
        }

        root.addEventListener('click', function (e) {
            if (e.target.closest('#mp-ss-start')) { start(); return; }
            var pad = e.target.closest('#mp-simonsays .ss-pad');
            if (!pad || !accepting) return;
            var i = +pad.getAttribute('data-pad');
            flash(i, 240);
            input.push(i);
            setBar(Math.round((input.length / sequence.length) * 100));
            var k = input.length - 1;
            if (input[k] !== sequence[k]) { gameOver(); return; }
            if (input.length === sequence.length) {
                accepting = false;
                score++;
                scoreEl.textContent = score;
                setBar(100);
                status.textContent = 'Nice! +1';
                status.className = 'mp-badge ok';
                timers.push(setTimeout(function () { next(); }, 720));
            }
        });

        renderBest();
        return function cleanup() { for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]); };
    }
});
