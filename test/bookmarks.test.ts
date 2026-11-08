import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { bookmarkLabel, isBookmarked, MAX_BOOKMARKS, moveBookmark, readBookmarks, removeBookmark, renameBookmark, toggleBookmark } from '../src/bookmarks.ts'

describe('bookmarks', () => {
  it('reads back only what makes sense', () => {
    assert.deepEqual(readBookmarks(undefined), [])
    assert.deepEqual(readBookmarks('x'), [])
    assert.deepEqual(readBookmarks([
      { url: 'https://a.example/', title: 'A' },
      { url: 'https://a.example/', title: 'A again' },
      { url: 'javascript:alert(1)', title: 'bad' },
      { url: 'https://b.example/' },
      null,
      42,
    ]), [{ url: 'https://a.example/', title: 'A' }, { url: 'https://b.example/', title: '' }])
  })

  it('adds a page, and takes it out again', () => {
    let list = toggleBookmark([], { url: 'https://a.example/', title: ' A ' })
    assert.deepEqual(list, [{ url: 'https://a.example/', title: 'A' }])
    assert.equal(isBookmarked(list, 'https://a.example/'), true)
    list = toggleBookmark(list, { url: 'https://a.example/', title: 'A' })
    assert.deepEqual(list, [])
  })

  it('keeps the newest few', () => {
    let list: { url: string, title: string }[] = []
    for (let i = 0; i < MAX_BOOKMARKS + 3; i++)
      list = toggleBookmark(list, { url: `https://s${i}.example/`, title: '' })
    assert.equal(list.length, MAX_BOOKMARKS)
    assert.equal(list[0].url, 'https://s3.example/')
  })

  it('labels a bookmark by its title, else its site', () => {
    assert.equal(bookmarkLabel({ url: 'https://www.example.com/x', title: '' }), 'example.com')
    assert.equal(bookmarkLabel({ url: 'https://x.example/', title: 'Short' }), 'Short')
    assert.equal(bookmarkLabel({ url: 'https://x.example/', title: 'A title that is much too long to show' }, 12), 'A title tha…')
  })

  it('renames, removes and moves one, leaving the rest alone', () => {
    const a = { url: 'https://a.example/', title: 'A' }
    const b = { url: 'https://b.example/', title: 'B' }
    const c = { url: 'https://c.example/', title: 'C' }
    assert.deepEqual(renameBookmark([a, b], b.url, '  Bee '), [a, { ...b, title: 'Bee' }])
    assert.deepEqual(removeBookmark([a, b, c], b.url), [a, c])
    assert.deepEqual(moveBookmark([a, b, c], c.url, -1), [a, c, b])
    assert.deepEqual(moveBookmark([a, b, c], a.url, 1), [b, a, c])
    // Already at an end: the same list back.
    const list = [a, b, c]
    assert.equal(moveBookmark(list, a.url, -1), list)
    assert.equal(moveBookmark(list, 'https://nope.example/', 1), list)
  })
})

