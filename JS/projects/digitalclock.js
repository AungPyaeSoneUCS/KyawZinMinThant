registerProject({
    id: 'digitalclock',
    title: 'Digital Clock',
    desc: 'A live clock with the full date, a seconds progress bar and a 12h/24h toggle.',
    tags: ['Utility', 'Time'],
    markup: `
    <div class="mp" id="mp-digitalclock">
        <style>
            #mp-digitalclock .dc-card {
                text-align: center; padding: 26px 16px; border-radius: var(--radius-lg);
                background: var(--surface-2); border: 1px solid var(--border);
                box-shadow: var(--shadow-sm);
            }
            #mp-digitalclock .dc-time {
                font-size: 44px; font-weight: 800; letter-spacing: .02em;
                font-variant-numeric: tabular-nums; line-height: 1.1;
                background: var(--primary-grad);
                -webkit-background-clip: text; background-clip: text; color: transparent;
            }
            #mp-digitalclock .dc-date { color: var(--muted); font-size: 13.5px; margin-top: 6px; }
            #mp-digitalclock .dc-bar { margin-top: 16px; }
            #mp-digitalclock .dc-meta { display: flex; justify-content: space-between; margin-top: 6px; }
        </style>
        <div class="dc-card">
            <div class="dc-time" id="mp-clock-time">--:--:--</div>
            <div class="dc-date" id="mp-clock-date"></div>
            <div class="dc-bar mp-progress"><i id="mp-clock-bar"></i></div>
            <div class="dc-meta">
                <span class="mp-sub" id="mp-clock-tz"></span>
                <span class="mp-sub" id="mp-clock-label">Seconds this minute</span>
            </div>
        </div>
        <div class="mp-row" style="margin-top: 12px">
            <button class="mp-btn" id="mp-clock-toggle">Use 12-hour</button>
            <button class="mp-btn alt" id="mp-clock-sec">Hide seconds</button>
            <span class="mp-badge ok" style="margin-left: auto" id="mp-clock-live">Live</span>
        </div>
    </div>`,
    init: function (root) {
        var timeEl = root.querySelector('#mp-clock-time');
        var dateEl = root.querySelector('#mp-clock-date');
        var tzEl = root.querySelector('#mp-clock-tz');
        var bar = root.querySelector('#mp-clock-bar');
        var btn = root.querySelector('#mp-clock-toggle');
        var secBtn = root.querySelector('#mp-clock-sec');
        var use12 = false;
        var showSeconds = true;

        try {
            tzEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
        } catch (e) { tzEl.textContent = 'Local time'; }

        function pad(n) { return n < 10 ? '0' + n : String(n); }

        function tick() {
            var now = new Date();
            var h = now.getHours();
            var suffix = '';
            if (use12) {
                suffix = h >= 12 ? ' PM' : ' AM';
                h = h % 12;
                if (h === 0) h = 12;
            }
            var time = (use12 ? h : pad(h)) + ':' + pad(now.getMinutes());
            if (showSeconds) time += ':' + pad(now.getSeconds());
            time += suffix;
            timeEl.textContent = time;
            dateEl.textContent = now.toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            bar.style.width = Math.round(now.getSeconds() / 60 * 100) + '%';
        }

        btn.addEventListener('click', function () {
            use12 = !use12;
            btn.textContent = use12 ? 'Use 24-hour' : 'Use 12-hour';
            tick();
        });

        secBtn.addEventListener('click', function () {
            showSeconds = !showSeconds;
            secBtn.textContent = showSeconds ? 'Hide seconds' : 'Show seconds';
            tick();
        });

        tick();
        var timer = setInterval(tick, 1000);

        return function cleanup() { clearInterval(timer); };
    }
});
