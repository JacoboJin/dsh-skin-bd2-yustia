/**
 * 棕色尘埃2 · 悠丝缇亚 (Justia) — DSH 动态皮肤插件（Client 端参考实现，对应 pkg-4）
 *
 * 原理（移植自 hsr-kafka 皮肤结构，适配本会话 DSH 运行时契约）：
 * 1. 设计令牌重映射：theme.overrideTokens(source, tokens) 叠加 { light, dark } 令牌对。
 * 2. 签名装饰：styles.insert(css)，颜色一律 var(--dsw-alias-*) 引用，昼夜自动跟随。
 * 3. 自定义背景图：
 *    - 默认圣光背景：Host 读 workspace 内 assets/default-bg.jpg → base64 data URI（挂载时自动应用）
 *    - 本地路径：host.call('bg-read-file', {path}) → Host fs.readBytes → 手写 base64 → data URI
 *    - https URL：浏览器直连 CSS url()（背景图不受 CORS 限制）
 *    - 背景 CSS 自带 50% 底色帷幕（bg-base 令牌，昼夜自适应）保证文字可读
 *    - 面板（tool.view.cordis）提供输入框 + 应用/默认/移除 按钮与状态行
 * 4. 所有副作用可回收：令牌层 ctx.effect、样式表 styles.insert、背景层统一由 swapBg 管理。
 */

const SKIN_CSS = `
/* bd2-yustia signature decor — 棕色尘埃2 · 悠丝缇亚 */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background-image:
    radial-gradient(ellipse at 85% -10%, color-mix(in srgb, var(--dsw-alias-brand-primary) 20%, transparent) 0%, transparent 55%),
    radial-gradient(ellipse at -10% 105%, color-mix(in srgb, var(--dsw-alias-brand-primary) 11%, transparent) 0%, transparent 45%);
  opacity: 0.38;
}
body[data-ds-dark-theme]::before { opacity: 0.55; }
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
  opacity: 0.22;
  animation: bd2-yustia-twinkle 9s ease-in-out infinite;
}
body[data-ds-dark-theme]::after { opacity: 0.34; }
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
@keyframes bd2-yustia-twinkle {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(3px, -4px); }
}
`

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

/** 背景 CSS：底层图片 + 上层 50% 底色帷幕（昼夜自适应） */
/** 背景 CSS：
 *  1. AppFrame 上把 bg-base 重定义为 transparent，对话区/详情栏透出图片；
 *  2. sidebar-fill 按 alpha 半透明（昼夜微调），侧栏透出图片；
 *  3. 侧栏 backdrop-filter 毛玻璃，模糊度随透明度联动（越透越模糊）；
 *  4. body 底层图片 + 50% 底色帷幕保证文字可读。 */
