registerProject({
    id: 'rockpaperscissors',
    title: 'Rock Paper Scissors',
    desc: 'Play against the computer, track wins, losses and draws, and chase your best streak.',
    tags: ['Game'],
    markup: `<div class="mp" id="mp-rockpaperscissors">
        <style>
            #mp-rockpaperscissors .rps-choices { display: flex; gap: 10px; flex-wrap: wrap; }
            #mp-rockpaperscissors .rps-choices .mp-btn { flex: 1; min-width: 96px; }
            #mp-rockpaperscissors .rps-last {
                margin-top: 14px; font-weight: 800; text-align: center;
                padding: 16px; border-radius: var(--radius);
                background: var(--surface-2); border: 1px solid var(--border);
            }
            #mp-rockpaperscissors .rps-last.win { color: var(--ok); }
            #mp-rockpaperscissors .rps-last.lose { color: var(--danger); }
            #mp-rockpaperscissors .rps-last.draw { color: var(--muted); }
            #mp-rockpaperscissors .rps-count { font-variant-numeric: tabular-nums; }
            #mp-rockpaperscissors .rps-legend {
                display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px;
                font-size: 12px; color: var(--muted); margin-top: 6px;
            }
        </style>
        <div class="rps-choices">
            <button class="mp-btn" data-move="Rock">Rock</button>
            <button class="mp-btn" data-move="Paper">Paper</button>
            <button class="mp-btn" data-move="Scissors">Scissors</button>
        </div>
        <div class="rps-last" id="mp-rps-last">Pick a move to start playing.</div>
        <div class="mp-grid-3" style="margin-top:12px">
            <div class="mp-stat"><b class="rps-count" id="mp-rps-wins">0</b><span>Wins</span></div>
            <div class="mp-stat"><b class="rps-count" id="mp-rps-losses">0</b><span>Losses</span></div>
            <div class="mp-stat"><b class="rps-count" id="mp-rps-draws">0</b><span>Draws</span></div>
        </div>
        <div class="mp-progress" style="margin-top:12px"><i id="mp-rps-bar"></i></div>
        <div class="rps-legend">
            <span id="mp-rps-rate">Win rate 0%</span>
            <span id="mp-rps-streak">Streak 0 · best 0</span>
        </div>
        <div class="mp-row" style="margin-top:12px">
            <button class="mp-btn alt sm" id="mp-rps-reset">Reset scores</button>
        </div>
    </div>`,
    init: function (root) {
        var MOVES = ['Rock', 'Paper', 'Scissors'];
        var BEATS = { Rock: 'Scissors', Paper: 'Rock', Scissors: 'Paper' };
        var KEY = 'mp-rps-score';
        var wins = 0, losses = 0, draws = 0, streak = 0, bestStreak = 0;
        var last = root.querySelector('#mp-rps-last');

        function load() {
            try {
                var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
                if (saved) {
                    wins = saved.wins || 0;
                    losses = saved.losses || 0;
                    draws = saved.draws || 0;
                    bestStreak = saved.bestStreak || 0;
                }
            } catch (e) { /* ignore */ }
        }

        function save() {
            try {
                localStorage.setItem(KEY, JSON.stringify({ wins: wins, losses: losses, draws: draws, bestStreak: bestStreak }));
            } catch (e) { /* ignore */ }
        }

        function render() {
            root.querySelector('#mp-rps-wins').textContent = String(wins);
            root.querySelector('#mp-rps-losses').textContent = String(losses);
            root.querySelector('#mp-rps-draws').textContent = String(draws);
            var total = wins + losses + draws;
            var rate = total ? Math.round((wins / total) * 100) : 0;
            root.querySelector('#mp-rps-bar').style.width = rate + '%';
            root.querySelector('#mp-rps-rate').textContent = 'Win rate ' + rate + '% (' + total + ' round' + (total === 1 ? '' : 's') + ')';
            root.querySelector('#mp-rps-streak').textContent = 'Streak ' + streak + ' · best ' + bestStreak;
        }

        function play(player) {
            var cpu = MOVES[Math.floor(Math.random() * MOVES.length)];
            var outcome, cls;
            if (player === cpu) {
                draws++;
                outcome = "it's a draw!";
                cls = 'draw';
            } else if (BEATS[player] === cpu) {
                wins++;
                streak++;
                if (streak > bestStreak) bestStreak = streak;
                outcome = 'you win!';
                cls = 'win';
            } else {
                losses++;
                streak = 0;
                outcome = 'you lose.';
                cls = 'lose';
            }
            last.textContent = 'You: ' + player + '  ·  Computer: ' + cpu + ' — ' + outcome;
            last.className = 'rps-last ' + cls;
            save();
            render();
        }

        root.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-move]');
            if (btn) play(btn.getAttribute('data-move'));
        });
        root.querySelector('#mp-rps-reset').addEventListener('click', function () {
            wins = 0; losses = 0; draws = 0; streak = 0; bestStreak = 0;
            save();
            render();
            last.textContent = 'Scores reset. Pick a move to play again.';
            last.className = 'rps-last';
        });
        load();
        render();
    }
});
