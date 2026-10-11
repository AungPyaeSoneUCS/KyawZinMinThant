registerProject({
    id: 'unitconverter',
    title: 'Unit Converter',
    desc: 'Convert lengths between meter, centimeter, kilometer, inch, foot and mile.',
    tags: ['Converter', 'Utility'],
    markup: `
    <div class="mp" id="mp-unitconverter">
        <style>
            #mp-unitconverter .uc-field { flex: 1; min-width: 110px; }
            #mp-unitconverter .uc-result { font-size: 30px; font-weight: 800; color: var(--primary); font-variant-numeric: tabular-nums; word-break: break-word; }
        </style>
        <div class="mp-row" style="align-items: flex-end">
            <div class="uc-field">
                <label class="mp-label" for="mp-unit-value">Value</label>
                <input class="mp-input" id="mp-unit-value" type="number" step="any" value="1" style="width: 100%">
            </div>
            <div class="uc-field">
                <label class="mp-label" for="mp-unit-from">From</label>
                <select class="mp-input" id="mp-unit-from" style="width: 100%">
                    <option value="m">Meter</option>
                    <option value="cm">Centimeter</option>
                    <option value="km">Kilometer</option>
                    <option value="in">Inch</option>
                    <option value="ft">Foot</option>
                    <option value="mi">Mile</option>
                </select>
            </div>
            <button class="mp-icon-btn" id="mp-unit-swap" title="Swap units" aria-label="Swap units">⇄</button>
            <div class="uc-field">
                <label class="mp-label" for="mp-unit-to">To</label>
                <select class="mp-input" id="mp-unit-to" style="width: 100%">
                    <option value="m">Meter</option>
                    <option value="cm">Centimeter</option>
                    <option value="km" selected>Kilometer</option>
                    <option value="in">Inch</option>
                    <option value="ft">Foot</option>
                    <option value="mi">Mile</option>
                </select>
            </div>
        </div>
        <div class="mp-row" style="margin-top: 10px">
            <button class="mp-btn alt sm" data-v="1" data-from="km" data-to="mi">1 km → mi</button>
            <button class="mp-btn alt sm" data-v="1" data-from="mi" data-to="km">1 mi → km</button>
            <button class="mp-btn alt sm" data-v="100" data-from="cm" data-to="m">100 cm → m</button>
            <button class="mp-btn alt sm" data-v="1" data-from="m" data-to="ft">1 m → ft</button>
        </div>
        <div class="mp-out">
            <div class="uc-result" id="mp-unit-result">—</div>
            <div class="mp-sub" id="mp-unit-formula" style="margin-top: 6px"></div>
        </div>
        <div class="mp-row" style="margin-top: 10px">
            <button class="mp-btn ghost sm" id="mp-unit-reset">Reset</button>
        </div>
    </div>`,
    init: function (root) {
        var FACTORS = { m: 1, cm: 0.01, km: 1000, in: 0.0254, ft: 0.3048, mi: 1609.344 };
        var NAMES = { m: 'meters', cm: 'centimeters', km: 'kilometers', in: 'inches', ft: 'feet', mi: 'miles' };

        var valueInput = root.querySelector('#mp-unit-value');
        var fromSel = root.querySelector('#mp-unit-from');
        var toSel = root.querySelector('#mp-unit-to');
        var resultEl = root.querySelector('#mp-unit-result');
        var formulaEl = root.querySelector('#mp-unit-formula');

        function format(n) {
            if (!isFinite(n)) return '0';
            return String(Math.round(n * 1e6) / 1e6);
        }

        function update() {
            var value = parseFloat(valueInput.value);
            if (isNaN(value)) value = 0;
            var from = fromSel.value;
            var to = toSel.value;
            var result = value * FACTORS[from] / FACTORS[to];
            resultEl.textContent = format(result) + ' ' + NAMES[to];
            formulaEl.textContent = format(value) + ' ' + NAMES[from] + ' = ' + format(result) + ' ' + NAMES[to];
        }

        valueInput.addEventListener('input', update);
        fromSel.addEventListener('change', update);
        toSel.addEventListener('change', update);

        root.querySelector('#mp-unit-swap').addEventListener('click', function () {
            var tmp = fromSel.value;
            fromSel.value = toSel.value;
            toSel.value = tmp;
            update();
        });

        root.querySelectorAll('[data-v]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                valueInput.value = btn.getAttribute('data-v');
                fromSel.value = btn.getAttribute('data-from');
                toSel.value = btn.getAttribute('data-to');
                update();
            });
        });

        root.querySelector('#mp-unit-reset').addEventListener('click', function () {
            valueInput.value = '1';
            fromSel.value = 'm';
            toSel.value = 'km';
            update();
        });

        update();
    }
});
