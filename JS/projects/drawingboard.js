registerProject({
    id: 'drawingboard',
    title: 'Drawing Board',
    desc: 'A modern canvas with a color palette, live brush preview, eraser, undo and PNG export.',
    tags: ['Canvas', 'Creative'],
    markup: `
    <div class="mp" id="mp-drawingboard">
        <style>
            #mp-drawingboard .db-tools {
                display: flex; flex-wrap: wrap; gap: 14px; align-items: center;
                padding: 12px; margin-bottom: 12px;
                background: var(--surface-2); border: 1px solid var(--border);
                border-radius: 14px;
            }
            #mp-drawingboard .db-group { display: flex; align-items: center; gap: 10px; }
            #mp-drawingboard .db-lab {
                font-size: 10.5px; font-weight: 800; letter-spacing: .06em;
                text-transform: uppercase; color: var(--muted);
            }
            #mp-drawingboard .db-swatches { display: flex; flex-wrap: wrap; gap: 6px; }
            #mp-drawingboard .db-sw {
                width: 22px; height: 22px; padding: 0; border-radius: 7px;
                cursor: pointer; border: 2px solid var(--border);
                transition: transform .12s, border-color .12s, box-shadow .12s;
            }
            #mp-drawingboard .db-sw:hover { transform: translateY(-1px); }
            #mp-drawingboard .db-sw.active {
                border-color: var(--text); transform: scale(1.08);
                box-shadow: 0 0 0 3px var(--primary-soft);
            }
            #mp-drawingboard input[type="color"] {
                width: 36px; height: 30px; padding: 0; cursor: pointer;
                border: 2px solid var(--border); border-radius: 9px;
                background: var(--surface);
            }
            #mp-drawingboard input[type="range"] {
                width: 128px; accent-color: var(--primary); cursor: pointer;
            }
            #mp-drawingboard .db-preview {
                width: 26px; height: 26px; flex: none;
                display: grid; place-items: center;
            }
            #mp-drawingboard .db-preview i {
                display: block; border-radius: 50%;
                box-shadow: 0 0 0 1px var(--border);
                transition: width .12s, height .12s, background .12s;
            }
            #mp-drawingboard .db-actions { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }
            #mp-drawingboard .db-btn {
                font: inherit; font-size: 13px; font-weight: 700;
                padding: 9px 13px; border-radius: 10px; cursor: pointer;
                color: var(--text); background: var(--surface);
                border: 1px solid var(--border);
                transition: transform .14s, box-shadow .14s, border-color .14s, background .14s;
            }
            #mp-drawingboard .db-btn:hover { transform: translateY(-1px); border-color: var(--primary); }
            #mp-drawingboard .db-btn.active {
                color: var(--primary); background: var(--primary-soft); border-color: var(--primary);
            }
            #mp-drawingboard .db-btn.primary {
                color: #fff; border-color: transparent;
                background: linear-gradient(135deg, var(--primary), var(--primary-2));
            }
            #mp-drawingboard .db-btn.primary:hover { box-shadow: 0 10px 20px -12px rgba(99, 102, 241, .9); }
            #mp-drawingboard .db-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
            #mp-drawingboard .db-board {
                position: relative; border-radius: 14px; overflow: hidden;
                border: 1px solid var(--border); box-shadow: var(--shadow);
                background-color: #ffffff;
                background-image: radial-gradient(rgba(15, 23, 42, .10) 1px, transparent 1px);
                background-size: 18px 18px;
            }
            #mp-drawingboard canvas {
                display: block; width: 100%; height: 320px;
                background: transparent; cursor: crosshair; touch-action: none;
            }
        </style>
        <div class="db-tools">
            <div class="db-group">
                <span class="db-lab">Color</span>
                <div class="db-swatches" id="mp-db-swatches"></div>
                <input type="color" id="mp-db-color" value="#6366f1" title="Custom color">
            </div>
            <div class="db-group">
                <span class="db-lab">Brush</span>
                <input type="range" id="mp-db-size" min="1" max="60" value="8">
                <span class="db-preview" id="mp-db-preview"><i></i></span>
            </div>
            <div class="db-actions">
                <button class="db-btn" id="mp-db-eraser" title="Eraser">Eraser</button>
                <button class="db-btn" id="mp-db-undo" title="Undo">Undo</button>
                <button class="db-btn" id="mp-db-clear" title="Clear canvas">Clear</button>
                <button class="db-btn primary" id="mp-db-save" title="Save as PNG">Save PNG</button>
            </div>
        </div>
        <div class="db-board">
            <canvas id="mp-db-canvas"></canvas>
        </div>
    </div>`,
    init: function (root) {
        var canvas = root.querySelector('#mp-db-canvas');
        var ctx = canvas.getContext('2d');
        var colorEl = root.querySelector('#mp-db-color');
        var sizeEl = root.querySelector('#mp-db-size');
        var previewIcon = root.querySelector('#mp-db-preview i');
        var swatchWrap = root.querySelector('#mp-db-swatches');
        var eraserBtn = root.querySelector('#mp-db-eraser');
        var undoBtn = root.querySelector('#mp-db-undo');

        var COLORS = ['#0f172a', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#ffffff'];
        var color = colorEl.value;
        var size = Number(sizeEl.value);
        var eraser = false;
        var drawing = false;
        var last = null;
        var dpr = window.devicePixelRatio || 1;
        var history = [];
        var ro = null;

        /* ---------- history ---------- */
        function updateUndo() { undoBtn.disabled = history.length === 0; }

        function pushHistory() {
            try {
                history.push(canvas.toDataURL('image/png'));
                if (history.length > 40) history.shift();
            } catch (e) { /* ignore */ }
            updateUndo();
        }

        function blank() {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        function restore(url) {
            var img = new Image();
            img.onload = function () {
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalCompositeOperation = 'source-over';
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                ctx.restore();
                last = null;
            };
            img.src = url;
        }

        /* ---------- sizing ---------- */
        function resize() {
            var rect = canvas.getBoundingClientRect();
            if (rect.width < 2 || rect.height < 2) return;
            dpr = window.devicePixelRatio || 1;

            var prev = null;
            if (canvas.width > 1 && canvas.height > 1) {
                prev = document.createElement('canvas');
                prev.width = canvas.width;
                prev.height = canvas.height;
                prev.getContext('2d').drawImage(canvas, 0, 0);
            }

            canvas.width = Math.max(1, Math.round(rect.width * dpr));
            canvas.height = Math.max(1, Math.round(rect.height * dpr));
            ctx = canvas.getContext('2d');
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (prev) {
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(prev, 0, 0, canvas.width, canvas.height);
                ctx.restore();
            }
        }

        /* ---------- drawing ---------- */
        function point(e) {
            var rect = canvas.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }

        function stroke(p) {
            ctx.globalCompositeOperation = eraser ? 'destination-out' : 'source-over';
            ctx.strokeStyle = eraser ? '#000' : color;
            ctx.fillStyle = eraser ? '#000' : color;
            ctx.lineWidth = size;
            if (!last) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.moveTo(last.x, last.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
            last = p;
        }

        function onDown(e) {
            if (e.button !== undefined && e.button !== 0) return;
            e.preventDefault();
            drawing = true;
            last = null;
            if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
            stroke(point(e));
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
            document.addEventListener('pointercancel', onUp);
        }

        function onMove(e) {
            if (drawing) stroke(point(e));
        }

        function onUp() {
            if (!drawing) return;
            drawing = false;
            last = null;
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointercancel', onUp);
            pushHistory();
        }

        /* ---------- actions ---------- */
        function undo() {
            if (!history.length) return;
            history.pop();
            if (history.length) restore(history[history.length - 1]);
            else blank();
            updateUndo();
        }

        function clear() {
            blank();
            history = [];
            updateUndo();
        }

        function save() {
            var out = document.createElement('canvas');
            out.width = canvas.width;
            out.height = canvas.height;
            var octx = out.getContext('2d');
            octx.fillStyle = '#ffffff';
            octx.fillRect(0, 0, out.width, out.height);
            octx.drawImage(canvas, 0, 0);
            var name = 'drawing.png';
            if (out.toBlob) {
                out.toBlob(function (blob) {
                    if (!blob) return;
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
                }, 'image/png');
            } else {
                var url2 = out.toDataURL('image/png');
                var a2 = document.createElement('a');
                a2.href = url2;
                a2.download = name;
                document.body.appendChild(a2);
                a2.click();
                document.body.removeChild(a2);
            }
        }

        /* ---------- UI ---------- */
        function updatePreview() {
            var d = Math.max(3, Math.min(size, 24));
            previewIcon.style.width = d + 'px';
            previewIcon.style.height = d + 'px';
            previewIcon.style.background = eraser ? 'transparent' : color;
            previewIcon.style.border = eraser ? '2px dashed var(--muted)' : 'none';
        }

        function setActiveSwatch(el) {
            var all = swatchWrap.querySelectorAll('.db-sw');
            for (var i = 0; i < all.length; i++) all[i].classList.toggle('active', all[i] === el);
        }

        function setColor(c, el) {
            color = c;
            eraser = false;
            eraserBtn.classList.remove('active');
            colorEl.value = c;
            setActiveSwatch(el || null);
            updatePreview();
        }

        COLORS.forEach(function (c) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'db-sw';
            b.style.background = c;
            b.title = c;
            if (c === color) b.classList.add('active');
            swatchWrap.appendChild(b);
            b.addEventListener('click', function () { setColor(c, b); });
        });

        eraserBtn.addEventListener('click', function () {
            eraser = !eraser;
            eraserBtn.classList.toggle('active', eraser);
            setActiveSwatch(null);
            updatePreview();
        });
        colorEl.addEventListener('input', function () { setColor(colorEl.value, null); });
        sizeEl.addEventListener('input', function () { size = Number(sizeEl.value); updatePreview(); });
        undoBtn.addEventListener('click', undo);
        root.querySelector('#mp-db-clear').addEventListener('click', clear);
        root.querySelector('#mp-db-save').addEventListener('click', save);

        canvas.addEventListener('pointerdown', onDown);
        window.addEventListener('resize', resize);

        /* ---------- boot ---------- */
        setColor(color, null);
        updatePreview();
        updateUndo();
        resize();
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(resize);
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(function () { resize(); });
            ro.observe(canvas);
        }

        return function cleanup() {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointercancel', onUp);
            window.removeEventListener('resize', resize);
            if (ro) { ro.disconnect(); ro = null; }
        };
    }
});
