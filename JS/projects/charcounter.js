registerProject({
    id: 'charcounter',
    title: 'Character Counter',
    desc: 'Track used and remaining characters against a maximum, with quick presets and an over-limit warning.',
    tags: ['Text Tool', 'Writing'],
    markup: `
    <div class="mp" id="mp-charcounter">
        <style>
            #mp-charcounter .cc-text { width: 100%; min-height: 130px; }
            #mp-charcounter .cc-top { margin-bottom: 10px; }
            #mp-charcounter .cc-max { width: 110px; }
            #mp-charcounter .cc-presets { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
            #mp-charcounter .cc-preset { border: 0; cursor: pointer; font: inherit; transition: transform .15s; }
            #mp-charcounter .cc-preset:hover { transform: translateY(-1px); }
            #mp-charcounter .cc-bar { margin-top: 12px; }
            #mp-charcounter .cc-bar.cc-over > i { background: var(--danger); }
            #mp-charcounter .cc-nums { font-size: 13px; color: var(--muted); margin-top: 8px; }
        </style>
        <div class="mp-row cc-top">
            <label class="mp-label" for="mp-cc-max" style="margin:0">Max length</label>
            <input class="mp-input cc-max" id="mp-cc-max" type="number" min="1" value="200">
            <span class="mp-badge" id="mp-cc-badge">Within limit</span>
        </div>
        <div class="cc-presets">
            <button class="mp-chip cc-preset" type="button" data-max="140">140 tweet</button>
            <button class="mp-chip cc-preset" type="button" data-max="280">280</button>
            <button class="mp-chip cc-preset" type="button" data-max="500">500</button>
            <button class="mp-chip cc-preset" type="button" data-max="1000">1000</button>
            <button class="mp-btn ghost sm" id="mp-cc-clear">Clear</button>
        </div>
        <textarea class="mp-input cc-text" id="mp-cc-text" placeholder="Start typing…"></textarea>
        <div class="mp-progress cc-bar" id="mp-cc-bar"><i id="mp-cc-fill"></i></div>
        <div class="cc-nums" id="mp-cc-nums">0 used · 200 remaining</div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-charcounter';
        var ta = root.querySelector('#mp-cc-text');
        var maxIn = root.querySelector('#mp-cc-max');
        var fill = root.querySelector('#mp-cc-fill');
        var bar = root.querySelector('#mp-cc-bar');
        var nums = root.querySelector('#mp-cc-nums');
        var badge = root.querySelector('#mp-cc-badge');

        function save() {
            try { localStorage.setItem(KEY, JSON.stringify({ max: maxIn.value, text: ta.value })); } catch (e) { /* ignore */ }
        }

        function update() {
            var max = Math.max(1, parseInt(maxIn.value, 10) || 1);
            var used = ta.value.length;
            var remaining = max - used;
            var pct = Math.min(100, (used / max) * 100);
            fill.style.width = pct + '%';
            var over = used > max;
            var near = !over && used >= max * 0.9;
            bar.classList.toggle('cc-over', over);
            badge.className = 'mp-badge' + (over ? ' err' : (near ? ' warn' : ''));
            badge.textContent = over ? 'Over limit' : (near ? 'Almost full' : 'Within limit');
            nums.textContent = used + ' used · ' + remaining + ' remaining' + (over ? ' (over limit)' : '');
            save();
        }

        ta.addEventListener('input', update);
        maxIn.addEventListener('input', update);

        Array.prototype.forEach.call(root.querySelectorAll('.cc-preset'), function (btn) {
            btn.addEventListener('click', function () {
                maxIn.value = btn.getAttribute('data-max');
                update();
            });
        });

        root.querySelector('#mp-cc-clear').addEventListener('click', function () {
            ta.value = '';
            try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
            update();
            ta.focus();
        });

        try {
            var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (saved) {
                if (saved.max) maxIn.value = saved.max;
                if (saved.text) ta.value = saved.text;
            }
        } catch (e) { /* ignore */ }

        update();
    }
});
