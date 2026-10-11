registerProject({
    id: 'gradientgenerator',
    title: 'Gradient Generator',
    desc: 'Generate a two-color linear gradient, preview it, copy CSS, and persist last gradient.',
    tags: ['UI Component', 'Utility'],
    markup: `
    <div class="mp" id="mp-gradientgenerator">
        <style>
            #mp-gradientgenerator .gg-preview { height: 190px; border-radius: var(--radius-lg); border: 1px solid var(--border); transition: background .3s ease; box-shadow: var(--shadow-sm); }
            #mp-gradientgenerator .gg-code { margin-top: 12px; padding: 12px 14px; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; word-break: break-all; }
            #mp-gradientgenerator .gg-msg { font-size: 12px; min-height: 16px; }
        </style>
        <div class="mp-stack">
            <div class="mp-card mp-stack">
                <div class="mp-title">Gradient Generator</div>
                <div class="mp-sub">Generate, tweak, and copy the CSS.</div>
                <div class="mp-row mp-wrap">
                    <label class="mp-stack" style="gap:4px; flex:1; min-width:120px">
                        <span class="mp-sub">Angle</span>
                        <input class="mp-range" id="mp-gg-angle" type="range" min="0" max="360" value="45">
                    </label>
                    <label class="mp-stack" style="gap:4px">
                        <span class="mp-sub">Color 1</span>
                        <input class="mp-input" id="mp-gg-c1" type="color" value="#4f9bff">
                    </label>
                    <label class="mp-stack" style="gap:4px">
                        <span class="mp-sub">Color 2</span>
                        <input class="mp-input" id="mp-gg-c2" type="color" value="#7af0a4">
                    </label>
                </div>
                <div class="mp-row">
                    <button class="mp-btn" id="mp-gg-regen">Random</button>
                    <button class="mp-btn alt" id="mp-gg-apply">Apply</button>
                    <button class="mp-btn alt" id="mp-gg-copy">Copy CSS</button>
                </div>
            </div>
            <div class="gg-preview" id="mp-gg-preview"></div>
            <div class="gg-code" id="mp-gg-code"></div>
            <div class="mp-muted gg-msg" id="mp-gg-msg"></div>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-gradientgenerator';
        var preview = root.querySelector('#mp-gg-preview');
        var code = root.querySelector('#mp-gg-code');
        var msgEl = root.querySelector('#mp-gg-msg');
        var angleEl = root.querySelector('#mp-gg-angle');
        var c1El = root.querySelector('#mp-gg-c1');
        var c2El = root.querySelector('#mp-gg-c2');
        var regenBtn = root.querySelector('#mp-gg-regen');
        var applyBtn = root.querySelector('#mp-gg-apply');
        var copyBtn = root.querySelector('#mp-gg-copy');
        var css = '';

        function randHex() {
            return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
        }

        function build(angle, c1, c2) {
            return 'linear-gradient(' + angle + 'deg, ' + c1 + ', ' + c2 + ')';
        }

        function update() {
            var angle = angleEl.value;
            var c1 = c1El.value;
            var c2 = c2El.value;
            css = build(angle, c1, c2);
            preview.style.background = css;
            code.textContent = css + ';';
        }

        function save() {
            try {
                localStorage.setItem(KEY, JSON.stringify({ angle: angleEl.value, c1: c1El.value, c2: c2El.value }));
            } catch (e) {}
        }

        function load() {
            try {
                var saved = localStorage.getItem(KEY);
                if (saved) {
                    var s = JSON.parse(saved);
                    if (s.angle !== undefined) angleEl.value = s.angle;
                    if (s.c1) c1El.value = s.c1;
                    if (s.c2) c2El.value = s.c2;
                }
            } catch (e) {}
        }

        function showMsg(text, type) {
            msgEl.textContent = text || '';
            if (type === 'ok') msgEl.style.color = 'var(--ok)';
            else if (type === 'err') msgEl.style.color = 'var(--danger)';
            else msgEl.style.color = 'var(--muted)';
        }

        function randomize() {
            angleEl.value = Math.floor(Math.random() * 361);
            c1El.value = randHex();
            c2El.value = randHex();
            update();
            save();
            showMsg('Random gradient generated', 'ok');
            setTimeout(showMsg, 1000, '');
        }

        function apply() {
            update();
            save();
            showMsg('Applied', 'ok');
            setTimeout(showMsg, 800, '');
        }

        function copy() {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(css + ';').then(function () {
                        showMsg('Copied CSS', 'ok');
                        setTimeout(showMsg, 1000, '');
                    }, function () {
                        showMsg('Copy failed', 'err');
                        setTimeout(showMsg, 1000, '');
                    });
                } else {
                    showMsg('Clipboard unavailable', 'err');
                    setTimeout(showMsg, 1000, '');
                }
            } catch (e) {
                showMsg('Copy failed', 'err');
                setTimeout(showMsg, 1000, '');
            }
        }

        load();
        update();

        regenBtn.addEventListener('click', randomize);
        applyBtn.addEventListener('click', apply);
        copyBtn.addEventListener('click', copy);
        angleEl.addEventListener('input', apply);
        c1El.addEventListener('input', apply);
        c2El.addEventListener('input', apply);

        var cleanup = function () {
            regenBtn.removeEventListener('click', randomize);
            applyBtn.removeEventListener('click', apply);
            copyBtn.removeEventListener('click', copy);
            angleEl.removeEventListener('input', apply);
            c1El.removeEventListener('input', apply);
            c2El.removeEventListener('input', apply);
        };
        return cleanup;
    }
});