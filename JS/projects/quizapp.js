registerProject({
    id: 'quizapp',
    title: 'Quiz App',
    desc: 'A 100-question JavaScript quiz bank; each round pulls a random set with instant feedback.',
    tags: ['Game', 'Education'],
    markup: `
    <div class="mp" id="mp-quizapp">
        <style>
            #mp-quizapp .qz-top { margin-bottom: 10px; }
            #mp-quizapp .qz-q { font-size: 16.5px; font-weight: 800; letter-spacing: -.01em; margin: 14px 0; line-height: 1.45; }
            #mp-quizapp .qz-opts { display: grid; gap: 9px; }
            #mp-quizapp .qz-opt {
                display: flex; align-items: center; gap: 12px; text-align: left;
                padding: 12px 14px; border-radius: 12px; border: 1px solid var(--border);
                background: var(--surface); color: var(--text); font: inherit; font-size: 14px;
                cursor: pointer; transition: transform .15s, border-color .15s, background .15s;
            }
            #mp-quizapp .qz-opt:hover:not(.done) { border-color: var(--primary); transform: translateY(-1px); }
            #mp-quizapp .qz-opt.done { cursor: default; }
            #mp-quizapp .qz-key {
                width: 26px; height: 26px; flex: none; display: grid; place-items: center;
                border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border);
                font-size: 12px; font-weight: 800; color: var(--muted);
            }
            #mp-quizapp .qz-opt.correct { background: var(--ok-soft); border-color: var(--ok); }
            #mp-quizapp .qz-opt.correct .qz-key { background: var(--ok); color: #fff; border-color: transparent; }
            #mp-quizapp .qz-opt.wrong { background: var(--danger-soft); border-color: var(--danger); }
            #mp-quizapp .qz-opt.wrong .qz-key { background: var(--danger); color: #fff; border-color: transparent; }
            #mp-quizapp .qz-foot { margin-top: 16px; }
            #mp-quizapp .qz-result { text-align: center; padding: 12px 0; }
            #mp-quizapp .qz-score {
                font-size: 46px; font-weight: 900; letter-spacing: -.02em;
                background: var(--primary-grad); -webkit-background-clip: text; background-clip: text; color: transparent;
            }
            #mp-quizapp .qz-msg { font-weight: 700; margin: 8px 0 16px; }
        </style>
        <div class="mp-between" style="margin-bottom:14px">
            <span class="mp-sub"><b>100</b> question bank</span>
            <label class="mp-row" style="gap:8px">
                <span class="mp-sub">Round</span>
                <select class="mp-select" id="mp-qz-size" style="width:auto;padding:7px 10px;font-size:13px">
                    <option value="10">10 questions</option>
                    <option value="25">25 questions</option>
                    <option value="50">50 questions</option>
                    <option value="100">All 100</option>
                </select>
            </label>
        </div>
        <div id="mp-qz-body"></div>
    </div>`,
    init: function (root) {
        var BANK = [
            { q: 'Which keyword declares a block-scoped variable?', a: ['var', 'let', 'function'], correct: 1 },
            { q: 'What does "2" + 2 evaluate to?', a: ['4', '22', 'NaN'], correct: 1 },
            { q: 'Which method converts JSON text into an object?', a: ['JSON.stringify', 'JSON.parse', 'Object.from'], correct: 1 },
            { q: 'What does typeof null return?', a: ['"null"', '"object"', '"undefined"'], correct: 1 },
            { q: 'Which method adds an item to the end of an array?', a: ['push()', 'pop()', 'shift()'], correct: 0 },
            { q: 'Which method removes the first array element?', a: ['shift()', 'unshift()', 'pop()'], correct: 0 },
            { q: 'What does === compare?', a: ['Value only', 'Value and type', 'Type only'], correct: 1 },
            { q: 'Which keyword declares a constant?', a: ['let', 'var', 'const'], correct: 2 },
            { q: 'Do arrow functions create their own this?', a: ['Yes', 'No', 'Only in classes'], correct: 1 },
            { q: 'Which loop iterates the values of an iterable?', a: ['for...in', 'for...of', 'for...at'], correct: 1 },
            { q: 'What does NaN stand for?', a: ['Not a Name', 'Not a Number', 'Null and None'], correct: 1 },
            { q: 'Which of these is NOT a primitive type?', a: ['string', 'object', 'boolean'], correct: 1 },
            { q: 'What does Array.isArray([]) return?', a: ['true', 'false', '"array"'], correct: 0 },
            { q: 'Which method joins array items into a string?', a: ['join()', 'merge()', 'concat()'], correct: 0 },
            { q: 'Which method returns a new, transformed array?', a: ['forEach()', 'map()', 'find()'], correct: 1 },
            { q: 'Which method returns a new, filtered array?', a: ['filter()', 'find()', 'splice()'], correct: 0 },
            { q: 'What does reduce() do?', a: ['Sorts items', 'Combines items into one value', 'Removes duplicates'], correct: 1 },
            { q: 'Which method checks whether an array includes a value?', a: ['has()', 'includes()', 'contains()'], correct: 1 },
            { q: 'What does the spread operator ... do?', a: ['Expands iterables', 'Multiplies values', 'Deletes items'], correct: 0 },
            { q: 'Which is the nullish coalescing operator?', a: ['||', '??', '?.'], correct: 1 },
            { q: 'Optional chaining uses which syntax?', a: ['?.', '?', '::'], correct: 0 },
            { q: 'What is the ternary operator?', a: ['if/else', 'condition ? a : b', 'switch'], correct: 1 },
            { q: 'What does "5" - 2 evaluate to?', a: ['3', '"3"', 'NaN'], correct: 0 },
            { q: 'What does true + 1 evaluate to?', a: ['2', 'true1', 'NaN'], correct: 0 },
            { q: 'Which method turns a string into an array?', a: ['split()', 'slice()', 'splice()'], correct: 0 },
            { q: 'Which method removes whitespace from both ends?', a: ['trim()', 'strip()', 'clean()'], correct: 0 },
            { q: 'Which string method tests for a substring?', a: ['contains()', 'includes()', 'search()'], correct: 1 },
            { q: 'How do you interpolate in a template literal?', a: ['{var}', '${var}', '%var%'], correct: 1 },
            { q: 'What do template literals use?', a: ['Backticks', 'Double quotes', 'Square brackets'], correct: 0 },
            { q: 'What is a function stored on an object called?', a: ['A property', 'A method', 'A field'], correct: 1 },
            { q: 'How do you read a property with a dynamic name?', a: ['obj.name', 'obj["name"]', 'obj->name'], correct: 1 },
            { q: 'What does Object.keys(obj) return?', a: ['All values', 'An array of keys', 'The length'], correct: 1 },
            { q: 'What does JSON.stringify() do?', a: ['Parses JSON', 'Converts a value to JSON text', 'Clones objects'], correct: 1 },
            { q: 'What is destructuring?', a: ['Extracting values into variables', 'Deleting properties', 'Copying an object'], correct: 0 },
            { q: 'How do you shallow-copy an object?', a: ['obj.copy()', '{ ...obj }', 'obj.clone()'], correct: 1 },
            { q: 'How do you delete a property?', a: ['delete obj.key', 'remove obj.key', 'obj.key = null'], correct: 0 },
            { q: 'What does Object.entries() return?', a: ['[key, value] pairs', 'Only keys', 'Only values'], correct: 0 },
            { q: 'Which method creates an element?', a: ['document.newElement()', 'document.createElement()', 'document.make()'], correct: 1 },
            { q: 'Which selects the first matching CSS selector?', a: ['getElementById', 'querySelector', 'getElementsByClassName'], correct: 1 },
            { q: 'Which attaches an event handler?', a: ['on()', 'addEventListener()', 'attach()'], correct: 1 },
            { q: 'What does event.preventDefault() do?', a: ['Stops bubbling', 'Cancels the default action', 'Removes the element'], correct: 1 },
            { q: 'What does event.stopPropagation() do?', a: ['Cancels default', 'Stops bubbling to ancestors', 'Deletes the event'], correct: 1 },
            { q: 'What is event delegation?', a: ['Handling events on a parent', 'Removing events', 'Cloning events'], correct: 0 },
            { q: 'How do you read a text input value?', a: ['input.text', 'input.value', 'input.content'], correct: 1 },
            { q: 'Which adds a CSS class?', a: ['el.class.add()', 'el.classList.add()', 'el.addClass()'], correct: 1 },
            { q: 'How do you remove an element?', a: ['el.delete()', 'el.remove()', 'el.destroy()'], correct: 1 },
            { q: 'What does textContent set?', a: ['HTML markup', 'Plain text', 'Attributes'], correct: 1 },
            { q: 'What does innerHTML set?', a: ['Plain text', 'HTML markup', 'Styles'], correct: 1 },
            { q: 'A Promise starts in which state?', a: ['fulfilled', 'pending', 'rejected'], correct: 1 },
            { q: 'Which handles a rejected promise?', a: ['.then()', '.catch()', '.map()'], correct: 1 },
            { q: 'What does async make a function return?', a: ['Nothing', 'A Promise', 'An array'], correct: 1 },
            { q: 'What does await do?', a: ['Blocks the whole program', 'Pauses async code for a promise', 'Rejects a promise'], correct: 1 },
            { q: 'What does Promise.all() do if any promise rejects?', a: ['Resolves', 'Rejects', 'Ignores it'], correct: 1 },
            { q: 'setTimeout runs code...', a: ['Once after a delay', 'Repeatedly', 'Immediately'], correct: 0 },
            { q: 'setInterval runs code...', a: ['Once', 'Repeatedly at an interval', 'After a rejection'], correct: 1 },
            { q: 'What does clearTimeout do?', a: ['Cancels a scheduled timeout', 'Clears the console', 'Stops intervals'], correct: 0 },
            { q: 'Which is a microtask?', a: ['setTimeout callback', 'Promise callback', 'DOM event'], correct: 1 },
            { q: 'What is hoisting?', a: ['Moving declarations to the top', 'Copying variables', 'Deleting functions'], correct: 0 },
            { q: 'Which declaration is hoisted but initialized to undefined?', a: ['let', 'var', 'const'], correct: 1 },
            { q: 'What is a closure?', a: ['A function that remembers its outer scope', 'A closed loop', 'A frozen object'], correct: 0 },
            { q: 'What is a callback?', a: ['A function passed to run later', 'A return value', 'A loop'], correct: 0 },
            { q: 'What is recursion?', a: ['A loop', 'A function calling itself', 'An event'], correct: 1 },
            { q: 'What is an IIFE?', a: ['A function that runs immediately', 'A class', 'A promise'], correct: 0 },
            { q: 'What does the rest parameter ...args do?', a: ['Collects arguments into an array', 'Spreads an array', 'Deletes arguments'], correct: 0 },
            { q: 'What does a function return with no return statement?', a: ['null', 'undefined', '0'], correct: 1 },
            { q: 'How do you define a class?', a: ['class keyword', 'function keyword only', 'object literal'], correct: 0 },
            { q: 'What does extends do?', a: ['Creates a subclass', 'Deletes a class', 'Copies a method'], correct: 0 },
            { q: 'What is a static method?', a: ['Called on the class itself', 'Called on instances only', 'Always private'], correct: 0 },
            { q: 'What is a Map?', a: ['Key/value pairs with any key type', 'A unique value set', 'A sorted array'], correct: 0 },
            { q: 'What is a Set?', a: ['A collection of unique values', 'Key/value pairs', 'A sorted array'], correct: 0 },
            { q: 'Which converts a Set to an array?', a: ['[...set]', 'set.toArray()', 'Array(set) only'], correct: 0 },
            { q: 'What does JSON.parse() throw on invalid input?', a: ['Nothing', 'A SyntaxError', 'null'], correct: 1 },
            { q: 'How do you handle errors in async/await?', a: ['try/catch', 'Only .finally', 'Ignore them'], correct: 0 },
            { q: 'When does finally run?', a: ['After try/catch, always', 'Only on success', 'Only on failure'], correct: 0 },
            { q: 'Which is the logical AND operator?', a: ['&&', '||', '!'], correct: 0 },
            { q: 'Which is the logical OR operator?', a: ['&&', '||', '!'], correct: 1 },
            { q: 'What does ! do?', a: ['Negates a boolean', 'Doubles a value', 'Clones a value'], correct: 0 },
            { q: 'Which converts a value to a number?', a: ['String(x)', 'Number(x)', 'Boolean(x)'], correct: 1 },
            { q: 'Which converts a value to a boolean?', a: ['Boolean(x)', 'Number(x)', 'String(x)'], correct: 0 },
            { q: 'Which converts a value to a string?', a: ['String(x)', 'Number(x)', 'parse(x)'], correct: 0 },
            { q: 'What is parseInt("12px")?', a: ['12', '"12px"', 'NaN'], correct: 0 },
            { q: 'What is Number("12px")?', a: ['12', 'NaN', '"12"'], correct: 1 },
            { q: 'Is 0.1 + 0.2 === 0.3 true?', a: ['true', 'false', 'NaN'], correct: 1 },
            { q: 'Which rounds to the nearest integer?', a: ['Math.floor', 'Math.round', 'Math.ceil'], correct: 1 },
            { q: 'Which rounds down?', a: ['Math.floor', 'Math.round', 'Math.ceil'], correct: 0 },
            { q: 'What does Math.random() return?', a: ['A number >= 0 and < 1', 'An integer', 'NaN'], correct: 0 },
            { q: 'What does String.prototype.charAt() do?', a: ['Returns the character at an index', 'Deletes a character', 'Splits the string'], correct: 0 },
            { q: 'Which method does a string NOT have?', a: ['reverse()', 'split()', 'trim()'], correct: 0 },
            { q: 'Which array method sorts in place?', a: ['sort()', 'sorted()', 'order()'], correct: 0 },
            { q: 'Which method tests if every element passes?', a: ['every()', 'some()', 'all()'], correct: 0 },
            { q: 'Which method tests if some element passes?', a: ['every()', 'some()', 'none()'], correct: 1 },
            { q: 'Which finds a matching element index?', a: ['findIndex()', 'indexOf only', 'find()'], correct: 0 },
            { q: 'Which creates an array from an iterable?', a: ['Array.from()', 'Array.of()', 'new Array() only'], correct: 0 },
            { q: 'Which flattens nested arrays?', a: ['flat()', 'flatMap()', 'concat()'], correct: 0 },
            { q: 'What does flatMap() do?', a: ['Maps then flattens one level', 'Only flattens', 'Only maps'], correct: 0 },
            { q: 'What does slice() do?', a: ['Returns a shallow copy section', 'Mutates the array', 'Sorts the array'], correct: 0 },
            { q: 'What does Array.prototype.at(-1) return?', a: ['The last element', 'The first element', 'undefined'], correct: 0 },
            { q: 'What does splice() do?', a: ['Adds/removes items in place', 'Copies the array', 'Sorts the array'], correct: 0 },
            { q: 'Which operator tests property existence?', a: ['in', 'of', 'has'], correct: 0 },
            { q: 'Which tests for an own property?', a: ['obj.hasOwnProperty()', 'in (includes inherited)', 'obj.contains()'], correct: 0 }
        ];

        var body = root.querySelector('#mp-qz-body');
        var sizeSel = root.querySelector('#mp-qz-size');
        var roundSize = Number(sizeSel.value);
        var round = [];
        var idx = 0;
        var score = 0;
        var locked = false;

        function shuffle(arr) {
            for (var i = arr.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
            }
            return arr;
        }

        function start() {
            round = shuffle(BANK.slice()).slice(0, Math.min(roundSize, BANK.length));
            idx = 0;
            score = 0;
            render();
        }

        function render() {
            body.innerHTML = '';
            if (idx >= round.length) { finish(); return; }
            locked = false;
            var item = round[idx];

            var head = document.createElement('div');
            head.className = 'mp-between qz-top';
            var prog = document.createElement('span');
            prog.className = 'mp-sub';
            prog.textContent = 'Question ' + (idx + 1) + ' of ' + round.length;
            var badge = document.createElement('span');
            badge.className = 'mp-badge';
            badge.textContent = 'Score ' + score;
            head.appendChild(prog);
            head.appendChild(badge);

            var bar = document.createElement('div');
            bar.className = 'mp-progress';
            var fill = document.createElement('i');
            fill.style.width = Math.round((idx / round.length) * 100) + '%';
            bar.appendChild(fill);

            var q = document.createElement('div');
            q.className = 'qz-q';
            q.textContent = item.q;

            var opts = document.createElement('div');
            opts.className = 'qz-opts';
            item.a.forEach(function (text, i) {
                var b = document.createElement('button');
                b.className = 'qz-opt';
                var k = document.createElement('span');
                k.className = 'qz-key';
                k.textContent = 'ABC'[i] || String(i + 1);
                var t = document.createElement('span');
                t.textContent = text;
                b.appendChild(k);
                b.appendChild(t);
                b.addEventListener('click', function () { answer(i); });
                opts.appendChild(b);
            });

            var foot = document.createElement('div');
            foot.className = 'mp-row qz-foot';
            var next = document.createElement('button');
            next.className = 'mp-btn';
            next.id = 'mp-qz-next';
            next.textContent = (idx === round.length - 1) ? 'See results' : 'Next';
            next.disabled = true;
            next.addEventListener('click', function () { idx++; render(); });
            foot.appendChild(next);

            body.appendChild(head);
            body.appendChild(bar);
            body.appendChild(q);
            body.appendChild(opts);
            body.appendChild(foot);
        }

        function answer(pick) {
            if (locked) return;
            locked = true;
            var item = round[idx];
            var btns = body.querySelectorAll('.qz-opt');
            for (var i = 0; i < btns.length; i++) {
                btns[i].classList.add('done');
                if (i === item.correct) btns[i].classList.add('correct');
                else if (i === pick) btns[i].classList.add('wrong');
            }
            if (pick === item.correct) score++;
            var badge = body.querySelector('.qz-top .mp-badge');
            if (badge) badge.textContent = 'Score ' + score;
            var next = body.querySelector('#mp-qz-next');
            if (next) { next.disabled = false; next.focus(); }
        }

        function finish() {
            var pct = round.length ? Math.round((score / round.length) * 100) : 0;
            var msg = pct === 100 ? 'Perfect score!' : pct >= 70 ? 'Great work!' : pct >= 40 ? 'Not bad - keep practising.' : 'Review the flashcards and try again.';

            var wrap = document.createElement('div');
            wrap.className = 'qz-result';

            var s = document.createElement('div');
            s.className = 'qz-score';
            s.textContent = score + ' / ' + round.length;

            var m = document.createElement('div');
            m.className = 'qz-msg';
            m.textContent = msg;

            var row = document.createElement('div');
            row.className = 'mp-row';
            row.style.justifyContent = 'center';

            var again = document.createElement('button');
            again.className = 'mp-btn';
            again.textContent = 'Play again';
            again.addEventListener('click', start);

            var full = document.createElement('button');
            full.className = 'mp-btn alt';
            full.textContent = 'All 100';
            full.addEventListener('click', function () {
                roundSize = BANK.length;
                sizeSel.value = String(BANK.length);
                start();
            });

            row.appendChild(again);
            row.appendChild(full);
            wrap.appendChild(s);
            wrap.appendChild(m);
            wrap.appendChild(row);
            body.appendChild(wrap);
        }

        sizeSel.addEventListener('change', function () {
            roundSize = Number(sizeSel.value);
            start();
        });

        function onKey(e) {
            if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
            if (!locked && /^[1-3]$/.test(e.key)) {
                var btns = body.querySelectorAll('.qz-opt');
                var i = Number(e.key) - 1;
                if (btns[i]) answer(i);
            } else if (e.key === 'Enter') {
                var next = body.querySelector('#mp-qz-next');
                if (next && !next.disabled) { idx++; render(); }
            }
        }
        document.addEventListener('keydown', onKey);

        start();

        return function cleanup() { document.removeEventListener('keydown', onKey); };
    }
});
