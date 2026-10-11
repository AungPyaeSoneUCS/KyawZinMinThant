registerProject({
    id: 'stopwatch',
    title: 'Stopwatch',
    desc: 'Start, pause, reset and record laps with fastest/slowest splits.',
    tags: ['Utility', 'Time'],
    markup: `
    <div class="mp" id="mp-stopwatch">
        <style>
            #mp-stopwatch .sw-display {
                text-align: center; font-size: 44px; font-weight: 800;
                font-variant-numeric: tabular-nums; padding: 22px 12px;
                border-radius: var(--radius-lg); letter-spacing: .02em;
                background: var(--surface-2); border: 1px solid var(--border);
                box-shadow: var(--shadow-sm); color: var(--primary); line-height: 1.1;
            }
            #mp-stopwatch .sw-display.running { border-color: var(--primary); }
            #mp-stopwatch .sw-laps {
                list-style: none; margin: 12px 0 0; padding: 0;
                display: flex; flex-direction: column; gap: 6px;
                max-height: 220px; overflow: auto;
            }
            #mp-stopwatch .sw-lap {
                display: flex; justify-content: space-between; gap: 10px;
                padding: 8px 12px; border-radius: var(--radius-sm);
                background: var(--surface-2); border: 1px solid var(--border);
                font-variant-numeric: tabular-nums; font-size: 13.5px;
            }
            #mp-stopwatch .sw-lap b { color: var(--primary); font-weight: 700; }
            #mp-stopwatch .sw-lap.best { border-color: var(--ok); }
            #mp-stopwatch .sw-lap.worst { border-color: var(--danger); }
            #mp-stopwatch .sw-empty { text-align: center; padding: 14px 0; }
        </style>
        <div class="sw-display" id="mp-sw-display">00:00.000</div>
        <div class="mp-row" style="margin-top: 12px">
            <button class="mp-btn" id="mp-sw-start">Start</button>
            <button class="mp-btn alt" id="mp-sw-lap">Lap</button>
            <button class="mp-btn alt" id="mp-sw-reset">Reset</button>
            <span class="mp-badge" style="margin-left: auto" id="mp-sw-count">0 laps</span>
        </div>
        <div class="mp-grid-3" style="margin-top: 12px">
            <div class="mp-stat"><b id="mp-sw-best">—</b><span>Fastest lap</span></div>
            <div class="mp-stat"><b id="mp-sw-worst">—</b><span>Slowest lap</span></div>
            <div class="mp-stat"><b id="mp-sw-total">00:00</b><span>Last lap</span></div>
        </div>
        <div class="mp-sub" style="margin-top: 8px">Tap Lap to record a split. Space starts/stops, L laps, R resets.</div>
        <ul class="sw-laps" id="mp-sw-laps"></ul>
    </div>`,
    init: function (root) {
        var display = root.querySelector('#mp-sw-display');
        var startBtn = root.querySelector('#mp-sw-start');
        var lapBtn = root.querySelector('#mp-sw-lap');
        var resetBtn = root.querySelector('#mp-sw-reset');
        var lapsEl = root.querySelector('#mp-sw-laps');
        var countEl = root.querySelector('#mp-sw-count');
        var bestEl = root.querySelector('#mp-sw-best');
        var worstEl = root.querySelector('#mp-sw-worst');
        var totalEl = root.querySelector('#mp-sw-total');

        var elapsed = 0;
        var running = false;
        var startedAt = 0;
        var timer = null;
        var lapTotals = [];

        function pad(n, len) { n = String(n); while (n.length < len) n = '0' + n; return n; }

        function format(ms) {
            var m = Math.floor(ms / 60000);
            var s = Math.floor((ms % 60000) / 1000);
            var milli = Math.floor(ms % 1000);
            return pad(m, 2) + ':' + pad(s, 2) + '.' + pad(milli, 3);
        }

        function current() {
            return elapsed + (running ? Date.now() - startedAt : 0);
        }

        function render() { display.textContent = format(current()); }

        function splits() {
            var out = [];
            for (var i = 0; i < lapTotals.length; i++) {
                out.push(lapTotals[i] - (i > 0 ? lapTotals[i - 1] : 0));
            }
            return out;
        }

        function renderLaps() {
            lapsEl.textContent = '';
            countEl.textContent = lapTotals.length + (lapTotals.length === 1 ? ' lap' : ' laps');
            var sp = splits();
            var best = sp.length ? Math.min.apply(null, sp) : 0;
            var worst = sp.length ? Math.max.apply(null, sp) : 0;
            bestEl.textContent = sp.length ? format(best) : '—';
            worstEl.textContent = sp.length ? format(worst) : '—';
            totalEl.textContent = lapTotals.length ? format(sp[sp.length - 1]) : '00:00';

            if (!lapTotals.length) {
                var empty = document.createElement('li');
                empty.className = 'sw-empty mp-sub';
                empty.textContent = 'No laps yet — start the timer and tap Lap.';
                lapsEl.appendChild(empty);
                return;
            }

            for (var i = 0; i < sp.length; i++) {
                var li = document.createElement('li');
                li.className = 'sw-lap' + (sp.length > 1 && sp[i] === best ? ' best' : '') + (sp.length > 1 && sp[i] === worst ? ' worst' : '');
                var num = document.createElement('span');
                num.textContent = 'Lap ' + (i + 1);
                var val = document.createElement('b');
                val.textContent = format(sp[i]);
                li.appendChild(num);
                li.appendChild(val);
                lapsEl.appendChild(li);
            }
            lapsEl.scrollTop = lapsEl.scrollHeight;
        }

        function start() {
            if (running) {
                running = false;
                elapsed = current();
                clearInterval(timer);
                timer = null;
                startBtn.textContent = 'Start';
                display.classList.remove('running');
            } else {
                running = true;
                startedAt = Date.now();
                timer = setInterval(render, 31);
                startBtn.textContent = 'Pause';
                display.classList.add('running');
            }
            render();
        }

        function reset() {
            running = false;
            clearInterval(timer);
            timer = null;
            elapsed = 0;
            lapTotals = [];
            startBtn.textContent = 'Start';
            display.classList.remove('running');
            render();
            renderLaps();
        }

        function lap() {
            if (!running && elapsed === 0) return;
            lapTotals.push(current());
            renderLaps();
        }

        function onKey(e) {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
            if (e.code === 'Space') { e.preventDefault(); start(); }
            else if (e.key === 'l' || e.key === 'L') lap();
            else if (e.key === 'r' || e.key === 'R') reset();
        }

        startBtn.addEventListener('click', start);
        lapBtn.addEventListener('click', lap);
        resetBtn.addEventListener('click', reset);
        document.addEventListener('keydown', onKey);
        render();
        renderLaps();

        return function cleanup() {
            clearInterval(timer);
            document.removeEventListener('keydown', onKey);
        };
    }
});
