registerProject({
    id: 'memorygame',
    title: 'Memory Match',
    desc: 'Flip cards two at a time and find all eight matching emoji pairs in as few moves as possible.',
    tags: ['Game', 'Memory'],
    markup: `
    <div class="mp" id="mp-memorygame">
        <style>
            #mp-memorygame .mm-head { margin-bottom: 12px; }
            #mp-memorygame .mm-board {
                display: grid; grid-template-columns: repeat(4, 1fr);
                gap: 8px; max-width: 340px; margin: 0 auto;
            }
            #mp-memorygame .mm-cell {
                aspect-ratio: 1 / 1; display: grid; place-items: center;
                border: 1px solid var(--border); border-radius: 14px;
                background: var(--surface-2); color: var(--text); font: inherit;
                font-size: 30px; cursor: pointer;
                transition: transform .15s, background .15s, border-color .15s;
            }
            #mp-memorygame .mm-cell:hover:not(:disabled) { border-color: var(--primary); transform: translateY(-2px); }
            #mp-memorygame .mm-cell.flipped {
                background: var(--surface); border-color: var(--primary);
                animation: mm-flip .25s ease;
            }
            @keyframes mm-flip { from { transform: rotateY(90deg) scale(.85); } to { transform: rotateY(0) scale(1); } }
            #mp-memorygame .mm-cell.matched {
                background: var(--ok-soft); border-color: var(--ok); cursor: default;
            }
            #mp-memorygame .mm-cell:disabled { cursor: default; }
            #mp-memorygame .mm-meta { margin: 12px 0 8px; }
        </style>
        <div class="mp-between mm-head">
            <div>
                <div class="mp-title">Memory Match</div>
                <div class="mp-sub">Find all eight pairs with the fewest moves.</div>
            </div>
            <span class="mp-badge" id="mp-mm-best">Best —</span>
        </div>
        <div class="mm-board" id="mp-mm-board">
            <button class="mm-cell" data-index="0"></button><button class="mm-cell" data-index="1"></button>
            <button class="mm-cell" data-index="2"></button><button class="mm-cell" data-index="3"></button>
            <button class="mm-cell" data-index="4"></button><button class="mm-cell" data-index="5"></button>
            <button class="mm-cell" data-index="6"></button><button class="mm-cell" data-index="7"></button>
            <button class="mm-cell" data-index="8"></button><button class="mm-cell" data-index="9"></button>
            <button class="mm-cell" data-index="10"></button><button class="mm-cell" data-index="11"></button>
            <button class="mm-cell" data-index="12"></button><button class="mm-cell" data-index="13"></button>
            <button class="mm-cell" data-index="14"></button><button class="mm-cell" data-index="15"></button>
        </div>
        <div class="mm-meta">
            <div class="mp-between" style="margin-bottom:6px">
                <span class="mp-sub">Pairs <b id="mp-mm-pairs">0</b> / 8</span>
                <span class="mp-chip" id="mp-mm-status">Find all pairs</span>
            </div>
            <div class="mp-progress"><i id="mp-mm-bar" style="width:0%"></i></div>
        </div>
        <div class="mp-grid-2">
            <div class="mp-stat"><b id="mp-mm-moves">0</b><span>Moves</span></div>
            <div class="mp-stat"><b id="mp-mm-time">0:00</b><span>Time</span></div>
        </div>
        <div class="mp-row" style="justify-content:center;margin-top:14px">
            <button class="mp-btn" id="mp-mm-restart">New game</button>
        </div>
    </div>`,
    init: function (root) {
        var emojis = ['🍎', '🍌', '🍇', '🍒', '🍉', '🍓', '🥝', '🍑'];
        var cells = root.querySelectorAll('#mp-memorygame .mm-cell');
        var movesEl = root.querySelector('#mp-mm-moves');
        var timeEl = root.querySelector('#mp-mm-time');
        var pairsEl = root.querySelector('#mp-mm-pairs');
        var barEl = root.querySelector('#mp-mm-bar');
        var status = root.querySelector('#mp-mm-status');
        var bestEl = root.querySelector('#mp-mm-best');
        var deck = [], first = null, lock = false, moves = 0, matched = 0;
        var timers = [], clock = null, seconds = 0, started = false;
        var best = parseInt(localStorage.getItem('mp-memorygame-best') || '0', 10) || 0;

        function renderBest() {
            bestEl.textContent = best > 0 ? 'Best ' + best + ' moves' : 'Best —';
        }

        function fmt(s) {
            var m = Math.floor(s / 60);
            var r = s % 60;
            return m + ':' + (r < 10 ? '0' : '') + r;
        }

        function stopClock() {
            if (clock) { clearInterval(clock); clock = null; }
        }

        function startClock() {
            if (started) return;
            started = true;
            clock = setInterval(function () {
                seconds++;
                timeEl.textContent = fmt(seconds);
            }, 1000);
        }

        function shuffle(a) {
            for (var i = a.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = a[i]; a[i] = a[j]; a[j] = t;
            }
            return a;
        }

        function updateProgress() {
            pairsEl.textContent = matched;
            barEl.style.width = Math.round((matched / emojis.length) * 100) + '%';
        }

        function reset() {
            for (var j = 0; j < timers.length; j++) clearTimeout(timers[j]);
            timers = [];
            stopClock();
            deck = shuffle(emojis.concat(emojis));
            first = null; lock = false; moves = 0; matched = 0; seconds = 0; started = false;
            movesEl.textContent = '0';
            timeEl.textContent = '0:00';
            status.textContent = 'Find all pairs';
            status.className = 'mp-chip';
            for (var i = 0; i < cells.length; i++) {
                cells[i].textContent = '';
                cells[i].className = 'mm-cell';
                cells[i].disabled = false;
            }
            updateProgress();
        }

        function win() {
            stopClock();
            status.textContent = 'You won in ' + moves + ' moves!';
            status.className = 'mp-chip';
            if (best === 0 || moves < best) {
                best = moves;
                try { localStorage.setItem('mp-memorygame-best', String(best)); } catch (e) { /* ignore */ }
                renderBest();
            }
        }

        root.addEventListener('click', function (e) {
            if (e.target.closest('#mp-mm-restart')) { reset(); return; }
            var cell = e.target.closest('#mp-memorygame .mm-cell');
            if (!cell || lock || cell.classList.contains('flipped') || cell.classList.contains('matched')) return;
            startClock();
            var idx = +cell.getAttribute('data-index');
            cell.textContent = deck[idx];
            cell.classList.add('flipped');
            if (!first) { first = cell; return; }
            moves++;
            movesEl.textContent = moves;
            if (first.textContent === cell.textContent) {
                first.classList.add('matched');
                cell.classList.add('matched');
                matched++;
                first = null;
                updateProgress();
                if (matched === emojis.length) win();
            } else {
                lock = true;
                var a = first, b = cell;
                first = null;
                cell.disabled = true;
                timers.push(setTimeout(function () {
                    a.textContent = ''; b.textContent = '';
                    a.classList.remove('flipped'); b.classList.remove('flipped');
                    b.disabled = false;
                    lock = false;
                }, 700));
            }
        });

        renderBest();
        reset();

        return function cleanup() {
            for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
            stopClock();
        };
    }
});
