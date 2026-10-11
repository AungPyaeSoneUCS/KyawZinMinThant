registerProject({
    id: 'multiplicationtable',
    title: 'Multiplication Table',
    desc: 'Build a multiplication table for any number up to a chosen range, with a running sum.',
    tags: ['Math'],
    markup: `<div class="mp" id="mp-multiplicationtable">
        <style>
            #mp-multiplicationtable .mt-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-variant-numeric: tabular-nums; }
            #mp-multiplicationtable .mt-table th {
                text-align: left; font-size: 12px; color: var(--muted); font-weight: 700;
                padding: 8px 12px; border-bottom: 1px solid var(--border);
            }
            #mp-multiplicationtable .mt-table td { padding: 8px 12px; border-bottom: 1px solid var(--border); font-size: 14px; }
            #mp-multiplicationtable .mt-table tr:last-child td { border-bottom: 0; }
            #mp-multiplicationtable .mt-table tr:hover td { background: var(--surface-2); }
            #mp-multiplicationtable .mt-res { text-align: right; font-weight: 700; color: var(--primary); }
            #mp-multiplicationtable .mt-wrap {
                border: 1px solid var(--border); border-radius: var(--radius);
                background: var(--surface); overflow: hidden; max-height: 320px; overflow-y: auto;
            }
            #mp-multiplicationtable .mt-empty { color: var(--muted); font-size: 13px; padding: 16px; text-align: center; }
            #mp-multiplicationtable .mt-count { font-variant-numeric: tabular-nums; }
        </style>
        <div class="mp-row">
            <label class="mp-label" for="mp-mt-n" style="margin:0">Number</label>
            <input class="mp-input" id="mp-mt-n" type="number" value="7" style="width:100px">
            <label class="mp-label" for="mp-mt-end" style="margin:0">Up to</label>
            <input class="mp-input" id="mp-mt-end" type="number" min="1" max="100" value="10" style="width:100px">
            <button class="mp-btn" id="mp-mt-go">Build</button>
            <button class="mp-btn alt" id="mp-mt-clear">Clear</button>
        </div>
        <div class="mp-row" style="margin-top:8px">
            <button class="mp-btn ghost sm" data-end="5">×5</button>
            <button class="mp-btn ghost sm" data-end="10">×10</button>
            <button class="mp-btn ghost sm" data-end="12">×12</button>
            <button class="mp-btn ghost sm" data-end="20">×20</button>
        </div>
        <div class="mp-grid-2" style="margin-top:12px">
            <div class="mp-stat"><b class="mt-count" id="mp-mt-rows">0</b><span>Rows</span></div>
            <div class="mp-stat"><b class="mt-count" id="mp-mt-sum">0</b><span>Sum of results</span></div>
        </div>
        <div class="mt-wrap" id="mp-mt-wrap"></div>
    </div>`,
    init: function (root) {
        var nEl = root.querySelector('#mp-mt-n');
        var endEl = root.querySelector('#mp-mt-end');
        var wrap = root.querySelector('#mp-mt-wrap');
        var rowsEl = root.querySelector('#mp-mt-rows');
        var sumEl = root.querySelector('#mp-mt-sum');

        function emptyState(msg) {
            wrap.textContent = '';
            var empty = document.createElement('div');
            empty.className = 'mt-empty';
            empty.textContent = msg;
            wrap.appendChild(empty);
        }

        function run() {
            var n = parseInt(nEl.value, 10);
            var end = parseInt(endEl.value, 10);
            if (isNaN(n)) { emptyState('Enter any whole number to multiply.'); rowsEl.textContent = '0'; sumEl.textContent = '0'; return; }
            if (isNaN(end) || end < 1) { emptyState('Choose how many rows to build (1 to 100).'); rowsEl.textContent = '0'; sumEl.textContent = '0'; return; }
            end = Math.min(end, 100);
            endEl.value = String(end);
            var table = document.createElement('table');
            table.className = 'mt-table';
            var thead = document.createElement('thead');
            var headRow = document.createElement('tr');
            var th1 = document.createElement('th');
            th1.textContent = 'Expression';
            var th2 = document.createElement('th');
            th2.textContent = 'Result';
            th2.className = 'mt-res';
            headRow.appendChild(th1);
            headRow.appendChild(th2);
            thead.appendChild(headRow);
            table.appendChild(thead);
            var tbody = document.createElement('tbody');
            var sum = 0;
            for (var i = 1; i <= end; i++) {
                var product = n * i;
                sum += product;
                var tr = document.createElement('tr');
                var left = document.createElement('td');
                left.textContent = n + ' × ' + i;
                var right = document.createElement('td');
                right.className = 'mt-res';
                right.textContent = String(product);
                tr.appendChild(left);
                tr.appendChild(right);
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            wrap.textContent = '';
            wrap.appendChild(table);
            rowsEl.textContent = String(end);
            sumEl.textContent = String(sum);
        }

        root.querySelector('#mp-mt-go').addEventListener('click', run);
        nEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
        endEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
        root.querySelector('#mp-mt-clear').addEventListener('click', function () {
            nEl.value = '';
            emptyState('Enter a number and a range, then press Build.');
            rowsEl.textContent = '0';
            sumEl.textContent = '0';
            nEl.focus();
        });
        root.querySelectorAll('[data-end]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                endEl.value = btn.getAttribute('data-end');
                run();
            });
        });
        run();
    }
});
