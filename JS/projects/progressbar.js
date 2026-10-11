registerProject({
    id: 'progressbar',
    title: 'Progress Bar',
    desc: 'Animated progress bar with preset buttons, step input, and reset; persists value.',
    tags: ['UI Component'],
    markup: `
    <div class="mp" id="mp-progressbar">
        <style>
            #mp-progressbar .pb-pct { text-align: center; font-weight: 800; font-size: 22px; color: var(--primary); margin-bottom: 10px; font-variant-numeric: tabular-nums; }
            #mp-progressbar .mp-progress { height: 22px; }
            #mp-progressbar .mp-progress i { transition: width .25s ease; }
            #mp-progressbar .pb-msg { font-size: 12px; min-height: 16px; text-align: center; }
        </style>
        <div class="mp-stack">
            <div class="mp-card mp-stack">
                <div class="mp-title">Progress</div>
                <div class="pb-pct" id="mp-pb-pct">0%</div>
                <div class="mp-progress"><i id="mp-pb-fill" style="width:0%"></i></div>
                <div class="mp-row mp-wrap mp-center">
                    <button class="mp-btn sm" id="mp-pb-up10">+10</button>
                    <button class="mp-btn sm" id="mp-pb-up25">+25</button>
                    <button class="mp-btn sm alt" id="mp-pb-down10">-10</button>
                    <button class="mp-btn sm alt" id="mp-pb-down25">-25</button>
                    <button class="mp-btn sm alt" id="mp-pb-reset">Reset</button>
                </div>
                <div class="mp-row mp-center mp-wrap">
                    <label class="mp-row" style="gap:6px">
                        <span class="mp-sub">Step</span>
                        <input class="mp-input" id="mp-pb-step" type="number" min="1" max="50" value="5" style="width:70px">
                    </label>
                    <button class="mp-btn sm" id="mp-pb-plus">+</button>
                    <button class="mp-btn sm alt" id="mp-pb-minus">-</button>
                </div>
                <div class="pb-msg" id="mp-pb-msg"></div>
            </div>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-progressbar';
        var value = 0;
        var pct = root.querySelector('#mp-pb-pct');
        var fill = root.querySelector('#mp-pb-fill');
        var msgEl = root.querySelector('#mp-pb-msg');
        var stepEl = root.querySelector('#mp-pb-step');
        var up10 = root.querySelector('#mp-pb-up10');
        var up25 = root.querySelector('#mp-pb-up25');
        var down10 = root.querySelector('#mp-pb-down10');
        var down25 = root.querySelector('#mp-pb-down25');
        var resetBtn = root.querySelector('#mp-pb-reset');
        var plusBtn = root.querySelector('#mp-pb-plus');
        var minusBtn = root.querySelector('#mp-pb-minus');

        try {
            var saved = localStorage.getItem(KEY);
            if (saved) value = clamp(parseFloat(saved) || 0);
        } catch (e) { value = 0; }

        function clamp(n) { return Math.max(0, Math.min(100, n)); }

        function save() {
            try { localStorage.setItem(KEY, String(Math.round(value))); } catch (e) {}
        }

        function showMsg(text, type) {
            msgEl.textContent = text || '';
            if (type === 'ok') msgEl.style.color = 'var(--ok)';
            else if (type === 'err') msgEl.style.color = 'var(--danger)';
            else msgEl.style.color = 'var(--muted)';
        }

        function render() {
            pct.textContent = Math.round(value) + '%';
            fill.style.width = value + '%';
            save();
        }

        function change(delta) {
            var old = value;
            value = clamp(value + delta);
            render();
            if (value !== old) {
                showMsg('Progress: ' + Math.round(value) + '%', 'ok');
                setTimeout(showMsg, 800, '');
            }
        }

        up10.addEventListener('click', function () { change(10); });
        up25.addEventListener('click', function () { change(25); });
        down10.addEventListener('click', function () { change(-10); });
        down25.addEventListener('click', function () { change(-25); });
        resetBtn.addEventListener('click', function () { value = 0; render(); showMsg('Reset', 'ok'); setTimeout(showMsg, 800, ''); });
        plusBtn.addEventListener('click', function () {
            var s = parseInt(stepEl.value, 10) || 5;
            change(s);
        });
        minusBtn.addEventListener('click', function () {
            var s = parseInt(stepEl.value, 10) || 5;
            change(-s);
        });

        render();
        var cleanup = function () {
            up10.removeEventListener('click', function () { change(10); });
            up25.removeEventListener('click', function () { change(25); });
            down10.removeEventListener('click', function () { change(-10); });
            down25.removeEventListener('click', function () { change(-25); });
            resetBtn.removeEventListener('click', function () {});
            plusBtn.removeEventListener('click', function () {});
            minusBtn.removeEventListener('click', function () {});
        };
        return cleanup;
    }
});