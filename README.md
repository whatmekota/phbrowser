# phbrowser

**18+ only.** A web browser plugin for [playhound](https://github.com/whatmekota/playhound). It puts a real web page on playhound's stage, with an address bar, so you can browse a site while playhound's own motion keeps driving your device: the generated stroke, beat or pulse lock, a session. Those controls stay in playhound's drawer on the right, which the page never covers.

Needs the playhound **2.0** desktop app. Web pages can't be shown inside playhound in a browser; there the plugin's page says so.

## Install

In playhound: **Settings → Plugins**. Add `whatmekota/phbrowser` under **Get plugins** and click **Install**, or download `phbrowser-<version>.zip` from [Releases](https://github.com/whatmekota/phbrowser/releases) and drop it on that page. It asks for two permissions:

- **Show its own page**: the **Browser** button in the left nav.
- **Open web pages inside playhound**.

## Using it

- Type an address, or words to search for. `example.com` opens over https, `localhost:8080` over http, anything else is searched for.
- Back, forward, reload (stop while loading) and home are on the left of the address bar. The star bookmarks the page; your bookmarks sit under the bar, up to 12.
- The page stays loaded while you go to other views, and comes back where you left it. It also remembers the last page between runs.
- **Esc** (or **`**) panics, even while you're in the page: the page hides, its sound mutes and its videos pause. **Ctrl K** opens playhound's command palette.
- While playhound has a dialog, menu or notice over the stage, the page steps out of the way until it closes.
- Keys you type go to the page while it has the keyboard. Click anywhere in playhound (the drawer, the nav) to give its own keys back.
- Tap tempo in playhound's Motion drawer follows a video playing in playhound's own player, not one in the page.

### Settings

In **Settings → Plugins → Browser**: the home page, the search address (`%s` is where your words go; DuckDuckGo by default), and the page zoom.

## Privacy

- Pages run in a **separate browsing session** of their own: cookies and logins are kept between runs, and kept apart from playhound's. Clearing it means removing playhound's `Partitions/browsing` folder from its data folder.
- Sites see a plain Chrome browser. Requests go through the proxy set in playhound's Settings → Network, like the rest of the app.
- The pages are sandboxed and can't reach playhound or your files. They get no camera, microphone, location or notifications. Links meant for a new tab open in the same page; nothing opens in your system browser.
- The plugin stores only its settings, your bookmarks and the last address, in playhound.

## Build

    npm install
    npm run build          # dist/index.js and phbrowser.zip
    npm run build:public   # release/phbrowser-<version>.zip and release/manifest.json
    npm test
    npm run typecheck

`src/types.ts` is a copy of playhound's plugin contract (`src/plugins/types.ts`); keep it in step.

## License

MIT
