/**
 * 棕色尘埃2 · 悠丝缇亚 (Justia) — DSH 动态皮肤插件（Client 端参考实现，对应 pkg-18）
 *
 * 能力一览：
 * 1. 设计令牌昼夜重映射（theme.overrideTokens）
 * 2. 签名装饰（金色滚动条/选中/链接/代码块/分割线；圣光+星尘浓度可调）
 * 3. 自定义背景图：背景库下拉 / 文件名 / 绝对路径 / https URL / 随机 / 默认 / 移除
 * 4. 玻璃化：对话区与详情栏透图（bg-base→transparent）、侧栏半透明+毛玻璃、
 *    消息/工具卡玻璃（layer-1/2 令牌）、标题栏与输入区毛玻璃
 * 5. 三滑杆：侧栏透明度（30–100）、帷幕深浅（0–80）、装饰浓度（0–100）
 * 6. 设置自动记忆：settings.json（Host 读写），重新运行插件自动恢复
 * 全部副作用可回收；Host 半体见 host.js。
 */

const STATIC_CSS = `
/* ===== 全面暖色令牌重映射（frame 内，昼夜双套）===== */
body [class*='_frame'] {
  --dsw-static-neutral-1000: #2a2118;
  --dsw-static-neutral-900: #33291b;
  --dsw-static-neutral-850: #3a3024;
  --dsw-static-neutral-800: #423a2e;
  --dsw-static-neutral-bluish-1000: #2a2118;
  --dsw-static-neutral-bluish-900: #33291b;
  --dsw-static-neutral-bluish-850: #3a3024;
  --dsw-static-neutral-bluish-800: #423a2e;
  --dsw-alias-bg-module-platform: color-mix(in srgb, #f6f1e8 78%, transparent);
  --dsw-alias-interactive-bg-hover: color-mix(in srgb, #b0871f 12%, transparent);
  --dsw-alias-fill-tsp-secondary: color-mix(in srgb, #b0871f 16%, transparent);
  --dsw-alias-button-elevated-fill: color-mix(in srgb, #fdfaf3 90%, transparent);
  --dsw-alias-button-floating-fill: color-mix(in srgb, #fdfaf3 90%, transparent);
  --dsw-alias-toast-bg: #423a2e;
  --dsw-alias-tooltip-bg: #3a3024;
}
body[data-ds-dark-theme] [class*='_frame'] {
  --dsw-static-neutral-1000: #16130f;
  --dsw-static-neutral-900: #1c1712;
  --dsw-static-neutral-850: #211a14;
  --dsw-static-neutral-800: #261e16;
  --dsw-static-neutral-bluish-1000: #16130f;
  --dsw-static-neutral-bluish-900: #1c1712;
  --dsw-static-neutral-bluish-850: #211a14;
  --dsw-static-neutral-bluish-800: #261e16;
  --dsw-static-neutral-bluish-750: #34281c;
  --dsw-static-neutral-bluish-700: #3d3022;
  --dsw-alias-bg-module-platform: color-mix(in srgb, #282113 80%, transparent);
  --dsw-alias-interactive-bg-hover: color-mix(in srgb, #d8b25c 14%, transparent);
  --dsw-alias-fill-tsp-secondary: color-mix(in srgb, #d8b25c 18%, transparent);
  --dsw-alias-button-elevated-fill: color-mix(in srgb, #33291b 92%, transparent);
  --dsw-alias-button-floating-fill: color-mix(in srgb, #2b2419 90%, transparent);
  /* 表面层：创造模式卡片 / 弹层 / 多选 */
  --dsw-alias-bg-layer-3: color-mix(in srgb, #2f261b 88%, transparent);
  --dsw-alias-bg-overlay: color-mix(in srgb, #2b2419 92%, transparent);
  --dsw-alias-bg-multi-select: color-mix(in srgb, #2b2419 88%, transparent);
  /* 侧栏条目：分组/会话项 */
  --dsw-specific-sidebar-nav-item-active: color-mix(in srgb, #d8b25c 22%, transparent);
  --dsw-specific-sidebar-nav-item-active-accent: #d8b25c;
  --dsw-specific-sidebar-nav-item-hover: color-mix(in srgb, #d8b25c 12%, transparent);
  /* 输入区选择器 / 用户气泡 */
  --dsw-specific-selector: color-mix(in srgb, #33291b 88%, transparent);
  --dsw-specific-bubble: color-mix(in srgb, #33291b 90%, transparent);
  --dsw-specific-bubble-highlight: #d8b25c;
  /* 代码块族：session log / 代码视图暖化 */
  --dsw-alias-markdown-code-block: #241c12;
  --dsw-alias-markdown-code-block-banner: #2b2215;
  --dsw-alias-markdown-code-segment-selected: #34281c;
  --dsw-alias-markdown-code-segment-unselected: #241c12;
  --dsw-alias-markdown-inline-code: #34281c;
  --dsw-alias-markdown-citation: #34281c;
  --dsw-alias-markdown-tag: #3a2f22;
  --dsw-alias-markdown-placeholder: #3a2f22;
  /* 其他深色杂项 */
  --dsw-alias-toast-bg: #423a2e;
  --dsw-alias-tooltip-bg: #3a3024;
  --dsw-alias-button-contrast-fill: #d8b25c;
  --dsw-alias-brand-primary-invert: #16130f;
  --dsw-alias-label-primary-inverted: #1a150e;
}
::selection {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 32%, transparent);
  color: var(--dsw-alias-label-primary);
}
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--dsw-alias-bg-layer-2); }
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--dsw-alias-brand-primary) 88%, #fff8e1),
    color-mix(in srgb, var(--dsw-alias-brand-primary) 60%, #33270f));
  border-radius: 6px;
  border: 2px solid var(--dsw-alias-bg-base);
}
::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--dsw-alias-brand-primary) 100%, #fff3c4),
    color-mix(in srgb, var(--dsw-alias-brand-primary) 72%, #33270f));
}
a { color: color-mix(in srgb, var(--dsw-alias-brand-primary) 82%, var(--dsw-alias-label-primary)); }
a:hover { color: var(--dsw-alias-brand-primary); }
code {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent);
  color: color-mix(in srgb, var(--dsw-alias-brand-primary) 78%, var(--dsw-alias-label-primary));
  border: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 34%, transparent);
  border-radius: 4px;
  padding: 1px 5px;
}
pre {
  border-left: 3px solid var(--dsw-alias-brand-primary);
  border-radius: 8px;
  box-shadow: inset 0 0 22px color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent);
}
blockquote {
  border-left: 3px solid var(--dsw-alias-brand-primary);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, transparent);
}
hr {
  border: none;
  height: 12px;
  background-image:
    radial-gradient(circle at 50% 4px, var(--dsw-alias-brand-primary) 0 2px, transparent 3px),
    linear-gradient(90deg, transparent,
      color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent) 25%,
      color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent) 75%, transparent);
  background-size: 100% 12px, 100% 1px;
  background-position: 0 0, 0 3px;
  background-repeat: no-repeat;
  opacity: 0.6;
}
`

