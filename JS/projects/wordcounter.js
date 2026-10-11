registerProject({
    id: 'wordcounter',
    title: 'Word Counter',
    desc: 'Live word, character, sentence and reading-time stats with the most frequent words in your text.',
    tags: ['Text Tool', 'Writing'],
    markup: `
    <div class="mp" id="mp-wordcounter">
        <style>
            #mp-wordcounter .wc-text { width: 100%; min-height: 140px; }
            #mp-wordcounter .wc-stats { margin-top: 12px; }
            #mp-wordcounter .wc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
            #mp-wordcounter .wc-empty { color: var(--muted); font-size: 13px; }
        </style>
        <textarea class="mp-input wc-text" id="mp-wc-text" placeholder="Type or paste your text here…"></textarea>
        <div class="mp-grid-3 wc-stats">
            <div class="mp-stat"><b id="mp-wc-words">0</b><span>Words</span></div>
            <div class="mp-stat"><b id="mp-wc-chars">0</b><span>Characters</span></div>
            <div class="mp-stat"><b id="mp-wc-nospace">0</b><span>No spaces</span></div>
            <div class="mp-stat"><b id="mp-wc-sent">0</b><span>Sentences</span></div>
            <div class="mp-stat"><b id="mp-wc-para">0</b><span>Paragraphs</span></div>
            <div class="mp-stat"><b id="mp-wc-read">0s</b><span>Reading time</span></div>
        </div>
        <div class="mp-out">
            <div class="mp-between">
                <span class="mp-label" style="margin:0">Top words</span>
                <button class="mp-btn ghost sm" id="mp-wc-clear">Clear</button>
            </div>
            <div class="wc-tags" id="mp-wc-top"><span class="wc-empty">Start typing to see word frequency.</span></div>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-wordcounter';
        var ta = root.querySelector('#mp-wc-text');
        var elWords = root.querySelector('#mp-wc-words');
        var elChars = root.querySelector('#mp-wc-chars');
        var elNoSpace = root.querySelector('#mp-wc-nospace');
        var elSent = root.querySelector('#mp-wc-sent');
        var elPara = root.querySelector('#mp-wc-para');
        var elRead = root.querySelector('#mp-wc-read');
        var elTop = root.querySelector('#mp-wc-top');

        function readingTime(words) {
            if (!words) return '0s';
            var seconds = Math.round((words / 200) * 60);
            if (seconds < 60) return seconds + 's';
            var mins = Math.floor(seconds / 60);
            var rem = seconds % 60;
            return mins + 'm ' + rem + 's';
        }

        function renderTop(words) {
            elTop.textContent = '';
            var counts = {};
            words.forEach(function (w) {
                var key = w.toLowerCase().replace(/[^a-z0-9']/g, '');
                if (!key) return;
                counts[key] = (counts[key] || 0) + 1;
            });
            var ranked = Object.keys(counts).map(function (k) { return [k, counts[k]]; });
            ranked.sort(function (x, y) { return y[1] - x[1]; });
            ranked = ranked.slice(0, 5);
            if (!ranked.length) {
                var empty = document.createElement('span');
                empty.className = 'wc-empty';
                empty.textContent = 'Start typing to see word frequency.';
                elTop.appendChild(empty);
                return;
            }
            ranked.forEach(function (pair) {
                var chip = document.createElement('span');
                chip.className = 'mp-chip';
                chip.textContent = pair[0] + ' ×' + pair[1];
                elTop.appendChild(chip);
            });
        }

        function save() {
            try { localStorage.setItem(KEY, ta.value); } catch (e) { /* ignore */ }
        }

        function update() {
            var text = ta.value;
            var words = text.trim() ? text.trim().split(/\s+/) : [];
            elWords.textContent = words.length;
            elChars.textContent = text.length;
            elNoSpace.textContent = text.replace(/\s/g, '').length;
            var sentences = text.trim() ? text.split(/[.!?]+/).filter(function (s) { return s.trim().length; }).length : 0;
            elSent.textContent = sentences;
            var paragraphs = text.trim() ? text.split(/\n+/).filter(function (s) { return s.trim().length; }).length : 0;
            elPara.textContent = paragraphs;
            elRead.textContent = readingTime(words.length);
            renderTop(words);
            save();
        }

        ta.addEventListener('input', update);

        root.querySelector('#mp-wc-clear').addEventListener('click', function () {
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
