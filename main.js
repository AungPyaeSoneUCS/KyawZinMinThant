(function () {
    'use strict';

    var SECTIONS = [
        {
            id: 'course',
            kicker: 'Full course',
            title: 'JavaScript Course',
            desc: 'A structured 100-lesson path from the basics through operators, strings, arrays, objects, functions, the DOM and modern ES features.',
            tags: ['Course', '100 lessons', 'Beginner to Advanced'],
            meta: '100 lessons',
            href: 'JS/index.html',
            status: 'ready',
            icon: 'book'
        },
        {
            id: 'projects',
            kicker: 'Practice',
            title: '50 Mini Projects',
            desc: 'Fifty hands-on browser projects — games, converters, timers and UI widgets — each in a single file you can read and tweak.',
            tags: ['Projects', 'Interactive', 'Offline'],
            meta: '50 projects',
            href: 'JS/JavascriptMiniProject.html',
            status: 'ready',
            icon: 'grid'
        },
        {
            id: 'html',
            kicker: 'Full course',
            title: 'HTML Course',
            desc: 'Fifty lessons covering structure, text, links, media, tables, forms, the document head, accessibility and modern HTML.',
            tags: ['Course', '50 lessons', 'Markup'],
            meta: '50 lessons',
            href: 'HTML/index.html',
            status: 'ready',
            icon: 'code'
        },
        {
            id: 'css',
            title: 'CSS Course',
            kicker: 'Full course',
            desc: 'Fifty lessons on selectors, the box model, Flexbox, Grid, responsive design, animation and modern CSS variables.',
            tags: ['Course', '50 lessons', 'Styling'],
            meta: '50 lessons',
            href: 'CSS/index.html',
            status: 'ready',
            icon: 'brush'
        }
    ];

    var ICONS = {
        book: '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M6 3v16"/>',
        grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
        code: '<path d="M8 6 3 12l5 6"/><path d="M16 6l5 6-5 6"/>',
        brush: '<path d="M4 21c3 0 5-1.2 5-4.2 0-2-2-2.2-2-4.3a4 4 0 0 1 8 0c0 2-2 2.3-2 4.3 0 3 2 4.2 5 4.2"/><circle cx="12" cy="7" r="1"/>'
    };

    var THEME_KEY = 'mp-theme';
    var root = document.documentElement;
    var grid = document.getElementById('grid');
    var searchInput = document.getElementById('search');
    var countEl = document.getElementById('count');
    var emptyEl = document.getElementById('empty');
    var themeBtn = document.getElementById('themeBtn');
    var themeIcon = document.getElementById('themeIcon');

    var SUN = '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
    var MOON = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';

    function svg(paths, cls) {
        return '<svg' + (cls ? ' class="' + cls + '"' : '') +
            ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
            ' stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
    }

    function makeCard(item) {
        var ready = item.status === 'ready';
        var el = document.createElement(ready ? 'a' : 'div');
        el.className = 'section-card' + (ready ? '' : ' soon');
        if (ready) {
            el.href = item.href;
        } else {
            el.setAttribute('aria-disabled', 'true');
        }

        var head = document.createElement('div');
        head.className = 'card-top';
        var icon = document.createElement('span');
        icon.className = 'card-icon';
        icon.innerHTML = svg(ICONS[item.icon] || ICONS.code);
        head.appendChild(icon);
        var titleWrap = document.createElement('div');
        titleWrap.innerHTML =
            '<div class="kicker"></div><h3></h3>';
        titleWrap.querySelector('.kicker').textContent = item.kicker;
        titleWrap.querySelector('h3').textContent = item.title;
        head.appendChild(titleWrap);

        var desc = document.createElement('p');
        desc.className = 'desc';
        desc.textContent = item.desc;

        var tags = document.createElement('div');
        tags.className = 'tags';
        item.tags.forEach(function (t) {
            var s = document.createElement('span');
            s.className = 'tag';
            s.textContent = t;
            tags.appendChild(s);
        });

        var foot = document.createElement('div');
        foot.className = 'card-foot';
        var meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = item.meta;
        var badge = document.createElement('span');
        badge.className = 'badge' + (ready ? '' : ' soon');
        badge.textContent = ready ? 'Ready' : 'Soon';
        foot.appendChild(meta);
        if (ready) {
            var arrow = document.createElement('span');
            arrow.className = 'arrow';
            arrow.setAttribute('aria-hidden', 'true');
            arrow.innerHTML = svg('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>');
            var right = document.createElement('span');
            right.style.cssText = 'display:flex;align-items:center;gap:8px';
            right.appendChild(badge);
            right.appendChild(arrow);
            right.querySelector('svg').style.width = '16px';
            right.querySelector('svg').style.height = '16px';
            right.querySelector('svg').style.color = 'var(--primary)';
            foot.appendChild(right);
        } else {
            foot.appendChild(badge);
        }

        el.appendChild(head);
        el.appendChild(desc);
        el.appendChild(tags);
        el.appendChild(foot);
        return el;
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('themeBtn').setAttribute('aria-pressed', theme === 'dark');
        document.getElementById('themeIcon').innerHTML = (theme === 'dark') ? MOON : SUN;
        try { localStorage.setItem('mp-theme', theme); } catch (e) {}
    }

    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function matches(item, q) {
        if (!q) return true;
        var hay = (item.title + ' ' + item.kicker + ' ' + item.desc + ' ' + item.tags.join(' ') + ' ' + item.meta).toLowerCase();
        return hay.indexOf(q) !== -1;
    }

    function render(filter) {
        var q = (filter || '').trim().toLowerCase();
        var grid = document.getElementById('grid');
        grid.innerHTML = '';
        var shown = SECTIONS.filter(function (s) { return matches(s, q); });
        shown.forEach(function (s) { grid.appendChild(makeCard(s)); });

        var empty = document.getElementById('empty');
        empty.hidden = shown.length !== 0;

        var ready = shown.filter(function (s) { return s.status === 'ready'; }).length;
        var count = document.getElementById('count');
        count.innerHTML = '';
        var b = document.createElement('b');
        b.textContent = shown.length;
        count.appendChild(b);
        count.appendChild(document.createTextNode(' of ' + SECTIONS.length + ' shown'));
        if (!q) {
            count.appendChild(document.createTextNode(' \u00b7 '));
            var rb = document.createElement('b');
            rb.textContent = ready;
            count.appendChild(rb);
            count.appendChild(document.createTextNode(' ready'));
        }
    }

    // theme
    document.getElementById('themeIcon').innerHTML = (currentTheme() === 'dark') ? MOON : SUN;
    document.getElementById('themeBtn').addEventListener('click', function () {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });

    // search
    document.getElementById('search').addEventListener('input', function (e) {
        render(e.target.value);
    });
    document.addEventListener('keydown', function (e) {
        var tag = (e.target && e.target.tagName) || '';
        if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
            e.preventDefault();
            document.getElementById('search').focus();
        }
        if (e.key === 'Escape' && document.activeElement === document.getElementById('search')) {
            document.getElementById('search').value = '';
            render('');
        }
    });

    render('');
})();
