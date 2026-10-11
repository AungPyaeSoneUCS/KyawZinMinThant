registerProject({
    id: 'accordion',
    title: 'Accordion',
    desc: 'Expandable list where opening one panel smoothly collapses the others.',
    tags: ['UI Component'],
    markup: `
    <div class="mp" id="mp-accordion">
        <style>
            #mp-accordion .acc-head { margin-bottom: 12px; }
            #mp-accordion .acc-item {
                border: 1px solid var(--border); border-radius: 14px;
                background: var(--surface); overflow: hidden; margin-bottom: 9px;
                box-shadow: var(--shadow-sm);
                transition: border-color .15s, box-shadow .15s;
            }
            #mp-accordion .acc-item:hover { border-color: var(--primary); }
            #mp-accordion .acc-item.open { border-color: var(--primary); box-shadow: var(--shadow); }
            #mp-accordion .acc-btn {
                width: 100%; display: flex; align-items: center; justify-content: space-between;
                gap: 10px; padding: 14px 16px; border: 0; background: transparent;
                color: var(--text); font: inherit; font-weight: 700; font-size: 14px;
                text-align: left; cursor: pointer; transition: color .15s;
            }
            #mp-accordion .acc-btn:hover { color: var(--primary); }
            #mp-accordion .acc-item.open .acc-btn { color: var(--primary); }
            #mp-accordion .acc-chev {
                flex: none; font-size: 13px; color: var(--primary);
                transition: transform .3s ease;
            }
            #mp-accordion .acc-item.open .acc-chev { transform: rotate(90deg); }
            #mp-accordion .acc-body {
                max-height: 0; overflow: hidden;
                transition: max-height .3s ease, opacity .25s ease;
                opacity: 0;
            }
            #mp-accordion .acc-item.open .acc-body { opacity: 1; }
            #mp-accordion .acc-text {
                padding: 0 16px 15px; color: var(--muted); font-size: 13.5px; line-height: 1.6;
            }
        </style>
        <div class="mp-between acc-head">
            <div>
                <div class="mp-title">Accordion</div>
                <div class="mp-sub">One panel stays open at a time.</div>
            </div>
            <button class="mp-btn alt sm" id="mp-acc-reset">Collapse all</button>
        </div>
        <div id="mp-acc-list">
            <div class="acc-item">
                <button class="acc-btn" aria-expanded="false">What is an accordion? <span class="acc-chev">▶</span></button>
                <div class="acc-body"><div class="acc-text">A UI pattern that hides content behind clickable headers so only one section shows at a time.</div></div>
            </div>
            <div class="acc-item">
                <button class="acc-btn" aria-expanded="false">How does it animate? <span class="acc-chev">▶</span></button>
                <div class="acc-body"><div class="acc-text">Each panel animates its height while a transform rotates the chevron, keeping the motion smooth.</div></div>
            </div>
            <div class="acc-item">
                <button class="acc-btn" aria-expanded="false">Why collapse the others? <span class="acc-chev">▶</span></button>
                <div class="acc-body"><div class="acc-text">Keeping a single open panel reduces clutter and draws attention to the current selection.</div></div>
            </div>
            <div class="acc-item">
                <button class="acc-btn" aria-expanded="false">Is it accessible? <span class="acc-chev">▶</span></button>
                <div class="acc-body"><div class="acc-text">Headers are real buttons, so they are keyboard focusable and can be activated with Enter or Space.</div></div>
            </div>
        </div>
    </div>`,
    init: function (root) {
        var items = root.querySelectorAll('#mp-accordion .acc-item');

        function close(item) {
            item.classList.remove('open');
            item.querySelector('.acc-body').style.maxHeight = '0px';
            item.querySelector('.acc-btn').setAttribute('aria-expanded', 'false');
        }

        function open(item) {
            item.classList.add('open');
            var body = item.querySelector('.acc-body');
            body.style.maxHeight = body.scrollHeight + 'px';
            item.querySelector('.acc-btn').setAttribute('aria-expanded', 'true');
        }

        root.addEventListener('click', function (e) {
            if (e.target.closest('#mp-acc-reset')) {
                for (var j = 0; j < items.length; j++) close(items[j]);
                return;
            }
            var btn = e.target.closest('#mp-accordion .acc-btn');
            if (!btn) return;
            var item = btn.parentNode;
            var wasOpen = item.classList.contains('open');
            for (var i = 0; i < items.length; i++) close(items[i]);
            if (!wasOpen) open(item);
        });

        return function cleanup() {
            for (var i = 0; i < items.length; i++) close(items[i]);
        };
    }
});
