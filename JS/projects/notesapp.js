registerProject({
    id: 'notesapp',
    title: 'Notes App',
    desc: 'Create, edit, copy and delete notes with titles; persisted in localStorage.',
    tags: ['Productivity', 'Utility'],
    markup: `
    <div class="mp" id="mp-notesapp">
        <style>
            #mp-notesapp .nt-list { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
            #mp-notesapp .nt-note { padding: 10px 12px; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: .15s; }
            #mp-notesapp .nt-note:hover { box-shadow: var(--shadow); }
            #mp-notesapp .nt-title { margin: 0 0 4px; font-size: 14px; font-weight: 600; }
            #mp-notesapp .nt-body { margin: 0; white-space: pre-wrap; color: var(--text); }
            #mp-notesapp .nt-acts { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; justify-content: flex-end; }
            #mp-notesapp .nt-empty { color: var(--muted); font-size: 13px; padding: 10px 0; text-align: center; }
            #mp-notesapp .nt-msg { font-size: 12px; min-height: 16px; }
        </style>
        <div class="mp-stack">
            <div class="mp-card mp-stack">
                <div class="mp-title">Quick Notes</div>
                <div class="mp-sub">Add a title or just write a note; changes save automatically.</div>
                <input class="mp-input" id="mp-notes-title" placeholder="Title (optional)">
                <textarea class="mp-input" id="mp-notes-body" rows="3" placeholder="Write a note..."></textarea>
                <div class="mp-row mp-between">
                    <div class="mp-muted nt-msg" id="mp-notes-msg"></div>
                    <div class="mp-row">
                        <button class="mp-btn alt" id="mp-notes-clear">Clear</button>
                        <button class="mp-btn" id="mp-notes-add">Add Note</button>
                    </div>
                </div>
            </div>
            <ul class="nt-list" id="mp-notes-list"></ul>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-notesapp';
        var titleEl = root.querySelector('#mp-notes-title');
        var bodyEl = root.querySelector('#mp-notes-body');
        var listEl = root.querySelector('#mp-notes-list');
        var addBtn = root.querySelector('#mp-notes-add');
        var clearBtn = root.querySelector('#mp-notes-clear');
        var msgEl = root.querySelector('#mp-notes-msg');
        var notes = [];

        try {
            var saved = localStorage.getItem(KEY);
            if (saved) notes = JSON.parse(saved) || [];
        } catch (e) { notes = []; }

        function save() {
            try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) {}
        }

        function showMsg(text, type) {
            msgEl.textContent = text || '';
            if (type === 'ok') msgEl.style.color = 'var(--ok)';
            else if (type === 'err') msgEl.style.color = 'var(--danger)';
            else msgEl.style.color = 'var(--muted)';
        }

        function render() {
            while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
            if (!notes.length) {
                var empty = document.createElement('li');
                empty.className = 'nt-empty';
                empty.textContent = 'No notes yet. Add your first note above.';
                listEl.appendChild(empty);
                return;
            }
            for (var i = 0; i < notes.length; i++) {
                var note = notes[i];
                var li = document.createElement('li');
                li.className = 'nt-note';
                if (note.title) {
                    var h = document.createElement('h4');
                    h.className = 'nt-title';
                    h.textContent = note.title;
                    li.appendChild(h);
                }
                var p = document.createElement('p');
                p.className = 'nt-body';
                p.textContent = note.body;
                li.appendChild(p);
                var acts = document.createElement('div');
                acts.className = 'nt-acts';
                var copyBtn = document.createElement('button');
                copyBtn.className = 'mp-btn sm alt';
                copyBtn.textContent = 'Copy';
                copyBtn.addEventListener('click', copyNote.bind(null, note));
                var editBtn = document.createElement('button');
                editBtn.className = 'mp-btn sm alt';
                editBtn.textContent = 'Edit';
                editBtn.addEventListener('click', editNote.bind(null, note));
                var delBtn = document.createElement('button');
                delBtn.className = 'mp-btn sm ghost';
                delBtn.textContent = 'Delete';
                delBtn.addEventListener('click', deleteNote.bind(null, note));
                acts.appendChild(copyBtn);
                acts.appendChild(editBtn);
                acts.appendChild(delBtn);
                li.appendChild(acts);
                listEl.appendChild(li);
            }
        }

        function copyNote(note) {
            var text = (note.title ? note.title + '\n\n' : '') + note.body;
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function () {
                        showMsg('Copied!', 'ok');
                        setTimeout(showMsg, 1000, '');
                    });
                } else {
                    showMsg('Copy not supported', 'err');
                    setTimeout(showMsg, 1000, '');
                }
            } catch (e) {
                showMsg('Copy failed', 'err');
                setTimeout(showMsg, 1000, '');
            }
        }

        function editNote(note) {
            var title = prompt('Edit title', note.title || '');
            if (title === null) return;
            var text = prompt('Edit note', note.body);
            if (text === null) return;
            note.title = title.trim();
            note.body = text;
            save();
            render();
            showMsg('Note updated', 'ok');
            setTimeout(showMsg, 1000, '');
        }

        function deleteNote(note) {
            notes = notes.filter(function (n) { return n !== note; });
            save();
            render();
            showMsg('Note deleted', 'ok');
            setTimeout(showMsg, 1000, '');
        }

        function add() {
            var body = bodyEl.value;
            if (!body || !body.trim()) {
                showMsg('Note cannot be empty', 'err');
                setTimeout(showMsg, 1200, '');
                bodyEl.focus();
                return;
            }
            notes.unshift({ title: (titleEl.value || '').trim(), body: body.trim() });
            titleEl.value = '';
            bodyEl.value = '';
            save();
            render();
            showMsg('Note added', 'ok');
            setTimeout(showMsg, 1000, '');
        }

        function clearForm() {
            titleEl.value = '';
            bodyEl.value = '';
            showMsg('Form cleared', 'ok');
            setTimeout(showMsg, 1000, '');
        }

        addBtn.addEventListener('click', add);
        clearBtn.addEventListener('click', clearForm);
        titleEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) add();
        });
        bodyEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) add();
        });

        render();
        var cleanup = function () {
            addBtn.removeEventListener('click', add);
            clearBtn.removeEventListener('click', clearForm);
        };
        return cleanup;
    }
});