/** 圣光/星尘装饰层：浓度可调（0–1） */
function decorCss(intensity) {
  const i = Math.min(1, Math.max(0, Number(intensity) || 0))
  const b1 = (0.38 * i).toFixed(3)
  const b1d = (0.55 * i).toFixed(3)
  const b2 = (0.22 * i).toFixed(3)
  const b2d = (0.34 * i).toFixed(3)
  return `
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background-image:
    radial-gradient(ellipse at 85% -10%, color-mix(in srgb, var(--dsw-alias-brand-primary) 20%, transparent) 0%, transparent 55%),
    radial-gradient(ellipse at -10% 105%, color-mix(in srgb, var(--dsw-alias-brand-primary) 11%, transparent) 0%, transparent 45%);
  opacity: ${b1};
}
body[data-ds-dark-theme]::before { opacity: ${b1d}; }
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background-image:
    radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--dsw-alias-brand-primary) 60%, transparent) 0 1.5px, transparent 3.2px),
    radial-gradient(circle at 80% 12%, color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, transparent) 0 1.2px, transparent 2.8px),
    radial-gradient(circle at 90% 66%, color-mix(in srgb, var(--dsw-alias-brand-primary) 50%, transparent) 0 1.4px, transparent 3px),
    radial-gradient(circle at 28% 84%, color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, transparent) 0 1.2px, transparent 2.8px),
    radial-gradient(circle at 58% 32%, color-mix(in srgb, var(--dsw-alias-brand-primary) 35%, transparent) 0 1px, transparent 2.6px);
  background-size: 520px 520px, 640px 640px, 460px 460px, 700px 700px, 560px 560px;
  opacity: ${b2};
  animation: bd2-yustia-twinkle 9s ease-in-out infinite;
}
body[data-ds-dark-theme]::after { opacity: ${b2d}; }
@keyframes bd2-yustia-twinkle {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(3px, -4px); }
}
`
}

