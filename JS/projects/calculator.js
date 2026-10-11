registerProject({
    id: 'calculator',
    title: 'Calculator',
    desc: 'Basic arithmetic with a button grid, keyboard support and a live expression readout.',
    tags: ['Calculator', 'Math'],
    markup: `
    <div class="mp" id="mp-calculator">
        <style>
            #mp-calculator .cl-wrap { max-width: 320px; margin: 0 auto; }
            #mp-calculator .cl-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
            #mp-calculator .cl-disp {
                text-align: right; padding: 16px; border-radius: var(--radius);
                background: var(--surface-2); border: 1px solid var(--border);
                box-shadow: var(--shadow-sm); overflow: hidden;
            }
            #mp-calculator .cl-expr { min-height: 18px; font-size: 13px; color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            #mp-calculator .cl-value { font-size: 32px; font-weight: 800; letter-spacing: -.02em; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            #mp-calculator .cl-keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px; }
            #mp-calculator .cl-key {
                padding: 15px 0; border-radius: 12px; border: 1px solid var(--border);
                background: var(--surface); color: var(--text); font: inherit;
                font-size: 16px; font-weight: 700; cursor: pointer;
                transition: transform .15s, border-color .15s, color .15s, box-shadow .15s;
            }
            #mp-calculator .cl-key:hover { transform: translateY(-1px); border-color: var(--primary); color: var(--primary); box-shadow: var(--shadow-sm); }
            #mp-calculator .cl-key:active { transform: translateY(0); }
            #mp-calculator .cl-key.op { background: var(--primary-soft); color: var(--primary); }
            #mp-calculator .cl-key.eq { background: var(--primary-grad); color: #fff; border-color: transparent; }
            #mp-calculator .cl-key.wide { grid-column: span 2; }
            #mp-calculator .cl-hint { text-align: center; margin-top: 10px; }
        </style>
        <div class="cl-wrap">
            <div class="cl-head">
                <div>
                    <div class="mp-title">Calculator</div>
                    <div class="mp-sub">Tap keys or use your keyboard.</div>
                </div>
                <span class="mp-badge" id="mp-calc-badge">Ready</span>
            </div>
            <div class="cl-disp">
                <div class="cl-expr" id="mp-calc-expr"></div>
                <div class="cl-value" id="mp-calc-display">0</div>
            </div>
            <div class="cl-keys">
                <button class="cl-key op" data-key="C">C</button>
                <button class="cl-key op" data-key="back">⌫</button>
                <button class="cl-key op" data-key="%">%</button>
                <button class="cl-key op" data-key="÷">÷</button>

                <button class="cl-key" data-key="7">7</button>
                <button class="cl-key" data-key="8">8</button>
                <button class="cl-key" data-key="9">9</button>
                <button class="cl-key op" data-key="×">×</button>

                <button class="cl-key" data-key="4">4</button>
                <button class="cl-key" data-key="5">5</button>
                <button class="cl-key" data-key="6">6</button>
                <button class="cl-key op" data-key="−">−</button>

                <button class="cl-key" data-key="1">1</button>
                <button class="cl-key" data-key="2">2</button>
                <button class="cl-key" data-key="3">3</button>
                <button class="cl-key op" data-key="+">+</button>

                <button class="cl-key wide" data-key="0">0</button>
                <button class="cl-key" data-key=".">.</button>
                <button class="cl-key eq" data-key="=">=</button>
            </div>
            <div class="mp-sub cl-hint">Digits, + − × ÷, Enter =, Backspace, Esc clears.</div>
        </div>
    </div>`,
    init: function (root) {
        var display = root.querySelector('#mp-calc-display');
        var exprEl = root.querySelector('#mp-calc-expr');
        var badge = root.querySelector('#mp-calc-badge');
        var current = '0';
        var previous = null;
        var operator = null;
        var resetNext = false;

        function render() {
            display.textContent = current;
            exprEl.textContent = operator !== null ? previous + ' ' + operator : '';
            badge.textContent = current === 'Error' ? 'Error' : (operator !== null ? operator : 'Ready');
            badge.className = 'mp-badge' + (current === 'Error' ? ' err' : (operator !== null ? '' : ' ok'));
        }

        function compute(a, b, op) {
            a = parseFloat(a);
            b = parseFloat(b);
            switch (op) {
                case '+': return a + b;
                case '−': return a - b;
                case '×': return a * b;
                case '÷': return b === 0 ? NaN : a / b;
            }
            return b;
        }

        function round(n) { return Math.round(n * 1e10) / 1e10; }

        function inputDigit(d) {
            if (resetNext) { current = d; resetNext = false; }
            else { current = current === '0' ? d : current + d; }
            if (current.replace('-', '').length > 13) current = current.slice(0, 14);
            render();
        }

        function inputDot() {
            if (resetNext) { current = '0.'; resetNext = false; }
            else if (current.indexOf('.') === -1) current += '.';
            render();
        }

        function chooseOp(op) {
            if (operator && !resetNext) current = String(round(compute(previous, current, operator)));
            previous = current;
            operator = op;
            resetNext = true;
            render();
        }

        function equals() {
            if (operator === null) return;
            var result = compute(previous, current, operator);
            current = isFinite(result) ? String(round(result)) : 'Error';
            previous = null;
            operator = null;
            resetNext = true;
            render();
        }

        function clearAll() { current = '0'; previous = null; operator = null; resetNext = false; render(); }

        function backspace() {
            if (resetNext) return;
            current = current.length > 1 ? current.slice(0, -1) : '0';
            render();
        }

        function percent() { current = String(round(parseFloat(current) / 100)); render(); }

        function press(key) {
            if (key >= '0' && key <= '9') inputDigit(key);
            else if (key === '.') inputDot();
            else if (key === '+' || key === '−' || key === '×' || key === '÷') chooseOp(key);
            else if (key === '=') equals();
            else if (key === 'C') clearAll();
            else if (key === 'back') backspace();
            else if (key === '%') percent();
        }

        function onClick(e) {
            var btn = e.target.closest('[data-key]');
            if (btn) press(btn.getAttribute('data-key'));
        }

        function onKey(e) {
            var map = { '*': '×', '/': '÷', '-': '−', '+': '+', 'Enter': '=', '=': '=', 'Escape': 'C', 'Backspace': 'back', '%': '%' };
            if (/^[0-9.]$/.test(e.key)) press(e.key);
            else if (map[e.key]) { press(map[e.key]); e.preventDefault(); }
        }

        root.addEventListener('click', onClick);
        document.addEventListener('keydown', onKey);
        render();

        return function cleanup() {
            root.removeEventListener('click', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }
});
