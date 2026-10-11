registerProject({
    id: 'fibonacci',
    title: 'Fibonacci Generator',
    desc: 'Generate the first n numbers of the Fibonacci sequence, with the sum and ratio.',
    tags: ['Math'],
    markup: `<div class="mp" id="mp-fibonacci">
        <style>
            #mp-fibonacci .fi-seq { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
            #mp-fibonacci .fi-term {
                padding: 8px 12px; border-radius: 10px; font-weight: 700;
                font-variant-numeric: tabular-nums; word-break: break-all;
                background: var(--surface-2); border: 1px solid var(--border);
                transition: transform .15s, box-shadow .15s;
            }
            #mp-fibonacci .fi-term:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }
            #mp-fibonacci .fi-term.hot { color: var(--primary); background: var(--primary-soft); border-color: transparent; }
            #mp-fibonacci .fi-empty { color: var(--muted); font-size: 13px; padding: 14px 0; }
            #mp-fibonacci .fi-count { font-variant-numeric: tabular-nums; }
        </style>
        <div class="mp-row">
            <label class="mp-label" for="mp-fi-count" style="margin:0">How many terms</label>
            <input class="mp-input" id="mp-fi-count" type="number" min="1" max="100" value="10" style="width:110px">
            <button class="mp-btn" id="mp-fi-go">Generate</button>
            <button class="mp-btn alt" id="mp-fi-copy">Copy</button>
        </div>
        <div class="mp-row" style="margin-top:8px">
            <button class="mp-btn ghost sm" data-n="10">10</button>
            <button class="mp-btn ghost sm" data-n="20">20</button>
            <button class="mp-btn ghost sm" data-n="50">50</button>
            <button class="mp-btn ghost sm" data-n="100">100</button>
        </div>
        <div class="mp-grid-3" style="margin-top:12px">
            <div class="mp-stat"><b class="fi-count" id="mp-fi-shown">0</b><span>Terms</span></div>
            <div class="mp-stat"><b class="fi-count" id="mp-fi-sum">0</b><span>Sum</span></div>
            <div class="mp-stat"><b class="fi-count" id="mp-fi-ratio">—</b><span>Last ratio</span></div>
        </div>
        <div class="fi-seq" id="mp-fi-seq"></div>
        <div class="mp-sub" id="mp-fi-status" style="margin-top:10px">F(0) = 0, F(1) = 1, and every term after is the sum of the two before it.</div>
    </div>`,
    init: function (root) {
        var input = root.querySelector('#mp-fi-count');
        var seq = root.querySelector('#mp-fi-seq');
        var shownEl = root.querySelector('#mp-fi-shown');
        var sumEl = root.querySelector('#mp-fi-sum');
        var ratioEl = root.querySelector('#mp-fi-ratio');
        var status = root.querySelector('#mp-fi-status');
        var KEY = 'mp-fib-count';
        var terms = [];

        try {
            var saved = parseInt(localStorage.getItem(KEY), 10);
            if (saved >= 1 && saved <= 100) input.value = String(saved);
        } catch (e) { /* ignore */ }

        function run() {
            var raw = parseInt(input.value, 10);
            seq.textContent = '';
            if (isNaN(raw) || raw < 1) {
                var empty = document.createElement('div');
                empty.className = 'fi-empty';
                empty.textContent = 'Enter how many terms you want (1 to 100).';
                seq.appendChild(empty);
                shownEl.textContent = '0';
                sumEl.textContent = '0';
                ratioEl.textContent = '—';
                return;
            }
            var count = Math.min(raw, 100);
            input.value = String(count);
            terms = [];
            var a = 0n, b = 1n, sum = 0n;
            var frag = document.createDocumentFragment();
            for (var i = 0; i < count; i++) {
                terms.push(a.toString());
                sum += a;
                var term = document.createElement('span');
                term.className = 'fi-term' + (i % 2 === 0 ? ' hot' : '');
                term.textContent = a.toString();
                frag.appendChild(term);
                var next = a + b;
                a = b;
                b = next;
            }
            seq.appendChild(frag);
            shownEl.textContent = String(count);
            sumEl.textContent = sum.toString();
            if (count >= 2) {
                var last = BigInt(terms[count - 1]);
                var prev = BigInt(terms[count - 2]);
                ratioEl.textContent = prev === 0n ? '—' : (Number(last) / Number(prev)).toFixed(3);
            } else {
                ratioEl.textContent = '—';
            }
            try { localStorage.setItem(KEY, String(count)); } catch (e) { /* ignore */ }
            status.textContent = 'Sequence of ' + count + ' term' + (count === 1 ? '' : 's') + ' ending at ' + terms[terms.length - 1] + '.';
        }

        root.querySelector('#mp-fi-go').addEventListener('click', run);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
        root.querySelector('[data-n="10"]').addEventListener('click', function () { input.value = '10'; run(); });
        root.querySelector('[data-n="20"]').addEventListener('click', function () { input.value = '20'; run(); });
        root.querySelector('[data-n="50"]').addEventListener('click', function () { input.value = '50'; run(); });
        root.querySelector('[data-n="100"]').addEventListener('click', function () { input.value = '100'; run(); });
        root.querySelector('#mp-fi-copy').addEventListener('click', function () {
            var str = terms.join(', ');
            if (!str) { status.textContent = 'Generate a sequence first.'; return; }
            function done() { status.textContent = 'Sequence copied to clipboard.'; }
            function fail() { status.textContent = 'Copy failed — select and copy manually.'; }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(str).then(done, fail);
            } else {
                var ta = document.createElement('textarea');
                ta.value = str;
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); done(); } catch (e) { fail(); }
                document.body.removeChild(ta);
            }
        });
        run();
    }
});
