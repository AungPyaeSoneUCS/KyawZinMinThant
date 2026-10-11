registerProject({
    id: 'expensetracker',
    title: 'Expense Tracker',
    desc: 'Track expenses, see running totals, clear all and persist to localStorage.',
    tags: ['Productivity', 'Finance'],
    markup: `
    <div class="mp" id="mp-expensetracker">
        <style>
            #mp-expensetracker .et-total-card { margin-top: 12px; }
            #mp-expensetracker .et-list { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
            #mp-expensetracker .et-row { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
            #mp-expensetracker .et-name { flex: 1; word-break: break-word; }
            #mp-expensetracker .et-amt { font-variant-numeric: tabular-nums; font-weight: 700; }
            #mp-expensetracker .et-empty { color: var(--muted); font-size: 13px; padding: 10px 0; text-align: center; }
            #mp-expensetracker .et-msg { font-size: 12px; min-height: 16px; }
        </style>
        <div class="mp-stack">
            <div class="mp-card mp-stack">
                <div class="mp-title">Add Expense</div>
                <div class="mp-sub">Enter a description and amount (use numbers).</div>
                <div class="mp-row mp-wrap">
                    <input class="mp-input" id="mp-ex-name" placeholder="Expense" style="flex:1; min-width: 160px">
                    <input class="mp-input" id="mp-ex-amount" type="number" step="0.01" min="0" placeholder="0.00" style="width:110px">
                    <button class="mp-btn" id="mp-ex-add">Add</button>
                </div>
                <div class="mp-row mp-between">
                    <div class="mp-muted et-msg" id="mp-ex-msg"></div>
                    <button class="mp-btn alt sm" id="mp-ex-clear">Clear All</button>
                </div>
            </div>
            <div class="mp-card et-total-card mp-between mp-row">
                <span class="mp-sub">Total</span>
                <b class="mp-stat" style="font-size:18px; font-variant-numeric:tabular-nums" id="mp-ex-total">$0.00</b>
            </div>
            <ul class="et-list" id="mp-ex-list"></ul>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-expensetracker';
        var nameEl = root.querySelector('#mp-ex-name');
        var amountEl = root.querySelector('#mp-ex-amount');
        var listEl = root.querySelector('#mp-ex-list');
        var totalEl = root.querySelector('#mp-ex-total');
        var addBtn = root.querySelector('#mp-ex-add');
        var clearBtn = root.querySelector('#mp-ex-clear');
        var msgEl = root.querySelector('#mp-ex-msg');
        var items = [];

        try {
            var saved = localStorage.getItem(KEY);
            if (saved) items = JSON.parse(saved) || [];
        } catch (e) { items = []; }

        function save() {
            try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
        }

        function showMsg(text, type) {
            msgEl.textContent = text || '';
            if (type === 'ok') msgEl.style.color = 'var(--ok)';
            else if (type === 'err') msgEl.style.color = 'var(--danger)';
            else msgEl.style.color = 'var(--muted)';
        }

        function money(n) { return '$' + n.toFixed(2); }

        function render() {
            while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
            var total = 0;
            if (!items.length) {
                var empty = document.createElement('li');
                empty.className = 'et-empty';
                empty.textContent = 'No expenses yet. Add your first expense above.';
                listEl.appendChild(empty);
            }
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                total += item.amount || 0;
                var li = document.createElement('li');
                li.className = 'et-row';
                var name = document.createElement('span');
                name.className = 'et-name';
                name.textContent = item.name;
                var amt = document.createElement('span');
                amt.className = 'et-amt';
                amt.textContent = money(item.amount || 0);
                var del = document.createElement('button');
                del.className = 'mp-btn sm ghost';
                del.textContent = 'Delete';
                del.setAttribute('aria-label', 'Delete expense');
                del.addEventListener('click', deleteItem.bind(null, item));
                li.appendChild(name);
                li.appendChild(amt);
                li.appendChild(del);
                listEl.appendChild(li);
            }
            totalEl.textContent = money(total);
        }

        function deleteItem(item) {
            items = items.filter(function (it) { return it !== item; });
            save();
            render();
            showMsg('Expense deleted', 'ok');
            setTimeout(showMsg, 1000, '');
        }

        function add() {
            var name = (nameEl.value || '').trim();
            var val = amountEl.value;
            var amount = parseFloat(val);
            if (!name) {
                showMsg('Please enter an expense name', 'err');
                setTimeout(showMsg, 1200, '');
                nameEl.focus();
                return;
            }
            if (!isFinite(amount) || amount < 0) {
                showMsg('Please enter a valid amount', 'err');
                setTimeout(showMsg, 1200, '');
                amountEl.focus();
                return;
            }
            items.push({ name: name, amount: parseFloat(amount.toFixed(2)) });
            nameEl.value = '';
            amountEl.value = '';
            save();
            render();
            showMsg('Expense added', 'ok');
            setTimeout(showMsg, 1000, '');
        }

        function clearAll() {
            if (items.length === 0) return;
            items = [];
            save();
            render();
            showMsg('All expenses cleared', 'ok');
            setTimeout(showMsg, 1000, '');
        }

        addBtn.addEventListener('click', add);
        clearBtn.addEventListener('click', clearAll);
        amountEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });
        nameEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });

        render();
        var cleanup = function () {
            addBtn.removeEventListener('click', add);
            clearBtn.removeEventListener('click', clearAll);
        };
        return cleanup;
    }
});