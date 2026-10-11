registerProject({
    id: 'vowelcounter',
    title: 'Vowel Counter',
    desc: 'Count each vowel plus totals for vowels, consonants and other characters in your text.',
    tags: ['Text Tool'],
    markup: `
    <div class="mp" id="mp-vowelcounter">
        <style>
            #mp-vowelcounter .vc-text { width: 100%; min-height: 120px; }
            #mp-vowelcounter .vc-tiles { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
            #mp-vowelcounter .vc-tile { text-align: center; padding: 10px 6px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--border); }
            #mp-vowelcounter .vc-tile b { display: block; font-size: 20px; color: var(--primary); }
            #mp-vowelcounter .vc-tile span { font-size: 12px; color: var(--muted); text-transform: uppercase; }
            #mp-vowelcounter .vc-totals { margin-top: 12px; }
        </style>
        <textarea class="mp-input vc-text" id="mp-vc-text" placeholder="Type or paste text here…"></textarea>
        <div class="vc-tiles">
            <div class="vc-tile"><b data-v="a">0</b><span>a</span></div>
            <div class="vc-tile"><b data-v="e">0</b><span>e</span></div>
            <div class="vc-tile"><b data-v="i">0</b><span>i</span></div>
            <div class="vc-tile"><b data-v="o">0</b><span>o</span></div>
            <div class="vc-tile"><b data-v="u">0</b><span>u</span></div>
        </div>
        <div class="mp-grid-3 vc-totals">
            <div class="mp-stat"><b id="mp-vc-totalv">0</b><span>Vowels</span></div>
            <div class="mp-stat"><b id="mp-vc-cons">0</b><span>Consonants</span></div>
            <div class="mp-stat"><b id="mp-vc-other">0</b><span>Other</span></div>
        </div>
        <div class="mp-row" style="margin-top:12px">
            <button class="mp-btn alt" id="mp-vc-example">Example</button>
            <button class="mp-btn ghost" id="mp-vc-clear">Clear</button>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-vowelcounter';
        var ta = root.querySelector('#mp-vc-text');
        var totalV = root.querySelector('#mp-vc-totalv');
        var cons = root.querySelector('#mp-vc-cons');
        var other = root.querySelector('#mp-vc-other');
        var cells = {
            a: root.querySelector('[data-v="a"]'),
            e: root.querySelector('[data-v="e"]'),
            i: root.querySelector('[data-v="i"]'),
            o: root.querySelector('[data-v="o"]'),
            u: root.querySelector('[data-v="u"]')
        };

        function save() {
            try { localStorage.setItem(KEY, ta.value); } catch (e) { /* ignore */ }
        }

        function update() {
            var text = ta.value.toLowerCase();
            var counts = { a: 0, e: 0, i: 0, o: 0, u: 0 };
            var total = 0;
            var consonants = 0;
            for (var i = 0; i < text.length; i++) {
                var ch = text[i];
                if (counts.hasOwnProperty(ch)) { counts[ch]++; total++; }
                else if (/[a-z]/.test(ch)) consonants++;
            }
            for (var k in cells) cells[k].textContent = counts[k];
            totalV.textContent = total;
            cons.textContent = consonants;
            other.textContent = ta.value.length - total - consonants;
            save();
        }

        ta.addEventListener('input', update);

        root.querySelector('#mp-vc-example').addEventListener('click', function () {
            ta.value = 'The quick brown fox jumps over the lazy dog.';
            update();
        });
        root.querySelector('#mp-vc-clear').addEventListener('click', function () {
            ta.value = '';
            try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
            update();
            ta.focus();
        });

        try {
            var saved = localStorage.getItem(KEY);
            if (saved) ta.value = saved;
        } catch (e) { /* ignore */ }

        update();
    }
});
