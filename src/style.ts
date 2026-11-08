/** The page's CSS. Only the app's CSS custom properties, so it follows the theme. */
export const CSS = `
.phb { display: flex; flex-direction: column; flex: 1; min-height: 0; gap: 6px; padding: 8px 10px 10px; color: var(--text); font-size: 12.5px; }
.phb * { box-sizing: border-box; }
.phb-bar { display: flex; align-items: center; gap: 4px; min-width: 0; }
.phb-btn { flex: none; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; padding: 0; border: 0; border-radius: var(--radius-sm, 6px); background: none; color: var(--text-muted); cursor: pointer; transition: background var(--dur-fast, 120ms), color var(--dur-fast, 120ms); }
.phb-btn:hover:not(:disabled) { background: var(--bg-800); color: var(--text); }
.phb-btn:disabled { opacity: .35; cursor: default; }
.phb-btn[aria-pressed=true] { color: var(--accent); }
.phb-btn:focus-visible, .phb-addr:focus-visible, .phb-mark:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--accent-soft); }
.phb-addr { flex: 1; min-width: 0; height: 30px; padding: 0 12px; border-radius: 99px; border: 1px solid var(--border); background: var(--bg-850); color: var(--text); font: inherit; font-size: 13px; }
.phb-addr:focus { border-color: var(--accent); background: var(--bg-900); }
.phb-addr::placeholder { color: var(--text-faint); }
.phb-info { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 22px; padding: 0 4px; }
.phb-title { flex: 1; min-width: 0; color: var(--text-muted); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.phb-error { color: var(--danger); }
.phb-link { flex: none; padding: 0 2px; border: 0; background: none; color: var(--text-muted); font: inherit; font-size: 12px; text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }
.phb-link:hover { color: var(--text); }
.phb-marks { display: flex; gap: 4px; min-width: 0; padding: 0 2px 2px; overflow-x: auto; scrollbar-width: none; }
.phb-marks::-webkit-scrollbar { display: none; }
.phb-marks[hidden] { display: none; }
.phb-mark { flex: none; max-width: 160px; height: 22px; padding: 0 9px; border: 1px solid var(--border); border-radius: 99px; background: var(--bg-850); color: var(--text-muted); font: inherit; font-size: 11.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
.phb-mark:hover { color: var(--text); border-color: var(--border-strong); }
.phb-frame { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.phb-progress { position: absolute; left: 0; right: 0; top: -4px; height: 2px; border-radius: 99px; overflow: hidden; opacity: 0; transition: opacity var(--dur, 200ms); }
.phb-progress[data-on] { opacity: 1; }
.phb-progress i { position: absolute; top: 0; bottom: 0; width: 30%; border-radius: inherit; background: var(--accent); animation: phb-slide 1.1s ease-in-out infinite; }
@keyframes phb-slide { from { left: -30%; } to { left: 100%; } }
.phb-manage { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 8px; padding: 12px; border-radius: var(--radius-md, 10px); background: var(--bg-900); overflow: hidden; }
.phb-manage[hidden], .phb-view[hidden] { display: none; }
.phb-manage-head { display: flex; align-items: center; gap: 8px; }
.phb-manage-head b { flex: 1; font-size: 13px; font-weight: 600; color: var(--text); }
.phb-pill { flex: none; height: 26px; padding: 0 11px; border: 1px solid var(--border); border-radius: 99px; background: var(--bg-850); color: var(--text); font: inherit; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.phb-pill:hover:not(:disabled) { border-color: var(--border-strong); }
.phb-pill:disabled { opacity: .45; cursor: default; }
.phb-list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
.phb-item { display: flex; align-items: center; gap: 4px; min-height: 40px; padding: 2px 4px 2px 10px; border-radius: var(--radius-sm, 6px); }
.phb-item:hover { background: var(--bg-850); }
.phb-open { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 1px; padding: 4px 0; border: 0; background: none; color: var(--text); font: inherit; text-align: left; cursor: pointer; }
.phb-open span { max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.phb-open small { max-width: 100%; color: var(--text-faint); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.phb-rename { flex: 1; min-width: 0; height: 28px; padding: 0 10px; border-radius: var(--radius-sm, 6px); border: 1px solid var(--accent); background: var(--bg-850); color: var(--text); font: inherit; }
.phb-item .phb-btn { width: 26px; height: 26px; }
.phb-empty { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-faint); font-size: 12px; text-align: center; padding: 16px; }
.phb-view { flex: 1; min-height: 0; border-radius: var(--radius-md, 10px); background: var(--bg-900); border: 0; display: flex; align-items: center; justify-content: center; color: var(--text-faint); font-size: 12px; text-align: center; padding: 16px; }
`
