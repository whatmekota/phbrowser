import type { Bookmark } from './bookmarks'
import type { PluginContext, WebViewHandle, WebViewState } from './types'
import { addressFor, DEFAULT_HOME, DEFAULT_SEARCH, shownAddress, webUrl } from './address'
import { bookmarkLabel, isBookmarked, moveBookmark, readBookmarks, removeBookmark, renameBookmark, toggleBookmark } from './bookmarks'
import { BACK, DOWN, FORWARD, GLOBE, HOME, MARKS, PENCIL, RELOAD, STAR, STAR_ON, STOP, TRASH, UP } from './icons'
import { CSS } from './style'

/**
 * A web browser on playhound's stage: an address bar and a real web page
 * (ctx.webview) under it. Tap tempo and the generated motion live in
 * playhound's own drawer on the right, which the page never covers, so a
 * site can play while they drive the device.
 *
 * The page is made once and kept while the plugin is on: leaving the stage
 * hides it, coming back finds it where it was.
 */
export default function activate(ctx: PluginContext) {
  ctx.ui.style(CSS)
  ctx.ui.settings([
    { key: 'home', type: 'text', label: 'Home page', placeholder: DEFAULT_HOME, default: DEFAULT_HOME },
    { key: 'search', type: 'text', label: 'Search with', hint: 'A web address with %s where the words go.', placeholder: DEFAULT_SEARCH, default: DEFAULT_SEARCH },
    { key: 'zoom', type: 'slider', label: 'Page zoom', min: 50, max: 200, step: 10, unit: '%', default: 100 },
  ])

  const setting = (key: string) => String(ctx.settings.get(key) ?? '').trim()
  const home = () => webUrl(setting('home')) ?? DEFAULT_HOME
  const zoom = () => Math.max(0.5, Math.min(2, (Number(ctx.settings.get('zoom')) || 100) / 100))

  let view: WebViewHandle | null = null
  let bookmarks: Bookmark[] = []
  let lastUrl: string | null = null
  /** Redraws the page while it is up. */
  let redraw: (() => void) | null = null

  const loaded = (async () => {
    try {
      bookmarks = readBookmarks(await ctx.storage.get('bookmarks'))
      const last = await ctx.storage.get<string>('last')
      lastUrl = typeof last === 'string' ? webUrl(last) : null
    }
    catch (err) {
      ctx.log('could not read saved data', err)
    }
  })()

  ctx.settings.onChange(() => view?.setZoom(zoom()))

  function go(url: string) {
    view?.navigate(url)
  }

  ctx.ui.page({
    title: 'Browser',
    icon: GLOBE,
    mount(el) {
      const root = document.createElement('div')
      root.className = 'phb'
      el.append(root)

      if (!ctx.webview.available) {
        root.innerHTML = '<div class="phb-view">The browser needs the playhound desktop app.</div>'
        return () => root.remove()
      }

      root.innerHTML = `
        <div class="phb-bar">
          <button type="button" class="phb-btn" data-act="back" aria-label="Back" title="Back">${BACK}</button>
          <button type="button" class="phb-btn" data-act="forward" aria-label="Forward" title="Forward">${FORWARD}</button>
          <button type="button" class="phb-btn" data-act="reload" aria-label="Reload" title="Reload">${RELOAD}</button>
          <button type="button" class="phb-btn" data-act="home" aria-label="Home" title="Home">${HOME}</button>
          <input class="phb-addr" type="text" spellcheck="false" autocomplete="off" placeholder="Search or type an address" aria-label="Address">
          <button type="button" class="phb-btn" data-act="mark" aria-label="Bookmark this page" title="Bookmark this page" aria-pressed="false">${STAR}</button>
          <button type="button" class="phb-btn" data-act="manage" aria-label="Bookmarks" title="Bookmarks" aria-pressed="false">${MARKS}</button>
        </div>
        <div class="phb-marks" hidden></div>
        <div class="phb-info">
          <span class="phb-title"></span>
          <button type="button" class="phb-link" data-act="retry" hidden>Try again</button>
        </div>
        <div class="phb-frame">
          <div class="phb-progress"><i></i></div>
          <div class="phb-view"></div>
          <div class="phb-manage" hidden>
            <div class="phb-manage-head">
              <b>Bookmarks</b>
              <button type="button" class="phb-pill" data-act="add">${STAR} Add this page</button>
              <button type="button" class="phb-pill" data-act="done">Back to the page</button>
            </div>
            <ul class="phb-list"></ul>
          </div>
        </div>`
      const $ = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T
      const btn = (act: string) => $<HTMLButtonElement>(`[data-act="${act}"]`)
      const addr = $<HTMLInputElement>('.phb-addr')
      const title = $<HTMLSpanElement>('.phb-title')
      const retry = btn('retry')
      const marks = $<HTMLDivElement>('.phb-marks')
      const progress = $<HTMLDivElement>('.phb-progress')
      const frame = $<HTMLDivElement>('.phb-view')
      const manage = $<HTMLDivElement>('.phb-manage')
      const list = $<HTMLUListElement>('.phb-list')
      // The bar scrolls sideways under a plain mouse wheel too.
      marks.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          marks.scrollLeft += e.deltaY
          e.preventDefault()
        }
      }, { passive: false })

      if (!view || view.destroyed) {
        try {
          view = ctx.webview.create({ zoom: zoom() })
        }
        catch (err) {
          frame.textContent = `Can't open a page: ${err instanceof Error ? err.message : String(err)}`
          return () => root.remove()
        }
        const first = view
        void loaded.then(() => {
          if (!first.destroyed && !first.state().url)
            first.navigate(lastUrl ?? home())
        })
      }
      const v = view
      v.attach(frame)

      let s: WebViewState = v.state()
      /**
       * The bookmarks list is up. It takes the page's place rather than
       * dropping down over it: the page is a native layer above everything
       * here, so a menu would open underneath it.
       */
      let managing = false
      /** The bookmark being renamed. */
      let renaming: string | null = null

      function setManaging(on: boolean) {
        managing = on
        renaming = null
        v.attach(on ? null : frame)
        render()
      }

      function renderList() {
        const add = btn('add')
        add.disabled = !s.url || isBookmarked(bookmarks, s.url)
        if (!bookmarks.length) {
          const empty = document.createElement('li')
          empty.className = 'phb-empty'
          empty.textContent = 'No bookmarks yet. The star next to the address bookmarks the page you are on.'
          list.replaceChildren(empty)
          return
        }
        list.replaceChildren(...bookmarks.map((b, i) => {
          const li = document.createElement('li')
          li.className = 'phb-item'
          if (renaming === b.url) {
            const input = document.createElement('input')
            input.className = 'phb-rename'
            input.value = b.title
            input.placeholder = bookmarkLabel({ url: b.url, title: '' }, 60)
            input.setAttribute('aria-label', 'Name')
            input.spellcheck = false
            const commit = () => {
              if (renaming !== b.url)
                return
              renaming = null
              save(renameBookmark(bookmarks, b.url, input.value))
            }
            input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter')
                commit()
              else if (e.key === 'Escape') {
                e.stopPropagation()
                renaming = null
                render()
              }
            })
            input.addEventListener('blur', commit)
            li.append(input)
            requestAnimationFrame(() => {
              input.focus()
              input.select()
            })
            return li
          }
          const open = document.createElement('button')
          open.type = 'button'
          open.className = 'phb-open'
          open.title = b.url
          const name = document.createElement('span')
          name.textContent = bookmarkLabel(b, 80)
          const where = document.createElement('small')
          where.textContent = shownAddress(b.url)
          open.append(name, where)
          open.addEventListener('click', () => {
            setManaging(false)
            go(b.url)
          })
          const tool = (icon: string, label: string, fn: () => void, disabled = false) => {
            const t = document.createElement('button')
            t.type = 'button'
            t.className = 'phb-btn'
            t.innerHTML = icon
            t.title = label
            t.setAttribute('aria-label', label)
            t.disabled = disabled
            t.addEventListener('click', fn)
            return t
          }
          li.append(
            open,
            tool(PENCIL, 'Rename', () => {
              renaming = b.url
              renderList()
            }),
            tool(UP, 'Move up', () => save(moveBookmark(bookmarks, b.url, -1)), i === 0),
            tool(DOWN, 'Move down', () => save(moveBookmark(bookmarks, b.url, 1)), i === bookmarks.length - 1),
            tool(TRASH, 'Remove', () => save(removeBookmark(bookmarks, b.url))),
          )
          return li
        }))
      }

      function render() {
        btn('back').disabled = !s.canGoBack
        btn('forward').disabled = !s.canGoForward
        const reload = btn('reload')
        reload.innerHTML = s.loading ? STOP : RELOAD
        reload.setAttribute('aria-label', s.loading ? 'Stop' : 'Reload')
        reload.title = s.loading ? 'Stop' : 'Reload'
        if (document.activeElement !== addr)
          addr.value = shownAddress(s.url)
        progress.toggleAttribute('data-on', s.loading)
        if (s.error) {
          title.textContent = `Couldn't open the page: ${s.error.description || `error ${s.error.code}`}`
          title.classList.add('phb-error')
        }
        else {
          title.textContent = s.title || (s.loading ? 'Loading…' : '')
          title.classList.remove('phb-error')
        }
        retry.hidden = !s.error
        const marked = !!s.url && isBookmarked(bookmarks, s.url)
        const mark = btn('mark')
        mark.disabled = !s.url
        mark.setAttribute('aria-pressed', String(marked))
        mark.innerHTML = marked ? STAR_ON : STAR
        mark.setAttribute('aria-label', marked ? 'Remove the bookmark' : 'Bookmark this page')
        mark.title = mark.getAttribute('aria-label')!
        btn('manage').setAttribute('aria-pressed', String(managing))
        frame.hidden = managing
        manage.hidden = !managing
        // Not while a name is being typed: the page's updates (title,
        // loading) come all the time and would rebuild the box under it.
        if (managing && renaming === null)
          renderList()
        marks.hidden = !bookmarks.length
        marks.replaceChildren(...bookmarks.map((b) => {
          const chip = document.createElement('button')
          chip.type = 'button'
          chip.className = 'phb-mark'
          chip.textContent = bookmarkLabel(b)
          chip.title = b.url
          chip.addEventListener('click', () => {
            if (managing)
              setManaging(false)
            go(b.url)
          })
          return chip
        }))
      }
      redraw = render

      const stopState = v.onState((next) => {
        if (next.url && next.url !== s.url) {
          lastUrl = next.url
          void ctx.storage.set('last', next.url).catch(() => {})
        }
        s = next
        render()
      })

      root.addEventListener('click', (e) => {
        const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act
        if (act === 'back')
          v.back()
        else if (act === 'forward')
          v.forward()
        else if (act === 'reload' && s.loading)
          v.stop()
        else if (act === 'reload')
          v.reload()
        else if (act === 'home')
          go(home())
        else if (act === 'retry' && s.error?.url)
          go(s.error.url)
        else if (act === 'retry')
          v.reload()
        else if (act === 'mark' && s.url)
          toggleMark({ url: s.url, title: s.title })
        else if (act === 'manage')
          setManaging(!managing)
        else if (act === 'done')
          setManaging(false)
        else if (act === 'add' && s.url && !isBookmarked(bookmarks, s.url))
          toggleMark({ url: s.url, title: s.title })
      })
      addr.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const url = addressFor(addr.value, setting('search') || DEFAULT_SEARCH)
          if (url) {
            go(url)
            addr.blur()
          }
        }
        else if (e.key === 'Escape') {
          addr.value = shownAddress(s.url)
          addr.blur()
        }
      })
      // The whole address, ready to be typed over, as in a browser.
      addr.addEventListener('focus', () => setTimeout(() => addr.select(), 0))
      addr.addEventListener('blur', () => {
        addr.value = shownAddress(s.url)
      })

      render()
      return () => {
        stopState()
        redraw = null
        v.attach(null)
        root.remove()
      }
    },
  })

  function save(next: Bookmark[]) {
    bookmarks = next
    void ctx.storage.set('bookmarks', bookmarks).catch(() => {})
    redraw?.()
  }

  function toggleMark(page: Bookmark) {
    // The star says so; a toast would sit over the page and hide it for a moment.
    save(toggleBookmark(bookmarks, page))
  }

  ctx.commands.register({
    id: 'open',
    title: 'Open the browser',
    hint: 'Browse the web on the stage',
    icon: GLOBE,
    run: () => ctx.ui.openPage(),
  })
}
