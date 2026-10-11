registerProject({
    id: 'leapyear',
    title: 'Leap Year Checker',
    desc: 'Check whether a year is a leap year, see the rule behind it and the nearest leap years.',
    tags: ['Utility', 'Date'],
    markup: `
    <div class="mp" id="mp-leapyear">
        <style>
            #mp-leapyear .ly-field { flex: 1; min-width: 150px; }
            #mp-leapyear .ly-verdict { font-size: 22px; font-weight: 800; letter-spacing: -.01em; }
            #mp-leapyear .ly-verdict.yes { color: var(--ok); }
            #mp-leapyear .ly-verdict.no { color: var(--danger); }
            #mp-leapyear .ly-reason { font-size: 13.5px; color: var(--muted); margin-top: 4px; }
            #mp-leapyear .ly-grid { margin-top: 12px; }
        </style>
        <div class="mp-row">
            <div class="ly-field">
                <label class="mp-label" for="mp-ly-year">Year</label>
                <input class="mp-input" id="mp-ly-year" type="number" min="1" max="99999" value="2024" style="width:100%">
            </div>
            <button class="mp-btn" id="mp-ly-go">Check</button>
            <button class="mp-btn alt" id="mp-ly-now">This year</button>
        </div>
        <div class="mp-out">
            <div class="ly-verdict" id="mp-ly-verdict">—</div>
            <div class="ly-reason" id="mp-ly-reason">Enter a year to check.</div>
        </div>
        <div class="mp-grid-2 ly-grid">
            <div class="mp-stat"><b id="mp-ly-prev">—</b><span>Previous leap year</span></div>
            <div class="mp-stat"><b id="mp-ly-next">—</b><span>Next leap year</span></div>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-leapyear';
        var yearIn = root.querySelector('#mp-ly-year');
        var verdict = root.querySelector('#mp-ly-verdict');
        var reason = root.querySelector('#mp-ly-reason');
        var prevEl = root.querySelector('#mp-ly-prev');
        var nextEl = root.querySelector('#mp-ly-next');

        function isLeap(y) {
            return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
        }

        function save(y) {
            try { localStorage.setItem(KEY, String(y)); } catch (e) { /* ignore */ }
        }

        function check() {
            var y = parseInt(yearIn.value, 10);
            if (isNaN(y) || y < 1) {
                verdict.className = 'ly-verdict';
                verdict.textContent = '—';
                reason.textContent = 'Please enter a valid positive year.';
                prevEl.textContent = '—';
                nextEl.textContent = '—';
                return;
            }
            var leap = isLeap(y);
            var why;
            if (y % 400 === 0) why = 'divisible by 400';
            else if (y % 100 === 0) why = 'divisible by 100 but not by 400';
            else if (y % 4 === 0) why = 'divisible by 4 but not by 100';
            else why = 'not divisible by 4';

            verdict.className = 'ly-verdict ' + (leap ? 'yes' : 'no');
            verdict.textContent = leap ? y + ' is a leap year' : y + ' is not a leap year';
            reason.textContent = 'It is ' + why + ' — leap years have 366 days.';

            var prev = y;
            do { prev--; } while (prev >= 1 && !isLeap(prev));
            var next = y;
            do { next++; } while (!isLeap(next));
            prevEl.textContent = prev > 0 ? prev : '—';
            nextEl.textContent = next;
            save(y);
        }

        root.querySelector('#mp-ly-go').addEventListener('click', check);
        root.querySelector('#mp-ly-now').addEventListener('click', function () {
            yearIn.value = new Date().getFullYear();
            check();
        });
        yearIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });

        try {
            var saved = localStorage.getItem(KEY);
            if (saved) yearIn.value = saved;
        } catch (e) { /* ignore */ }

        check();
    }
});
