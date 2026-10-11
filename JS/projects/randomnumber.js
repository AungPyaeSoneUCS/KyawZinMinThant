registerProject({
    id: 'randomnumber',
    title: 'Random Number Generator',
    desc: 'Generate random integers in a range, roll several at once and keep a saved history.',
    tags: ['Utility', 'Math'],
    markup: `
    <div class="mp" id="mp-randomnumber">
        <style>
            #mp-randomnumber .rn-field { flex: 1; min-width: 110px; }
            #mp-randomnumber .rn-presets { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 2px; }
            #mp-randomnumber .rn-preset { border: 0; cursor: pointer; font: inherit; transition: transform .15s; }
            #mp-randomnumber .rn-preset:hover { transform: translateY(-1px); }
            #mp-randomnumber .rn-result { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-height: 44px; }
            #mp-randomnumber .rn-num {
                min-width: 52px; text-align: center; padding: 9px 12px; border-radius: 10px;
                font-weight: 800; font-size: 18px; color: var(--primary);
                background: var(--primary-soft); border: 1px solid transparent;
            }
            #mp-randomnumber .rn-num.single { font-size: 34px; padding: 6px 18px; }
            #mp-randomnumber .rn-empty { color: var(--muted); font-size: 13px; }
            #mp-randomnumber .rn-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        </style>
        <div class="mp-row">
            <div class="rn-field">
                <label class="mp-label" for="mp-rn-min">Minimum</label>
                <input class="mp-input" id="mp-rn-min" type="number" value="1" style="width:100%">
            </div>
            <div class="rn-field">
                <label class="mp-label" for="mp-rn-max">Maximum</label>
                <input class="mp-input" id="mp-rn-max" type="number" value="100" style="width:100%">
            </div>
            <div class="rn-field">
                <label class="mp-label" for="mp-rn-count">How many</label>
                <input class="mp-input" id="mp-rn-count" type="number" min="1" max="100" value="1" style="width:100%">
            </div>
        </div>
        <div class="rn-presets">
            <button class="mp-chip rn-preset" type="button" data-min="1" data-max="6">Dice 1–6</button>
            <button class="mp-chip rn-preset" type="button" data-min="1" data-max="10">1–10</button>
            <button class="mp-chip rn-preset" type="button" data-min="1" data-max="100">1–100</button>
            <button class="mp-chip rn-preset" type="button" data-min="1" data-max="1000">1–1000</button>
        </div>
        <div class="mp-row" style="margin-top:12px">
            <button class="mp-btn" id="mp-rn-go">Generate</button>
            <button class="mp-btn alt" id="mp-rn-reset">Clear history</button>
        </div>
        <div class="mp-out">
            <div class="rn-result" id="mp-rn-out"><span class="rn-empty">Press Generate to roll.</span></div>
        </div>
        <div class="mp-out">
            <div class="mp-label" style="margin:0 0 6px">History</div>
            <div class="rn-tags" id="mp-rn-hist"><span class="rn-empty">none yet</span></div>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-randomnumber';
        var minIn = root.querySelector('#mp-rn-min');
        var maxIn = root.querySelector('#mp-rn-max');
        var countIn = root.querySelector('#mp-rn-count');
        var out = root.querySelector('#mp-rn-out');
        var hist = root.querySelector('#mp-rn-hist');
        var history = [];

        function save() {
            try {
                localStorage.setItem(KEY, JSON.stringify({
                    min: minIn.value, max: maxIn.value, count: countIn.value, history: history
                }));
            } catch (e) { /* ignore */ }
        }

        function renderHistory() {
            hist.textContent = '';
            if (!history.length) {
                var empty = document.createElement('span');
                empty.className = 'rn-empty';
                empty.textContent = 'none yet';
                hist.appendChild(empty);
                return;
            }
            history.forEach(function (n) {
                var chip = document.createElement('span');
                chip.className = 'mp-chip';
                chip.textContent = n;
                hist.appendChild(chip);
            });
        }

        function showOut(text) {
            out.textContent = '';
            var span = document.createElement('span');
            span.className = 'rn-empty';
            span.textContent = text;
            out.appendChild(span);
        }

        function generate() {
            var min = parseInt(minIn.value, 10);
            var max = parseInt(maxIn.value, 10);
            if (isNaN(min) || isNaN(max)) { showOut('Enter whole numbers for the minimum and maximum.'); return; }
            if (min > max) { var tmp = min; min = max; max = tmp; minIn.value = min; maxIn.value = max; }
            var count = Math.max(1, Math.min(100, parseInt(countIn.value, 10) || 1));
            countIn.value = count;
            var numbers = [];
            for (var i = 0; i < count; i++) {
                numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
            }
            out.textContent = '';
            numbers.forEach(function (n) {
                var cell = document.createElement('span');
                cell.className = 'rn-num' + (count === 1 ? ' single' : '');
                cell.textContent = n;
                out.appendChild(cell);
            });
            numbers.forEach(function (n) { history.unshift(n); });
            if (history.length > 20) history = history.slice(0, 20);
            renderHistory();
            save();
        }

        root.querySelector('#mp-rn-go').addEventListener('click', generate);
        root.querySelector('#mp-rn-reset').addEventListener('click', function () {
            history = [];
            renderHistory();
            save();
        });

        Array.prototype.forEach.call(root.querySelectorAll('.rn-preset'), function (btn) {
            btn.addEventListener('click', function () {
                minIn.value = btn.getAttribute('data-min');
                maxIn.value = btn.getAttribute('data-max');
                countIn.value = '1';
                generate();
            });
        });

        try {
            var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (saved) {
                if (saved.min !== undefined) minIn.value = saved.min;
                if (saved.max !== undefined) maxIn.value = saved.max;
                if (saved.count !== undefined) countIn.value = saved.count;
                if (saved.history && saved.history.length) history = saved.history;
            }
        } catch (e) { /* ignore */ }

        renderHistory();
    }
});
