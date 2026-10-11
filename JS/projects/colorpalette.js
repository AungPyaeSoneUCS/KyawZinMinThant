registerProject({
    id: 'colorpalette',
    title: 'Color Palette',
    desc: 'Generate up to 6 colors, copy hex values, lock favorites and persist to localStorage.',
    tags: ['UI Component', 'Utility'],
    markup: `
    <div class="mp" id="mp-colorpalette">
        <style>
            #mp-colorpalette .cp-swatches { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
            #mp-colorpalette .cp-swatch { border-radius: var(--radius); overflow: hidden; cursor: pointer; border: 1px solid var(--border); text-align: center; background: var(--surface); box-shadow: var(--shadow-sm); transition: .15s; }
            #mp-colorpalette .cp-swatch:hover { box-shadow: var(--shadow); }
            #mp-colorpalette .cp-chip { height: 110px; position: relative; }
            #mp-colorpalette .cp-lock { position: absolute; right: 6px; top: 6px; background: rgba(0,0,0,.4); color: #fff; border: 0; border-radius: 6px; padding: 2px 6px; font-size: 11px; cursor: pointer; }
            #mp-colorpalette .cp-hex { padding: 8px 4px; font-size: 12px; font-weight: 700; font-family: ui-monospace, Menlo, Consolas, monospace; background: var(--surface); }
            #mp-colorpalette .cp-msg { font-size: 12px; min-height: 16px; }
        </style>
        <div class="mp-stack">
            <div class="mp-card mp-stack">
                <div class="mp-title">Color Palette</div>
                <div class="mp-sub">Click a swatch to copy hex. Lock colors to keep them.</div>
                <div class="mp-row mp-wrap">
                    <label class="mp-stack" style="gap:4px">
                        <span class="mp-sub">Count</span>
                        <select class="mp-select" id="mp-cp-count">
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5" selected>5</option>
                            <option value="6">6</option>
                        </select>
                    </label>
                    <button class="mp-btn" id="mp-cp-regen">Regenerate Unlocked</button>
                    <button class="mp-btn alt" id="mp-cp-randall">Regenerate All</button>
                </div>
                <div class="mp-muted cp-msg" id="mp-cp-msg">Click a swatch to copy its hex.</div>
            </div>
            <div class="cp-swatches" id="mp-cp-swatches"></div>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-colorpalette';
        var swatchesEl = root.querySelector('#mp-cp-swatches');
        var msgEl = root.querySelector('#mp-cp-msg');
        var regenBtn = root.querySelector('#mp-cp-regen');
        var randallBtn = root.querySelector('#mp-cp-randall');
        var countEl = root.querySelector('#mp-cp-count');
        var state = [];

        function randHex() {
            return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
        }

        function save() {
            try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
        }

        function load() {
            try {
                var saved = localStorage.getItem(KEY);
                if (saved) {
                    var s = JSON.parse(saved);
                    if (Array.isArray(s)) state = s.map(function (x) { return { color: x.color || randHex(), locked: !!x.locked }; });
                }
            } catch (e) {}
        }

        function showMsg(text, type) {
            msgEl.textContent = text || '';
            if (type === 'ok') msgEl.style.color = 'var(--ok)';
            else if (type === 'err') msgEl.style.color = 'var(--danger)';
            else msgEl.style.color = 'var(--muted)';
        }

        function copy(text) {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function () {
                        showMsg('Copied ' + text, 'ok');
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

        function render() {
            while (swatchesEl.firstChild) swatchesEl.removeChild(swatchesEl.firstChild);
            for (var i = 0; i < state.length; i++) {
                var it = state[i];
                var sw = document.createElement('div');
                sw.className = 'cp-swatch';
                var chip = document.createElement('div');
                chip.className = 'cp-chip';
                chip.style.background = it.color;
                var lockBtn = document.createElement('button');
                lockBtn.className = 'cp-lock';
                lockBtn.textContent = it.locked ? 'Unlock' : 'Lock';
                lockBtn.addEventListener('click', toggleLock.bind(null, i));
                var hex = document.createElement('div');
                hex.className = 'cp-hex';
                hex.textContent = it.color;
                sw.addEventListener('click', copy.bind(null, it.color));
                chip.appendChild(lockBtn);
                sw.appendChild(chip);
                sw.appendChild(hex);
                swatchesEl.appendChild(sw);
            }
        }

        function toggleLock(idx) {
            if (idx < 0 || idx >= state.length) return;
            state[idx].locked = !state[idx].locked;
            save();
            render();
        }

        function regen(keepLocked) {
            var count = parseInt(countEl.value, 10) || 5;
            if (keepLocked) {
                if (state.length !== count) {
                    var newState = [];
                    for (var i = 0; i < count; i++) {
                        if (state[i] && state[i].locked) newState.push({ color: state[i].color, locked: true });
                        else newState.push({ color: randHex(), locked: false });
                    }
                    state = newState;
                } else {
                    for (var j = 0; j < state.length; j++) {
                        if (!state[j].locked) state[j].color = randHex();
                    }
                }
            } else {
                state = [];
                for (var k = 0; k < count; k++) state.push({ color: randHex(), locked: false });
            }
            save();
            render();
            showMsg(keepLocked ? 'Regenerated unlocked colors' : 'Generated new palette', 'ok');
            setTimeout(showMsg, 1000, '');
        }

        load();
        if (state.length === 0) regen(false);

        regenBtn.addEventListener('click', function () { regen(true); });
        randallBtn.addEventListener('click', function () { regen(false); });

        render();
        var cleanup = function () {
            regenBtn.removeEventListener('click', function () { regen(true); });
            randallBtn.removeEventListener('click', function () { regen(false); });
        };
        return cleanup;
    }
});