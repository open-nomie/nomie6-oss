## Nomie 6

Welcome to the next chapter in Nomie.

## Open Source Life Tracker / Mood Tracker / Data Journal

![Nomie 6 Github](https://shareking.s3.amazonaws.com/pb-l3LHnDdC5H-1586728691.png)

## Try it out

- [https://v5.nomie.app](https://v6.nomie.app) **Production** (v6-prod)

If you like to live dangerously you can run the dev branch

- [https://v6-dev.nomie.app](https://v6-dev.nomie.app) **Development** (v6-dev)

---

Version 5 will main accessible at [https://v5.nomie.app](https://v5.nomie.app)


---

## The Story

I started [building Nomie in 2014](https://nomie.app/blog/original-nomie-blog-post) and over the next handful of years I release 3 major versions in 3 different JS technologies (VanilaJS -> Ionic -> ReactNative). The Nomie user base grew to ~100,000 users spread over multiple versions and multiple platforms.

In March 2019 I decided to remove the apps from Google Play and the App Store and step away from the "native app world" has it's too exhausting.

While the native apps will continue to run for those who installed it before, I wanted to take the best parts of Nomie 1, 2 and 3 and release it as an open source solution that could be run in the browser. This project is that result.

Wanna know more about the Nomie story? [Here are a handful of podcasts talking about each release](https://soundcloud.com/nomiepodcast).

## Want to contribute?

1. Create feature branches from the `v6-dev` branch. All pull requests should be for `v5-dev`.
2. Keep dependencies to an absolute minimum.
3. Reuse code when possible.


## [Svelte](https://svelte.dev)

This rewrite/port uses [SvelteJS](https://svelte.dev) - a great tool for building fast / reactive single page apps (like Vue, React) without the framework.

## Nomie Cloud

Nomie Cloud uses Firebase to offer multidevice syncing, and stores your data fully encrypted in the cloud. Not just encrypted, but end-to-end encrypted - meaning no one, other than yourself, can decrypt your data. This is done using [Virgil Security's E3Kit](https://virgilsecurity.com/e3kit/)
## Nomie Local

You'll need Node >= 12 and NPM. I have not tested running this on Windows.

```bash
git clone git@github.com:open-nomie/nomie.git
cd nomie
git checkout v6-dev
npm install
npm run dev
```

## Running tests

```bash
npm run cypress
```

## How Nomie Works

Nomie stores each record as a log - with all tracker, people and context data being stored as a string in the `log.note` field. Nomie then parses the notes to extract structured data in real time.

For example:

`Today I walked #miles(5) #mood(8)` is converted to a structure like: `{ 'miles' : 5, 'mood': 8 }`

A more complicated example would be:

`Today @em @maddy and I #walked(4) +memory`

which would be converted into something like:

```javascript
{
    people:['em','maddy'],
    trackers: { walked: 4},
    context:['memory']
}
```

## Meet the Nouns

- **Tracker** - primarily represented by a button on the "track board". Trackers are represented by their hashtag in notes - for example: #sleep(160000).
- **Board** - a board is specific group of trackers.
- **Board Tabs** - how you switch boards on the track tab
- **Log** - a record event. A lot contains a note, a note can contain unlimited numbers of tags; e.g: #mood(4) #pizza #beer(12). Logs can contain a lat and long. Tracker Objects and their values are parsed out of the logs in real time.
- **Person** - a Person that you track in Nomie. You can track individuals by using the @username format.
- **Context** - a generic categorization / group using the +context format. For example ``Went to dinner with @mom +meal`
- **Location** - a physical location that you store and use later

## Coding Rules

- **Keep it readable** - focus on writing code that new people can easily understand and follow. If the code can't do it, then do it with comments. There's no such thing as too much commenting. (yes, I should follow my own rules)
- **Keep it under 300 lines** - the goal is to keep files under 300 lines of code. Note: Sometimes that's not feasible, and I break it often
- **Keep it flexible** - think in components. If you're doing something more than once, it most likely should be a component.
- **Keep it safe** - if you're deleting something of the users, consider using `await Interact.confirm("Are you sure")` to confirm they're action
- **Keep cleaning, organizing and testing** - this project didn't start very clean, or ready for unit testing, this should be an on going objective.
- **Use what's there**
  - Tailwind CSS - is the new world

## Nomie Jingle

The Nomie Jingle was written and produced by soldilil - [see more work](https://soldilil.bandcamp.com)

## Open Source Props

- [SvelteJS](https://svelte.dev/)
- [Leaflet](https://leafletjs.com)
- [OpenStreetMap](https://openstreetmap.org)
- [Blockstack](https://blockstack.org)
- [Cypress](https://cypress.io)
- [PouchDB](https://pouchdb.com)
- [LocalForage](https://localforage.github.io/localForage/)
- [Carbon Design System](https://www.carbondesignsystem.com)
- [svelte-emoji-picker](https://github.com/joeattardi/svelte-emoji-selector)

## Trademark License

Nomie and the Blue Elephant are registered Trademarks of Happy Data, LLC. Indianapolis, IN. For a commercial use of the brand or logomark please contact support@happydata.org

## MIT License

Copyright 2019 Happy Data, LLC <support@happydata.org>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