function bgCssFor(src, alpha) {
  const a = Math.min(1, Math.max(0.3, alpha))
  const lightPct = Math.round(a * 100)
  const darkPct = Math.round(Math.max(0.2, a - 0.08) * 100)
  const blurPx = Math.max(0, Math.min(24, Math.round((1 - a) * 30)))
  return `
body [class*='_frame'] {
  background-color: transparent !important;
  --dsw-alias-bg-base: transparent !important;
  --dsw-specific-sidebar-fill: color-mix(in srgb, #efe5d2 ${lightPct}%, transparent) !important;
}
body[data-ds-dark-theme] [class*='_frame'] {
  --dsw-specific-sidebar-fill: color-mix(in srgb, #1c1712 ${darkPct}%, transparent) !important;
}
body [class*='_frame'] [class*='sidebarCol'] {
  -webkit-backdrop-filter: blur(${blurPx}px);
  backdrop-filter: blur(${blurPx}px);
}
body {
  background-image:
    linear-gradient(color-mix(in srgb, var(--dsw-alias-bg-base) 50%, transparent), color-mix(in srgb, var(--dsw-alias-bg-base) 50%, transparent)),
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
  const [sidebarPct, setSidebarPct] = React.useState(70)
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
    ctrl.applyDefault().then((msg) => {
      if (alive) setStatus(msg)
    }).catch((e) => {
      if (alive) setStatus('默认背景加载失败：' + String(e && e.message ? e.message : e))
    })
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
  const onSidebarAlpha = (e) => {
    const pct = Number(e.target.value)
    setSidebarPct(pct)
    ctrl.setSidebarAlpha(pct / 100).then((msg) => setStatus(msg)).catch(() => {})
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
      React.createElement('button', { style: ghostStyle, onClick: run(() => ctrl.applyDefault()) }, '默认'),
      React.createElement('button', { style: ghostStyle, onClick: run(() => ctrl.clear()) }, '移除'),
    ),
    React.createElement('div', { style: rowStyle },
      React.createElement('span', { style: labelStyle }, '侧栏透明度'),
      React.createElement('input', {
        type: 'range', min: 30, max: 100, step: 5,
        value: sidebarPct,
        onChange: onSidebarAlpha,
        style: { flex: 1, minWidth: 140, accentColor: 'var(--dsw-alias-brand-primary)' },
      }),
      React.createElement('span', { style: labelStyle }, sidebarPct + '%'),
    ),
    React.createElement('p', { style: subStyle }, '背景库：bd2-yustia-skin/backgrounds/，命名 bg-<名称>.<png|jpg|webp|gif|avif|bmp|svg>'),
    React.createElement('p', { style: subStyle }, status),
  )
}

export function apply(ctx) {
  const theme = ctx.get('theme')
  if (theme !== undefined) {
    ctx.effect(
      () => theme.overrideTokens('bd2-yustia', YUSTIA_TOKENS),
      'bd2-yustia: 棕色尘埃2 · 悠丝缇亚 skin tokens',
    )
  }

  styles.insert(SKIN_CSS)

  let currentBgDispose
  let stopped = false
  let currentSrc = ''
  let sidebarAlpha = 0.7

  function reapplyBg() {
    if (typeof currentBgDispose === 'function') {
      currentBgDispose()
      currentBgDispose = undefined
    }
    if (currentSrc) currentBgDispose = styles.insert(bgCssFor(currentSrc, sidebarAlpha))
  }

  function swapBg(src) {
    if (stopped) return
    currentSrc = src
    reapplyBg()
  }

  const bgController = {
    async listBackgrounds() {
      try {
        const r = await host.call('bg-list', {})
        return r && r.ok && Array.isArray(r.names) ? r.names : []
      } catch (e) {
        return []
      }
    },
    async setSidebarAlpha(v) {
      const n = Number(v)
      if (!Number.isFinite(n)) return '透明度参数无效'
      sidebarAlpha = Math.min(1, Math.max(0.3, n))
      reapplyBg()
      return '侧栏透明度 ' + Math.round(sidebarAlpha * 100) + '%'
    },
    async applyValue(raw) {
      const value = String(raw || '').trim()
      if (!value) return '请输入本地图片路径或 http(s):// URL'
      if (/^https?:\/\//i.test(value)) {
        swapBg(value)
        return '已应用网络图片（浏览器直连；若被防盗链或 CSP 拦截，请改用本地路径）'
      }
      try {
        const r = await host.call('bg-read-file', { path: value })
        if (!r || !r.ok) return '加载失败：' + (r && r.error ? r.error : '未知错误')
        swapBg('data:' + r.mime + ';base64,' + r.data)
        return '已应用本地图片（' + Math.round(r.size / 1024) + ' KB · ' + r.path + '）'
      } catch (e) {
        return '加载失败：' + String(e && e.message ? e.message : e)
      }
    },
    async applyDefault() {
      try {
        const r = await host.call('bg-load-default', {})
        if (r && r.ok) {
          swapBg('data:' + r.mime + ';base64,' + r.data)
          return '已恢复默认圣光背景'
        }
        swapBg('')
        return '默认图片不可用：' + (r && r.error ? r.error : '未知错误')
      } catch (e) {
        swapBg('')
        return '默认图片不可用：' + String(e && e.message ? e.message : e)
      }
    },
    clear() {
      swapBg('')
      return '已移除背景图，恢复纯色皮肤'
    },
  }

  ctx.effect(() => () => {
    stopped = true
    swapBg('')
  }, 'bd2-yustia: background cleanup')

  host.call('bg-load-default', {}).then((r) => {
    if (!stopped && r && r.ok) {
      swapBg('data:' + r.mime + ';base64,' + r.data)
      console.log('bd2-yustia: default background applied')
    }
  }).catch((e) => console.log('bd2-yustia: default background unavailable', e))

  const slots = ctx.get('slots')
  if (slots !== undefined) {
    slots.inject('tool.view.cordis', () => slots.register(
      { name: 'tool.view.cordis', key: 'self' },
      () => React.createElement(YustiaRunPanel, { ctrl: bgController }),
    ))
  }
  console.log('bd2-yustia: 棕色尘埃2 · 悠丝缇亚 skin mounted')
}
