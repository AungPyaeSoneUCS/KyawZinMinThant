registerProject({
    id: 'tipcalculator',
    title: 'Tip Calculator',
    desc: 'Work out the tip, total and per-person share — with quick tip presets.',
    tags: ['Calculator', 'Money'],
    markup: `
    <div class="mp" id="mp-tipcalculator">
        <style>
            #mp-tipcalculator .tip-field { flex: 1; min-width: 110px; }
            #mp-tipcalculator .tip-preset.on { background: var(--primary-grad); color: #fff; border-color: transparent; }
        </style>
        <div class="mp-row">
            <div class="tip-field">
                <label class="mp-label" for="mp-tip-bill">Bill amount</label>
                <input class="mp-input" id="mp-tip-bill" type="number" min="0" step="0.01" value="50" style="width: 100%">
            </div>
            <div class="tip-field">
                <label class="mp-label" for="mp-tip-pct">Tip %</label>
                <input class="mp-input" id="mp-tip-pct" type="number" min="0" value="15" style="width: 100%">
            </div>
            <div class="tip-field">
                <label class="mp-label" for="mp-tip-people">People</label>
                <input class="mp-input" id="mp-tip-people" type="number" min="1" value="2" style="width: 100%">
            </div>
        </div>
        <div class="mp-row" style="margin-top: 10px">
            <button class="mp-btn alt sm tip-preset" data-pct="10">10%</button>
            <button class="mp-btn alt sm tip-preset" data-pct="15">15%</button>
            <button class="mp-btn alt sm tip-preset" data-pct="18">18%</button>
            <button class="mp-btn alt sm tip-preset" data-pct="20">20%</button>
            <button class="mp-btn alt sm tip-preset" data-pct="25">25%</button>
        </div>
        <div class="mp-out">
            <div class="mp-grid-3">
                <div class="mp-stat"><b id="mp-tip-tip">$0.00</b><span>Tip</span></div>
                <div class="mp-stat"><b id="mp-tip-total">$0.00</b><span>Total</span></div>
                <div class="mp-stat"><b id="mp-tip-each">$0.00</b><span>Per person</span></div>
            </div>
            <div class="mp-sub" id="mp-tip-note" style="margin-top: 10px"></div>
        </div>
        <div class="mp-row" style="margin-top: 10px">
            <button class="mp-btn ghost sm" id="mp-tip-reset">Reset</button>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-tipcalculator';
        var billInput = root.querySelector('#mp-tip-bill');
        var pctInput = root.querySelector('#mp-tip-pct');
        var peopleInput = root.querySelector('#mp-tip-people');
        var tipEl = root.querySelector('#mp-tip-tip');
        var totalEl = root.querySelector('#mp-tip-total');
        var eachEl = root.querySelector('#mp-tip-each');
        var note = root.querySelector('#mp-tip-note');
        var presetBtns = root.querySelectorAll('.tip-preset');

        try {
            var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (saved) {
                billInput.value = saved.bill;
                pctInput.value = saved.pct;
                peopleInput.value = saved.people;
            }
        } catch (e) { /* ignore */ }

        function money(n) { return '$' + (isFinite(n) ? n : 0).toFixed(2); }

        function save() {
            try {
                localStorage.setItem(KEY, JSON.stringify({
                    bill: billInput.value, pct: pctInput.value, people: peopleInput.value
                }));
            } catch (e) { /* ignore */ }
        }

        function update() {
            var bill = parseFloat(billInput.value);
            var pct = parseFloat(pctInput.value);
            var people = parseInt(peopleInput.value, 10);

            if (isNaN(bill) || bill < 0) {
                tipEl.textContent = totalEl.textContent = eachEl.textContent = '$0.00';
                note.textContent = 'Enter a valid bill amount to see the split.';
                return;
            }
            if (isNaN(pct) || pct < 0) pct = 0;
            if (isNaN(people) || people < 1) people = 1;

            var tip = bill * pct / 100;
            var total = bill + tip;
            var each = total / people;

            tipEl.textContent = money(tip);
            totalEl.textContent = money(total);
            eachEl.textContent = money(each);
            note.textContent = 'A ' + pct + '% tip on ' + money(bill) + ' split ' + people +
                (people === 1 ? ' way.' : ' ways.');

            presetBtns.forEach(function (btn) {
                btn.classList.toggle('on', parseFloat(btn.getAttribute('data-pct')) === pct);
            });
        }

        [billInput, pctInput, peopleInput].forEach(function (el) {
            el.addEventListener('input', function () { update(); save(); });
        });

        presetBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                pctInput.value = btn.getAttribute('data-pct');
                update();
                save();
            });
        });

        root.querySelector('#mp-tip-reset').addEventListener('click', function () {
            billInput.value = '50';
            pctInput.value = '15';
            peopleInput.value = '2';
            update();
            save();
        });

        update();
    }
});
