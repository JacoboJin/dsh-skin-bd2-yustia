/**
 * 棕色尘埃2 · 悠丝缇亚 (Justia) — DSH 动态皮肤插件（Client 端最终参考实现，对应 pkg-31）
 *
 * 架构：
 * 1. 设计令牌昼夜重映射（theme.overrideTokens，13 个内联令牌）
 * 2. STATIC_CSS：全量暖色令牌重映射，body 作用域 + !important（覆盖 portal 弹出层），
 *    包含深色静态中性色、deepseek 金色点缀、hovercard/ghost-active/tool-bar/label-caption/
 *    label-quaternary/masks/skeleton、按钮填充、交互状态、代码块族、边框与阴影等
 * 3. bgCssFor：背景模式动态层 —— body 级非内联令牌随侧栏透明度联动（含 portal），
 *    frame 级内联令牌联动，标题栏/session log 按钮毛玻璃
 * 4. decorCss：圣光/星尘装饰层，浓度可调
 * 5. 面板：背景库/随机/默认/移除、三滑杆（侧栏透明度/帷幕/装饰）、状态行、诊断按钮
 * 6. 设置自动记忆（settings.json，Host 写策略 danger-full-access）
 * 全部副作用可回收；Host 半体见 host.js。
 */

const STATIC_CSS = `
/* ===== bd2-yustia 全量暖色令牌重映射（body 作用域 + !important，覆盖 portal 弹出层） ===== */
body {
  --dsw-static-neutral-1000: #2a2118 !important;
  --dsw-static-neutral-900: #33291b !important;
  --dsw-static-neutral-850: #3a3024 !important;
  --dsw-static-neutral-800: #423a2e !important;
  --dsw-static-neutral-700: #4d4033 !important;
  --dsw-static-neutral-bluish-1000: #2a2118 !important;
  --dsw-static-neutral-bluish-950: #33291b !important;
  --dsw-static-neutral-bluish-900: #33291b !important;
  --dsw-static-neutral-bluish-875: #3a3024 !important;
  --dsw-static-neutral-bluish-850: #3a3024 !important;
  --dsw-static-neutral-bluish-800: #423a2e !important;
  --dsw-static-neutral-bluish-750: #4d4033 !important;
  --dsw-static-neutral-bluish-700: #5b4c3c !important;
  --dsw-static-deepseek-400: #c9a53d !important;
  --dsw-static-deepseek-450: #b98a1e !important;
  --dsw-static-deepseek-500: #b0871f !important;
  --dsw-static-deepseek-600: #8f6b1a !important;
  --dsw-static-deepseek-50: #fbf3df !important;
  --dsw-static-deepseek-100: #f7e8c4 !important;
  --dsw-static-deepseek-200: #efd79a !important;
  --dsw-static-deepseek-300: #e2bf6a !important;
  --dsw-alias-bg-module-platform: color-mix(in srgb, #f6f1e8 78%, transparent) !important;
  --dsw-alias-bg-multi-select: color-mix(in srgb, #f6f1e8 78%, transparent) !important;
  --dsw-alias-bg-layer-3: color-mix(in srgb, #fbf7ef 90%, transparent) !important;
  --dsw-alias-bg-overlay: color-mix(in srgb, #fdfaf3 92%, transparent) !important;
  --dsw-alias-bg-skeleton: color-mix(in srgb, #b0871f 10%, transparent) !important;
  --dsw-alias-bg-mask-1: rgba(51, 41, 27, 0.24) !important;
  --dsw-alias-bg-mask-2: rgba(51, 41, 27, 0.12) !important;
  --dsw-alias-bg-mask-3: rgba(51, 41, 27, 0.48) !important;
  --dsw-alias-bg-mask-photo: rgba(22, 19, 15, 0.88) !important;
  --dsw-alias-bg-mask-drop: rgba(251, 247, 239, 0.70) !important;
  --dsw-hovercard-bg: #fbf7ef !important;
  --dsw-alias-button-elevated-fill: color-mix(in srgb, #fdfaf3 90%, transparent) !important;
  --dsw-alias-button-floating-fill: color-mix(in srgb, #fdfaf3 90%, transparent) !important;
  --dsw-alias-button-floating-hover: color-mix(in srgb, #f6f1e8 96%, transparent) !important;
  --dsw-alias-button-ghost-active-fill: color-mix(in srgb, #b0871f 14%, transparent) !important;
  --dsw-alias-button-ghost-active-hover: color-mix(in srgb, #b0871f 20%, transparent) !important;
  --dsw-alias-button-ghost-active-border: color-mix(in srgb, #b0871f 40%, transparent) !important;
  --dsw-alias-button-primary-hover: #8f6b1a !important;
  --dsw-alias-button-contrast-fill: #b0871f !important;
  --dsw-alias-button-tool-bar-fill: rgba(122, 92, 22, 0.5) !important;
  --dsw-alias-button-tool-bar-hover: rgba(122, 92, 22, 0.6) !important;
  --dsw-alias-button-tool-bar-fill-invisible: rgba(122, 92, 22, 0.36) !important;
  --dsw-alias-interactive-bg-hover: color-mix(in srgb, #b0871f 12%, transparent) !important;
  --dsw-alias-interactive-bg-active: color-mix(in srgb, #b0871f 16%, transparent) !important;
  --dsw-alias-interactive-bg-hover-solid: color-mix(in srgb, #b0871f 14%, transparent) !important;
  --dsw-alias-interactive-bg-hover-accent: color-mix(in srgb, #b0871f 20%, transparent) !important;
  --dsw-alias-interactive-bg-hover-danger: color-mix(in srgb, #b23a48 8%, transparent) !important;
  --dsw-alias-fill-l1: color-mix(in srgb, #b0871f 8%, transparent) !important;
  --dsw-alias-fill-l2: color-mix(in srgb, #b0871f 16%, transparent) !important;
  --dsw-alias-fill-tsp-secondary: color-mix(in srgb, #b0871f 16%, transparent) !important;
  --dsw-specific-selector: color-mix(in srgb, #f6f1e8 78%, transparent) !important;
  --dsw-specific-bubble: color-mix(in srgb, #f6f1e8 95%, transparent) !important;
  --dsw-specific-bubble-highlight: #b0871f !important;
  --dsw-specific-sidebar-nav-item-active: color-mix(in srgb, #b0871f 22%, transparent) !important;
  --dsw-specific-sidebar-nav-item-active-accent: color-mix(in srgb, #b0871f 52%, transparent) !important;
  --dsw-specific-sidebar-nav-item-hover: color-mix(in srgb, #b0871f 12%, transparent) !important;
  --dsw-alias-markdown-code-block: #f6f1e8 !important;
  --dsw-alias-markdown-code-block-banner: #efe6d6 !important;
  --dsw-alias-markdown-code-segment-selected: #fbf7ef !important;
  --dsw-alias-markdown-code-segment-unselected: #efe6d6 !important;
  --dsw-alias-markdown-inline-code: #f6f1e8 !important;
  --dsw-alias-markdown-citation: #f6f1e8 !important;
  --dsw-alias-markdown-tag: color-mix(in srgb, #f6f1e8 80%, transparent) !important;
  --dsw-alias-markdown-placeholder: color-mix(in srgb, #efe6d6 80%, transparent) !important;
  --dsw-alias-label-quaternary: #8d7d6a !important;
  --dsw-alias-label-caption: #8a7448 !important;
  --dsw-alias-label-dimmed: #8d7d6a !important;
  --dsw-alias-label-primary-inverted: #fdfaf3 !important;
  --dsw-alias-label-primary-dimmed: #3a3024 !important;
  --dsw-alias-brand-primary-invert: #33291b !important;
  --dsw-alias-brand-text: #33291b !important;
  --dsw-alias-border-l2-darkmode-thin: color-mix(in srgb, #b0871f 18%, transparent) !important;
  --dsw-alias-border-l3: color-mix(in srgb, #b0871f 26%, transparent) !important;
  --dsw-alias-border-l4: color-mix(in srgb, #b0871f 32%, transparent) !important;
  --dsw-alias-toast-bg: #423a2e !important;
  --dsw-alias-tooltip-bg: #3a3024 !important;
  --dsw-shadow-lv1: 0 2px 4px 0 rgba(51, 41, 27, 0.10) !important;
  --dsw-shadow-lv1-blur: 0 4px 12px 0 rgba(51, 41, 27, 0.08) !important;
  --dsw-shadow-lv2: 0 4px 12px 0 rgba(51, 41, 27, 0.10), 0 2px 8px 0 rgba(51, 41, 27, 0.10) !important;
  --dsw-shadow-lv3: 0 0 1px 0 rgba(51, 41, 27, 0.25), 0 0 4px 0 rgba(51, 41, 27, 0.10), 0 12px 32px 0 rgba(51, 41, 27, 0.18) !important;
}
body[data-ds-dark-theme] {
  --dsw-static-neutral-1000: #16130f !important;
  --dsw-static-neutral-900: #1c1712 !important;
  --dsw-static-neutral-850: #211a14 !important;
  --dsw-static-neutral-800: #261e16 !important;
  --dsw-static-neutral-700: #2e241a !important;
  --dsw-static-neutral-bluish-1000: #16130f !important;
  --dsw-static-neutral-bluish-950: #1c1712 !important;
  --dsw-static-neutral-bluish-900: #1c1712 !important;
  --dsw-static-neutral-bluish-875: #211a14 !important;
  --dsw-static-neutral-bluish-850: #211a14 !important;
  --dsw-static-neutral-bluish-800: #261e16 !important;
  --dsw-static-neutral-bluish-750: #2e241a !important;
  --dsw-static-neutral-bluish-700: #382c1f !important;
  --dsw-static-deepseek-400: #d8b25c !important;
  --dsw-static-deepseek-450: #c9a53d !important;
  --dsw-static-deepseek-500: #b0871f !important;
  --dsw-static-deepseek-600: #e0bd66 !important;
  --dsw-static-deepseek-50: #241c12 !important;
  --dsw-static-deepseek-100: #2e241a !important;
  --dsw-static-deepseek-200: #3a2f22 !important;
  --dsw-static-deepseek-300: #4d4033 !important;
  --dsw-alias-bg-module-platform: color-mix(in srgb, #282113 80%, transparent) !important;
  --dsw-alias-bg-multi-select: color-mix(in srgb, #2b2419 88%, transparent) !important;
  --dsw-alias-bg-layer-3: color-mix(in srgb, #2f261b 88%, transparent) !important;
  --dsw-alias-bg-overlay: color-mix(in srgb, #2b2419 92%, transparent) !important;
  --dsw-alias-bg-skeleton: color-mix(in srgb, #d8b25c 10%, transparent) !important;
  --dsw-alias-bg-mask-1: rgba(10, 7, 4, 0.50) !important;
  --dsw-alias-bg-mask-2: rgba(10, 7, 4, 0.30) !important;
  --dsw-alias-bg-mask-3: rgba(10, 7, 4, 0.55) !important;
  --dsw-alias-bg-mask-photo: rgba(10, 7, 4, 0.88) !important;
  --dsw-alias-bg-mask-drop: rgba(30, 24, 16, 0.70) !important;
  --dsw-hovercard-bg: #282113 !important;
  --dsw-alias-button-elevated-fill: color-mix(in srgb, #33291b 92%, transparent) !important;
  --dsw-alias-button-floating-fill: color-mix(in srgb, #2b2419 90%, transparent) !important;
  --dsw-alias-button-floating-hover: color-mix(in srgb, #33291b 92%, transparent) !important;
  --dsw-alias-button-ghost-active-fill: color-mix(in srgb, #d8b25c 18%, transparent) !important;
  --dsw-alias-button-ghost-active-hover: color-mix(in srgb, #d8b25c 24%, transparent) !important;
  --dsw-alias-button-ghost-active-border: color-mix(in srgb, #d8b25c 45%, transparent) !important;
  --dsw-alias-button-primary-hover: #e0bd66 !important;
  --dsw-alias-button-contrast-fill: #d8b25c !important;
  --dsw-alias-button-tool-bar-fill: rgba(51, 41, 27, 0.62) !important;
  --dsw-alias-button-tool-bar-hover: rgba(51, 41, 27, 0.72) !important;
  --dsw-alias-button-tool-bar-fill-invisible: rgba(51, 41, 27, 0.45) !important;
  --dsw-alias-interactive-bg-hover: color-mix(in srgb, #d8b25c 14%, transparent) !important;
  --dsw-alias-interactive-bg-active: color-mix(in srgb, #d8b25c 18%, transparent) !important;
  --dsw-alias-interactive-bg-hover-solid: color-mix(in srgb, #d8b25c 16%, transparent) !important;
  --dsw-alias-interactive-bg-hover-accent: color-mix(in srgb, #d8b25c 22%, transparent) !important;
  --dsw-alias-interactive-bg-hover-danger: color-mix(in srgb, #d96a77 10%, transparent) !important;
  --dsw-alias-fill-l1: color-mix(in srgb, #d8b25c 10%, transparent) !important;
  --dsw-alias-fill-l2: color-mix(in srgb, #d8b25c 18%, transparent) !important;
  --dsw-alias-fill-tsp-secondary: color-mix(in srgb, #d8b25c 18%, transparent) !important;
  --dsw-specific-selector: color-mix(in srgb, #33291b 88%, transparent) !important;
  --dsw-specific-bubble: color-mix(in srgb, #33291b 90%, transparent) !important;
  --dsw-specific-bubble-highlight: #d8b25c !important;
  --dsw-specific-sidebar-nav-item-active: color-mix(in srgb, #d8b25c 22%, transparent) !important;
  --dsw-specific-sidebar-nav-item-active-accent: #d8b25c !important;
  --dsw-specific-sidebar-nav-item-hover: color-mix(in srgb, #d8b25c 12%, transparent) !important;
  --dsw-alias-markdown-code-block: #241c12 !important;
  --dsw-alias-markdown-code-block-banner: #2b2215 !important;
  --dsw-alias-markdown-code-segment-selected: #34281c !important;
  --dsw-alias-markdown-code-segment-unselected: #241c12 !important;
  --dsw-alias-markdown-inline-code: #34281c !important;
  --dsw-alias-markdown-citation: #34281c !important;
  --dsw-alias-markdown-tag: #3a2f22 !important;
  --dsw-alias-markdown-placeholder: #3a2f22 !important;
  --dsw-alias-label-quaternary: #9c8d70 !important;
  --dsw-alias-label-caption: #a08a5c !important;
  --dsw-alias-label-dimmed: #9c8d70 !important;
  --dsw-alias-label-primary-inverted: #1a150e !important;
  --dsw-alias-label-primary-dimmed: #c9b489 !important;
  --dsw-alias-brand-primary-invert: #16130f !important;
  --dsw-alias-brand-text: #d8b25c !important;
  --dsw-alias-border-l2-darkmode-thin: color-mix(in srgb, #d8b25c 16%, transparent) !important;
  --dsw-alias-border-l3: color-mix(in srgb, #d8b25c 26%, transparent) !important;
  --dsw-alias-border-l4: color-mix(in srgb, #d8b25c 34%, transparent) !important;
  --dsw-alias-toast-bg: #423a2e !important;
  --dsw-alias-tooltip-bg: #3a3024 !important;
  --dsw-shadow-lv1: 0 2px 4px 0 rgba(10, 7, 4, 0.45) !important;
  --dsw-shadow-lv1-blur: 0 4px 12px 0 rgba(10, 7, 4, 0.35) !important;
  --dsw-shadow-lv2: 0 4px 12px 0 rgba(10, 7, 4, 0.40), 0 2px 8px 0 rgba(10, 7, 4, 0.42) !important;
  --dsw-shadow-lv3: 0 0 1px 0 rgba(10, 7, 4, 0.55), 0 0 4px 0 rgba(10, 7, 4, 0.30), 0 12px 32px 0 rgba(10, 7, 4, 0.50) !important;
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

/** 背景 CSS：body 级非内联令牌 + frame 级内联令牌随滑杆联动（详见 README） */
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
  const hoverLight = Math.round(a * 16)
  const hoverDark = Math.round(a * 18)
  return `
