registerProject({
    id: 'diceroller',
    title: 'Dice Roller',
    desc: 'Roll a six-sided die and try to beat your longest run of matching rolls.',
    tags: ['Game', 'Random'],
    markup: `
    <div class="mp" id="mp-diceroller">
        <style>
            #mp-diceroller .dr-head { margin-bottom: 12px; }
            #mp-diceroller .dr-stage { display: grid; place-items: center; padding: 10px 0 6px; }
            #mp-diceroller .dr-die {
                width: 132px; height: 132px; padding: 14px;
                display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);
                gap: 7px; background: var(--surface); border: 1px solid var(--border);
                border-radius: 22px; box-shadow: var(--shadow);
                transition: transform .15s, box-shadow .15s;
            }
            #mp-diceroller .dr-die.rolling { animation: dr-shake .45s ease; }
            @keyframes dr-shake {
                0% { transform: rotate(0) scale(1); }
                30% { transform: rotate(-16deg) scale(.92); }
                60% { transform: rotate(14deg) scale(1.04); }
                100% { transform: rotate(0) scale(1); }
            }
            #mp-diceroller .dr-pip { border-radius: 50%; background: transparent; transition: background .15s, transform .15s; }
            #mp-diceroller .dr-pip.on {
                background: linear-gradient(135deg, var(--primary), var(--primary-2));
                transform: scale(1);
                box-shadow: 0 3px 8px -3px var(--primary);
            }
            #mp-diceroller .dr-hist { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; min-height: 30px; }
            #mp-diceroller .dr-chip {
                min-width: 32px; text-align: center; padding: 5px 9px; border-radius: 9px;
                background: var(--surface-2); border: 1px solid var(--border);
                font-weight: 800; font-size: 13px; animation: dr-pop .2s ease;
            }
            #mp-diceroller .dr-chip.new { border-color: var(--primary); color: var(--primary); }
            @keyframes dr-pop { from { opacity: 0; transform: translateY(-4px) scale(.9); } to { opacity: 1; transform: none; } }
        </style>
        <div class="mp-between dr-head">
            <div>
                <div class="mp-title">Roll the die</div>
                <div class="mp-sub">Match the previous number to grow your run.</div>
            </div>
            <span class="mp-badge" id="mp-dr-best">Best run 0</span>
        </div>
        <div class="dr-stage">
            <div class="dr-die" id="mp-dr-die" aria-label="Die face">
                <div class="dr-pip"></div><div class="dr-pip"></div><div class="dr-pip"></div>
                <div class="dr-pip"></div><div class="dr-pip"></div><div class="dr-pip"></div>
                <div class="dr-pip"></div><div class="dr-pip"></div><div class="dr-pip"></div>
            </div>
        </div>
        <div class="mp-grid-3" style="margin-top:10px">
            <div class="mp-stat"><b id="mp-dr-last">—</b><span>Last roll</span></div>
            <div class="mp-stat"><b id="mp-dr-rolls">0</b><span>Rolls</span></div>
            <div class="mp-stat"><b id="mp-dr-streak">0</b><span>Run</span></div>
        </div>
        <div class="mp-row" style="justify-content:center;margin-top:14px">
            <button class="mp-btn lg" id="mp-dr-roll">Roll dice</button>
            <button class="mp-btn alt" id="mp-dr-reset">New game</button>
        </div>
        <div class="mp-hr"></div>
        <div class="mp-between">
            <span class="mp-label" style="margin:0">Recent rolls</span>
            <span class="mp-sub" id="mp-dr-hint">Roll to begin</span>
        </div>
        <div class="dr-hist" id="mp-dr-hist"></div>
    </div>`,
    init: function (root) {
        var faces = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
        var die = root.querySelector('#mp-dr-die');
        var pips = root.querySelectorAll('#mp-diceroller .dr-pip');
        var lastEl = root.querySelector('#mp-dr-last');
        var rollsEl = root.querySelector('#mp-dr-rolls');
        var streakEl = root.querySelector('#mp-dr-streak');
        var bestEl = root.querySelector('#mp-dr-best');
        var histEl = root.querySelector('#mp-dr-hist');
        var hint = root.querySelector('#mp-dr-hint');
        var rollBtn = root.querySelector('#mp-dr-roll');
        var resetBtn = root.querySelector('#mp-dr-reset');
        var history = [];
        var last = 0, rolls = 0, streak = 0;
        var best = parseInt(localStorage.getItem('mp-diceroller-best') || '0', 10) || 0;
        var busy = false, timer = null;

        function draw(n) {
            for (var i = 0; i < pips.length; i++) {
                pips[i].className = 'dr-pip' + (faces[n].indexOf(i) !== -1 ? ' on' : '');
            }
        }

        function renderBest() { bestEl.textContent = 'Best run ' + best; }

        function renderHist() {
            histEl.textContent = '';
            if (!history.length) {
                var empty = document.createElement('span');
                empty.className = 'mp-sub';
                empty.textContent = 'No rolls yet.';
                histEl.appendChild(empty);
                return;
            }
            for (var i = 0; i < history.length; i++) {
                var chip = document.createElement('span');
                chip.className = 'dr-chip' + (i === 0 ? ' new' : '');
                chip.textContent = history[i];
                histEl.appendChild(chip);
            }
        }

        function roll() {
            if (busy) return;
            busy = true;
            rollBtn.disabled = true;
            die.classList.remove('rolling');
            void die.offsetWidth;
            die.classList.add('rolling');
            timer = setTimeout(function () {
                var n = 1 + Math.floor(Math.random() * 6);
                if (n === last) streak++; else streak = 1;
                last = n;
                rolls++;
                if (streak > best) {
                    best = streak;
                    try { localStorage.setItem('mp-diceroller-best', String(best)); } catch (e) { /* ignore */ }
                    renderBest();
                }
                lastEl.textContent = n;
                rollsEl.textContent = rolls;
                streakEl.textContent = streak;
                hint.textContent = streak > 1 ? 'Run of ' + streak + '!' : 'Keep rolling';
                history.unshift(n);
                if (history.length > 14) history.pop();
                draw(n);
                renderHist();
                die.classList.remove('rolling');
                busy = false;
                rollBtn.disabled = false;
            }, 450);
        }

        function reset() {
            if (timer) { clearTimeout(timer); timer = null; }
            busy = false;
            rollBtn.disabled = false;
            history = [];
            last = 0; rolls = 0; streak = 0;
            lastEl.textContent = '—';
            rollsEl.textContent = '0';
            streakEl.textContent = '0';
            hint.textContent = 'Roll to begin';
            draw(1);
            renderBest();
            renderHist();
        }

        rollBtn.addEventListener('click', roll);
        resetBtn.addEventListener('click', reset);
        draw(1);
        renderBest();
        renderHist();

        return function cleanup() { if (timer) clearTimeout(timer); };
    }
});
