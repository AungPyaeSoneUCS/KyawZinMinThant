registerProject({
    id: 'factorial',
    title: 'Factorial Calculator',
    desc: 'Compute n! for n from 0 to 170 with exact big-integer results and quick stats.',
    tags: ['Math'],
    markup: `<div class="mp" id="mp-factorial">
        <style>
            #mp-factorial .fa-big {
                font-family: 'Consolas', 'Menlo', ui-monospace, monospace;
                font-size: 15px; line-height: 1.55; word-break: break-all;
                max-height: 220px; overflow: auto;
            }
            #mp-factorial .fa-count { font-variant-numeric: tabular-nums; }
        </style>
        <div class="mp-row">
            <label class="mp-label" for="mp-fa-n" style="margin:0">n (0–170)</label>
            <input class="mp-input" id="mp-fa-n" type="number" min="0" max="170" value="20" style="width:130px">
            <button class="mp-btn" id="mp-fa-go">Compute n!</button>
            <button class="mp-btn alt" id="mp-fa-copy">Copy</button>
        </div>
        <div class="mp-row" style="margin-top:8px">
            <button class="mp-btn ghost sm" data-n="5">5</button>
            <button class="mp-btn ghost sm" data-n="10">10</button>
            <button class="mp-btn ghost sm" data-n="20">20</button>
            <button class="mp-btn ghost sm" data-n="50">50</button>
            <button class="mp-btn ghost sm" data-n="100">100</button>
        </div>
        <div class="mp-grid-2" style="margin-top:12px">
            <div class="mp-stat"><b class="fa-count" id="mp-fa-digits">0</b><span>Digits</span></div>
            <div class="mp-stat"><b class="fa-count" id="mp-fa-zeros">0</b><span>Trailing zeros</span></div>
        </div>
        <div class="mp-out fa-big" id="mp-fa-out">Enter a value from 0 to 170 and press Compute.</div>
        <div class="mp-sub" id="mp-fa-status" style="margin-top:10px">0! and 1! both equal 1. Values above 170 overflow to Infinity in plain numbers, so we use BigInt.</div>
    </div>`,
    init: function (root) {
        var input = root.querySelector('#mp-fa-n');
        var out = root.querySelector('#mp-fa-out');
        var digitsEl = root.querySelector('#mp-fa-digits');
        var zerosEl = root.querySelector('#mp-fa-zeros');
        var status = root.querySelector('#mp-fa-status');
        var resultStr = '';

        function trailingZeros(n) {
            var count = 0;
            for (var p = 5; Math.floor(n / p) >= 1; p *= 5) count += Math.floor(n / p);
            return count;
        }

        function run() {
            var n = parseInt(input.value, 10);
            if (isNaN(n) || n < 0 || n > 170) {
                out.textContent = 'Enter a whole number from 0 to 170.';
                digitsEl.textContent = '0';
                zerosEl.textContent = '0';
                resultStr = '';
                status.textContent = 'Out of range — try a value between 0 and 170.';
                return;
            }
            var result = 1n;
            var limit = BigInt(n);
            for (var i = 2n; i <= limit; i++) result *= i;
            resultStr = result.toString();
            out.textContent = n + '! = ' + resultStr;
            digitsEl.textContent = String(resultStr.length);
            zerosEl.textContent = String(trailingZeros(n));
            status.textContent = n + '! has ' + resultStr.length + ' digits.';
        }

        root.querySelector('#mp-fa-go').addEventListener('click', run);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
        root.querySelector('[data-n="5"]').addEventListener('click', function () { input.value = '5'; run(); });
        root.querySelector('[data-n="10"]').addEventListener('click', function () { input.value = '10'; run(); });
        root.querySelector('[data-n="20"]').addEventListener('click', function () { input.value = '20'; run(); });
        root.querySelector('[data-n="50"]').addEventListener('click', function () { input.value = '50'; run(); });
        root.querySelector('[data-n="100"]').addEventListener('click', function () { input.value = '100'; run(); });
        root.querySelector('#mp-fa-copy').addEventListener('click', function () {
            if (!resultStr) { status.textContent = 'Compute a factorial first.'; return; }
            function done() { status.textContent = 'Result copied to clipboard.'; }
            function fail() { status.textContent = 'Copy failed — select and copy manually.'; }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(resultStr).then(done, fail);
            } else {
                var ta = document.createElement('textarea');
                ta.value = resultStr;
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); done(); } catch (e) { fail(); }
                document.body.removeChild(ta);
            }
        });
        run();
    }
});
