registerProject({
    id: 'countdowntimer',
    title: 'Countdown Timer',
    desc: 'Count down with quick presets, pause/resume and a live progress bar.',
    tags: ['Utility', 'Time'],
    markup: `
    <div class="mp" id="mp-countdowntimer">
        <style>
            #mp-countdowntimer .cd-display {
                text-align: center; font-size: 46px; font-weight: 800;
                font-variant-numeric: tabular-nums; padding: 24px 12px;
                border-radius: var(--radius-lg); letter-spacing: .03em;
                background: var(--surface-2); border: 1px solid var(--border);
                box-shadow: var(--shadow-sm); color: var(--primary); line-height: 1.1;
            }
            #mp-countdowntimer .cd-display.done { color: var(--danger); border-color: var(--danger); }
            #mp-countdowntimer .cd-field { flex: 1; min-width: 90px; }
            #mp-countdowntimer .cd-hint { min-height: 18px; margin-top: 8px; }
            #mp-countdowntimer .cd-hint.err { color: var(--danger); }
        </style>
        <div class="cd-display" id="mp-cd-display">05:00</div>
        <div class="mp-progress" style="margin-top: 14px"><i id="mp-cd-bar"></i></div>
        <div class="mp-row" style="margin-top: 12px">
            <button class="mp-btn alt sm" data-preset="60">1 min</button>
            <button class="mp-btn alt sm" data-preset="300">5 min</button>
            <button class="mp-btn alt sm" data-preset="600">10 min</button>
            <button class="mp-btn alt sm" data-preset="1500">25 min</button>
        </div>
        <div class="mp-row" style="margin-top: 12px">
            <div class="cd-field">
                <label class="mp-label" for="mp-cd-min">Minutes</label>
                <input class="mp-input" id="mp-cd-min" type="number" min="0" value="5" style="width: 100%">
            </div>
            <div class="cd-field">
                <label class="mp-label" for="mp-cd-sec">Seconds</label>
                <input class="mp-input" id="mp-cd-sec" type="number" min="0" max="59" value="0" style="width: 100%">
            </div>
        </div>
        <div class="mp-row" style="margin-top: 12px">
            <button class="mp-btn" id="mp-cd-start">Start</button>
            <button class="mp-btn alt" id="mp-cd-reset">Reset</button>
            <button class="mp-btn ghost" id="mp-cd-plus">+1:00</button>
        </div>
        <div class="mp-sub cd-hint" id="mp-cd-hint">Choose a preset or set your own time.</div>
    </div>`,
    init: function (root) {
        var display = root.querySelector('#mp-cd-display');
        var bar = root.querySelector('#mp-cd-bar');
        var minInput = root.querySelector('#mp-cd-min');
        var secInput = root.querySelector('#mp-cd-sec');
        var startBtn = root.querySelector('#mp-cd-start');
        var resetBtn = root.querySelector('#mp-cd-reset');
        var plusBtn = root.querySelector('#mp-cd-plus');
        var hint = root.querySelector('#mp-cd-hint');

        var total = 0;
        var remaining = 0;
        var running = false;
        var timer = null;

        function pad(n) { return n < 10 ? '0' + n : String(n); }

        function show() {
            var m = Math.floor(remaining / 60);
            var s = remaining % 60;
            display.textContent = pad(m) + ':' + pad(s);
            var pct = total > 0 ? (total - remaining) / total * 100 : 0;
            bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
        }

        function readInputs() {
            var m = Math.max(0, Math.floor(parseInt(minInput.value, 10) || 0));
            var s = Math.max(0, Math.floor(parseInt(secInput.value, 10) || 0));
            return m * 60 + s;
        }

        function setHint(msg, isErr) {
            hint.textContent = msg;
            hint.className = 'mp-sub cd-hint' + (isErr ? ' err' : '');
        }

        function stop() {
            running = false;
            clearInterval(timer);
            timer = null;
            startBtn.textContent = 'Start';
        }

        function tick() {
            remaining -= 1;
            if (remaining <= 0) {
                remaining = 0;
                show();
                stop();
                display.classList.add('done');
                display.textContent = "Time's up!";
                setHint('Countdown finished.', false);
                return;
            }
            show();
        }

        function applyInputs() {
            total = readInputs();
            remaining = total;
            display.classList.remove('done');
            show();
            if (total <= 0) setHint('Enter at least 1 second to start.', true);
            else setHint('Ready — press Start when you are.', false);
        }

        startBtn.addEventListener('click', function () {
            if (running) { stop(); setHint('Paused.', false); return; }
            display.classList.remove('done');
            if (remaining <= 0) { total = readInputs(); remaining = total; }
            if (remaining <= 0) { setHint('Enter at least 1 second to start.', true); return; }
            setHint('Counting down…', false);
            show();
            running = true;
            startBtn.textContent = 'Pause';
            timer = setInterval(tick, 1000);
        });

        resetBtn.addEventListener('click', function () {
            stop();
            applyInputs();
        });

        plusBtn.addEventListener('click', function () {
            remaining += 60;
            total = Math.max(total, remaining);
            display.classList.remove('done');
            show();
            if (running) setHint('Added one minute.', false);
        });

        root.querySelectorAll('[data-preset]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var secs = parseInt(btn.getAttribute('data-preset'), 10);
                minInput.value = Math.floor(secs / 60);
                secInput.value = secs % 60;
                stop();
                applyInputs();
            });
        });

        [minInput, secInput].forEach(function (el) {
            el.addEventListener('input', function () { if (!running) applyInputs(); });
        });

        applyInputs();

        return function cleanup() { clearInterval(timer); };
    }
});
