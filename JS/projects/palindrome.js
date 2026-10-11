registerProject({
    id: 'palindrome',
    title: 'Palindrome Checker',
    desc: 'Check if text reads the same forwards and backwards, with the normalised and reversed forms shown.',
    tags: ['Text Tool'],
    markup: `
    <div class="mp" id="mp-palindrome">
        <style>
            #mp-palindrome .pd-text { width: 100%; }
            #mp-palindrome .pd-verdict { font-size: 20px; font-weight: 800; }
            #mp-palindrome .pd-verdict.yes { color: var(--ok); }
            #mp-palindrome .pd-verdict.no { color: var(--danger); }
            #mp-palindrome .pd-line { font-family: Consolas, "Courier New", monospace; font-size: 13px; color: var(--muted); margin-top: 6px; word-break: break-all; }
            #mp-palindrome .pd-opt { display: flex; gap: 7px; align-items: center; font-size: 13px; color: var(--text); cursor: pointer; }
        </style>
        <label class="mp-label" for="mp-pd-text">Text</label>
        <input class="mp-input pd-text" id="mp-pd-text" type="text" placeholder="e.g. A man, a plan, a canal: Panama">
        <div class="mp-row" style="margin-top:10px">
            <label class="pd-opt"><input type="checkbox" id="mp-pd-ignore" checked> Ignore case, spaces &amp; punctuation</label>
        </div>
        <div class="mp-row" style="margin-top:12px">
            <button class="mp-btn" id="mp-pd-go">Check</button>
            <button class="mp-btn alt" id="mp-pd-example">Example</button>
            <button class="mp-btn ghost" id="mp-pd-clear">Clear</button>
        </div>
        <div class="mp-out">
            <div class="pd-verdict" id="mp-pd-verdict">—</div>
            <div class="pd-line" id="mp-pd-norm"></div>
            <div class="pd-line" id="mp-pd-rev"></div>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-palindrome';
        var input = root.querySelector('#mp-pd-text');
        var ignore = root.querySelector('#mp-pd-ignore');
        var verdict = root.querySelector('#mp-pd-verdict');
        var normEl = root.querySelector('#mp-pd-norm');
        var revEl = root.querySelector('#mp-pd-rev');

        function save() {
            try { localStorage.setItem(KEY, input.value); } catch (e) { /* ignore */ }
        }

        function clearResult() {
            verdict.className = 'pd-verdict';
            verdict.textContent = '—';
            normEl.textContent = '';
            revEl.textContent = '';
        }

        function check() {
            var raw = input.value;
            var clean = ignore.checked ? raw.toLowerCase().replace(/[^a-z0-9]/g, '') : raw;
            if (!clean) {
                clearResult();
                verdict.textContent = 'Enter at least one letter or number.';
                return;
            }
            var reversed = clean.split('').reverse().join('');
            var yes = clean === reversed;
            verdict.className = 'pd-verdict ' + (yes ? 'yes' : 'no');
            verdict.textContent = yes ? 'Palindrome' : 'Not a palindrome';
            normEl.textContent = 'Normalised: ' + clean;
            revEl.textContent = 'Reversed:   ' + reversed;
            save();
        }

        function clear() {
            input.value = '';
            try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
            clearResult();
            input.focus();
        }

        root.querySelector('#mp-pd-go').addEventListener('click', check);
        root.querySelector('#mp-pd-example').addEventListener('click', function () {
            input.value = 'A man, a plan, a canal: Panama';
            ignore.checked = true;
            check();
        });
        root.querySelector('#mp-pd-clear').addEventListener('click', clear);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
        ignore.addEventListener('change', function () { if (input.value) check(); });

        try {
            var saved = localStorage.getItem(KEY);
            if (saved) { input.value = saved; check(); }
        } catch (e) { /* ignore */ }
    }
});