body {
  --dsw-alias-bg-module-platform: color-mix(in srgb, #f6f1e8 ${lightPct}%, transparent) !important;
  --dsw-alias-button-elevated-fill: color-mix(in srgb, #fdfaf3 ${elevLight}%, transparent) !important;
  --dsw-alias-button-floating-fill: color-mix(in srgb, #fdfaf3 ${elevLight}%, transparent) !important;
  --dsw-alias-interactive-bg-hover: color-mix(in srgb, #b0871f ${hoverLight}%, transparent) !important;
  --dsw-alias-interactive-bg-active: color-mix(in srgb, #b0871f ${Math.min(100, hoverLight + 4)}%, transparent) !important;
  --dsw-specific-sidebar-nav-item-active: color-mix(in srgb, #b0871f ${navActive}%, transparent) !important;
  --dsw-specific-sidebar-nav-item-active-accent: color-mix(in srgb, #b0871f ${navAccent}%, transparent) !important;
  --dsw-specific-sidebar-nav-item-hover: color-mix(in srgb, #b0871f ${navHover}%, transparent) !important;
  --dsw-alias-fill-l2: color-mix(in srgb, #b0871f ${fillPct}%, transparent) !important;
  --dsw-alias-fill-l1: color-mix(in srgb, #b0871f ${Math.max(6, fillPct - 8)}%, transparent) !important;
}
body[data-ds-dark-theme] {
  --dsw-alias-bg-module-platform: color-mix(in srgb, #282113 ${darkPct}%, transparent) !important;
  --dsw-alias-button-elevated-fill: color-mix(in srgb, #33291b ${elevDark}%, transparent) !important;
  --dsw-alias-button-floating-fill: color-mix(in srgb, #2b2419 ${elevDark}%, transparent) !important;
  --dsw-alias-interactive-bg-hover: color-mix(in srgb, #d8b25c ${hoverDark}%, transparent) !important;
  --dsw-alias-interactive-bg-active: color-mix(in srgb, #d8b25c ${Math.min(100, hoverDark + 4)}%, transparent) !important;
  --dsw-specific-sidebar-nav-item-active: color-mix(in srgb, #d8b25c ${navActive}%, transparent) !important;
  --dsw-specific-sidebar-nav-item-active-accent: color-mix(in srgb, #d8b25c ${navAccent}%, transparent) !important;
  --dsw-specific-sidebar-nav-item-hover: color-mix(in srgb, #d8b25c ${navHover}%, transparent) !important;
  --dsw-alias-fill-l2: color-mix(in srgb, #d8b25c ${fillPct}%, transparent) !important;
  --dsw-alias-fill-l1: color-mix(in srgb, #d8b25c ${Math.max(6, fillPct - 8)}%, transparent) !important;
}
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
  --dsw-specific-selector: color-mix(in srgb, #f6f1e8 ${lightPct}%, transparent) !important;
}
body[data-ds-dark-theme] [class*='_frame'] {
  --dsw-specific-sidebar-fill: color-mix(in srgb, #1c1712 ${darkPct}%, transparent) !important;
  --dsw-alias-bg-layer-1: color-mix(in srgb, #1f1a13 90%, transparent) !important;
  --dsw-alias-bg-layer-2: color-mix(in srgb, #282113 82%, transparent) !important;
  --dsw-alias-bg-layer-3: color-mix(in srgb, #2f261b ${elevDark}%, transparent) !important;
  --dsw-alias-bg-overlay: color-mix(in srgb, #2b2419 ${elevDark}%, transparent) !important;
  --dsw-alias-bg-multi-select: color-mix(in srgb, #2b2419 ${darkPct}%, transparent) !important;
  --dsw-specific-tip: color-mix(in srgb, #1f1a13 80%, transparent) !important;
  --dsw-specific-selector: color-mix(in srgb, #33291b ${elevDark}%, transparent) !important;
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
      ctrl.diagnose().then((msg) => setStatus(msg)).catch(() => {})
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
      React.createElement('input', { type: 'range', min: 0, max: 85, step: 5, value: veilPct, onChange: onVeil, onMouseUp: () => ctrl.persist(), onTouchEnd: () => ctrl.persist(), style: sliderStyle }),
      React.createElement('span', { style: labelStyle }, veilPct + '%'),
    ),
    React.createElement('div', { style: rowStyle },
      React.createElement('span', { style: labelStyle }, '装饰浓度'),
      React.createElement('input', { type: 'range', min: 0, max: 100, step: 5, value: decorPct, onChange: onDecor, onMouseUp: () => ctrl.persist(), onTouchEnd: () => ctrl.persist(), style: sliderStyle }),
      React.createElement('span', { style: labelStyle }, decorPct + '%'),
    ),
    React.createElement('div', { style: rowStyle },
      React.createElement('button', { style: ghostStyle, onClick: run(() => ctrl.diagnose()) }, '诊断'),
      React.createElement('span', { style: labelStyle }, '扫描着色元素写入 diag-styles.json'),
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

  async function diagnose() {
    const probe = {}
    try { probe.documentType = typeof document } catch (e) { probe.documentType = 'err' }
    let rows = []
    let scanError = ''
    try {
      if (typeof document !== 'undefined') {
        const selectors = [
          "[class*='_frame']",
          "[class*='sessionLogButton']",
          "[class*='sidebarCol']",
          "[class*='_header']",
        ]
        for (const sel of selectors) {
          const root = document.querySelector(sel)
          if (!root) continue
          const els = [root, ...root.querySelectorAll('*')]
          for (const el of els) {
            const cs = getComputedStyle(el)
            const bg = cs.backgroundColor || ''
            const shadow = cs.boxShadow || ''
            const bf = cs.backdropFilter || cs.webkitBackdropFilter || ''
            if ((bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') || (shadow && shadow !== 'none') || (bf && bf !== 'none')) {
              rows.push({
                tag: el.tagName,
                cls: String(typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal) || '').slice(0, 90),
                bg: bg.slice(0, 60),
                shadow: shadow.slice(0, 70),
                bf: bf.slice(0, 40),
              })
            }
            if (rows.length > 160) break
          }
          if (rows.length > 160) break
        }
      } else {
        scanError = 'document undefined'
      }
    } catch (e) {
      scanError = String(e && e.message ? e.message : e)
    }
    try {
      const r = await host.call('bg-dump-styles', { probe, scanError, rows })
      return '诊断完成 rows=' + rows.length + (scanError ? ' err=' + scanError : '') + ((r && r.ok) ? '（已写盘）' : '（写盘失败：' + (r && r.error ? r.error : '') + '）')
    } catch (e) {
      return '诊断回传失败：' + String(e && e.message ? e.message : e)
    }
  }

  const bgController = {
    ready,
    diagnose,
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
      sidebarAlpha = clamp(v, 0.3, 1, 0.82)
      reapplyBg()
      return '侧栏透明度 ' + Math.round(sidebarAlpha * 100) + '%（侧栏/标题栏/胶囊/条目/hover 状态同步联动）'
    },
    async setVeil(v) {
      veilPct = clamp(v, 0, 85, 62)
      reapplyBg()
      return '帷幕深浅 ' + veilPct + '%'
    },
    async setDecor(v) {
      decorIntensity = clamp(v / 100, 0, 1, 0.9)
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
