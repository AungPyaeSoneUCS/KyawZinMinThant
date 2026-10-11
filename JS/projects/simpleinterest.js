registerProject({
    id: 'simpleinterest',
    title: 'Simple Interest',
    desc: 'Work out simple interest and the total amount, with quick rate presets and saved inputs.',
    tags: ['Calculator', 'Math', 'Finance'],
    markup: `
    <div class="mp" id="mp-simpleinterest">
        <style>
            #mp-simpleinterest .sip-field { flex: 1; min-width: 130px; }
            #mp-simpleinterest .sip-presets { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 2px; }
            #mp-simpleinterest .sip-preset { border: 0; cursor: pointer; font: inherit; transition: transform .15s; }
            #mp-simpleinterest .sip-preset:hover { transform: translateY(-1px); }
            #mp-simpleinterest .sip-grid { margin-top: 2px; }
            #mp-simpleinterest .sip-note { font-size: 13px; color: var(--muted); margin-top: 10px; }
        </style>
        <div class="mp-row">
            <div class="sip-field">
                <label class="mp-label" for="mp-si-p">Principal amount</label>
                <input class="mp-input" id="mp-si-p" type="number" min="0" step="any" inputmode="decimal" placeholder="e.g. 10000" style="width:100%">
            </div>
            <div class="sip-field">
                <label class="mp-label" for="mp-si-r">Annual rate (%)</label>
                <input class="mp-input" id="mp-si-r" type="number" min="0" step="any" inputmode="decimal" placeholder="e.g. 5" style="width:100%">
            </div>
            <div class="sip-field">
                <label class="mp-label" for="mp-si-t">Time (years)</label>
                <input class="mp-input" id="mp-si-t" type="number" min="0" step="any" inputmode="decimal" placeholder="e.g. 3" style="width:100%">
            </div>
        </div>
        <div class="sip-presets">
            <button class="mp-chip sip-preset" type="button" data-rate="5">5%</button>
            <button class="mp-chip sip-preset" type="button" data-rate="7.5">7.5%</button>
            <button class="mp-chip sip-preset" type="button" data-rate="10">10%</button>
            <button class="mp-chip sip-preset" type="button" data-rate="12.5">12.5%</button>
        </div>
        <div class="mp-row" style="margin-top:12px">
            <button class="mp-btn" id="mp-si-go">Calculate</button>
            <button class="mp-btn alt" id="mp-si-reset">Reset</button>
        </div>
        <div class="mp-out">
            <div class="mp-sub" id="mp-si-msg">Enter a principal, rate and time, then press Calculate.</div>
            <div class="mp-grid-2 sip-grid" id="mp-si-results" hidden>
                <div class="mp-stat"><b id="mp-si-interest">0</b><span>Interest earned</span></div>
                <div class="mp-stat"><b id="mp-si-total">0</b><span>Total amount</span></div>
            </div>
            <div class="sip-note" id="mp-si-note"></div>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-simpleinterest';
        var p = root.querySelector('#mp-si-p');
        var r = root.querySelector('#mp-si-r');
        var t = root.querySelector('#mp-si-t');
        var msg = root.querySelector('#mp-si-msg');
        var results = root.querySelector('#mp-si-results');
        var interestEl = root.querySelector('#mp-si-interest');
        var totalEl = root.querySelector('#mp-si-total');
        var note = root.querySelector('#mp-si-note');

        function fmt(n) {
            return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }

        function showMsg(text) {
            msg.textContent = text;
            msg.hidden = false;
            results.hidden = true;
            note.textContent = '';
        }

        function save() {
            try {
                localStorage.setItem(KEY, JSON.stringify({ p: p.value, r: r.value, t: t.value }));
            } catch (e) { /* ignore */ }
        }

        function calc() {
            var P = parseFloat(p.value);
            var R = parseFloat(r.value);
            var T = parseFloat(t.value);
            if (p.value === '' || r.value === '' || t.value === '' || isNaN(P) || isNaN(R) || isNaN(T)) {
                showMsg('Please fill in all three fields with numbers.');
                return;
            }
            if (P < 0 || R < 0 || T < 0) {
                showMsg('Principal, rate and time must all be zero or greater.');
                return;
            }
            var interest = (P * R * T) / 100;
            var total = P + interest;
            interestEl.textContent = fmt(interest);
            totalEl.textContent = fmt(total);
            note.textContent = 'Principal ' + fmt(P) + ' · rate ' + R + '% · ' + T + ' year' + (T === 1 ? '' : 's') + ' → ' + fmt(total);
            msg.hidden = true;
            results.hidden = false;
            save();
        }

        function reset() {
            p.value = '';
            r.value = '';
            t.value = '';
            try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
            showMsg('Enter a principal, rate and time, then press Calculate.');
            p.focus();
        }

        root.querySelector('#mp-si-go').addEventListener('click', calc);
        root.querySelector('#mp-si-reset').addEventListener('click', reset);

        Array.prototype.forEach.call(root.querySelectorAll('.sip-preset'), function (btn) {
            btn.addEventListener('click', function () {
                r.value = btn.getAttribute('data-rate');
                calc();
            });
        });

        [p, r, t].forEach(function (el) {
            el.addEventListener('keydown', function (e) { if (e.key === 'Enter') calc(); });
        });

        try {
            var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (saved && saved.p !== undefined) {
                p.value = saved.p;
                r.value = saved.r;
                t.value = saved.t;
                if (saved.p !== '' && saved.r !== '' && saved.t !== '') calc();
            }
        } catch (e) { /* ignore */ }
    }
});
