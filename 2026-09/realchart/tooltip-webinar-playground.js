/**
 * Tooltip 웨비나 시연용 playground
 * - 사이드 목록에서 데모 선택 → editor에 config 로드
 * - 편집 후 적용(⌘/Ctrl+S) → chart.load
 */

const DEMOS = [
    {
        group: '1. 문구 만들기',
        items: [
            { id: 'text', label: 'tooltipText', file: './tooltip-webinar-text.js' },
            { id: 'callback', label: 'tooltipCallback', file: './tooltip-webinar-callback.js' },
            { id: 'list', label: '목록 툴팁', file: './tooltip-webinar-list.js' },
            { id: 'format', label: 'numberFormat · timeFormat', file: './tooltip-webinar-format.js' },
        ],
    },
    {
        group: '2. 범위 정하기',
        items: [
            { id: 'scope', label: 'scope', file: './tooltip-webinar-scope.js' },
        ],
    },
    {
        group: '3. 위치 · 디자인',
        items: [
            { id: 'crosshair', label: 'crosshair', file: './tooltip-webinar-crosshair.js' },
            { id: 'shape', label: 'simpleMode · listMarker', file: './tooltip-webinar-shape.js' },
            { id: 'css', label: 'style · CSS', file: './tooltip-webinar-css.js' },
        ],
    },
];

let chart = null;
let currentDemoId = null;
let monacoReady = false;
const sourceCache = new Map();

function setStatus(message, isError) {
    const el = document.getElementById('status');
    if (!el) {
        return;
    }
    el.textContent = message;
    el.classList.toggle('is-error', !!isError);
}

function scanStringAware(source, startIndex, onChar) {
    let inStr = null;
    let escaped = false;
    for (let i = startIndex; i < source.length; i += 1) {
        const ch = source[i];
        if (inStr) {
            if (escaped) {
                escaped = false;
            } else if (ch === '\\') {
                escaped = true;
            } else if (ch === inStr) {
                inStr = null;
            }
            continue;
        }
        if (ch === '"' || ch === "'" || ch === '`') {
            inStr = ch;
            continue;
        }
        const stop = onChar(ch, i);
        if (stop) {
            return i;
        }
    }
    return -1;
}

function findMatchingEnd(source, openIndex) {
    const open = source[openIndex];
    const close = open === '{' ? '}' : open === '[' ? ']' : ')';
    let depth = 0;
    return scanStringAware(source, openIndex, (ch, i) => {
        if (ch === open) {
            depth += 1;
        } else if (ch === close) {
            depth -= 1;
            if (depth === 0) {
                return true;
            }
        }
        return false;
    });
}

function extractAssignment(source, name) {
    const re = new RegExp(`(?:^|\\n)((?:const|let|var)\\s+${name}\\s*=\\s*)`);
    const match = re.exec(source);
    if (!match) {
        return '';
    }
    const start = match.index + (match[0].startsWith('\n') ? 1 : 0);
    let i = match.index + match[0].length;
    while (i < source.length && /\s/.test(source[i])) {
        i += 1;
    }
    const open = source[i];
    let end;
    if (open === '{' || open === '[' || open === '(') {
        end = findMatchingEnd(source, i);
        if (end < 0) {
            return '';
        }
        end += 1;
        if (source[end] === ';') {
            end += 1;
        }
    } else {
        end = source.indexOf(';', i);
        if (end < 0) {
            return '';
        }
        end += 1;
    }
    return source.slice(start, end).trim();
}

function extractFunction(source, name) {
    const re = new RegExp(`(?:^|\\n)(function\\s+${name}\\s*\\()`);
    const match = re.exec(source);
    if (!match) {
        return '';
    }
    const start = match.index + (match[0].startsWith('\n') ? 1 : 0);
    const paren = source.indexOf('(', match.index + match[0].length - 1);
    const paramsEnd = findMatchingEnd(source, paren);
    if (paramsEnd < 0) {
        return '';
    }
    let i = paramsEnd + 1;
    while (i < source.length && /\s/.test(source[i])) {
        i += 1;
    }
    if (source[i] !== '{') {
        return '';
    }
    const bodyEnd = findMatchingEnd(source, i);
    if (bodyEnd < 0) {
        return '';
    }
    return source.slice(start, bodyEnd + 1).trim();
}

