registerProject({
    id: 'randomquote',
    title: 'Random Quote Generator',
    desc: 'Show a random quote from a curated list, save your favorites and copy them anywhere.',
    tags: ['Fun'],
    markup: `<div class="mp" id="mp-randomquote">
        <style>
            #mp-randomquote .rq-quote {
                padding: 20px; border-radius: var(--radius-lg); min-height: 124px;
                background: var(--surface-2); border: 1px solid var(--border);
                box-shadow: var(--shadow-sm);
                display: flex; flex-direction: column; justify-content: center; gap: 10px;
            }
            #mp-randomquote .rq-text { font-size: 17px; font-style: italic; line-height: 1.55; }
            #mp-randomquote .rq-author { font-size: 13px; font-weight: 700; color: var(--primary); text-align: right; }
            #mp-randomquote .rq-fav.on { color: var(--warn); border-color: var(--warn); }
            #mp-randomquote .rq-status { font-size: 12px; color: var(--muted); min-height: 16px; }
            #mp-randomquote .rq-list { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
            #mp-randomquote .rq-item {
                display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px;
                border-radius: var(--radius-sm); background: var(--surface-2);
                border: 1px solid var(--border); transition: border-color .15s;
            }
            #mp-randomquote .rq-item:hover { border-color: var(--primary); }
            #mp-randomquote .rq-item .t { flex: 1; font-size: 13.5px; }
            #mp-randomquote .rq-item .a { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }
            #mp-randomquote .rq-empty { color: var(--muted); font-size: 13px; padding: 12px 0; }
        </style>
        <div class="rq-quote">
            <div class="rq-text" id="mp-rq-text"></div>
            <div class="rq-author" id="mp-rq-author"></div>
        </div>
        <div class="mp-row" style="margin-top:10px">
            <button class="mp-btn" id="mp-rq-new">New Quote</button>
            <button class="mp-btn alt" id="mp-rq-copy">Copy</button>
            <button class="mp-btn alt rq-fav" id="mp-rq-fav">☆ Favorite</button>
            <span class="rq-status" id="mp-rq-status"></span>
        </div>
        <hr class="mp-hr">
        <div class="mp-between">
            <span class="mp-label">Favorites</span>
            <span class="mp-sub" id="mp-rq-count">0 saved</span>
        </div>
        <div class="rq-list" id="mp-rq-list"></div>
    </div>`,
    init: function (root) {
        var QUOTES = [
            { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
            { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
            { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
            { text: 'Programs must be written for people to read.', author: 'Harold Abelson' },
            { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
            { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
            { text: 'Code is like humor; when you have to explain it, it is bad.', author: 'Cory House' },
            { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
            { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
            { text: 'Any sufficiently advanced technology is indistinguishable from magic.', author: 'Arthur C. Clarke' },
            { text: 'Clean code always looks like it was written by someone who cares.', author: 'Robert C. Martin' }
        ];
        var KEY = 'mp-quotes-fav';
        var textEl = root.querySelector('#mp-rq-text');
        var authorEl = root.querySelector('#mp-rq-author');
        var status = root.querySelector('#mp-rq-status');
        var favBtn = root.querySelector('#mp-rq-fav');
        var listEl = root.querySelector('#mp-rq-list');
        var countEl = root.querySelector('#mp-rq-count');
        var current = QUOTES[0];
        var favorites = [];

        try {
            var saved = localStorage.getItem(KEY);
            if (saved) favorites = JSON.parse(saved) || [];
        } catch (e) { favorites = []; }

        function save() {
            try { localStorage.setItem(KEY, JSON.stringify(favorites)); } catch (e) { /* ignore */ }
        }

        function isFav(q) {
            return favorites.some(function (f) { return f.text === q.text && f.author === q.author; });
        }

        function syncFavButton() {
            var on = isFav(current);
            favBtn.textContent = on ? '★ Saved' : '☆ Favorite';
            favBtn.className = 'mp-btn alt rq-fav' + (on ? ' on' : '');
        }

        function show() {
            var q = current;
            var guard = 0;
            while (q.text === current.text && guard++ < 12) {
                q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            }
            current = q;
            textEl.textContent = '\u201C' + q.text + '\u201D';
            authorEl.textContent = '\u2014 ' + q.author;
            status.textContent = '';
            syncFavButton();
        }

        function copy() {
            var str = current.text + ' \u2014 ' + current.author;
            function done() { status.textContent = 'Copied!'; }
            function fail() { status.textContent = 'Copy failed.'; }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(str).then(done, fail);
            } else {
                var ta = document.createElement('textarea');
                ta.value = str;
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); done(); } catch (e) { fail(); }
                document.body.removeChild(ta);
            }
        }

        function renderFavorites() {
            listEl.textContent = '';
            countEl.textContent = favorites.length + ' saved';
            if (!favorites.length) {
                var empty = document.createElement('div');
                empty.className = 'rq-empty';
                empty.textContent = 'No favorites yet. Tap Favorite to keep a quote here.';
                listEl.appendChild(empty);
                return;
            }
            var frag = document.createDocumentFragment();
            favorites.forEach(function (q, index) {
                var item = document.createElement('div');
                item.className = 'rq-item';
                var body = document.createElement('div');
                body.className = 't';
                body.textContent = '\u201C' + q.text + '\u201D';
                var author = document.createElement('span');
                author.className = 'a';
                author.textContent = q.author;
                body.appendChild(author);
                var del = document.createElement('button');
                del.className = 'mp-btn ghost sm';
                del.textContent = '✕';
                del.setAttribute('aria-label', 'Remove favorite');
                del.addEventListener('click', function () {
                    favorites.splice(index, 1);
                    save();
                    renderFavorites();
                    syncFavButton();
                });
                item.appendChild(body);
                item.appendChild(del);
                frag.appendChild(item);
            });
            listEl.appendChild(frag);
        }

        root.querySelector('#mp-rq-new').addEventListener('click', show);
        root.querySelector('#mp-rq-copy').addEventListener('click', copy);
        favBtn.addEventListener('click', function () {
            if (isFav(current)) {
                favorites = favorites.filter(function (f) { return !(f.text === current.text && f.author === current.author); });
                status.textContent = 'Removed from favorites.';
            } else {
                favorites.push({ text: current.text, author: current.author });
                status.textContent = 'Added to favorites.';
            }
            save();
            syncFavButton();
            renderFavorites();
        });
        show();
        renderFavorites();
    }
});
