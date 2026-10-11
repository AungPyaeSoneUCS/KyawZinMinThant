registerProject({
    id: 'todolist',
    title: 'Todo List',
    desc: 'Add, complete and delete tasks with filters, progress and localStorage.',
    tags: ['Utility', 'Productivity'],
    markup: `
    <div class="mp" id="mp-todolist">
        <style>
            #mp-todolist .tl-list { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
            #mp-todolist .tl-item {
                display: flex; align-items: center; gap: 10px;
                padding: 10px 12px; border-radius: var(--radius-sm);
                background: var(--surface-2); border: 1px solid var(--border);
                transition: border-color .15s, transform .15s;
            }
            #mp-todolist .tl-item:hover { border-color: var(--primary); transform: translateX(2px); }
            #mp-todolist .tl-item.done { opacity: .72; }
            #mp-todolist .tl-check { width: 18px; height: 18px; flex: none; accent-color: var(--primary); cursor: pointer; }
            #mp-todolist .tl-text { flex: 1; word-break: break-word; }
            #mp-todolist .tl-item.done .tl-text { text-decoration: line-through; color: var(--muted); }
            #mp-todolist .tl-del {
                border: 0; background: transparent; color: var(--danger);
                font: inherit; font-weight: 700; cursor: pointer; padding: 4px 8px;
                border-radius: 8px; transition: background .15s;
            }
            #mp-todolist .tl-del:hover { background: var(--danger-soft); }
            #mp-todolist .tl-empty { list-style: none; text-align: center; padding: 18px 8px; }
        </style>
        <div class="mp-between">
            <div>
                <div class="mp-title">Todo List</div>
                <div class="mp-sub">Plan, track and clear your tasks.</div>
            </div>
            <div class="mp-row" style="gap: 6px">
                <span class="mp-badge" id="mp-todo-active">0 active</span>
                <span class="mp-badge ok" id="mp-todo-done">0 done</span>
            </div>
        </div>
        <div class="mp-row" style="margin-top: 12px">
            <input class="mp-input" id="mp-todo-input" placeholder="What needs doing?" style="flex: 1">
            <button class="mp-btn" id="mp-todo-add">Add</button>
        </div>
        <div class="mp-row" style="margin-top: 10px">
            <button class="mp-btn sm" data-filter="all">All</button>
            <button class="mp-btn alt sm" data-filter="active">Active</button>
            <button class="mp-btn alt sm" data-filter="done">Done</button>
            <button class="mp-btn ghost sm" id="mp-todo-clear" style="margin-left: auto">Clear done</button>
        </div>
        <div class="mp-progress" style="margin-top: 12px"><i id="mp-todo-bar"></i></div>
        <div class="mp-sub" id="mp-todo-label" style="margin-top: 6px">0 of 0 complete</div>
        <ul class="tl-list" id="mp-todo-list"></ul>
    </div>`,
    init: function (root) {
        var KEY = 'mp-todolist';
        var input = root.querySelector('#mp-todo-input');
        var listEl = root.querySelector('#mp-todo-list');
        var activeBadge = root.querySelector('#mp-todo-active');
        var doneBadge = root.querySelector('#mp-todo-done');
        var bar = root.querySelector('#mp-todo-bar');
        var label = root.querySelector('#mp-todo-label');
        var filterBtns = root.querySelectorAll('[data-filter]');
        var filter = 'all';
        var todos = [];

        try {
            var saved = localStorage.getItem(KEY);
            if (saved) todos = JSON.parse(saved) || [];
        } catch (e) { todos = []; }

        function save() {
            try { localStorage.setItem(KEY, JSON.stringify(todos)); } catch (e) { /* ignore */ }
        }

        function visible() {
            if (filter === 'active') return todos.filter(function (t) { return !t.done; });
            if (filter === 'done') return todos.filter(function (t) { return t.done; });
            return todos;
        }

        function makeItem(todo) {
            var li = document.createElement('li');
            li.className = 'tl-item' + (todo.done ? ' done' : '');

            var toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.className = 'tl-check';
            toggle.checked = todo.done;
            toggle.setAttribute('aria-label', 'Mark done');
            toggle.addEventListener('change', function () {
                todo.done = toggle.checked;
                save();
                render();
            });

            var label = document.createElement('span');
            label.className = 'tl-text';
            label.textContent = todo.text;

            var del = document.createElement('button');
            del.className = 'tl-del';
            del.textContent = '✕';
            del.setAttribute('aria-label', 'Delete task');
            del.addEventListener('click', function () {
                todos = todos.filter(function (t) { return t !== todo; });
                save();
                render();
            });

            li.appendChild(toggle);
            li.appendChild(label);
            li.appendChild(del);
            return li;
        }

        function emptyState() {
            var li = document.createElement('li');
            li.className = 'tl-empty';
            var p = document.createElement('div');
            p.className = 'mp-sub';
            p.textContent = filter === 'done' ? 'No completed tasks yet.' :
                (filter === 'active' ? 'All caught up — nothing active.' : 'Nothing here yet. Add your first task above.');
            li.appendChild(p);
            if (filter === 'all' && !todos.length) {
                var seed = document.createElement('button');
                seed.className = 'mp-btn alt sm';
                seed.style.marginTop = '10px';
                seed.textContent = 'Add example tasks';
                seed.addEventListener('click', function () {
                    todos = [
                        { text: 'Review the monthly budget', done: false },
                        { text: 'Reply to the design email', done: false },
                        { text: 'Plan weekend trip', done: true }
                    ];
                    save();
                    render();
                });
                li.appendChild(seed);
            }
            return li;
        }

        function render() {
            var active = todos.filter(function (t) { return !t.done; }).length;
            var done = todos.length - active;
            activeBadge.textContent = active + ' active';
            doneBadge.textContent = done + ' done';
            label.textContent = done + ' of ' + todos.length + ' complete';
            bar.style.width = (todos.length ? Math.round(done / todos.length * 100) : 0) + '%';

            filterBtns.forEach(function (btn) {
                var on = btn.getAttribute('data-filter') === filter;
                btn.className = on ? 'mp-btn sm' : 'mp-btn alt sm';
            });

            listEl.textContent = '';
            var items = visible();
            if (!items.length) {
                listEl.appendChild(emptyState());
                return;
            }
            items.forEach(function (todo) { listEl.appendChild(makeItem(todo)); });
        }

        function add() {
            var text = input.value.trim();
            if (!text) { input.focus(); return; }
            todos.push({ text: text, done: false });
            input.value = '';
            save();
            render();
            input.focus();
        }

        root.querySelector('#mp-todo-add').addEventListener('click', add);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });

        root.querySelector('#mp-todo-clear').addEventListener('click', function () {
            todos = todos.filter(function (t) { return !t.done; });
            save();
            render();
        });

        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                filter = btn.getAttribute('data-filter');
                render();
            });
        });

        render();
    }
});
