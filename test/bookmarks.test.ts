import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { bookmarkLabel, isBookmarked, MAX_BOOKMARKS, readBookmarks, toggleBookmark } from '../src/bookmarks.ts'

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
})
