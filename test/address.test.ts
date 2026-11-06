import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { addressFor, DEFAULT_SEARCH, searchUrl, shownAddress, webUrl } from '../src/address.ts'

describe('the address field', () => {
  it('opens web addresses as they are', () => {
    assert.equal(addressFor('https://pmvhaven.com/video/x?y=1'), 'https://pmvhaven.com/video/x?y=1')
    assert.equal(addressFor('  http://example.com  '), 'http://example.com/')
  })

  it('adds https to what looks like a site, and http to a local server', () => {
    assert.equal(addressFor('example.com'), 'https://example.com/')
    assert.equal(addressFor('www.pornhub.com/categories'), 'https://www.pornhub.com/categories')
    assert.equal(addressFor('sub.example.co.uk:8443/a#b'), 'https://sub.example.co.uk:8443/a#b')
    assert.equal(addressFor('localhost:3000'), 'http://localhost:3000/')
    assert.equal(addressFor('192.168.1.5/remote'), 'http://192.168.1.5/remote')
  })

  it('searches for anything else', () => {
    assert.equal(addressFor('hello world'), 'https://duckduckgo.com/?q=hello%20world')
    assert.equal(addressFor('pmv'), 'https://duckduckgo.com/?q=pmv')
    assert.equal(addressFor('what is example.com'), 'https://duckduckgo.com/?q=what%20is%20example.com')
    assert.equal(addressFor('c++ & rust', 'https://www.google.com/search?q=%s'), 'https://www.google.com/search?q=c%2B%2B%20%26%20rust')
  })

  it('opens nothing that is not a web page', () => {
    assert.equal(addressFor(''), null)
    assert.equal(addressFor('   '), null)
    assert.equal(addressFor('file:///C:/Windows/win.ini'), null)
    assert.equal(addressFor('javascript:alert(1)'), null)
    assert.equal(addressFor('data:text/html,hi'), null)
    assert.equal(addressFor('ftp://example.com/x'), null)
    assert.equal(addressFor('about:blank'), null)
  })

  it('uses the search address the user set, or the default when it is not one', () => {
    assert.equal(searchUrl('a b', 'https://search.example/?s=%s&x=1'), 'https://search.example/?s=a%20b&x=1')
    assert.equal(searchUrl('a b', 'https://search.example/?s='), 'https://search.example/?s=a%20b')
    assert.equal(searchUrl('a', 'not a url %s'), DEFAULT_SEARCH.replace('%s', 'a'))
    assert.equal(searchUrl('a', 'javascript:%s'), DEFAULT_SEARCH.replace('%s', 'a'))
  })

  it('shows a bare site without its trailing slash', () => {
    assert.equal(shownAddress('https://example.com/'), 'https://example.com')
    assert.equal(shownAddress('https://example.com/a/'), 'https://example.com/a/')
    assert.equal(shownAddress('https://example.com/?q=1'), 'https://example.com/?q=1')
    assert.equal(shownAddress(''), '')
  })

  it('knows a web page from anything else', () => {
    assert.equal(webUrl('https://a.example'), 'https://a.example/')
    assert.equal(webUrl('chrome://gpu'), null)
    assert.equal(webUrl('nonsense'), null)
  })
})
