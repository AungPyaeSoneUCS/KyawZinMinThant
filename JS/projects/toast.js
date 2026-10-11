registerProject({
    id: 'toast',
    title: 'Toast Notifications',
    desc: 'Success, info, warning and error toasts that stack, are dismissible, and auto-dismiss.',
    tags: ['UI Component'],
    markup: `
    <div class="mp" id="mp-toast">
        <style>
            #mp-toast .ts-zone { position: relative; min-height: 140px; padding: 12px; border-radius: var(--radius); border: 1px dashed var(--border); background: var(--surface); display: flex; flex-direction: column; gap: 8px; overflow: hidden; }
            #mp-toast .ts-toast { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); box-shadow: var(--shadow-sm); animation: ts-in .2s ease; transition: .15s; }
            #mp-toast .ts-toast:hover { box-shadow: var(--shadow); }
            #mp-toast .ts-toast.out { animation: ts-out .2s ease forwards; }
            #mp-toast .ts-dot { width: 9px; height: 9px; border-radius: 50%; flex: none; }
            #mp-toast .ts-toast.success .ts-dot { background: var(--ok); }
            #mp-toast .ts-toast.info .ts-dot { background: var(--primary); }
            #mp-toast .ts-toast.warn .ts-dot { background: var(--warn); }
            #mp-toast .ts-toast.error .ts-dot { background: var(--danger); }
            #mp-toast .ts-msg { flex: 1; font-size: 13.5px; }
            @keyframes ts-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
            @keyframes ts-out { to { opacity: 0; transform: translateX(16px); } }
        </style>
        <div class="mp-stack">
            <div class="mp-card mp-stack">
                <div class="mp-title">Toast Demo</div>
                <div class="mp-sub">Show temporary notifications; they auto-dismiss and are stackable.</div>
                <div class="mp-row mp-wrap">
                    <button class="mp-btn" data-ts="success">Success</button>
                    <button class="mp-btn alt" data-ts="info">Info</button>
                    <button class="mp-btn alt" data-ts="warn">Warning</button>
                    <button class="mp-btn ghost" data-ts="error">Error</button>
                    <button class="mp-btn alt sm" id="mp-ts-clear">Clear All</button>
                </div>
            </div>
            <div class="ts-zone" id="mp-ts-zone"></div>
        </div>
    </div>`,
    init: function (root) {
        var zone = root.querySelector('#mp-ts-zone');
        var clearBtn = root.querySelector('#mp-ts-clear');
        var timers = [];
        var messages = {
            success: 'Saved successfully!',
            info: 'Just a heads up.',
            warn: 'This action needs attention.',
            error: 'Something went wrong.'
        };
        var idCounter = 0;

        function removeToast(el) {
            if (el && el.parentNode) el.parentNode.removeChild(el);
        }

        function dismiss(el) {
            if (!el) return;
            el.classList.add('out');
            setTimeout(function () { removeToast(el); }, 200);
        }

        function show(kind) {
            var el = document.createElement('div');
            el.className = 'ts-toast ' + kind;
            var dot = document.createElement('span');
            dot.className = 'ts-dot';
            var msg = document.createElement('span');
            msg.className = 'ts-msg';
            msg.textContent = messages[kind] || 'Notice';
            var close = document.createElement('button');
            close.className = 'mp-btn sm ghost';
            close.textContent = 'Dismiss';
            close.addEventListener('click', function () { dismiss(el); });
            el.appendChild(dot);
            el.appendChild(msg);
            el.appendChild(close);
            zone.appendChild(el);
            var t = setTimeout(function () { dismiss(el); }, 3200);
            timers.push(t);
        }

        function clearAll() {
            for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
            timers = [];
            while (zone.firstChild) zone.removeChild(zone.firstChild);
        }

        function onClick(e) {
            var btn = e.target.closest('[data-ts]');
            if (btn) show(btn.getAttribute('data-ts'));
        }
        root.addEventListener('click', onClick);
        clearBtn.addEventListener('click', clearAll);

        var cleanup = function () {
            root.removeEventListener('click', onClick);
            clearBtn.removeEventListener('click', clearAll);
            clearAll();
        };
        return cleanup;
    }
});