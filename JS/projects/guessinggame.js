registerProject({
    id: 'guessinggame',
    title: 'Number Guessing Game',
    desc: 'Guess the secret number across three difficulty levels with hints, history and best scores.',
    tags: ['Game'],
    markup: `<div class="mp" id="mp-guessinggame">
        <style>
            #mp-guessinggame .gg-feedback { margin-top: 12px; font-weight: 700; font-size: 14.5px; min-height: 22px; }
            #mp-guessinggame .gg-feedback.high { color: var(--danger); }
            #mp-guessinggame .gg-feedback.low { color: var(--primary); }
            #mp-guessinggame .gg-feedback.win { color: var(--ok); }
            #mp-guessinggame .gg-history { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
            #mp-guessinggame .gg-guess {
                display: inline-block; padding: 3px 10px; border-radius: 99px; font-weight: 700;
                font-size: 12.5px; font-variant-numeric: tabular-nums;
                border: 1px solid var(--border); background: var(--surface-2);
            }
            #mp-guessinggame .gg-guess.high { color: var(--danger); background: var(--danger-soft); border-color: transparent; }
            #mp-guessinggame .gg-guess.low { color: var(--primary); background: var(--primary-soft); border-color: transparent; }
            #mp-guessinggame .gg-guess.win { color: #fff; background: var(--primary-grad); border-color: transparent; }
            #mp-guessinggame .gg-count { font-variant-numeric: tabular-nums; }
        </style>
        <div class="mp-row">
            <label class="mp-label" for="mp-gg-diff" style="margin:0">Difficulty</label>
            <select class="mp-select" id="mp-gg-diff">
                <option value="50">Easy · 1–50</option>
                <option value="100" selected>Medium · 1–100</option>
                <option value="500">Hard · 1–500</option>
            </select>
            <button class="mp-btn alt" id="mp-gg-new">New Game</button>
        </div>
        <div class="mp-row" style="margin-top:10px">
            <input class="mp-input" id="mp-gg-input" type="number" min="1" placeholder="Your guess" style="width:150px">
            <button class="mp-btn" id="mp-gg-go">Guess</button>
        </div>
        <div class="mp-between" style="margin-top:12px">
            <span class="mp-badge" id="mp-gg-badge">Ready</span>
            <span class="mp-sub" id="mp-gg-range"></span>
        </div>
        <div class="mp-grid-2" style="margin-top:12px">
            <div class="mp-stat"><b class="gg-count" id="mp-gg-attempts">0</b><span>Attempts</span></div>
            <div class="mp-stat"><b class="gg-count" id="mp-gg-best">—</b><span>Best score</span></div>
        </div>
        <div class="gg-feedback" id="mp-gg-feedback"></div>
        <div class="gg-history" id="mp-gg-history"></div>
    </div>`,
    init: function (root) {
        var diff = root.querySelector('#mp-gg-diff');
        var input = root.querySelector('#mp-gg-input');
        var badge = root.querySelector('#mp-gg-badge');
        var rangeEl = root.querySelector('#mp-gg-range');
        var attemptsEl = root.querySelector('#mp-gg-attempts');
        var bestEl = root.querySelector('#mp-gg-best');
        var feedback = root.querySelector('#mp-gg-feedback');
        var history = root.querySelector('#mp-gg-history');
        var secret = 0;
        var attempts = 0;
        var max = 100;
        var over = false;

        function bestKey() { return 'mp-guess-best-' + max; }

        function loadBest() {
            var best = 0;
            try { best = parseInt(localStorage.getItem(bestKey()), 10) || 0; } catch (e) { best = 0; }
            bestEl.textContent = best > 0 ? String(best) : '—';
            return best;
        }

        function setBadge(text, cls) {
            badge.textContent = text;
            badge.className = 'mp-badge' + (cls ? ' ' + cls : '');
        }

        function restart() {
            max = parseInt(diff.value, 10) || 100;
            secret = Math.floor(Math.random() * max) + 1;
            attempts = 0;
            over = false;
            input.value = '';
            input.setAttribute('max', String(max));
            input.disabled = false;
            feedback.textContent = 'I picked a number from 1 to ' + max + '. Make your first guess!';
            feedback.className = 'gg-feedback';
            attemptsEl.textContent = '0';
            history.textContent = '';
            rangeEl.textContent = 'Range: 1 – ' + max;
            setBadge('Ready', '');
            loadBest();
            input.focus();
        }

        function guess() {
            if (over) return;
            var value = parseInt(input.value, 10);
            if (isNaN(value) || value < 1 || value > max) {
                feedback.textContent = 'Enter a whole number from 1 to ' + max + '.';
                feedback.className = 'gg-feedback';
                setBadge('Invalid', 'warn');
                return;
            }
            attempts++;
            attemptsEl.textContent = String(attempts);
            var chip = document.createElement('span');
            chip.className = 'gg-guess';
            chip.textContent = String(value);
            if (value === secret) {
                over = true;
                input.disabled = true;
                chip.className = 'gg-guess win';
                feedback.textContent = 'Correct! You found ' + secret + ' in ' + attempts + (attempts === 1 ? ' try.' : ' tries.');
                feedback.className = 'gg-feedback win';
                setBadge('Correct', 'ok');
                var best = loadBest();
                if (best === 0 || attempts < best) {
                    bestEl.textContent = String(attempts);
                    try { localStorage.setItem(bestKey(), String(attempts)); } catch (e) { /* ignore */ }
                }
            } else if (value > secret) {
                chip.className = 'gg-guess high';
                feedback.textContent = 'Too high — try something lower.';
                feedback.className = 'gg-feedback high';
                setBadge('Too high', 'err');
            } else {
                chip.className = 'gg-guess low';
                feedback.textContent = 'Too low — try something higher.';
                feedback.className = 'gg-feedback low';
                setBadge('Too low');
            }
            history.appendChild(chip);
            input.value = '';
            input.focus();
        }

        root.querySelector('#mp-gg-go').addEventListener('click', guess);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') guess(); });
        root.querySelector('#mp-gg-new').addEventListener('click', restart);
        diff.addEventListener('change', restart);
        restart();
    }
});
