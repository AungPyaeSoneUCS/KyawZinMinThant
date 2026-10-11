registerProject({
    id: 'temperatureconverter',
    title: 'Temperature Converter',
    desc: 'Convert Celsius, Fahrenheit and Kelvin in real time with quick reference presets.',
    tags: ['Converter', 'Science'],
    markup: `
    <div class="mp" id="mp-temperatureconverter">
        <style>
            #mp-temperatureconverter .tc-field { flex: 1; min-width: 130px; }
        </style>
        <div class="mp-row">
            <div class="tc-field">
                <label class="mp-label" for="mp-temp-c">Celsius (°C)</label>
                <input class="mp-input" id="mp-temp-c" type="number" step="any" value="0" style="width: 100%">
            </div>
            <div class="tc-field">
                <label class="mp-label" for="mp-temp-f">Fahrenheit (°F)</label>
                <input class="mp-input" id="mp-temp-f" type="number" step="any" value="32" style="width: 100%">
            </div>
            <div class="tc-field">
                <label class="mp-label" for="mp-temp-k">Kelvin (K)</label>
                <input class="mp-input" id="mp-temp-k" type="number" step="any" value="273.15" style="width: 100%">
            </div>
        </div>
        <div class="mp-row" style="margin-top: 10px">
            <button class="mp-btn alt sm" data-c="-40">-40°</button>
            <button class="mp-btn alt sm" data-c="0">Freezing</button>
            <button class="mp-btn alt sm" data-c="37">Body</button>
            <button class="mp-btn alt sm" data-c="100">Boiling</button>
        </div>
        <div class="mp-out">
            <div class="mp-between">
                <span class="mp-sub">Reading</span>
                <span class="mp-badge" id="mp-tc-badge">—</span>
            </div>
            <div class="mp-sub" id="mp-tc-note" style="margin-top: 6px">Type in any field to convert.</div>
        </div>
        <div class="mp-row" style="margin-top: 10px">
            <button class="mp-btn ghost sm" id="mp-tc-reset">Reset</button>
        </div>
    </div>`,
    init: function (root) {
        var c = root.querySelector('#mp-temp-c');
        var f = root.querySelector('#mp-temp-f');
        var k = root.querySelector('#mp-temp-k');
        var badge = root.querySelector('#mp-tc-badge');
        var note = root.querySelector('#mp-tc-note');
        var presetBtns = root.querySelectorAll('[data-c]');

        function round(n) { return Math.round(n * 100) / 100; }

        function status(celsius) {
            if (celsius <= -273.15) return { label: 'Below absolute zero', cls: ' err' };
            if (celsius <= 0) return { label: 'Freezing', cls: ' warn' };
            if (celsius <= 15) return { label: 'Cold', cls: ' warn' };
            if (celsius <= 25) return { label: 'Mild', cls: ' ok' };
            if (celsius <= 35) return { label: 'Warm', cls: '' };
            return { label: 'Hot', cls: ' err' };
        }

        function paint(celsius) {
            if (isNaN(celsius)) {
                badge.textContent = '—';
                badge.className = 'mp-badge';
                note.textContent = 'Type in any field to convert.';
                return;
            }
            var st = status(celsius);
            badge.textContent = st.label;
            badge.className = 'mp-badge' + st.cls;
            note.textContent = round(celsius) + ' °C is the reference point for this reading.';
        }

        function fromC() {
            var v = parseFloat(c.value);
            if (isNaN(v)) { f.value = ''; k.value = ''; paint(NaN); return; }
            f.value = round(v * 9 / 5 + 32);
            k.value = round(v + 273.15);
            paint(v);
        }

        function fromF() {
            var v = parseFloat(f.value);
            if (isNaN(v)) { c.value = ''; k.value = ''; paint(NaN); return; }
            var celsius = (v - 32) * 5 / 9;
            c.value = round(celsius);
            k.value = round(celsius + 273.15);
            paint(celsius);
        }

        function fromK() {
            var v = parseFloat(k.value);
            if (isNaN(v)) { c.value = ''; f.value = ''; paint(NaN); return; }
            var celsius = v - 273.15;
            c.value = round(celsius);
            f.value = round(celsius * 9 / 5 + 32);
            paint(celsius);
        }

        c.addEventListener('input', fromC);
        f.addEventListener('input', fromF);
        k.addEventListener('input', fromK);

        presetBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                c.value = btn.getAttribute('data-c');
                fromC();
            });
        });

        root.querySelector('#mp-tc-reset').addEventListener('click', function () {
            c.value = '0';
            fromC();
        });

        paint(parseFloat(c.value));
    }
});
