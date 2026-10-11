registerProject({
    id: 'typingspeed',
    title: 'Typing Speed Test',
    desc: 'Type a sentence against the clock and measure your words per minute and accuracy.',
    tags: ['Game', 'Typing'],
    markup: `<div class="mp" id="mp-typingspeed">
        <style>
            #mp-typingspeed .ts-sentence {
                padding: 14px 16px; border-radius: var(--radius); font-size: 15px; line-height: 1.8;
                background: var(--surface-2); border: 1px solid var(--border);
            }
            #mp-typingspeed .ts-sentence .ts-ok { color: var(--ok); }
            #mp-typingspeed .ts-sentence .ts-bad { color: var(--danger); text-decoration: underline; }
            #mp-typingspeed .ts-live { font-variant-numeric: tabular-nums; font-weight: 700; color: var(--primary); }
            #mp-typingspeed .ts-best { font-variant-numeric: tabular-nums; color: var(--primary); }
        </style>
        <div class="mp-stack">
            <div class="ts-sentence" id="mp-ts-sentence"></div>
            <textarea class="mp-textarea" id="mp-ts-input" placeholder="Type the sentence above, exactly as shown…"></textarea>
            <div class="mp-between">
                <div class="mp-row">
                    <button class="mp-btn" id="mp-ts-submit">Submit</button>
                    <button class="mp-btn alt" id="mp-ts-new">New sentence</button>
                </div>
                <span class="mp-sub"><span class="ts-live" id="mp-ts-time">0.0s</span> · best <b class="ts-best" id="mp-ts-best">—</b> wpm</span>
            </div>
            <div class="mp-progress"><i id="mp-ts-bar"></i></div>
            <div class="mp-grid-3">
                <div class="mp-stat"><b id="mp-ts-wpm">0</b><span>Words / min</span></div>
                <div class="mp-stat"><b id="mp-ts-acc">100%</b><span>Accuracy</span></div>
                <div class="mp-stat"><b id="mp-ts-done">0%</b><span>Progress</span></div>
            </div>
            <div class="mp-out" id="mp-ts-result">Start typing — the timer begins automatically.</div>
        </div>
    </div>`,
    init: function (root) {
        var SENTENCES = [
            'The quick brown fox jumps over the lazy dog near the river.',
            'A journey of a thousand miles begins with a single step.',
            'Code is like humor; when you have to explain it, it is bad.',
            'Simplicity is the ultimate sophistication in good design.',
            'The best way to predict the future is to invent it today.',
            'Keep your eyes on the stars and your feet on the ground.'
        ];
        var KEY = 'mp-typing-best';
        var sentenceEl = root.querySelector('#mp-ts-sentence');
        var input = root.querySelector('#mp-ts-input');
        var timeEl = root.querySelector('#mp-ts-time');
        var bestEl = root.querySelector('#mp-ts-best');
        var barEl = root.querySelector('#mp-ts-bar');
        var wpmEl = root.querySelector('#mp-ts-wpm');
        var accEl = root.querySelector('#mp-ts-acc');
        var doneEl = root.querySelector('#mp-ts-done');
        var result = root.querySelector('#mp-ts-result');
        var current = '';
        var start = null;
        var timer = null;
        var best = 0;

        try { best = parseInt(localStorage.getItem(KEY), 10) || 0; } catch (e) { best = 0; }
        bestEl.textContent = best > 0 ? String(best) : '—';

        function saveBest(wpm) {
            if (wpm <= best) return;
            best = wpm;
            bestEl.textContent = String(best);
            try { localStorage.setItem(KEY, String(best)); } catch (e) { /* ignore */ }
        }

        function accuracy(typed) {
            var correct = 0;
            var len = Math.max(typed.length, 1);
            for (var i = 0; i < typed.length; i++) {
                if (typed.charAt(i) === current.charAt(i)) correct++;
            }
            return Math.round((correct / len) * 100);
        }

        function paintSentence(typed) {
            sentenceEl.textContent = '';
            for (var i = 0; i < current.length; i++) {
                var span = document.createElement('span');
                span.textContent = current.charAt(i);
                if (i < typed.length) span.className = typed.charAt(i) === current.charAt(i) ? 'ts-ok' : 'ts-bad';
                sentenceEl.appendChild(span);
            }
        }

        function tick() {
            var elapsed = start ? Date.now() - start : 0;
            timeEl.textContent = (elapsed / 1000).toFixed(1) + 's';
        }

        function onInput() {
            if (start === null && input.value.length > 0) {
                start = Date.now();
                timer = setInterval(tick, 100);
            }
            var typed = input.value;
            paintSentence(typed);
            var pct = Math.min(100, Math.round((typed.length / current.length) * 100));
            barEl.style.width = pct + '%';
            doneEl.textContent = pct + '%';
            accEl.textContent = accuracy(typed) + '%';
            if (start !== null) {
                var minutes = (Date.now() - start) / 60000;
                var trimmed = typed.trim();
                var words = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
                wpmEl.textContent = String(minutes > 0 ? Math.round(words / minutes) : 0);
            }
        }

        function stopTimer() {
            if (timer !== null) { clearInterval(timer); timer = null; }
        }

        function pickSentence() {
            var next = current;
            while (next === current) next = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
            return next;
        }

        function reset() {
            stopTimer();
            start = null;
            current = pickSentence();
            input.value = '';
            result.textContent = 'Start typing — the timer begins automatically.';
            timeEl.textContent = '0.0s';
            wpmEl.textContent = '0';
            accEl.textContent = '100%';
            doneEl.textContent = '0%';
            barEl.style.width = '0%';
            paintSentence('');
            input.disabled = false;
            input.focus();
        }

        function submit() {
            var typed = input.value;
            if (start === null || typed.trim() === '') {
                result.textContent = 'Type the sentence first, then press Submit.';
                return;
            }
            var elapsedMs = Date.now() - start;
            stopTimer();
            input.disabled = true;
            timeEl.textContent = (elapsedMs / 1000).toFixed(1) + 's';
            var minutes = elapsedMs / 60000;
            var words = typed.trim().split(/\s+/).length;
            var wpm = minutes > 0 ? Math.round(words / minutes) : 0;
            var acc = accuracy(typed);
            wpmEl.textContent = String(wpm);
            accEl.textContent = acc + '%';
            saveBest(wpm);
            result.textContent = 'Done in ' + (elapsedMs / 1000).toFixed(1) + 's — ' + wpm +
                ' wpm at ' + acc + '% accuracy.' + (acc < 100 ? ' Tip: focus on accuracy first, speed follows.' : ' Perfect run!');
        }

        root.querySelector('#mp-ts-submit').addEventListener('click', submit);
        root.querySelector('#mp-ts-new').addEventListener('click', function () {
            reset();
            result.textContent = 'New sentence loaded. Start typing!';
        });
        input.addEventListener('input', onInput);
        reset();

        return function () {
            stopTimer();
        };
    }
});
