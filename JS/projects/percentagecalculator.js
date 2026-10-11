registerProject({
    id: 'percentagecalculator',
    title: 'Percentage Calculator',
    desc: 'Find X% of Y, work out what percent X is of Y, and see the percent change between two values.',
    tags: ['Calculator', 'Math'],
    markup: `
    <div class="mp" id="mp-percentagecalculator">
        <style>
            #mp-percentagecalculator .pc-panel { display: flex; flex-direction: column; gap: 8px; }
            #mp-percentagecalculator .pc-panel .mp-input { width: 100%; }
            #mp-percentagecalculator .pc-title { font-size: 14px; font-weight: 800; letter-spacing: -.01em; }
            #mp-percentagecalculator .pc-res {
                margin-top: auto; padding-top: 8px; font-weight: 800; font-size: 15px;
                color: var(--primary); min-height: 22px; word-break: break-word;
            }
            #mp-percentagecalculator .pc-res.err { color: var(--danger); font-weight: 600; font-size: 13px; }
        </style>
        <div class="mp-grid-3">
            <div class="mp-panel pc-panel">
                <div class="pc-title">X% of Y</div>
                <input class="mp-input pc-a" type="number" step="any" inputmode="decimal" placeholder="Percent (X)">
                <input class="mp-input pc-b" type="number" step="any" inputmode="decimal" placeholder="Number (Y)">
                <button class="mp-btn sm pc-go-a">Compute</button>
                <div class="pc-res pc-res-a"></div>
            </div>
            <div class="mp-panel pc-panel">
                <div class="pc-title">X is what % of Y</div>
                <input class="mp-input pc-c" type="number" step="any" inputmode="decimal" placeholder="Part (X)">
                <input class="mp-input pc-d" type="number" step="any" inputmode="decimal" placeholder="Whole (Y)">
                <button class="mp-btn sm pc-go-b">Compute</button>
                <div class="pc-res pc-res-b"></div>
            </div>
            <div class="mp-panel pc-panel">
                <div class="pc-title">Percent change</div>
                <input class="mp-input pc-e" type="number" step="any" inputmode="decimal" placeholder="From (old)">
                <input class="mp-input pc-f" type="number" step="any" inputmode="decimal" placeholder="To (new)">
                <button class="mp-btn sm pc-go-c">Compute</button>
                <div class="pc-res pc-res-c"></div>
            </div>
        </div>
        <div class="mp-row" style="margin-top:12px">
            <button class="mp-btn alt" id="mp-pc-clear">Clear all</button>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-percentagecalculator';
        var a = root.querySelector('.pc-a');
        var b = root.querySelector('.pc-b');
        var c = root.querySelector('.pc-c');
        var d = root.querySelector('.pc-d');
        var e = root.querySelector('.pc-e');
        var f = root.querySelector('.pc-f');
        var resA = root.querySelector('.pc-res-a');
        var resB = root.querySelector('.pc-res-b');
        var resC = root.querySelector('.pc-res-c');

        function num(el) {
            var v = parseFloat(el.value);
            return isNaN(v) ? null : v;
        }

        function round(n) {
            return Math.round(n * 1e6) / 1e6;
        }

        function setRes(el, text, isErr) {
            el.textContent = text;
            el.classList.toggle('err', !!isErr);
        }

        function save() {
            try {
                localStorage.setItem(KEY, JSON.stringify({ a: a.value, b: b.value, c: c.value, d: d.value, e: e.value, f: f.value }));
            } catch (err) { /* ignore */ }
        }

        function calcA() {
            var x = num(a);
            var y = num(b);
            if (x === null || y === null) { setRes(resA, 'Enter both values.', true); return; }
            setRes(resA, x + '% of ' + y + ' = ' + round((x / 100) * y));
            save();
        }

        function calcB() {
            var x = num(c);
            var y = num(d);
            if (x === null || y === null) { setRes(resB, 'Enter both values.', true); return; }
            if (y === 0) { setRes(resB, 'The whole (Y) cannot be zero.', true); return; }
            setRes(resB, x + ' is ' + round((x / y) * 100) + '% of ' + y);
            save();
        }

        function calcC() {
            var oldV = num(e);
            var newV = num(f);
            if (oldV === null || newV === null) { setRes(resC, 'Enter both values.', true); return; }
            if (oldV === 0) { setRes(resC, 'The starting value cannot be zero.', true); return; }
            var change = ((newV - oldV) / Math.abs(oldV)) * 100;
            var dir = change > 0 ? 'increase' : (change < 0 ? 'decrease' : 'no change');
            setRes(resC, dir.charAt(0).toUpperCase() + dir.slice(1) + ' of ' + round(Math.abs(change)) + '%');
            save();
        }

        root.querySelector('.pc-go-a').addEventListener('click', calcA);
        root.querySelector('.pc-go-b').addEventListener('click', calcB);
        root.querySelector('.pc-go-c').addEventListener('click', calcC);

        [[a, calcA], [b, calcA], [c, calcB], [d, calcB], [e, calcC], [f, calcC]].forEach(function (pair) {
            pair[0].addEventListener('keydown', function (ev) { if (ev.key === 'Enter') pair[1](); });
        });

        root.querySelector('#mp-pc-clear').addEventListener('click', function () {
            [a, b, c, d, e, f].forEach(function (el) { el.value = ''; });
            setRes(resA, ''); setRes(resB, ''); setRes(resC, '');
            try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
            a.focus();
        });

        try {
            var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (saved) {
                a.value = saved.a || '';
                b.value = saved.b || '';
                c.value = saved.c || '';
                d.value = saved.d || '';
                e.value = saved.e || '';
                f.value = saved.f || '';
                if (a.value !== '' && b.value !== '') calcA();
                if (c.value !== '' && d.value !== '') calcB();
                if (e.value !== '' && f.value !== '') calcC();
            }
        } catch (err) { /* ignore */ }
    }
});
