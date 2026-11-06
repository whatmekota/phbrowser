// A few bookmarks, kept in the plugin's storage.

export interface Bookmark {
  url: string
  title: string
}

/** More than this and the row gets crowded: the oldest goes. */
export const MAX_BOOKMARKS = 12

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
