registerProject({
    id: 'anagram',
    title: 'Anagram Checker',
    desc: 'Check whether two words or phrases are anagrams of each other, with their letter signatures.',
    tags: ['Text Tool'],
    markup: `
    <div class="mp" id="mp-anagram">
        <style>
            #mp-anagram .an-field { flex: 1; min-width: 180px; }
            #mp-anagram .an-verdict { font-size: 20px; font-weight: 800; }
            #mp-anagram .an-verdict.yes { color: var(--ok); }
            #mp-anagram .an-verdict.no { color: var(--danger); }
            #mp-anagram .an-sig { font-family: Consolas, "Courier New", monospace; font-size: 13px; color: var(--muted); margin-top: 6px; word-break: break-all; }
        </style>
        <div class="mp-row">
            <div class="an-field">
                <label class="mp-label" for="mp-an-a">First word or phrase</label>
                <input class="mp-input" id="mp-an-a" type="text" placeholder="e.g. listen" style="width:100%">
            </div>
            <button class="mp-icon-btn" id="mp-an-swap" type="button" aria-label="Swap inputs" title="Swap inputs">⇄</button>
            <div class="an-field">
                <label class="mp-label" for="mp-an-b">Second word or phrase</label>
                <input class="mp-input" id="mp-an-b" type="text" placeholder="e.g. silent" style="width:100%">
            </div>
        </div>
        <div class="mp-row" style="margin-top:12px">
            <button class="mp-btn" id="mp-an-go">Check</button>
            <button class="mp-btn alt" id="mp-an-example">Example</button>
            <button class="mp-btn ghost" id="mp-an-clear">Clear</button>
        </div>
        <div class="mp-out">
            <div class="an-verdict" id="mp-an-verdict">—</div>
            <div class="an-sig" id="mp-an-sig-a"></div>
            <div class="an-sig" id="mp-an-sig-b"></div>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-anagram';
        var a = root.querySelector('#mp-an-a');
        var b = root.querySelector('#mp-an-b');
        var verdict = root.querySelector('#mp-an-verdict');
        var sigA = root.querySelector('#mp-an-sig-a');
        var sigB = root.querySelector('#mp-an-sig-b');

        function norm(s) {
            return s.toLowerCase().replace(/[^a-z0-9]/g, '').split('').sort().join('');
        }

        function save() {
            try { localStorage.setItem(KEY, JSON.stringify({ a: a.value, b: b.value })); } catch (e) { /* ignore */ }
        }

        function clearResult() {
            verdict.className = 'an-verdict';
            verdict.textContent = '—';
            sigA.textContent = '';
            sigB.textContent = '';
        }

        function check() {
            var na = norm(a.value);
            var nb = norm(b.value);
            if (!na || !nb) {
                clearResult();
                verdict.textContent = 'Enter text in both fields.';
                return;
            }
            var yes = na === nb;
            verdict.className = 'an-verdict ' + (yes ? 'yes' : 'no');
            verdict.textContent = yes ? 'Anagrams ✓' : 'Not anagrams ✗';
            sigA.textContent = 'First:  ' + na;
            sigB.textContent = 'Second: ' + nb;
            save();
        }

        function clear() {
            a.value = '';
            b.value = '';
            try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
            clearResult();
            a.focus();
        }

        root.querySelector('#mp-an-go').addEventListener('click', check);
        root.querySelector('#mp-an-example').addEventListener('click', function () {
            a.value = 'listen';
            b.value = 'silent';
            check();
        });
        root.querySelector('#mp-an-clear').addEventListener('click', clear);
        root.querySelector('#mp-an-swap').addEventListener('click', function () {
            var tmp = a.value;
            a.value = b.value;
            b.value = tmp;
            if (a.value || b.value) check();
        });
        [a, b].forEach(function (el) {
            el.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
        });

        try {
            var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (saved) {
                a.value = saved.a || '';
                b.value = saved.b || '';
                if (a.value && b.value) check();
            }
        } catch (e) { /* ignore */ }
    }
});
