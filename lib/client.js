/**
 * 棕色尘埃2 · 悠丝缇亚 — DSH skin（静态 npm 皮肤包形态）
 * 忠实还原 hsr-kafka 的挂载契约：favicon + 标题 + 样式表 + 主题令牌层，
 * apply(ctx) 写入的一切在 dispose 时全部收回。
 * 运行于真实浏览器环境（document 可用）；令牌重映射使用客户端 theme 服务。
 */

const SKIN_TITLE = '棕色尘埃2 · 悠丝缇亚'

const FAVICON_SVG = "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='#b0871f'/><rect x='14.2' y='5' width='3.6' height='22' rx='1.2' fill='#fbf7ef'/><rect x='9.5' y='14.2' width='13' height='3.6' rx='1.2' fill='#fbf7ef'/><circle cx='16' cy='16' r='4.4' fill='#f6f1e8'/><circle cx='16' cy='16' r='2.2' fill='#b0871f'/></svg>"

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

const SKIN_CSS = `
/* bd2-yustia signature decor — 棕色尘埃2 · 悠丝缇亚 */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
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
  z-index: 0;
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

export function apply(ctx) {
  const body = document.body
  const originalTitle = document.title

  const favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.href = `data:image/svg+xml;utf8,${encodeURIComponent(FAVICON_SVG)}`
  document.head.append(favicon)
  document.title = SKIN_TITLE

  const style = document.createElement('style')
  style.dataset.pluginCss = 'dsh-skin-bd2-yustia/decor'
  style.textContent = SKIN_CSS
  document.head.append(style)

  const theme = ctx.get('theme')
  let disposeTokens
  if (theme !== undefined) disposeTokens = theme.overrideTokens('bd2-yustia', YUSTIA_TOKENS)

  ctx.effect(() => () => {
    if (typeof disposeTokens === 'function') {
      disposeTokens()
      disposeTokens = undefined
    }
    favicon.remove()
    style.remove()
    if (document.title === SKIN_TITLE) document.title = originalTitle
  }, 'bd2-yustia: 棕色尘埃2 · 悠丝缇亚 skin')
}
