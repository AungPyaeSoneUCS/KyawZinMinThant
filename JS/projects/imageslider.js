registerProject({
    id: 'imageslider',
    title: 'Image Slider',
    desc: 'Auto-advancing slider with prev/next, dot indicators, play/pause, and localStorage for last slide.',
    tags: ['UI Component'],
    markup: `
    <div class="mp" id="mp-imageslider">
        <style>
            #mp-imageslider .is-stage { position: relative; height: 220px; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
            #mp-imageslider .is-slide { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font-size: 22px; font-weight: 800; opacity: 0; transition: opacity .5s ease; text-shadow: 0 2px 10px rgba(0,0,0,.35); user-select: none; }
            #mp-imageslider .is-slide.active { opacity: 1; }
            #mp-imageslider .is-dots { display: flex; gap: 8px; justify-content: center; margin-top: 10px; flex-wrap: wrap; }
            #mp-imageslider .is-dot { width: 10px; height: 10px; border-radius: 50%; cursor: pointer; background: var(--border); border: 0; padding: 0; transition: .15s; }
            #mp-imageslider .is-dot.active { background: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
            #mp-imageslider .is-ctrl { margin-top: 10px; justify-content: space-between; }
            #mp-imageslider .is-msg { font-size: 12px; min-height: 16px; text-align: center; }
        </style>
        <div class="mp-stack">
            <div class="mp-card mp-stack">
                <div class="mp-title">Image Slider</div>
                <div class="mp-sub">Cycle through gradient slides with keyboard or buttons.</div>
                <div class="is-stage" id="mp-is-stage" tabindex="0" aria-label="Image slider"></div>
                <div class="is-dots" id="mp-is-dots"></div>
                <div class="mp-row is-ctrl">
                    <div class="mp-row">
                        <button class="mp-btn alt" id="mp-is-prev">Prev</button>
                        <button class="mp-btn alt" id="mp-is-next">Next</button>
                    </div>
                    <div class="mp-row">
                        <button class="mp-btn alt sm" id="mp-is-play">Play</button>
                        <button class="mp-btn alt sm" id="mp-is-pause">Pause</button>
                    </div>
                </div>
                <div class="is-msg" id="mp-is-msg"></div>
            </div>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-imageslider';
        var stage = root.querySelector('#mp-is-stage');
        var dotsEl = root.querySelector('#mp-is-dots');
        var prevBtn = root.querySelector('#mp-is-prev');
        var nextBtn = root.querySelector('#mp-is-next');
        var playBtn = root.querySelector('#mp-is-play');
        var pauseBtn = root.querySelector('#mp-is-pause');
        var msgEl = root.querySelector('#mp-is-msg');
        var slides = [
            { label: 'Aurora', bg: 'linear-gradient(135deg, #667eea, #764ba2)' },
            { label: 'Sunset', bg: 'linear-gradient(135deg, #f093fb, #f5576c)' },
            { label: 'Ocean', bg: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
            { label: 'Lime', bg: 'linear-gradient(135deg, #43e97b, #38f9d7)' }
        ];
        var current = 0;
        var timer = null;
        var paused = false;

        try {
            var saved = localStorage.getItem(KEY);
            if (saved) {
                var s = parseInt(saved, 10);
                if (!isNaN(s) && s >= 0 && s < slides.length) current = s;
            }
        } catch (e) {}

        function showMsg(text, type) {
            msgEl.textContent = text || '';
            if (type === 'ok') msgEl.style.color = 'var(--ok)';
            else if (type === 'err') msgEl.style.color = 'var(--danger)';
            else msgEl.style.color = 'var(--muted)';
        }

        function save() {
            try { localStorage.setItem(KEY, String(current)); } catch (e) {}
        }

        for (var i = 0; i < slides.length; i++) {
            var s = slides[i];
            var sl = document.createElement('div');
            sl.className = 'is-slide';
            sl.style.background = s.bg;
            sl.textContent = s.label;
            stage.appendChild(sl);

            var dot = document.createElement('button');
            dot.className = 'is-dot';
            dot.setAttribute('aria-label', 'Slide ' + (i + 1));
            dot.addEventListener('click', go.bind(null, i, true));
            dotsEl.appendChild(dot);
        }

        function go(idx, user) {
            current = (idx + slides.length) % slides.length;
            for (var a = 0; a < stage.children.length; a++) stage.children[a].classList.toggle('active', a === current);
            for (var b = 0; b < dotsEl.children.length; b++) dotsEl.children[b].classList.toggle('active', b === current);
            save();
            if (user) { start(); showMsg('Slide ' + (current + 1) + '/' + slides.length, 'ok'); setTimeout(showMsg, 800, ''); }
        }

        function step(n, user) { go(current + n, !!user); }

        function start() {
            if (paused) return;
            clearInterval(timer);
            timer = setInterval(function () { step(1, false); }, 3000);
        }

        function stop() {
            clearInterval(timer);
            timer = null;
        }

        prevBtn.addEventListener('click', function () { step(-1, true); });
        nextBtn.addEventListener('click', function () { step(1, true); });
        playBtn.addEventListener('click', function () { paused = false; start(); showMsg('Playing', 'ok'); setTimeout(showMsg, 800, ''); });
        pauseBtn.addEventListener('click', function () { paused = true; stop(); showMsg('Paused', 'ok'); setTimeout(showMsg, 800, ''); });
        stage.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') { step(-1, true); }
            if (e.key === 'ArrowRight') { step(1, true); }
        });

        go(current, false);
        start();

        var cleanup = function () {
            stop();
            prevBtn.removeEventListener('click', function () {});
            nextBtn.removeEventListener('click', function () {});
            playBtn.removeEventListener('click', function () {});
            pauseBtn.removeEventListener('click', function () {});
            stage.removeEventListener('keydown', function () {});
            for (var d = 0; d < dotsEl.children.length; d++) {
                dotsEl.children[d].removeEventListener('click', function () {});
            }
        };
        return cleanup;
    }
});