function stripComments(source) {
    let out = '';
    let i = 0;
    let inStr = null;
    let escaped = false;

    while (i < source.length) {
        const ch = source[i];
        const next = source[i + 1];

        if (inStr) {
            out += ch;
            if (escaped) {
                escaped = false;
            } else if (ch === '\\') {
                escaped = true;
            } else if (ch === inStr) {
                inStr = null;
            }
            i += 1;
            continue;
        }

        if (ch === '"' || ch === "'" || ch === '`') {
            inStr = ch;
            out += ch;
            i += 1;
            continue;
        }

        if (ch === '/' && next === '/') {
            i += 2;
            while (i < source.length && source[i] !== '\n') {
                i += 1;
            }
            continue;
        }

        if (ch === '/' && next === '*') {
            i += 2;
            while (i + 1 < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
                i += 1;
            }
            i += 2;
            continue;
        }

        out += ch;
        i += 1;
    }

    return out
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function prepareEditorSource(raw) {
    const helpers = ['salesTooltip', 'installWebinarCss']
        .map((name) => extractFunction(raw, name))
        .filter(Boolean)
        .map(stripComments);

    const config = stripComments(extractAssignment(raw, 'config'));
    if (!config) {
        throw new Error('config를 찾지 못했습니다');
    }

    return [...helpers, config].join('\n\n') + '\n';
}

async function fetchDemoSource(file) {
    if (sourceCache.has(file)) {
        return sourceCache.get(file);
    }
    const res = await fetch(file, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error(`${file} 로드 실패 (${res.status})`);
    }
    const text = await res.text();
    const prepared = prepareEditorSource(text);
    sourceCache.set(file, prepared);
    return prepared;
}

function findDemo(id) {
    for (const group of DEMOS) {
        const item = group.items.find((it) => it.id === id);
        if (item) {
            return item;
        }
    }
    return null;
}

function renderDemoList() {
    const root = document.getElementById('demo-list');
    root.innerHTML = '';

    DEMOS.forEach((group) => {
        const groupEl = document.createElement('div');
        groupEl.className = 'demo-group';

        const title = document.createElement('div');
        title.className = 'demo-group-title';
        title.textContent = group.group;
        groupEl.appendChild(title);

        group.items.forEach((item) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'demo-item';
            btn.dataset.id = item.id;
            btn.textContent = item.label;
            btn.addEventListener('click', () => {
                selectDemo(item.id);
            });
            groupEl.appendChild(btn);
        });

        root.appendChild(groupEl);
    });
}

function updateActiveDemo(id) {
    document.querySelectorAll('.demo-item').forEach((el) => {
        el.classList.toggle('is-active', el.dataset.id === id);
    });
}

async function selectDemo(id, options = {}) {
    const demo = findDemo(id);
    if (!demo) {
        return;
    }
    if (!monacoReady || !window.monacoEditor) {
        setStatus('에디터 준비 중…');
        return;
    }

    try {
        setStatus(`${demo.label} 불러오는 중…`);
        const source = await fetchDemoSource(demo.file);
        currentDemoId = id;
        updateActiveDemo(id);
        window.monacoEditor.getModel().setValue(source);
        if (options.apply !== false) {
            applyConfig();
        } else {
            setStatus(`${demo.label} 로드됨 · 적용을 눌러 반영`);
        }
        const url = new URL(window.location.href);
        url.searchParams.set('demo', id);
        history.replaceState(null, '', url);
    } catch (err) {
        console.error(err);
        setStatus(String(err.message || err), true);
    }
}

function applyConfig() {
    if (!window.monacoEditor) {
        return;
    }
    const code = window.monacoEditor.getValue();
    try {
        const factory = new Function(`
            ${code}
            if (typeof installWebinarCss === 'function') {
                installWebinarCss();
            }
            if (typeof config === 'undefined') {
                throw new Error('config 변수가 필요합니다');
            }
            return config;
        `);
        const next = factory();
        if (!chart) {
            chart = RealChart.createChart(document, 'realchart', next);
        } else {
            chart.load(next, false);
        }
        const label = findDemo(currentDemoId)?.label || 'config';
        setStatus(`${label} 적용됨`);
    } catch (err) {
        console.error(err);
        setStatus(String(err.message || err), true);
    }
}

