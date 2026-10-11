registerProject({
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    desc: 'Classic two-player Tic Tac Toe with win detection and a running scoreboard.',
    tags: ['Game'],
    markup: `
    <div class="mp" id="mp-tictactoe">
        <style>
            #mp-tictactoe .ttt-head { margin-bottom: 12px; }
            #mp-tictactoe .ttt-board {
                display: grid; grid-template-columns: repeat(3, 1fr);
                gap: 8px; max-width: 300px; margin: 0 auto;
            }
            #mp-tictactoe .ttt-cell {
                aspect-ratio: 1 / 1; display: grid; place-items: center;
                border: 1px solid var(--border); border-radius: 14px;
                background: var(--surface); color: var(--text); font: inherit;
                font-size: 42px; font-weight: 800; cursor: pointer;
                transition: transform .15s, border-color .15s, background .15s, box-shadow .15s;
            }
            #mp-tictactoe .ttt-cell:hover:not(:disabled) {
                border-color: var(--primary); background: var(--primary-soft); transform: translateY(-2px);
            }
            #mp-tictactoe .ttt-cell:disabled { cursor: default; }
            #mp-tictactoe .ttt-cell.x { color: var(--primary); }
            #mp-tictactoe .ttt-cell.o { color: var(--warn); }
            #mp-tictactoe .ttt-cell.win {
                background: var(--ok-soft); border-color: var(--ok);
                animation: ttt-win .5s ease;
            }
            @keyframes ttt-win { 0% { transform: scale(.9); } 60% { transform: scale(1.06); } 100% { transform: none; } }
            #mp-tictactoe .ttt-status { text-align: center; margin: 14px 0; }
        </style>
        <div class="mp-between ttt-head">
            <div>
                <div class="mp-title">Tic Tac Toe</div>
                <div class="mp-sub">Take turns and line up three in a row.</div>
            </div>
            <span class="mp-badge" id="mp-ttt-badge">Player X</span>
        </div>
        <div class="ttt-board" id="mp-ttt-board">
            <button class="ttt-cell" data-index="0"></button><button class="ttt-cell" data-index="1"></button><button class="ttt-cell" data-index="2"></button>
            <button class="ttt-cell" data-index="3"></button><button class="ttt-cell" data-index="4"></button><button class="ttt-cell" data-index="5"></button>
            <button class="ttt-cell" data-index="6"></button><button class="ttt-cell" data-index="7"></button><button class="ttt-cell" data-index="8"></button>
        </div>
        <div class="ttt-status mp-out" id="mp-ttt-status">Player X's turn</div>
        <div class="mp-grid-3">
            <div class="mp-stat"><b id="mp-ttt-x">0</b><span>X wins</span></div>
            <div class="mp-stat"><b id="mp-ttt-o">0</b><span>O wins</span></div>
            <div class="mp-stat"><b id="mp-ttt-d">0</b><span>Draws</span></div>
        </div>
        <div class="mp-row" style="justify-content:center;margin-top:14px">
            <button class="mp-btn" id="mp-ttt-restart">New game</button>
            <button class="mp-btn alt" id="mp-ttt-reset">Reset scores</button>
        </div>
    </div>`,
    init: function (root) {
        var cells = root.querySelectorAll('#mp-tictactoe .ttt-cell');
        var status = root.querySelector('#mp-ttt-status');
        var badge = root.querySelector('#mp-ttt-badge');
        var xEl = root.querySelector('#mp-ttt-x');
        var oEl = root.querySelector('#mp-ttt-o');
        var dEl = root.querySelector('#mp-ttt-d');
        var wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        var board, turn, over, moves;
        var scores = { X: 0, O: 0, D: 0 };

        try {
            var saved = JSON.parse(localStorage.getItem('mp-tictactoe-score') || 'null');
            if (saved && typeof saved === 'object') {
                scores.X = saved.X || 0; scores.O = saved.O || 0; scores.D = saved.D || 0;
            }
        } catch (e) { /* ignore */ }

        function saveScores() {
            try { localStorage.setItem('mp-tictactoe-score', JSON.stringify(scores)); } catch (e) { /* ignore */ }
        }

        function renderScores() {
            xEl.textContent = scores.X;
            oEl.textContent = scores.O;
            dEl.textContent = scores.D;
        }

        function render() {
            for (var i = 0; i < cells.length; i++) {
                cells[i].textContent = board[i];
                cells[i].classList.remove('win', 'x', 'o');
                if (board[i] === 'X') cells[i].classList.add('x');
                if (board[i] === 'O') cells[i].classList.add('o');
                cells[i].disabled = !!board[i] || over;
            }
        }

        function winner(b) {
            for (var i = 0; i < wins.length; i++) {
                var w = wins[i];
                if (b[w[0]] && b[w[0]] === b[w[1]] && b[w[1]] === b[w[2]]) return w;
            }
            return null;
        }

        function finish(winLine) {
            over = true;
            if (winLine) {
                var w = board[winLine[0]];
                for (var i = 0; i < winLine.length; i++) cells[winLine[i]].classList.add('win');
                scores[w]++;
                status.textContent = 'Player ' + w + ' wins!';
                badge.textContent = 'Player ' + w + ' wins';
                badge.className = 'mp-badge ok';
            } else {
                scores.D++;
                status.textContent = "It's a draw!";
                badge.textContent = 'Draw';
                badge.className = 'mp-badge warn';
            }
            saveScores();
            renderScores();
            render();
        }

        function reset() {
            board = ['', '', '', '', '', '', '', '', ''];
            turn = 'X'; over = false; moves = 0;
            status.textContent = "Player X's turn";
            badge.textContent = 'Player X';
            badge.className = 'mp-badge';
            render();
        }

        root.addEventListener('click', function (e) {
            if (e.target.closest('#mp-ttt-restart')) { reset(); return; }
            if (e.target.closest('#mp-ttt-reset')) {
                scores = { X: 0, O: 0, D: 0 };
                saveScores();
                renderScores();
                reset();
                return;
            }
            var cell = e.target.closest('#mp-tictactoe .ttt-cell');
            if (!cell || over) return;
            var i = +cell.getAttribute('data-index');
            if (board[i]) return;
            board[i] = turn;
            moves++;
            var line = winner(board);
            if (line) { finish(line); return; }
            if (moves === 9) { finish(null); return; }
            turn = turn === 'X' ? 'O' : 'X';
            status.textContent = "Player " + turn + "'s turn";
            badge.textContent = 'Player ' + turn;
            render();
        });

        renderScores();
        reset();
    }
});
