registerProject({
    id: 'flashcards',
    title: 'Flashcard App',
    desc: 'A 100-card study deck with categories, shuffle, keyboard control and mastered tracking.',
    tags: ['Education', 'Study'],
    markup: `
    <div class="mp" id="mp-flashcards">
        <style>
            #mp-flashcards .fc-head { gap: 12px; margin-bottom: 12px; }
            #mp-flashcards .fc-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
            #mp-flashcards .fc-count { font-size: 12.5px; font-weight: 700; color: var(--muted); }
            #mp-flashcards .fc-select { width: auto; padding: 8px 10px; font-size: 13px; }
            #mp-flashcards .fc-bar { margin: 4px 0 14px; }
            #mp-flashcards .fc-card { perspective: 1200px; height: 210px; cursor: pointer; }
            #mp-flashcards .fc-inner {
                position: relative; width: 100%; height: 100%;
                transition: transform .55s cubic-bezier(.2, .8, .2, 1);
                transform-style: preserve-3d;
            }
            #mp-flashcards .fc-card.flipped .fc-inner { transform: rotateY(180deg); }
            #mp-flashcards .fc-face {
                position: absolute; inset: 0;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                gap: 12px; text-align: center; padding: 26px;
                border-radius: var(--radius-lg); border: 1px solid var(--border);
                backface-visibility: hidden; -webkit-backface-visibility: hidden;
                box-shadow: var(--shadow-sm);
            }
            #mp-flashcards .fc-front { background: var(--surface); }
            #mp-flashcards .fc-back {
                background: var(--primary-soft); color: var(--primary);
                transform: rotateY(180deg);
            }
            #mp-flashcards .fc-q { font-size: 17.5px; font-weight: 800; letter-spacing: -.01em; line-height: 1.4; }
            #mp-flashcards .fc-a { font-size: 16px; font-weight: 700; line-height: 1.5; }
            #mp-flashcards .fc-tag {
                position: absolute; top: 12px; left: 12px;
                font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase;
                padding: 3px 9px; border-radius: 99px;
                background: var(--surface-2); color: var(--muted); border: 1px solid var(--border);
            }
            #mp-flashcards .fc-back .fc-tag { background: rgba(255,255,255,.5); color: var(--primary); border-color: transparent; }
            #mp-flashcards .fc-star {
                position: absolute; top: 10px; right: 10px; font-size: 15px;
                opacity: 0; transition: opacity .2s;
            }
            #mp-flashcards .fc-card.is-known .fc-star { opacity: 1; }
            #mp-flashcards .fc-hint { font-size: 11.5px; font-weight: 700; color: var(--muted); letter-spacing: .02em; }
            #mp-flashcards .fc-foot { margin-top: 14px; }
            #mp-flashcards .fc-empty { text-align: center; color: var(--muted); padding: 40px 0; font-size: 14px; }
        </style>

        <div class="mp-between fc-head">
            <div class="fc-meta">
                <select class="mp-select fc-select" id="mp-fc-cat"></select>
                <span class="fc-count" id="mp-fc-count">1 / 100</span>
            </div>
            <div class="mp-row">
                <span class="mp-badge ok" id="mp-fc-mastered">0 mastered</span>
                <button class="mp-btn alt sm" id="mp-fc-shuffle">Shuffle</button>
                <button class="mp-btn ghost sm" id="mp-fc-reset">Reset</button>
            </div>
        </div>

        <div class="mp-progress fc-bar"><i id="mp-fc-bar"></i></div>

        <div class="fc-card" id="mp-fc-card" tabindex="0">
            <div class="fc-inner">
                <div class="fc-face fc-front">
                    <span class="fc-tag" id="mp-fc-cat-label">All</span>
                    <span class="fc-star" id="mp-fc-star" title="Mastered">⭐</span>
                    <div class="fc-q" id="mp-fc-front"></div>
                    <div class="fc-hint">Click or press Space to flip</div>
                </div>
                <div class="fc-face fc-back">
                    <span class="fc-tag">Answer</span>
                    <span class="fc-star" id="mp-fc-star2">⭐</span>
                    <div class="fc-a" id="mp-fc-back"></div>
                </div>
            </div>
        </div>

        <div class="mp-row fc-foot">
            <button class="mp-btn alt" id="mp-fc-prev">‹ Prev</button>
            <button class="mp-btn alt" id="mp-fc-flip">Flip</button>
            <button class="mp-btn" id="mp-fc-got">Got it ✓</button>
            <button class="mp-btn alt" id="mp-fc-next">Next ›</button>
        </div>
    </div>`,
    init: function (root) {
        var DECK = [
            { c: 'Basics', q: 'Who created JavaScript, and in which year?', a: 'Brendan Eich at Netscape, in 1995.' },
            { c: 'Basics', q: 'What is ECMAScript?', a: 'The standard specification that JavaScript follows.' },
            { c: 'Basics', q: 'How do you start a single-line comment?', a: 'With two forward slashes: //' },
            { c: 'Basics', q: 'What does console.log() do?', a: 'Prints values to the browser console.' },
            { c: 'Basics', q: 'What is the DOM?', a: 'The Document Object Model - a tree of the page elements.' },
            { c: 'Basics', q: 'What is a REPL?', a: 'A Read-Eval-Print Loop: an interactive code prompt.' },
            { c: 'Basics', q: 'Is JavaScript case-sensitive?', a: 'Yes, identifiers distinguish uppercase and lowercase.' },
            { c: 'Basics', q: 'How do you write a multi-line comment?', a: 'Enclose it in /* ... */' },
            { c: 'Basics', q: 'What does "use strict" do?', a: 'Turns on strict mode, which enforces safer rules.' },
            { c: 'Basics', q: 'What is the event loop?', a: 'A single-threaded loop that runs queued callbacks.' },

            { c: 'Types', q: 'Name the primitive types in JavaScript.', a: 'string, number, bigint, boolean, undefined, null, symbol.' },
            { c: 'Types', q: 'What does typeof [] return?', a: '"object" - arrays are objects.' },
            { c: 'Types', q: 'How do you reliably check for an array?', a: 'Array.isArray(value).' },
            { c: 'Types', q: 'What is NaN?', a: 'A numeric value meaning "Not a Number".' },
            { c: 'Types', q: 'How do you test for NaN safely?', a: 'Number.isNaN(value).' },
            { c: 'Types', q: 'Difference between null and undefined?', a: 'null is an assigned empty value; undefined means not yet assigned.' },
            { c: 'Types', q: 'What does Number("42") do?', a: 'Converts the string to the number 42.' },
            { c: 'Types', q: 'What is a bigint?', a: 'An integer type for values beyond Number\u2019s safe range.' },
            { c: 'Types', q: 'What is a symbol?', a: 'A unique, immutable primitive often used as an object key.' },
            { c: 'Types', q: 'Are primitive values mutable?', a: 'No, primitives are immutable.' },

            { c: 'Operators', q: 'Difference between == and ===?', a: '== compares after type coercion; === compares value and type.' },
            { c: 'Operators', q: 'What does ?? (nullish coalescing) do?', a: 'Returns the right side when the left is null or undefined.' },
            { c: 'Operators', q: 'What does ?. (optional chaining) do?', a: 'Safely reads a nested property that may be null or undefined.' },
            { c: 'Operators', q: 'What does the spread operator ... do?', a: 'Expands an iterable or copies object properties.' },
            { c: 'Operators', q: 'What is the ternary operator?', a: 'condition ? valueIfTrue : valueIfFalse' },
            { c: 'Operators', q: 'What does typeof return for a function?', a: '"function".' },
            { c: 'Operators', q: 'What does ! do?', a: 'Logical NOT: converts to boolean and inverts it.' },
            { c: 'Operators', q: 'What does the % operator return?', a: 'The remainder of a division (modulo).' },
            { c: 'Operators', q: 'What does the ternary require?', a: 'A condition and two expressions separated by ? and :' },
            { c: 'Operators', q: 'What is short-circuit evaluation?', a: '&& and || stop as soon as the result is known.' },

            { c: 'Strings', q: 'Which quote styles can define a string?', a: 'Single quotes, double quotes, or backticks.' },
            { c: 'Strings', q: 'How do you get a string\u2019s length?', a: 'The .length property.' },
            { c: 'Strings', q: 'Which method joins array items into a string?', a: 'Array.prototype.join().' },
            { c: 'Strings', q: 'How do you uppercase a string?', a: '.toUpperCase().' },
            { c: 'Strings', q: 'What do template literals use for interpolation?', a: '${expression} inside backticks.' },
            { c: 'Strings', q: 'How do you find the index of a substring?', a: 'str.indexOf(text).' },
            { c: 'Strings', q: 'How do you strip whitespace from both ends?', a: '.trim().' },
            { c: 'Strings', q: 'How do you replace text in a string?', a: '.replace() or .replaceAll().' },
            { c: 'Strings', q: 'How do you split a string into an array?', a: '.split(separator).' },
            { c: 'Strings', q: 'How do you test if a string contains text?', a: '.includes(text).' },

            { c: 'Arrays', q: 'How do you add an item to the end?', a: 'arr.push(item).' },
            { c: 'Arrays', q: 'How do you remove the last item?', a: 'arr.pop().' },
            { c: 'Arrays', q: 'Which method removes the first item?', a: 'arr.shift().' },
            { c: 'Arrays', q: 'Which method adds an item to the start?', a: 'arr.unshift(item).' },
            { c: 'Arrays', q: 'What does map() return?', a: 'A new array with each element transformed.' },
            { c: 'Arrays', q: 'What does filter() return?', a: 'A new array of elements that pass a test.' },
            { c: 'Arrays', q: 'What does reduce() do?', a: 'Combines all elements into a single value.' },
            { c: 'Arrays', q: 'How do you check if an array contains a value?', a: 'arr.includes(value).' },
            { c: 'Arrays', q: 'Which method finds a matching element\u2019s index?', a: 'arr.findIndex(fn) (or indexOf for values).' },
            { c: 'Arrays', q: 'How do you merge two arrays?', a: 'arr1.concat(arr2) or [...arr1, ...arr2].' },

            { c: 'Objects', q: 'How do you read a property?', a: 'obj.key or obj["key"].' },
            { c: 'Objects', q: 'How do you list an object\u2019s keys?', a: 'Object.keys(obj).' },
            { c: 'Objects', q: 'How do you list an object\u2019s values?', a: 'Object.values(obj).' },
            { c: 'Objects', q: 'What is destructuring?', a: 'Extracting values into variables, e.g. const { a, b } = obj.' },
            { c: 'Objects', q: 'How do you shallow-copy an object?', a: '{ ...obj } or Object.assign({}, obj).' },
            { c: 'Objects', q: 'What does JSON.stringify() do?', a: 'Converts a value into a JSON string.' },
            { c: 'Objects', q: 'How do you merge two objects?', a: 'Object.assign({}, a, b) or { ...a, ...b }.' },
            { c: 'Objects', q: 'What is a method?', a: 'A function stored as an object property.' },
            { c: 'Objects', q: 'How do you delete a property?', a: 'The delete operator: delete obj.key.' },
            { c: 'Objects', q: 'What does Object.entries() return?', a: 'An array of [key, value] pairs.' },

            { c: 'Functions', q: 'Difference between a function declaration and expression?', a: 'Declarations are hoisted; expressions are not.' },
            { c: 'Functions', q: 'What is an arrow function?', a: 'A shorter function that does not bind its own this.' },
            { c: 'Functions', q: 'What is this inside an arrow function?', a: 'The lexical this of the surrounding scope.' },
            { c: 'Functions', q: 'What is a callback?', a: 'A function passed to another function to run later.' },
            { c: 'Functions', q: 'What is a default parameter?', a: 'A fallback used when an argument is undefined.' },
            { c: 'Functions', q: 'What is a higher-order function?', a: 'A function that takes or returns another function.' },
            { c: 'Functions', q: 'How do you collect remaining arguments?', a: 'A rest parameter: function fn(...args) {}.' },
            { c: 'Functions', q: 'What does a function return with no return statement?', a: 'undefined.' },
            { c: 'Functions', q: 'What is an IIFE?', a: 'An Immediately Invoked Function Expression.' },
            { c: 'Functions', q: 'What is recursion?', a: 'A function that calls itself.' },

            { c: 'DOM', q: 'How do you select an element by id?', a: 'document.getElementById("id").' },
            { c: 'DOM', q: 'How do you select with a CSS selector?', a: 'document.querySelector() / querySelectorAll().' },
            { c: 'DOM', q: 'How do you change an element\u2019s text?', a: 'el.textContent = "new text".' },
            { c: 'DOM', q: 'How do you attach a click handler?', a: 'el.addEventListener("click", fn).' },
            { c: 'DOM', q: 'How do you create a new element?', a: 'document.createElement("div").' },
            { c: 'DOM', q: 'How do you add a CSS class?', a: 'el.classList.add("name").' },
            { c: 'DOM', q: 'How do you remove an element from the DOM?', a: 'el.remove().' },
            { c: 'DOM', q: 'What does event.preventDefault() do?', a: 'Cancels the browser\u2019s default action for the event.' },
            { c: 'DOM', q: 'What is event delegation?', a: 'Handling events on a parent using event bubbling.' },
            { c: 'DOM', q: 'How do you read an input\u2019s value?', a: 'input.value.' },

            { c: 'Async', q: 'What does a Promise represent?', a: 'The future result of an asynchronous operation.' },
            { c: 'Async', q: 'What are the three Promise states?', a: 'pending, fulfilled and rejected.' },
            { c: 'Async', q: 'What does the async keyword do?', a: 'Makes a function always return a Promise.' },
            { c: 'Async', q: 'What does await do?', a: 'Pauses async code until a Promise settles.' },
            { c: 'Async', q: 'How do you handle Promise errors?', a: '.catch() or try/catch around await.' },
            { c: 'Async', q: 'What is setTimeout used for?', a: 'Running code once after a delay.' },
            { c: 'Async', q: 'What does setInterval do?', a: 'Repeats code at a fixed interval.' },
            { c: 'Async', q: 'Sync vs async code?', a: 'Async code does not block the main thread.' },
            { c: 'Async', q: 'What does Promise.all() do?', a: 'Waits for all promises and rejects if any fails.' },
            { c: 'Async', q: 'What is a microtask?', a: 'A callback queued by Promises, run before timers.' },

            { c: 'Modern', q: 'What is destructuring used for?', a: 'Pulling values out of arrays or objects into variables.' },
            { c: 'Modern', q: 'What does the spread operator do?', a: 'Expands an iterable or copies object properties.' },
            { c: 'Modern', q: 'What is a Map?', a: 'A collection of key/value pairs where keys can be any type.' },
            { c: 'Modern', q: 'What is a Set?', a: 'A collection of unique values.' },
            { c: 'Modern', q: 'What is optional chaining for?', a: 'Safely reading nested properties that may be null.' },
            { c: 'Modern', q: 'What is a module?', a: 'A file with its own scope that can import and export.' },
            { c: 'Modern', q: 'What declaration is block-scoped?', a: 'let (and const).' },
            { c: 'Modern', q: 'What is a class?', a: 'Syntax for creating objects with shared fields and methods.' },
            { c: 'Modern', q: 'What does extends do?', a: 'Creates a subclass that inherits from another class.' },
            { c: 'Modern', q: 'What is a default export?', a: 'The main value a module exports with export default.' }
        ];

        var KNOWN_KEY = 'mp-fc-known';
        var card = root.querySelector('#mp-fc-card');
        var front = root.querySelector('#mp-fc-front');
        var back = root.querySelector('#mp-fc-back');
        var catLabel = root.querySelector('#mp-fc-cat-label');
        var countEl = root.querySelector('#mp-fc-count');
        var bar = root.querySelector('#mp-fc-bar');
        var catSel = root.querySelector('#mp-fc-cat');
        var masteredEl = root.querySelector('#mp-fc-mastered');

        var known = {};
        try {
            var saved = JSON.parse(localStorage.getItem(KNOWN_KEY) || '[]');
            saved.forEach(function (i) { known[i] = true; });
        } catch (e) { known = {}; }

        var category = 'All';
        var order = DECK.map(function (_, i) { return i; });
        var pos = 0;
        var flipped = false;

        var categories = ['All'];
        DECK.forEach(function (item) {
            if (categories.indexOf(item.c) === -1) categories.push(item.c);
        });
        catSel.innerHTML = categories.map(function (c) {
            return '<option value="' + c + '">' + c + '</option>';
        }).join('');

        function saveKnown() {
            var keys = Object.keys(known).filter(function (k) { return known[k]; });
            try { localStorage.setItem(KNOWN_KEY, JSON.stringify(keys)); } catch (e) { /* ignore */ }
        }

        function masteredCount() {
            var n = 0;
            for (var k in known) { if (known[k]) n++; }
            return n;
        }

        function buildOrder() {
            order = [];
            DECK.forEach(function (item, i) {
                if (category === 'All' || item.c === category) order.push(i);
            });
            pos = 0;
            flipped = false;
            card.classList.remove('flipped');
        }

        function updateMeta() {
            masteredEl.textContent = masteredCount() + ' / ' + DECK.length + ' mastered';
            if (!order.length) {
                countEl.textContent = '0 / 0';
                bar.style.width = '0%';
                return;
            }
            countEl.textContent = (pos + 1) + ' / ' + order.length;
            bar.style.width = Math.round(((pos + 1) / order.length) * 100) + '%';
        }

        function render() {
            if (!order.length) {
                front.textContent = 'No cards in this category.';
                back.textContent = '';
                catLabel.textContent = category;
                card.classList.remove('is-known');
                updateMeta();
                return;
            }
            var item = DECK[order[pos]];
            front.textContent = item.q;
            back.textContent = item.a;
            catLabel.textContent = item.c;
            card.classList.toggle('is-known', !!known[order[pos]]);
            card.classList.remove('flipped');
            flipped = false;
            updateMeta();
        }

        function move(n) {
            if (!order.length) return;
            pos = (pos + n + order.length) % order.length;
            render();
        }

        function flip() {
            flipped = !flipped;
            card.classList.toggle('flipped', flipped);
        }

        function gotIt() {
            if (!order.length) return;
            known[order[pos]] = true;
            saveKnown();
            card.classList.add('is-known');
            move(1);
        }

        function shuffle() {
            for (var i = order.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = order[i]; order[i] = order[j]; order[j] = t;
            }
            pos = 0;
            render();
        }

        function onKey(e) {
            if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
            if (e.key === ' ' || e.key === 'Enter') { flip(); e.preventDefault(); }
            else if (e.key === 'ArrowRight') move(1);
            else if (e.key === 'ArrowLeft') move(-1);
        }

        card.addEventListener('click', flip);
        root.querySelector('#mp-fc-prev').addEventListener('click', function () { move(-1); });
        root.querySelector('#mp-fc-next').addEventListener('click', function () { move(1); });
        root.querySelector('#mp-fc-flip').addEventListener('click', flip);
        root.querySelector('#mp-fc-got').addEventListener('click', gotIt);
        root.querySelector('#mp-fc-shuffle').addEventListener('click', shuffle);
        root.querySelector('#mp-fc-reset').addEventListener('click', function () {
            known = {};
            saveKnown();
            render();
        });
        catSel.addEventListener('change', function () {
            category = catSel.value;
            buildOrder();
            render();
        });
        document.addEventListener('keydown', onKey);

        buildOrder();
        render();

        return function cleanup() { document.removeEventListener('keydown', onKey); };
    }
});