function initSplitter() {
    const workspace = document.getElementById('workspace');
    const splitter = document.getElementById('splitter');
    const minChart = 240;
    const minEditor = 280;

    function applySplit(chartWidth) {
        const total = workspace.getBoundingClientRect().width;
        const maxChart = Math.max(minChart, total - 6 - minEditor);
        const width = Math.min(maxChart, Math.max(minChart, chartWidth));
        workspace.style.gridTemplateColumns = `${width}px 6px minmax(${minEditor}px, 1fr)`;
        if (window.monacoEditor) {
            window.monacoEditor.layout();
        }
        try {
            chart?.resize?.();
        } catch (_) {
            /* ignore */
        }
    }

    applySplit(workspace.getBoundingClientRect().width * 0.5);

    splitter.addEventListener('mousedown', (ev) => {
        ev.preventDefault();
        document.body.classList.add('is-resizing');
        const onMove = (e) => {
            const left = workspace.getBoundingClientRect().left;
            applySplit(e.clientX - left);
        };
        const onUp = () => {
            document.body.classList.remove('is-resizing');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });

    window.addEventListener('resize', () => {
        const chartEl = workspace.querySelector('.chart-wrap');
        if (!chartEl) {
            return;
        }
        applySplit(chartEl.getBoundingClientRect().width);
    });
}

const FONT_KEY = 'tooltip-webinar-playground-font';
let editorFontSize = Number(localStorage.getItem(FONT_KEY)) || 13;

function setEditorFontSize(size) {
    editorFontSize = Math.min(24, Math.max(11, Math.round(size)));
    localStorage.setItem(FONT_KEY, String(editorFontSize));
    const slider = document.getElementById('font-size');
    const label = document.getElementById('font-size-value');
    if (slider) {
        slider.value = String(editorFontSize);
    }
    if (label) {
        label.textContent = `${editorFontSize}px`;
    }
    if (window.monacoEditor) {
        window.monacoEditor.updateOptions({ fontSize: editorFontSize });
    }
}

function initFontControls() {
    const slider = document.getElementById('font-size');
    document.getElementById('font-dec').addEventListener('click', () => {
        setEditorFontSize(editorFontSize - 1);
    });
    document.getElementById('font-inc').addEventListener('click', () => {
        setEditorFontSize(editorFontSize + 1);
    });
    slider.addEventListener('input', () => {
        setEditorFontSize(Number(slider.value));
    });
    setEditorFontSize(editorFontSize);
}

function initPlayground() {
    renderDemoList();
    initSplitter();
    initFontControls();
    document.getElementById('btn-apply').addEventListener('click', applyConfig);
    document.getElementById('btn-reload').addEventListener('click', () => {
        if (!currentDemoId) {
            return;
        }
        sourceCache.delete(findDemo(currentDemoId).file);
        selectDemo(currentDemoId);
    });

    document.addEventListener('keydown', (ev) => {
        if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 's') {
            ev.preventDefault();
            applyConfig();
        }
    });
}

function bootMonaco() {
    require.config({
        paths: {
            vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs',
        },
    });

    require(['vs/editor/editor.main'], () => {
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            diagnosticCodesToIgnore: [1109, 1128],
        });

        window.monacoEditor = monaco.editor.create(document.getElementById('editor'), {
            value: 'const config = {\n};\n',
            language: 'javascript',
            automaticLayout: true,
            theme: 'vs-dark',
            fontSize: editorFontSize,
            minimap: { enabled: false },
            padding: { top: 8, bottom: 8 },
            scrollBeyondLastLine: false,
            overviewRulerLanes: 0,
            overviewRulerBorder: false,
        });
        setEditorFontSize(editorFontSize);

        monacoReady = true;
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('demo') || 'text';
        selectDemo(initial);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('RealChart v' + RealChart.getVersion());
        initPlayground();
        bootMonaco();
    } catch (err) {
        console.error(err);
        setStatus(String(err), true);
    }
});
