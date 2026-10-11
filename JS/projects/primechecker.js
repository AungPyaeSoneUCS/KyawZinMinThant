registerProject({
    id: 'primechecker',
    title: 'Prime Checker',
    desc: 'Test whether a number is prime, factor it if not, and list every prime up to 50.',
    tags: ['Math'],
    markup: `<div class="mp" id="mp-primechecker">
        <style>
            #mp-primechecker .pr-list { display: flex; flex-wrap: wrap; gap: 6px; }
            #mp-primechecker .pr-factor {
                display: inline-block; padding: 3px 10px; border-radius: 99px;
                font-weight: 700; font-size: 12.5px; font-variant-numeric: tabular-nums;
                background: var(--warn-soft); color: var(--warn);
            }
            #mp-primechecker .pr-note { font-size: 12px; color: var(--muted); min-height: 16px; }
            #mp-primechecker .mp-out { margin-top: 10px; }
        </style>
        <div class="mp-row">
            <label class="mp-label" for="mp-pr-n" style="margin:0">Number</label>
            <input class="mp-input" id="mp-pr-n" type="number" min="0" value="29" style="width:140px">
            <button class="mp-btn" id="mp-pr-go">Check</button>
            <button class="mp-btn alt" id="mp-pr-clear">Clear</button>
        </div>
        <div class="mp-between" style="margin-top:12px">
            <div class="mp-row">
                <span class="mp-badge" id="mp-pr-badge">Waiting</span>
                <span class="pr-note" id="mp-pr-note"></span>
            </div>
            <button class="mp-btn ghost sm" id="mp-pr-sample">Sample</button>
        </div>
        <div class="mp-out" id="mp-pr-out">Enter a number and press Check.</div>
        <div class="mp-stack" id="mp-pr-factors-wrap" style="gap:6px; margin-top:12px; display:none">
            <span class="mp-label">Prime factors</span>
            <div class="pr-list" id="mp-pr-factors"></div>
        </div>
        <hr class="mp-hr">
        <div class="mp-between">
            <span class="mp-label">Primes up to 50</span>
            <span class="mp-sub" id="mp-pr-count"></span>
        </div>
        <div class="pr-list" id="mp-pr-list" style="margin-top:8px"></div>
    </div>`,
    init: function (root) {
        var input = root.querySelector('#mp-pr-n');
        var out = root.querySelector('#mp-pr-out');
        var badge = root.querySelector('#mp-pr-badge');
        var note = root.querySelector('#mp-pr-note');
        var factorsWrap = root.querySelector('#mp-pr-factors-wrap');
        var factorsEl = root.querySelector('#mp-pr-factors');
        var list = root.querySelector('#mp-pr-list');
        var countEl = root.querySelector('#mp-pr-count');

        function isPrime(n) {
            if (n < 2) return false;
            if (n < 4) return true;
            if (n % 2 === 0) return false;
            for (var i = 3; i * i <= n; i += 2) {
                if (n % i === 0) return false;
            }
            return true;
        }

        function factorize(n) {
            var factors = [];
            var x = n;
            for (var d = 2; d * d <= x; d++) {
                while (x % d === 0) { factors.push(d); x /= d; }
            }
            if (x > 1) factors.push(x);
            return factors;
        }

        function setBadge(text, cls) {
            badge.textContent = text;
            badge.className = 'mp-badge' + (cls ? ' ' + cls : '');
        }

        function renderFactors(n) {
            factorsEl.textContent = '';
            if (isPrime(n) || n < 2) { factorsWrap.style.display = 'none'; return; }
            factorsWrap.style.display = '';
            var factors = factorize(n);
            var frag = document.createDocumentFragment();
            for (var i = 0; i < factors.length; i++) {
                var chip = document.createElement('span');
                chip.className = 'pr-factor';
                chip.textContent = String(factors[i]);
                frag.appendChild(chip);
            }
            factorsEl.appendChild(frag);
        }

        function check() {
            var raw = input.value.trim();
            if (!/^\d+$/.test(raw)) {
                out.textContent = 'Please enter a whole number of 0 or more.';
                setBadge('Invalid', 'warn');
                note.textContent = '';
                factorsWrap.style.display = 'none';
                return;
            }
            var n = parseInt(raw, 10);
            if (n < 2) {
                out.textContent = n + ' is not prime — primes are greater than 1.';
                setBadge('Not prime', 'err');
                note.textContent = '';
                factorsWrap.style.display = 'none';
                return;
            }
            if (isPrime(n)) {
                out.textContent = n + ' is prime — its only divisors are 1 and itself.';
                setBadge('Prime', 'ok');
                note.textContent = 'No factors between 2 and ' + (Math.floor(Math.sqrt(n)) || 1) + '.';
                factorsWrap.style.display = 'none';
            } else {
                var f = factorize(n);
                var first = f[0];
                out.textContent = n + ' is not prime — the smallest factor is ' + first + '.';
                setBadge('Not prime', 'err');
                note.textContent = 'Composite number.';
                renderFactors(n);
            }
        }

        function renderList() {
            list.textContent = '';
            var frag = document.createDocumentFragment();
            var count = 0;
            for (var i = 2; i <= 50; i++) {
                if (!isPrime(i)) continue;
                count++;
                var chip = document.createElement('span');
                chip.className = 'mp-chip';
                chip.textContent = String(i);
                frag.appendChild(chip);
            }
            list.appendChild(frag);
            countEl.textContent = count + ' primes';
        }

        root.querySelector('#mp-pr-go').addEventListener('click', check);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
        root.querySelector('#mp-pr-clear').addEventListener('click', function () {
            input.value = '';
            out.textContent = 'Enter a number and press Check.';
            setBadge('Waiting', '');
            note.textContent = '';
            factorsWrap.style.display = 'none';
            input.focus();
        });
        root.querySelector('#mp-pr-sample').addEventListener('click', function () {
            input.value = '97';
            check();
        });
        renderList();
        check();
    }
});
