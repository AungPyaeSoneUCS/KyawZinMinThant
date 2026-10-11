registerProject({
    id: 'agecalculator',
    title: 'Age Calculator',
    desc: 'Find your exact age plus total days, weeks and a next-birthday countdown.',
    tags: ['Utility', 'Date'],
    markup: `
    <div class="mp" id="mp-agecalculator">
        <style>
            #mp-agecalculator .age-value { font-size: 30px; font-weight: 800; color: var(--primary); font-variant-numeric: tabular-nums; }
            #mp-agecalculator .age-note { min-height: 0; }
        </style>
        <div class="mp-row" style="align-items: flex-end">
            <div>
                <label class="mp-label" for="mp-age-dob">Date of birth</label>
                <input class="mp-input" id="mp-age-dob" type="date" style="width: 100%; max-width: 260px">
            </div>
            <button class="mp-btn alt" id="mp-age-clear">Clear</button>
        </div>
        <div class="mp-out">
            <div class="mp-sub" id="mp-age-msg">Pick your date of birth.</div>
            <div id="mp-age-result" hidden>
                <div class="age-value" id="mp-age-value">—</div>
                <div class="mp-sub age-note" id="mp-age-sentence" style="margin-top: 4px"></div>
                <div class="mp-sub age-note" id="mp-age-born" style="margin-top: 2px"></div>
            </div>
        </div>
        <div class="mp-grid-3" style="margin-top: 12px">
            <div class="mp-stat"><b id="mp-age-days">—</b><span>Total days</span></div>
            <div class="mp-stat"><b id="mp-age-weeks">—</b><span>Total weeks</span></div>
            <div class="mp-stat"><b id="mp-age-next">—</b><span>Next birthday</span></div>
        </div>
    </div>`,
    init: function (root) {
        var KEY = 'mp-agecalculator';
        var input = root.querySelector('#mp-age-dob');
        var msg = root.querySelector('#mp-age-msg');
        var result = root.querySelector('#mp-age-result');
        var valueEl = root.querySelector('#mp-age-value');
        var sentence = root.querySelector('#mp-age-sentence');
        var born = root.querySelector('#mp-age-born');
        var daysEl = root.querySelector('#mp-age-days');
        var weeksEl = root.querySelector('#mp-age-weeks');
        var nextEl = root.querySelector('#mp-age-next');

        try {
            var saved = localStorage.getItem(KEY);
            if (saved) input.value = saved;
        } catch (e) { /* ignore */ }

        function save() {
            try { localStorage.setItem(KEY, input.value); } catch (e) { /* ignore */ }
        }

        function clearStats() {
            daysEl.textContent = weeksEl.textContent = nextEl.textContent = '—';
        }

        function update() {
            var value = input.value;
            if (!value) {
                msg.textContent = 'Pick your date of birth.';
                msg.hidden = false;
                result.hidden = true;
                clearStats();
                return;
            }

            var dob = new Date(value + 'T00:00:00');
            var now = new Date();
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (isNaN(dob.getTime()) || dob > now) {
                msg.textContent = 'Please choose a date in the past.';
                msg.hidden = false;
                result.hidden = true;
                clearStats();
                return;
            }

            var years = now.getFullYear() - dob.getFullYear();
            var months = now.getMonth() - dob.getMonth();
            var days = now.getDate() - dob.getDate();

            if (days < 0) {
                months -= 1;
                days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            }
            if (months < 0) {
                years -= 1;
                months += 12;
            }

            var totalDays = Math.floor((today - new Date(dob.getFullYear(), dob.getMonth(), dob.getDate())) / 86400000);

            var nb = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
            if (nb < today) nb = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
            var daysToBirthday = Math.round((nb - today) / 86400000);

            msg.hidden = true;
            result.hidden = false;
            valueEl.textContent = years + 'y ' + months + 'm ' + days + 'd';
            sentence.textContent = years + ' years, ' + months + ' months and ' + days + ' days old.';
            born.textContent = 'Born on a ' + dob.toLocaleDateString(undefined, { weekday: 'long' }) +
                ', ' + dob.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + '.';

            daysEl.textContent = totalDays.toLocaleString();
            weeksEl.textContent = Math.floor(totalDays / 7).toLocaleString();
            nextEl.textContent = daysToBirthday === 0 ? 'Today' : daysToBirthday + ' day' + (daysToBirthday === 1 ? '' : 's');
        }

        input.addEventListener('input', function () { update(); save(); });
        input.addEventListener('change', function () { update(); save(); });

        root.querySelector('#mp-age-clear').addEventListener('click', function () {
            input.value = '';
            update();
            save();
        });

        update();
    }
});
