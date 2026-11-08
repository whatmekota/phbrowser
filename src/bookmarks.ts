// A few bookmarks, kept in the plugin's storage.

export interface Bookmark {
  url: string
  title: string
}

/** Kept at most; past this the oldest goes. The bar scrolls, the list holds them all. */
export const MAX_BOOKMARKS = 200

/** A stored value read back as a list of bookmarks, whatever it holds. */
export function readBookmarks(raw: unknown): Bookmark[] {
  if (!Array.isArray(raw))
    return []
  const out: Bookmark[] = []
  for (const b of raw) {
    if (!b || typeof b !== 'object')
      continue
    const { url, title } = b as Record<string, unknown>
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url) || out.some(x => x.url === url))
      continue
    out.push({ url, title: typeof title === 'string' ? title : '' })
  }
  return out.slice(-MAX_BOOKMARKS)
}

export function isBookmarked(list: Bookmark[], url: string): boolean {
  return list.some(b => b.url === url)
}

/** The list with this page added, or taken out if it was there. */
export function toggleBookmark(list: Bookmark[], page: Bookmark): Bookmark[] {
  if (isBookmarked(list, page.url))
    return list.filter(b => b.url !== page.url)
  return [...list, { url: page.url, title: page.title.trim() }].slice(-MAX_BOOKMARKS)
}

/** What a bookmark's button says: its title, else the site's name. */
export function bookmarkLabel(b: Bookmark, max = 24): string {
  let label = b.title.trim()
  if (!label) {
    try {
      label = new URL(b.url).host.replace(/^www\./, '')
    }
    catch {
      label = b.url
    }
  }
  return label.length > max ? `${label.slice(0, max - 1).trimEnd()}…` : label
}

/** The list with this bookmark's title changed (empty: back to the site's name). */
export function renameBookmark(list: Bookmark[], url: string, title: string): Bookmark[] {
  return list.map(b => (b.url === url ? { ...b, title: title.trim() } : b))
}

/** The list without this bookmark. */
export function removeBookmark(list: Bookmark[], url: string): Bookmark[] {
  return list.filter(b => b.url !== url)
}

/** The list with this bookmark moved by `by` places (-1 up, 1 down), kept inside the list. */
export function moveBookmark(list: Bookmark[], url: string, by: number): Bookmark[] {
  const from = list.findIndex(b => b.url === url)
  if (from < 0)
    return list
  const to = Math.max(0, Math.min(list.length - 1, from + by))
  if (to === from)
    return list
  const out = [...list]
  const [b] = out.splice(from, 1)
  out.splice(to, 0, b)
  return out
}
