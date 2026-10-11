registerProject({
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    desc: 'Print 1 to n, swapping multiples of 3 and 5 for Fizz, Buzz and FizzBuzz.',
    tags: ['Math'],
    markup: `<div class="mp" id="mp-fizzbuzz">
        <style>
            #mp-fizzbuzz .fb-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
            #mp-fizzbuzz .fb-cell {
                min-width: 58px; text-align: center; padding: 8px 10px; border-radius: 10px;
                font-weight: 700; font-variant-numeric: tabular-nums;
                background: var(--surface-2); border: 1px solid var(--border);
                transition: transform .15s, box-shadow .15s;
            }
            #mp-fizzbuzz .fb-cell:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }
            #mp-fizzbuzz .fb-cell.fizz { color: var(--primary); background: var(--primary-soft); border-color: transparent; }
            #mp-fizzbuzz .fb-cell.buzz { color: var(--ok); background: var(--ok-soft); border-color: transparent; }
            #mp-fizzbuzz .fb-cell.fizzbuzz { color: #fff; background: var(--primary-grad); border-color: transparent; }
            #mp-fizzbuzz .fb-empty { color: var(--muted); font-size: 13px; padding: 14px 0; }
            #mp-fizzbuzz .fb-count { font-variant-numeric: tabular-nums; }
        </style>
        <div class="mp-row">
            <label class="mp-label" for="mp-fb-n" style="margin:0">Count up to</label>
            <input class="mp-input" id="mp-fb-n" type="number" min="1" max="200" value="30" style="width:110px">
            <button class="mp-btn" id="mp-fb-go">Run</button>
            <button class="mp-btn alt" id="mp-fb-clear">Clear</button>
        </div>
        <div class="mp-row" id="mp-fb-presets" style="margin-top:8px">
            <button class="mp-btn ghost sm" data-n="15">15</button>
            <button class="mp-btn ghost sm" data-n="30">30</button>
            <button class="mp-btn ghost sm" data-n="50">50</button>
            <button class="mp-btn ghost sm" data-n="100">100</button>
        </div>
        <div class="mp-row" id="mp-fb-stats" style="margin-top:12px">
            <span class="mp-badge" id="mp-fb-s-fizz">Fizz <span class="fb-count">0</span></span>
            <span class="mp-badge ok" id="mp-fb-s-buzz">Buzz <span class="fb-count">0</span></span>
            <span class="mp-badge" id="mp-fb-s-fizzbuzz">FizzBuzz <span class="fb-count">0</span></span>
        </div>
        <div class="fb-wrap" id="mp-fb-out"></div>
        <div class="mp-sub" id="mp-fb-hint" style="margin-top:10px">Multiples of 3 become Fizz, of 5 become Buzz, and of both become FizzBuzz.</div>
    </div>`,
    init: function (root) {
        var input = root.querySelector('#mp-fb-n');
        var out = root.querySelector('#mp-fb-out');
        var hint = root.querySelector('#mp-fb-hint');
        var sFizz = root.querySelector('#mp-fb-s-fizz');
        var sBuzz = root.querySelector('#mp-fb-s-buzz');
        var sFizzbuzz = root.querySelector('#mp-fb-s-fizzbuzz');

        function setCount(el, n) {
            el.querySelector('.fb-count').textContent = String(n);
        }

        function run() {
            var raw = parseInt(input.value, 10);
            if (isNaN(raw) || raw < 1) {
                out.textContent = '';
                var empty = document.createElement('div');
                empty.className = 'fb-empty';
                empty.textContent = 'Enter a whole number of 1 or more to run FizzBuzz.';
                out.appendChild(empty);
                hint.textContent = 'Try a presets value below or type a count up to 200.';
                return;
            }
            var n = Math.min(raw, 200);
            input.value = String(n);
            var fizz = 0, buzz = 0, both = 0;
            var frag = document.createDocumentFragment();
            for (var i = 1; i <= n; i++) {
                var cell = document.createElement('div');
                var label;
                if (i % 15 === 0) { label = 'FizzBuzz'; cell.className = 'fb-cell fizzbuzz'; both++; }
                else if (i % 3 === 0) { label = 'Fizz'; cell.className = 'fb-cell fizz'; fizz++; }
                else if (i % 5 === 0) { label = 'Buzz'; cell.className = 'fb-cell buzz'; buzz++; }
                else { label = String(i); cell.className = 'fb-cell'; }
                cell.textContent = label;
                frag.appendChild(cell);
            }
            out.textContent = '';
            out.appendChild(frag);
            setCount(sFizz, fizz);
            setCount(sBuzz, buzz);
            setCount(sFizzbuzz, both);
            hint.textContent = 'Showing 1 to ' + n + '. Multiples of 3 become Fizz, of 5 become Buzz, of both become FizzBuzz.';
        }

        root.querySelector('#mp-fb-go').addEventListener('click', run);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
        root.querySelector('#mp-fb-clear').addEventListener('click', function () {
            input.value = '';
            out.textContent = '';
            setCount(sFizz, 0);
            setCount(sBuzz, 0);
            setCount(sFizzbuzz, 0);
            hint.textContent = 'Cleared. Enter a count and press Run.';
            input.focus();
        });
        root.querySelector('#mp-fb-presets').addEventListener('click', function (e) {
            var btn = e.target.closest('[data-n]');
            if (!btn) return;
            input.value = btn.getAttribute('data-n');
            run();
        });
        run();
    }
});