/** 悠丝缇亚白金圣骑士令牌：{ light, dark } 成对 */
const YUSTIA_TOKENS = {
  '--dsw-alias-bg-base': { light: '#f6f1e8', dark: '#16130f' },
  '--dsw-alias-bg-layer-1': { light: '#fbf7ef', dark: '#1f1a13' },
  '--dsw-alias-bg-layer-2': { light: '#efe6d6', dark: '#282113' },
  '--dsw-alias-bg-overlay': { light: '#fdfaf3', dark: '#2b2419' },
  '--dsw-alias-border-l1': { light: '#e3d8c3', dark: '#32291a' },
  '--dsw-alias-border-l2': { light: '#c9b489', dark: '#5b4a24' },
  '--dsw-alias-brand-primary': { light: '#b0871f', dark: '#d8b25c' },
  '--dsw-alias-label-primary': { light: '#33291b', dark: '#f2ead9' },
  '--dsw-alias-label-secondary': { light: '#77684e', dark: '#b0a186' },
  '--dsw-alias-state-error-primary': { light: '#b23a48', dark: '#d96a77' },
  '--dsw-alias-state-success-primary': { light: '#3f8a58', dark: '#6fb588' },
  '--dsw-alias-state-warn-primary': { light: '#b07d1c', dark: '#d9a94f' },
  '--dsw-specific-sidebar-fill': { light: '#efe5d2', dark: '#1c1712' },
}

