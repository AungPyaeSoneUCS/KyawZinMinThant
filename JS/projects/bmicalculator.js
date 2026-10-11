registerProject({
    id: 'bmicalculator',
    title: 'BMI Calculator',
    desc: 'Calculate body mass index with a category gauge and healthy weight range.',
    tags: ['Health', 'Calculator'],
    markup: `
    <div class="mp" id="mp-bmicalculator">
        <style>
            #mp-bmicalculator .bmi-field { flex: 1; min-width: 120px; }
            #mp-bmicalculator .bmi-value { font-size: 34px; font-weight: 800; color: var(--primary); font-variant-numeric: tabular-nums; }
        </style>
        <div class="mp-row">
            <div class="bmi-field">
                <label class="mp-label" for="mp-bmi-weight">Weight (kg)</label>
                <input class="mp-input" id="mp-bmi-weight" type="number" min="0" step="0.1" value="70" style="width: 100%">
            </div>
            <div class="bmi-field">
                <label class="mp-label" for="mp-bmi-height">Height (cm)</label>
                <input class="mp-input" id="mp-bmi-height" type="number" min="0" step="0.1" value="175" style="width: 100%">
            </div>
        </div>
        <div class="mp-out">
            <div class="mp-between">
                <div><span class="bmi-value" id="mp-bmi-value">—</span> <span class="mp-sub">kg/m²</span></div>
                <span class="mp-badge" id="mp-bmi-badge">Awaiting input</span>
            </div>
            <div class="mp-progress" style="margin-top: 12px"><i id="mp-bmi-bar"></i></div>
            <div class="mp-between" style="margin-top: 6px">
                <span class="mp-sub">Underweight</span>
                <span class="mp-sub">Healthy</span>
                <span class="mp-sub">Obese</span>
            </div>
            <div class="mp-grid-2" style="margin-top: 12px">
                <div class="mp-stat"><b id="mp-bmi-low">—</b><span>Healthy min (kg)</span></div>
                <div class="mp-stat"><b id="mp-bmi-high">—</b><span>Healthy max (kg)</span></div>
            </div>
        </div>
        <div class="mp-row" style="margin-top: 10px">
            <button class="mp-btn ghost sm" id="mp-bmi-reset">Reset</button>
            <span class="mp-sub">Assumes adult metric measurements.</span>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-bmicalculator';
        var weightInput = root.querySelector('#mp-bmi-weight');
        var heightInput = root.querySelector('#mp-bmi-height');
        var valueEl = root.querySelector('#mp-bmi-value');
        var badge = root.querySelector('#mp-bmi-badge');
        var bar = root.querySelector('#mp-bmi-bar');
        var lowEl = root.querySelector('#mp-bmi-low');
        var highEl = root.querySelector('#mp-bmi-high');

        try {
            var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (saved) {
                weightInput.value = saved.weight;
                heightInput.value = saved.height;
            }
        } catch (e) { /* ignore */ }

        function save() {
            try {
                localStorage.setItem(KEY, JSON.stringify({ weight: weightInput.value, height: heightInput.value }));
            } catch (e) { /* ignore */ }
        }

        function category(bmi) {
            if (bmi < 18.5) return { label: 'Underweight', cls: ' warn' };
            if (bmi < 25) return { label: 'Normal', cls: ' ok' };
            if (bmi < 30) return { label: 'Overweight', cls: ' warn' };
            return { label: 'Obese', cls: ' err' };
        }

        function update() {
            var kg = parseFloat(weightInput.value);
            var cm = parseFloat(heightInput.value);

            if (isNaN(kg) || isNaN(cm) || kg <= 0 || cm <= 0) {
                valueEl.textContent = '—';
                badge.textContent = 'Awaiting input';
                badge.className = 'mp-badge';
                bar.style.width = '0%';
                lowEl.textContent = highEl.textContent = '—';
                return;
            }

            var m = cm / 100;
            var bmi = kg / (m * m);
            var cat = category(bmi);

            valueEl.textContent = bmi.toFixed(1);
            badge.textContent = cat.label;
            badge.className = 'mp-badge' + cat.cls;

            var pct = (bmi - 10) / 30 * 100;
            bar.style.width = Math.max(0, Math.min(100, pct)) + '%';

            lowEl.textContent = (18.5 * m * m).toFixed(1);
            highEl.textContent = (24.9 * m * m).toFixed(1);
        }

        [weightInput, heightInput].forEach(function (el) {
            el.addEventListener('input', function () { update(); save(); });
        });

        root.querySelector('#mp-bmi-reset').addEventListener('click', function () {
            weightInput.value = '70';
            heightInput.value = '175';
            update();
            save();
        });

        update();
    }
});
