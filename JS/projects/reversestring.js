registerProject({
    id: 'reversestring',
    title: 'Reverse Text',
    desc: 'Reverse the characters or the word order of any text, with live stats and copy buttons.',
    tags: ['Text Tool'],
    markup: `<div class="mp" id="mp-reversestring">
        <style>
            #mp-reversestring .rs-out {
                min-height: 78px; margin-top: 0; white-space: pre-wrap;
                font-size: 14.5px; line-height: 1.6;
            }
            #mp-reversestring .rs-out.rs-empty { color: var(--muted); font-style: italic; }
            #mp-reversestring .rs-stat { font-variant-numeric: tabular-nums; white-space: nowrap; }
            #mp-reversestring .rs-cap { font-size: 12px; color: var(--muted); min-height: 16px; }
        </style>
        <div class="mp-stack">
            <div>
                <label class="mp-label" for="mp-rs-input">Your text</label>
                <textarea class="mp-textarea" id="mp-rs-input" placeholder="Type or paste some text…"></textarea>
            </div>
            <div class="mp-between">
                <div class="mp-row">
                    <button class="mp-btn" id="mp-rs-reverse">Reverse</button>
                    <button class="mp-btn alt" id="mp-rs-sample">Sample</button>
                    <button class="mp-btn ghost" id="mp-rs-clear">Clear</button>
                </div>
                <span class="mp-sub rs-stat" id="mp-rs-stats">0 characters · 0 words</span>
            </div>
            <div class="mp-grid-2">
                <div class="mp-stack" style="gap:8px">
                    <div class="mp-between">
                        <span class="mp-label" style="margin:0">Reversed characters</span>
                        <button class="mp-btn ghost sm" id="mp-rs-copy-chars">Copy</button>
                    </div>
                    <div class="mp-out rs-out rs-empty" id="mp-rs-chars">Output appears here as you type.</div>
                </div>
                <div class="mp-stack" style="gap:8px">
                    <div class="mp-between">
                        <span class="mp-label" style="margin:0">Reversed words</span>
                        <button class="mp-btn ghost sm" id="mp-rs-copy-words">Copy</button>
                    </div>
                    <div class="mp-out rs-out rs-empty" id="mp-rs-words">Output appears here as you type.</div>
                </div>
            </div>
            <div class="rs-cap" id="mp-rs-status">Reversal updates live as you type.</div>
        </div>
    </div>`,
    init: function (root) {
        var input = root.querySelector('#mp-rs-input');
        var chars = root.querySelector('#mp-rs-chars');
        var words = root.querySelector('#mp-rs-words');
        var stats = root.querySelector('#mp-rs-stats');
        var status = root.querySelector('#mp-rs-status');
        var SAMPLE = 'Never odd or even — a man, a plan, a canal, panama!';

        function setOut(el, value) {
            if (value === '') {
                el.classList.add('rs-empty');
                el.textContent = 'Output appears here as you type.';
            } else {
                el.classList.remove('rs-empty');
                el.textContent = value;
            }
        }

        function run() {
            var text = input.value;
            setOut(chars, text.split('').reverse().join(''));
            var trimmed = text.trim();
            setOut(words, trimmed === '' ? '' : trimmed.split(/\s+/).reverse().join(' '));
            var wc = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
            stats.textContent = text.length + ' characters · ' + wc + ' words';
            status.textContent = text.length ? 'Updated.' : 'Reversal updates live as you type.';
        }

        function copy(el, name) {
            var value = el.classList.contains('rs-empty') ? '' : el.textContent;
            if (!value) { status.textContent = 'Nothing to copy yet.'; return; }
            function done() { status.textContent = name + ' copied to clipboard.'; }
            function fail() { status.textContent = 'Copy failed — select and copy manually.'; }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(value).then(done, fail);
            } else {
                var ta = document.createElement('textarea');
                ta.value = value;
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); done(); } catch (e) { fail(); }
                document.body.removeChild(ta);
            }
        }

        root.querySelector('#mp-rs-reverse').addEventListener('click', run);
        input.addEventListener('input', run);
        root.querySelector('#mp-rs-sample').addEventListener('click', function () {
            input.value = SAMPLE;
            run();
            status.textContent = 'Loaded a sample palindrome.';
        });
        root.querySelector('#mp-rs-clear').addEventListener('click', function () {
            input.value = '';
            run();
            input.focus();
            status.textContent = 'Cleared.';
        });
        root.querySelector('#mp-rs-copy-chars').addEventListener('click', function () { copy(chars, 'Reversed characters'); });
        root.querySelector('#mp-rs-copy-words').addEventListener('click', function () { copy(words, 'Reversed words'); });
        run();
    }
});