/** 背景 CSS：透图 + 玻璃化 + 可调帷幕（可读性优化：卡片更实、标题栏 60%、帷幕默认 62%） */
function bgCssFor(src, opts) {
  const a = Math.min(1, Math.max(0.3, opts.sidebarAlpha))
  const veil = Math.min(85, Math.max(0, opts.veilPct))
  const lightPct = Math.round(a * 100)
  const darkPct = Math.round(Math.max(0.2, a - 0.08) * 100)
  const blurPx = Math.max(0, Math.min(24, Math.round((1 - a) * 30)))
  const elevLight = Math.min(100, lightPct + 12)
  const elevDark = Math.min(100, darkPct + 12)
  const hdrLight = Math.min(100, Math.max(15, lightPct - 25))
  const hdrDark = Math.min(100, Math.max(15, darkPct - 20))
  const navActive = Math.round(a * 26)
  const navHover = Math.round(a * 14)
  const navAccent = Math.min(100, navActive + 30)
  const fillPct = Math.round(a * 20)
  return `
body [class*='_frame'] {
  background-color: transparent !important;
  --dsw-alias-bg-base: transparent !important;
  --dsw-specific-sidebar-fill: color-mix(in srgb, #efe5d2 ${lightPct}%, transparent) !important;
  --dsw-alias-bg-layer-1: color-mix(in srgb, #fbf7ef 90%, transparent) !important;
  --dsw-alias-bg-layer-2: color-mix(in srgb, #efe6d6 84%, transparent) !important;
  --dsw-alias-bg-layer-3: color-mix(in srgb, #fbf7ef ${elevLight}%, transparent) !important;
  --dsw-alias-bg-overlay: color-mix(in srgb, #fdfaf3 ${elevLight}%, transparent) !important;
  --dsw-alias-bg-multi-select: color-mix(in srgb, #f6f1e8 ${lightPct}%, transparent) !important;
  --dsw-specific-tip: color-mix(in srgb, #fbf7ef 82%, transparent) !important;
  --dsw-alias-bg-module-platform: color-mix(in srgb, #f6f1e8 ${lightPct}%, transparent) !important;
  --dsw-alias-button-elevated-fill: color-mix(in srgb, #fdfaf3 ${elevLight}%, transparent) !important;
  --dsw-alias-button-floating-fill: color-mix(in srgb, #fdfaf3 ${elevLight}%, transparent) !important;
  --dsw-specific-selector: color-mix(in srgb, #f6f1e8 ${lightPct}%, transparent) !important;
  --dsw-specific-sidebar-nav-item-active: color-mix(in srgb, #b0871f ${navActive}%, transparent) !important;
  --dsw-specific-sidebar-nav-item-active-accent: color-mix(in srgb, #b0871f ${navAccent}%, transparent) !important;
  --dsw-specific-sidebar-nav-item-hover: color-mix(in srgb, #b0871f ${navHover}%, transparent) !important;
  --dsw-alias-fill-l2: color-mix(in srgb, #b0871f ${fillPct}%, transparent) !important;
  --dsw-alias-fill-l1: color-mix(in srgb, #b0871f ${Math.max(6, fillPct - 8)}%, transparent) !important;
}
body[data-ds-dark-theme] [class*='_frame'] {
  --dsw-specific-sidebar-fill: color-mix(in srgb, #1c1712 ${darkPct}%, transparent) !important;
  --dsw-alias-bg-layer-1: color-mix(in srgb, #1f1a13 90%, transparent) !important;
  --dsw-alias-bg-layer-2: color-mix(in srgb, #282113 82%, transparent) !important;
  --dsw-alias-bg-layer-3: color-mix(in srgb, #2f261b ${elevDark}%, transparent) !important;
  --dsw-alias-bg-overlay: color-mix(in srgb, #2b2419 ${elevDark}%, transparent) !important;
  --dsw-alias-bg-multi-select: color-mix(in srgb, #2b2419 ${darkPct}%, transparent) !important;
  --dsw-specific-tip: color-mix(in srgb, #1f1a13 80%, transparent) !important;
  --dsw-alias-bg-module-platform: color-mix(in srgb, #282113 ${darkPct}%, transparent) !important;
  --dsw-alias-button-elevated-fill: color-mix(in srgb, #33291b ${elevDark}%, transparent) !important;
  --dsw-alias-button-floating-fill: color-mix(in srgb, #2b2419 ${elevDark}%, transparent) !important;
  --dsw-specific-selector: color-mix(in srgb, #33291b ${elevDark}%, transparent) !important;
  --dsw-specific-sidebar-nav-item-active: color-mix(in srgb, #d8b25c ${navActive}%, transparent) !important;
  --dsw-specific-sidebar-nav-item-active-accent: color-mix(in srgb, #d8b25c ${navAccent}%, transparent) !important;
  --dsw-specific-sidebar-nav-item-hover: color-mix(in srgb, #d8b25c ${navHover}%, transparent) !important;
  --dsw-alias-fill-l2: color-mix(in srgb, #d8b25c ${fillPct}%, transparent) !important;
  --dsw-alias-fill-l1: color-mix(in srgb, #d8b25c ${Math.max(6, fillPct - 8)}%, transparent) !important;
}
body [class*='_frame'] [class*='sidebarCol'] {
  -webkit-backdrop-filter: blur(${blurPx}px);
  backdrop-filter: blur(${blurPx}px);
}
body [class*='_frame'] [class*='_dock'] {
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}
body [class*='_frame'] [class*='_header'] {
  background: color-mix(in srgb, #fbf7ef ${hdrLight}%, transparent);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
body[data-ds-dark-theme] [class*='_frame'] [class*='_header'] {
  background: color-mix(in srgb, #1f1a13 ${hdrDark}%, transparent);
}
body [class*='_frame'] [class*='sessionLogButton'] {
  background: color-mix(in srgb, #fdfaf3 ${elevLight}%, transparent) !important;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}
body[data-ds-dark-theme] [class*='_frame'] [class*='sessionLogButton'] {
  background: color-mix(in srgb, #33291b ${elevDark}%, transparent) !important;
}
body {
  background-image:
    linear-gradient(color-mix(in srgb, var(--dsw-alias-bg-base) ${veil}%, transparent), color-mix(in srgb, var(--dsw-alias-bg-base) ${veil}%, transparent)),
    url("${src}");
  background-size: 100% 100%, cover;
  background-position: center, center;
  background-repeat: no-repeat, no-repeat;
  background-attachment: fixed, fixed;
}
`
}

