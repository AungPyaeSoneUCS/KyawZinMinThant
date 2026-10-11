registerProject({
    id: 'passwordgenerator',
    title: 'Password Generator',
    desc: 'Generate a strong random password with adjustable length, character sets and a live strength meter.',
    tags: ['Security', 'Utility'],
    markup: `
    <div class="mp" id="mp-passwordgenerator">
        <style>
            #mp-passwordgenerator .pw-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 6px; }
            #mp-passwordgenerator .pw-len { display: flex; align-items: center; gap: 10px; }
            #mp-passwordgenerator .pw-len input[type=range] { flex: 1; }
            #mp-passwordgenerator .pw-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin: 14px 0; }
            #mp-passwordgenerator .pw-opt { display: flex; gap: 7px; align-items: center; font-size: 13px; color: var(--text); cursor: pointer; }
            #mp-passwordgenerator .pw-opt input { accent-color: var(--primary); }
            #mp-passwordgenerator .pw-out {
                font-family: Consolas, "Courier New", monospace; font-size: 17px; font-weight: 700;
                word-break: break-all; color: var(--primary); min-height: 24px;
            }
            #mp-passwordgenerator .pw-meter { margin-top: 12px; }
            #mp-passwordgenerator .pw-meta { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 7px; font-size: 12.5px; color: var(--muted); }
        </style>
        <div class="pw-head">
            <label class="mp-label" for="mp-pw-len" style="margin:0">Length</label>
            <span class="mp-chip" id="mp-pw-lenval">16</span>
        </div>
        <div class="pw-len">
            <input class="mp-range" id="mp-pw-len" type="range" min="4" max="64" value="16">
        </div>
        <div class="pw-opts">
            <label class="pw-opt"><input type="checkbox" id="mp-pw-upper" checked> Uppercase</label>
            <label class="pw-opt"><input type="checkbox" id="mp-pw-lower" checked> Lowercase</label>
            <label class="pw-opt"><input type="checkbox" id="mp-pw-num" checked> Numbers</label>
            <label class="pw-opt"><input type="checkbox" id="mp-pw-sym"> Symbols</label>
            <label class="pw-opt"><input type="checkbox" id="mp-pw-simple"> Avoid look-alikes</label>
            <label class="pw-opt"><input type="checkbox" id="mp-pw-noamb" checked> Guarantee one of each</label>
        </div>
        <div class="mp-row">
            <button class="mp-btn" id="mp-pw-gen">Generate</button>
            <button class="mp-btn alt" id="mp-pw-copy">Copy</button>
        </div>
        <div class="mp-out">
            <div class="pw-out" id="mp-pw-out">—</div>
            <div class="pw-meter">
                <div class="mp-progress"><i id="mp-pw-bar"></i></div>
                <div class="pw-meta">
                    <span id="mp-pw-str">Select options and generate.</span>
                    <span class="mp-badge" id="mp-pw-badge">—</span>
                </div>
            </div>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-passwordgenerator';
        var len = root.querySelector('#mp-pw-len');
        var lenVal = root.querySelector('#mp-pw-lenval');
        var out = root.querySelector('#mp-pw-out');
        var bar = root.querySelector('#mp-pw-bar');
        var str = root.querySelector('#mp-pw-str');
        var badge = root.querySelector('#mp-pw-badge');
        var opts = {
            upper: root.querySelector('#mp-pw-upper'),
            lower: root.querySelector('#mp-pw-lower'),
            num: root.querySelector('#mp-pw-num'),
            sym: root.querySelector('#mp-pw-sym')
        };
        var simple = root.querySelector('#mp-pw-simple');
        var unique = root.querySelector('#mp-pw-noamb');
        var copyTimer = null;
        var baseStatus = 'Select options and generate.';

        var sets = {
            upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lower: 'abcdefghijklmnopqrstuvwxyz',
            num: '0123456789',
            sym: '!@#$%^&*()-_=+[]{};:,.?'
        };
        var ambiguous = 'O0oIl1|';

        function rand(n) {
            if (window.crypto && window.crypto.getRandomValues) {
                var arr = new Uint32Array(1);
                window.crypto.getRandomValues(arr);
                return arr[0] % n;
            }
            return Math.floor(Math.random() * n);
        }

        function clean(s) {
            if (!simple.checked) return s;
            var result = '';
            for (var i = 0; i < s.length; i++) {
                if (ambiguous.indexOf(s[i]) === -1) result += s[i];
            }
            return result;
        }

        function selectedSets() {
            var groups = [];
            for (var k in sets) {
                if (opts[k] && opts[k].checked) {
                    var value = clean(sets[k]);
                    if (value) groups.push(value);
                }
            }
            return groups;
        }

        function shuffle(arr) {
            for (var i = arr.length - 1; i > 0; i--) {
                var j = rand(i + 1);
                var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
            }
            return arr;
        }

        function save() {
            try {
                localStorage.setItem(KEY, JSON.stringify({
                    len: len.value,
                    upper: opts.upper.checked,
                    lower: opts.lower.checked,
                    num: opts.num.checked,
                    sym: opts.sym.checked,
                    simple: simple.checked,
                    unique: unique.checked
                }));
            } catch (e) { /* ignore */ }
        }

        function strength(pw, poolSize) {
            var bits = pw.length * (Math.log(poolSize) / Math.log(2));
            var pct = Math.max(4, Math.min(100, Math.round((bits / 128) * 100)));
            var level, cls, color;
            if (bits < 45) { level = 'Weak'; cls = 'err'; color = 'var(--danger)'; }
            else if (bits < 80) { level = 'Medium'; cls = 'warn'; color = 'var(--warn)'; }
            else { level = 'Strong'; cls = 'ok'; color = 'var(--ok)'; }
            return { pct: pct, level: level, cls: cls, color: color, bits: bits };
        }

        function generate() {
            var groups = selectedSets();
            if (!groups.length) {
                out.textContent = '—';
                bar.style.width = '0';
                badge.className = 'mp-badge';
                badge.textContent = '—';
                baseStatus = 'Select at least one character type.';
                str.textContent = baseStatus;
                return;
            }
            var pool = '';
            for (var g = 0; g < groups.length; g++) pool += groups[g];
            var n = parseInt(len.value, 10) || 16;
            var chars = [];
            if (unique.checked) {
                for (var q = 0; q < groups.length && q < n; q++) chars.push(groups[q][rand(groups[q].length)]);
            }
            while (chars.length < n) chars.push(pool[rand(pool.length)]);
            shuffle(chars);
            var pw = chars.join('');
            out.textContent = pw;

            var s = strength(pw, pool.length);
            bar.style.width = s.pct + '%';
            bar.style.background = s.color;
            badge.className = 'mp-badge ' + s.cls;
            badge.textContent = s.level;
            baseStatus = pw.length + ' characters · about ' + Math.round(s.bits) + ' bits of entropy';
            str.textContent = baseStatus;
            save();
        }

        function copy() {
            var text = out.textContent;
            if (!text || text === '—') return;
            var done = function () {
                if (copyTimer) clearTimeout(copyTimer);
                str.textContent = 'Copied to clipboard!';
                copyTimer = setTimeout(function () {
                    copyTimer = null;
                    str.textContent = baseStatus;
                }, 1400);
            };
            var fallback = function () {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                root.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); done(); } catch (e) { str.textContent = 'Copy failed.'; }
                root.removeChild(ta);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, fallback);
            } else {
                fallback();
            }
        }

        len.addEventListener('input', function () {
            lenVal.textContent = len.value;
            generate();
        });
        [opts.upper, opts.lower, opts.num, opts.sym, simple, unique].forEach(function (el) {
            el.addEventListener('change', generate);
        });
        root.querySelector('#mp-pw-gen').addEventListener('click', generate);
        root.querySelector('#mp-pw-copy').addEventListener('click', copy);

        try {
            var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (saved) {
                if (saved.len) len.value = saved.len;
                opts.upper.checked = saved.upper !== false;
                opts.lower.checked = saved.lower !== false;
                opts.num.checked = saved.num !== false;
                opts.sym.checked = !!saved.sym;
                simple.checked = !!saved.simple;
                unique.checked = saved.unique !== false;
            }
        } catch (e) { /* ignore */ }

        lenVal.textContent = len.value;
        generate();

        return function cleanup() {
            if (copyTimer) clearTimeout(copyTimer);
        };
    }
});
