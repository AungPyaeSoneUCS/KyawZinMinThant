registerProject({
    id: 'tabs',
    title: 'Tabs',
    desc: 'Switch between content panels with a sliding active indicator and arrow-key support.',
    tags: ['UI Component'],
    markup: `
    <div class="mp" id="mp-tabs">
        <style>
            #mp-tabs .tb-head { margin-bottom: 12px; }
            #mp-tabs .tb-bar {
                position: relative; display: flex; gap: 4px; padding: 5px;
                background: var(--surface-2); border: 1px solid var(--border);
                border-radius: 14px; margin-bottom: 16px;
            }
            #mp-tabs .tb-pill {
                position: absolute; top: 5px; left: 5px; height: calc(100% - 10px);
                border-radius: 10px; background: var(--primary-grad); z-index: 0;
                transition: left .28s cubic-bezier(.3,.9,.3,1), width .28s cubic-bezier(.3,.9,.3,1);
            }
            #mp-tabs .tb-tab {
                position: relative; z-index: 1; flex: 1; padding: 9px 10px;
                border: 0; border-radius: 10px; background: transparent; color: var(--muted);
                font: inherit; font-weight: 700; font-size: 13px; cursor: pointer;
                transition: color .2s;
            }
            #mp-tabs .tb-tab:hover { color: var(--text); }
            #mp-tabs .tb-tab.active { color: #fff; }
            #mp-tabs .tb-panel { display: none; }
            #mp-tabs .tb-panel.active { display: block; animation: tb-fade .28s ease; }
            @keyframes tb-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
            #mp-tabs .tb-panel .mp-card { box-shadow: var(--shadow-sm); }
        </style>
        <div class="mp-between tb-head">
            <div>
                <div class="mp-title">Tabs</div>
                <div class="mp-sub">Click a tab or use the arrow keys.</div>
            </div>
            <span class="mp-chip" id="mp-tb-label">Overview</span>
        </div>
        <div class="tb-bar" id="mp-tb-bar" role="tablist">
            <div class="tb-pill" id="mp-tb-pill"></div>
            <button class="tb-tab active" data-tab="0" role="tab">Overview</button>
            <button class="tb-tab" data-tab="1" role="tab">Features</button>
            <button class="tb-tab" data-tab="2" role="tab">Pricing</button>
            <button class="tb-tab" data-tab="3" role="tab">FAQ</button>
        </div>
        <div class="tb-panel active">
            <div class="mp-card">
                <div class="mp-title">Overview</div>
                <p style="margin:6px 0 0">Tabs pack several views into one compact area and reveal them on demand. The active indicator slides between tabs so the connection between control and content stays clear.</p>
            </div>
        </div>
        <div class="tb-panel">
            <div class="mp-card">
                <div class="mp-title">Features</div>
                <p style="margin:6px 0 0">Animated active pill, fading panel transitions, keyboard navigation with the arrow keys, and ARIA roles for assistive technology.</p>
            </div>
        </div>
        <div class="tb-panel">
            <div class="mp-card">
                <div class="mp-title">Pricing</div>
                <p style="margin:6px 0 0">Free to use and easy to drop into any page. No dependencies and no build step required.</p>
            </div>
        </div>
        <div class="tb-panel">
            <div class="mp-card">
                <div class="mp-title">FAQ</div>
                <p style="margin:6px 0 0">Do tabs need JavaScript? Yes, to swap active state and move the indicator. Style and layout remain pure CSS.</p>
            </div>
        </div>
    </div>`,
    init: function (root) {
        var tabs = root.querySelectorAll('#mp-tabs .tb-tab');
        var panels = root.querySelectorAll('#mp-tabs .tb-panel');
        var pill = root.querySelector('#mp-tb-pill');
        var label = root.querySelector('#mp-tb-label');
        var current = 0;

        function movePill(btn) {
            pill.style.left = btn.offsetLeft + 'px';
            pill.style.width = btn.offsetWidth + 'px';
        }

        function select(index) {
            current = index;
            for (var i = 0; i < tabs.length; i++) {
                var on = i === index;
                tabs[i].className = 'tb-tab' + (on ? ' active' : '');
                tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
                panels[i].className = 'tb-panel' + (on ? ' active' : '');
            }
            if (tabs[index]) {
                movePill(tabs[index]);
                label.textContent = tabs[index].textContent;
            }
        }

        root.addEventListener('click', function (e) {
            var tab = e.target.closest('#mp-tabs .tb-tab');
            if (tab) select(+tab.getAttribute('data-tab'));
        });

        root.addEventListener('keydown', function (e) {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            if (!e.target.classList || !e.target.classList.contains('tb-tab')) return;
            e.preventDefault();
            var next = current + (e.key === 'ArrowRight' ? 1 : -1);
            next = (next + tabs.length) % tabs.length;
            select(next);
            tabs[next].focus();
        });

        function onResize() { if (tabs[current]) movePill(tabs[current]); }
        window.addEventListener('resize', onResize);

        select(0);

        return function cleanup() {
            window.removeEventListener('resize', onResize);
        };
    }
});