const SWATCHES = [
  { mode: '浅色', items: [
    ['圣金', '#b0871f'], ['象牙底', '#f6f1e8'], ['表层', '#fbf7ef'], ['正文', '#33291b'], ['侧栏', '#efe5d2'],
  ] },
  { mode: '深色', items: [
    ['烛光金', '#d8b25c'], ['夜底', '#16130f'], ['表层', '#1f1a13'], ['正文', '#f2ead9'], ['侧栏', '#1c1712'],
  ] },
]

function YustiaRunPanel(props) {
  const [value, setValue] = React.useState('')
  const [status, setStatus] = React.useState('加载默认背景…')
  const [bgList, setBgList] = React.useState([])
  const [sidebarPct, setSidebarPct] = React.useState(82)
  const [veilPct, setVeilPct] = React.useState(62)
  const [decorPct, setDecorPct] = React.useState(90)
  const ctrl = props.ctrl
  const run = (op) => async () => {
    setStatus('处理中…')
    setStatus(await op())
  }
  React.useEffect(() => {
    let alive = true
    ctrl.listBackgrounds().then((names) => {
      if (alive) setBgList(names)
    }).catch(() => {})
    ctrl.ready.then((st) => {
      if (!alive) return
      setSidebarPct(st.sidebarPct)
      setVeilPct(st.veilPct)
      setDecorPct(st.decorPct)
      setStatus(st.statusMsg)
    }).catch(() => {})
    return () => { alive = false }
  }, [])
  const cardStyle = {
    marginTop: 10,
    padding: '12px 14px',
    borderRadius: 10,
    background: 'var(--dsw-alias-bg-layer-1)',
    border: '1px solid var(--dsw-alias-border-l2)',
    boxShadow: 'inset 0 0 18px color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent)',
    color: 'var(--dsw-alias-label-primary)',
    fontSize: 13,
  }
  const titleStyle = { fontWeight: 700, fontSize: 14, color: 'var(--dsw-alias-brand-primary)', margin: 0 }
  const subStyle = { margin: '4px 0 10px', fontSize: 12, color: 'var(--dsw-alias-label-secondary)' }
  const rowStyle = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 6 }
  const modeStyle = { fontSize: 12, fontWeight: 600, width: 34, color: 'var(--dsw-alias-label-secondary)' }
  const chipStyle = { display: 'inline-flex', alignItems: 'center', gap: 5 }
  const swStyle = {
    width: 16, height: 16, borderRadius: 4, display: 'inline-block',
    border: '1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 25%, transparent)',
  }
  const labelStyle = { fontSize: 11, color: 'var(--dsw-alias-label-secondary)' }
  const inputStyle = {
    flex: 1, minWidth: 190, padding: '6px 10px', borderRadius: 8,
    background: 'var(--dsw-alias-bg-layer-2)',
    border: '1px solid var(--dsw-alias-border-l2)',
    color: 'var(--dsw-alias-label-primary)', fontSize: 12, outline: 'none',
  }
  const selectStyle = {
    flex: 1, minWidth: 190, padding: '6px 10px', borderRadius: 8,
    background: 'var(--dsw-alias-bg-layer-2)',
    border: '1px solid var(--dsw-alias-border-l2)',
    color: 'var(--dsw-alias-label-primary)', fontSize: 12, outline: 'none',
  }
  const btnStyle = {
    padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
    background: 'var(--dsw-alias-brand-primary)', color: '#fff8e1', border: 'none',
  }
  const ghostStyle = {
    padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
    background: 'transparent', color: 'var(--dsw-alias-brand-primary)',
    border: '1px solid var(--dsw-alias-border-l2)',
  }
  const sliderStyle = { flex: 1, minWidth: 140, accentColor: 'var(--dsw-alias-brand-primary)' }
  const onSidebarAlpha = (e) => {
    const pct = Number(e.target.value)
    setSidebarPct(pct)
    ctrl.setSidebarAlpha(pct / 100).then((msg) => setStatus(msg)).catch(() => {})
  }
  const onVeil = (e) => {
    const pct = Number(e.target.value)
    setVeilPct(pct)
    ctrl.setVeil(pct).then((msg) => setStatus(msg)).catch(() => {})
  }
  const onDecor = (e) => {
    const pct = Number(e.target.value)
    setDecorPct(pct)
    ctrl.setDecor(pct).then((msg) => setStatus(msg)).catch(() => {})
  }
  return React.createElement('div', { style: cardStyle },
    React.createElement('p', { style: titleStyle }, '棕色尘埃2 · 悠丝缇亚 — 白金圣骑士皮肤已生效'),
    React.createElement('p', { style: subStyle }, '象牙白 × 圣金（日）｜深夜暖黑 × 烛光金（夜）· 停止插件即恢复原主题'),
    SWATCHES.map((group) => React.createElement('div', { key: group.mode, style: rowStyle },
      React.createElement('span', { style: modeStyle }, group.mode),
      group.items.map((item) => React.createElement('span', { key: item[0], style: chipStyle },
        React.createElement('span', { style: Object.assign({}, swStyle, { background: item[1] }) }),
        React.createElement('span', { style: labelStyle }, item[0] + ' ' + item[1]),
      )),
    )),
    React.createElement('div', { style: Object.assign({}, rowStyle, { marginTop: 10 }) },
      React.createElement('select', {
        style: selectStyle,
        value: '',
        onChange: (e) => {
          const name = e.target.value
          if (name) run(() => ctrl.applyValue(name))()
        },
      }, bgList.length ? React.createElement('option', { value: '' }, '— 选择背景库图片 —') : React.createElement('option', { value: '' }, '（背景库为空）'),
        bgList.map((name) => React.createElement('option', { key: name, value: name }, name)),
      ),
      React.createElement('button', {
        style: ghostStyle,
        onClick: run(async () => {
          const names = await ctrl.listBackgrounds()
          setBgList(names)
          return '背景库已刷新（' + names.length + ' 张）'
        }),
      }, '刷新'),
    ),
    React.createElement('div', { style: rowStyle },
      React.createElement('input', {
        style: inputStyle, value: value,
        placeholder: '文件名（如 bg-02）／绝对路径／https:// URL',
        onChange: (e) => setValue(e.target.value),
      }),
      React.createElement('button', { style: btnStyle, onClick: run(() => ctrl.applyValue(value)) }, '应用背景'),
      React.createElement('button', { style: ghostStyle, onClick: run(() => ctrl.randomBg()) }, '随机'),
      React.createElement('button', { style: ghostStyle, onClick: run(() => ctrl.applyDefault()) }, '默认'),
      React.createElement('button', { style: ghostStyle, onClick: run(() => ctrl.clear()) }, '移除'),
    ),
    React.createElement('div', { style: rowStyle },
      React.createElement('span', { style: labelStyle }, '侧栏透明度'),
      React.createElement('input', { type: 'range', min: 30, max: 100, step: 5, value: sidebarPct, onChange: onSidebarAlpha, onMouseUp: () => ctrl.persist(), onTouchEnd: () => ctrl.persist(), style: sliderStyle }),
      React.createElement('span', { style: labelStyle }, sidebarPct + '%'),
    ),
    React.createElement('div', { style: rowStyle },
      React.createElement('span', { style: labelStyle }, '帷幕深浅'),
      React.createElement('input', { type: 'range', min: 0, max: 80, step: 5, value: veilPct, onChange: onVeil, onMouseUp: () => ctrl.persist(), onTouchEnd: () => ctrl.persist(), style: sliderStyle }),
      React.createElement('span', { style: labelStyle }, veilPct + '%'),
    ),
    React.createElement('div', { style: rowStyle },
      React.createElement('span', { style: labelStyle }, '装饰浓度'),
      React.createElement('input', { type: 'range', min: 0, max: 100, step: 5, value: decorPct, onChange: onDecor, onMouseUp: () => ctrl.persist(), onTouchEnd: () => ctrl.persist(), style: sliderStyle }),
      React.createElement('span', { style: labelStyle }, decorPct + '%'),
    ),
    React.createElement('p', { style: subStyle }, '背景库：bd2-yustia-skin/backgrounds/，命名 bg-<名称>.<扩展名>；命名为 bg-default.* 即为默认背景；设置自动记忆'),
    React.createElement('p', { style: subStyle }, status),
  )
}

