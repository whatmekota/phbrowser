// What the address field makes of what was typed in it.

export const DEFAULT_HOME = 'https://duckduckgo.com/'
export const DEFAULT_SEARCH = 'https://duckduckgo.com/?q=%s'

/** The URL as a string if it is a web page (http or https), else null. */
export function webUrl(u: string): string | null {
  try {
    const url = new URL(u)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  }
  catch {
    return null
  }
}

const SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i
const LOCAL = /^(?:localhost|\d{1,3}(?:\.\d{1,3}){3}|\[[\d:a-f]+\])(?::\d{1,5})?(?:[/?#]|$)/i
const DOMAIN = /^[^\s/?#:@]+\.[a-z][a-z0-9-]{1,62}\.?(?::\d{1,5})?(?:[/?#]|$)/i

/**
 * A search for `words` with the search address the user set: `%s` stands
 * for the words; without it they go on the end. A search address that isn't
 * a web address falls back to the default.
 */
export function searchUrl(words: string, template: string = DEFAULT_SEARCH): string {
  const t = webUrl(template.includes('%s') ? template.replace('%s', 'x') : template) ? template : DEFAULT_SEARCH
  const q = encodeURIComponent(words.trim())
  return t.includes('%s') ? t.replace('%s', q) : `${t}${q}`
}

/**
 * Where to go for what was typed: a web address as it is, something that
 * looks like one (example.com, localhost:8080, 192.168.1.5) over https or
 * http, and anything else is searched for. Null for nothing, and for an
 * address that isn't a web page (file:, javascript:…): those don't open.
 */
export function addressFor(input: string, template?: string): string | null {
  const s = input.trim()
  if (!s)
    return null
  if (SCHEME.test(s) || /^(?:javascript|data|file|about|blob|view-source):/i.test(s))
    return webUrl(s)
  if (/\s/.test(s))
    return searchUrl(s, template)
  // A local server most likely speaks plain http.
  if (LOCAL.test(s))
    return webUrl(`http://${s}`)
  if (DOMAIN.test(s))
    return webUrl(`https://${s}`)
  return searchUrl(s, template)
}

/** The address as the field shows it while you aren't typing: no trailing slash on a bare site. */
export function shownAddress(url: string): string {
  if (!url)
    return ''
  try {
    const u = new URL(url)
    if (u.pathname === '/' && !u.search && !u.hash)
      return `${u.protocol}//${u.host}`
    return url
  }
  catch {
    return url
  }
}
