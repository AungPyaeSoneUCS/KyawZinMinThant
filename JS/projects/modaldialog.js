registerProject({
    id: 'modaldialog',
    title: 'Modal Dialog',
    desc: 'An in-container modal with focus trapping, Escape-to-close and confirm actions.',
    tags: ['UI Component'],
    markup: `
    <div class="mp" id="mp-modaldialog">
        <style>
            #mp-modaldialog { position: relative; }
            #mp-modaldialog .md-head { margin-bottom: 12px; }
            #mp-modaldialog .md-stage {
                display: grid; place-items: center; min-height: 200px; padding: 24px;
                border: 1px dashed var(--border); border-radius: 16px;
                background: var(--surface-2); text-align: center;
            }
            #mp-modaldialog .md-stage .mp-row { justify-content: center; margin-top: 14px; }
            #mp-modaldialog .md-overlay {
                position: absolute; inset: 0; z-index: 5;
                display: grid; place-items: center; padding: 16px;
                background: rgba(2, 6, 23, .55); backdrop-filter: blur(2px);
                border-radius: 16px; opacity: 0; visibility: hidden;
                transition: opacity .2s, visibility .2s;
            }
            #mp-modaldialog .md-overlay.open { opacity: 1; visibility: visible; }
            #mp-modaldialog .md-dialog {
                width: min(380px, 100%); padding: 20px;
                background: var(--surface); border: 1px solid var(--border);
                border-radius: 18px; box-shadow: var(--shadow);
                transform: translateY(10px) scale(.96); transition: transform .22s cubic-bezier(.2,.8,.2,1);
            }
            #mp-modaldialog .md-overlay.open .md-dialog { transform: none; }
            #mp-modaldialog .md-dialog .mp-title { font-size: 17px; }
            #mp-modaldialog .md-dialog .mp-sub { margin: 6px 0 16px; }
            #mp-modaldialog .md-actions { justify-content: flex-end; }
            #mp-modaldialog .md-danger { background: var(--danger); }
            #mp-modaldialog .md-danger:hover { box-shadow: 0 10px 20px -12px var(--danger); }
        </style>
        <div class="mp-between md-head">
            <div>
                <div class="mp-title">Modal Dialog</div>
                <div class="mp-sub">Opens inside the project area, not the hub modal.</div>
            </div>
            <span class="mp-badge" id="mp-md-state">Closed</span>
        </div>
        <div class="md-stage">
            <div>
                <p style="margin-bottom:4px">Try an informational or a confirmation dialog.</p>
                <div class="mp-row">
                    <button class="mp-btn" id="mp-md-info">Open dialog</button>
                    <button class="mp-btn alt" id="mp-md-confirm">Delete item</button>
                </div>
            </div>
        </div>
        <div class="mp-out" id="mp-md-result">No action yet.</div>
        <div class="md-overlay" id="mp-md-overlay">
            <div class="md-dialog" role="dialog" aria-modal="true" aria-labelledby="mp-md-title">
                <div class="mp-between">
                    <div class="mp-title" id="mp-md-title">Hello there</div>
                    <button class="mp-icon-btn" id="mp-md-x" aria-label="Close dialog">✕</button>
                </div>
                <div class="mp-sub" id="mp-md-text">You opened the in-project modal.</div>
                <div class="mp-row md-actions">
                    <button class="mp-btn alt" id="mp-md-cancel">Cancel</button>
                    <button class="mp-btn" id="mp-md-ok">Got it</button>
                </div>
            </div>
        </div>
    </div>`,
    init: function (root) {
        var overlay = root.querySelector('#mp-md-overlay');
        var titleEl = root.querySelector('#mp-md-title');
        var textEl = root.querySelector('#mp-md-text');
        var okBtn = root.querySelector('#mp-md-ok');
        var cancelBtn = root.querySelector('#mp-md-cancel');
        var state = root.querySelector('#mp-md-state');
        var result = root.querySelector('#mp-md-result');
        var variant = 'info';
        var opener = null;

        function focusables() {
            return root.querySelectorAll('#mp-modaldialog .md-dialog button');
        }

        function show(kind, from) {
            variant = kind;
            opener = from || null;
            if (kind === 'danger') {
                titleEl.textContent = 'Delete this item?';
                textEl.textContent = 'This action cannot be undone. Are you sure you want to continue?';
                okBtn.textContent = 'Delete';
                okBtn.className = 'mp-btn md-danger';
                cancelBtn.hidden = false;
            } else {
                titleEl.textContent = 'Hello there';
                textEl.textContent = 'This dialog lives inside the project container and traps focus while it is open.';
                okBtn.textContent = 'Got it';
                okBtn.className = 'mp-btn';
                cancelBtn.hidden = true;
            }
            overlay.classList.add('open');
            state.textContent = 'Open';
            state.className = 'mp-badge ok';
            var first = focusables()[0];
            if (first) first.focus();
        }

        function hide() {
            if (!overlay.classList.contains('open')) return;
            overlay.classList.remove('open');
            state.textContent = 'Closed';
            state.className = 'mp-badge';
            if (opener && typeof opener.focus === 'function') opener.focus();
        }

        function onOk() {
            if (variant === 'danger') result.textContent = 'Item deleted.';
            else result.textContent = 'Dialog acknowledged.';
            hide();
        }

        root.querySelector('#mp-md-info').addEventListener('click', function (e) { show('info', e.currentTarget); });
        root.querySelector('#mp-md-confirm').addEventListener('click', function (e) { show('danger', e.currentTarget); });
        root.querySelector('#mp-md-x').addEventListener('click', hide);
        cancelBtn.addEventListener('click', hide);
        okBtn.addEventListener('click', onOk);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) hide(); });

        function onKey(e) {
            if (!overlay.classList.contains('open')) return;
            if (e.key === 'Escape') { hide(); return; }
            if (e.key !== 'Tab') return;
            var f = [];
            for (var i = 0; i < focusables().length; i++) {
                var el = focusables()[i];
                if (!el.hidden) f.push(el);
            }
            if (!f.length) return;
            var first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
        document.addEventListener('keydown', onKey);

        return function cleanup() {
            document.removeEventListener('keydown', onKey);
            overlay.classList.remove('open');
        };
    }
});