function clamp(v, lo, hi, fallback) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.min(hi, Math.max(lo, n))
}

export function apply(ctx) {
  const theme = ctx.get('theme')
  if (theme !== undefined) {
    ctx.effect(
      () => theme.overrideTokens('bd2-yustia', YUSTIA_TOKENS),
      'bd2-yustia: 棕色尘埃2 · 悠丝缇亚 skin tokens',
    )
  }

  styles.insert(STATIC_CSS)

  let currentBgDispose
  let decorDispose
  let stopped = false
  let currentSrc = ''
  let currentLabel = ''
  let currentKind = ''
  let sidebarAlpha = 0.82
  let veilPct = 62
  let decorIntensity = 0.9

  let resolveReady
  const ready = new Promise((res) => { resolveReady = res })

  function reapplyDecor() {
    if (typeof decorDispose === 'function') {
      decorDispose()
      decorDispose = undefined
    }
    decorDispose = styles.insert(decorCss(decorIntensity))
  }

  function reapplyBg() {
    if (typeof currentBgDispose === 'function') {
      currentBgDispose()
      currentBgDispose = undefined
    }
    if (currentSrc) currentBgDispose = styles.insert(bgCssFor(currentSrc, { sidebarAlpha, veilPct }))
  }

  function swapBg(src) {
    if (stopped) return
    currentSrc = src
    reapplyBg()
  }

  function persist() {
    try {
      host.call('bg-save-settings', { settings: {
        source: currentLabel,
        kind: currentKind,
        sidebarAlpha,
        veilPct,
        decorIntensity,
      } }).catch(() => {})
    } catch (e) {}
  }

  const bgController = {
    ready,
    async listBackgrounds() {
      try {
        const r = await host.call('bg-list', {})
        return r && r.ok && Array.isArray(r.names) ? r.names : []
      } catch (e) {
        return []
      }
    },
    persist,
    async setSidebarAlpha(v) {
      sidebarAlpha = clamp(v, 0.3, 1, 0.7)
      reapplyBg()
      return '侧栏透明度 ' + Math.round(sidebarAlpha * 100) + '%（毛玻璃联动）'
    },
    async setVeil(v) {
      veilPct = clamp(v, 0, 80, 50)
      reapplyBg()
      return '帷幕深浅 ' + veilPct + '%'
    },
    async setDecor(v) {
      decorIntensity = clamp(v / 100, 0, 1, 1)
      reapplyDecor()
      return '装饰浓度 ' + Math.round(decorIntensity * 100) + '%'
    },
    async applyValue(raw) {
      const value = String(raw || '').trim()
      if (!value) return '请选择或输入背景图（文件名 bg-xx / 绝对路径 / https URL）'
      if (/^https?:\/\//i.test(value)) {
        swapBg(value)
        currentLabel = value
        currentKind = 'url'
        persist()
        return '已应用网络图片（浏览器直连；若被防盗链或 CSP 拦截，请改用本地路径）'
      }
      try {
        const r = await host.call('bg-read-file', { path: value })
        if (!r || !r.ok) return '加载失败：' + (r && r.error ? r.error : '未知错误')
        swapBg('data:' + r.mime + ';base64,' + r.data)
        currentLabel = value
        currentKind = 'file'
        persist()
        return '已应用（' + Math.round(r.size / 1024) + ' KB · ' + r.path + '）'
      } catch (e) {
        return '加载失败：' + String(e && e.message ? e.message : e)
      }
    },
    async applyDefault() {
      try {
        const r = await host.call('bg-load-default', {})
        if (r && r.ok) {
          swapBg('data:' + r.mime + ';base64,' + r.data)
          currentLabel = ''
          currentKind = ''
          persist()
          return '默认背景已应用（' + (r.name ? r.name : '内置圣光图') + '）'
        }
        swapBg('')
        return '默认图片不可用：' + (r && r.error ? r.error : '未知错误')
      } catch (e) {
        swapBg('')
        return '默认图片不可用：' + String(e && e.message ? e.message : e)
      }
    },
    async randomBg() {
      const names = await bgController.listBackgrounds()
      const candidates = names.filter((n) => n !== currentLabel)
      if (candidates.length === 0) return '背景库没有可切换的图片'
      const pick = candidates[Math.floor(Math.random() * candidates.length)]
      return bgController.applyValue(pick)
    },
    clear() {
      swapBg('')
      currentLabel = ''
      currentKind = ''
      persist()
      return '已移除背景图，恢复纯色皮肤'
    },
  }

  ctx.effect(() => () => {
    stopped = true
    currentSrc = ''
    if (typeof currentBgDispose === 'function') {
      currentBgDispose()
      currentBgDispose = undefined
    }
    if (typeof decorDispose === 'function') {
      decorDispose()
      decorDispose = undefined
    }
  }, 'bd2-yustia: background cleanup')

  reapplyDecor()

  /* 挂载：优先恢复记忆设置，否则应用默认背景 */
  host.call('bg-load-settings', {}).then(async (r) => {
    if (stopped) return
    let statusMsg = ''
    const s = r && r.ok && r.settings ? r.settings : null
    sidebarAlpha = clamp(s && s.sidebarAlpha, 0.3, 1, 0.82)
    veilPct = clamp(s && s.veilPct, 0, 85, 62)
    decorIntensity = clamp(s && s.decorIntensity, 0, 1, 0.9)
    reapplyDecor()
    if (s && s.source) {
      currentLabel = s.source
      currentKind = s.kind || 'file'
      if (s.kind === 'url') {
        swapBg(s.source)
        statusMsg = '已恢复记忆背景（网络图片）'
      } else {
        const img = await host.call('bg-read-file', { path: s.source }).catch(() => null)
        if (img && img.ok) {
          swapBg('data:' + img.mime + ';base64,' + img.data)
          statusMsg = '已恢复记忆背景（' + s.source + '）'
        } else {
          const d = await host.call('bg-load-default', {}).catch(() => null)
          if (d && d.ok) {
            swapBg('data:' + d.mime + ';base64,' + d.data)
            currentLabel = ''
            currentKind = ''
            statusMsg = '记忆背景失效，已回退默认背景'
          } else {
            statusMsg = '背景加载失败'
          }
        }
      }
    } else {
      const d = await host.call('bg-load-default', {}).catch(() => null)
      if (d && d.ok) {
        swapBg('data:' + d.mime + ';base64,' + d.data)
        statusMsg = '默认背景已应用（' + (d.name ? d.name : '内置圣光图') + '）'
      } else {
        statusMsg = '默认背景不可用'
      }
    }
    resolveReady({
      sidebarPct: Math.round(sidebarAlpha * 100),
      veilPct: Math.round(veilPct),
      decorPct: Math.round(decorIntensity * 100),
      statusMsg,
    })
  }).catch((e) => {
    if (stopped) return
    resolveReady({ sidebarPct: 82, veilPct: 62, decorPct: 90, statusMsg: '设置读取失败：' + String(e && e.message ? e.message : e) })
  })

  const slots = ctx.get('slots')
  if (slots !== undefined) {
    slots.inject('tool.view.cordis', () => slots.register(
      { name: 'tool.view.cordis', key: 'self' },
      () => React.createElement(YustiaRunPanel, { ctrl: bgController }),
    ))
  }
  console.log('bd2-yustia: 棕色尘埃2 · 悠丝缇亚 skin mounted')
}
