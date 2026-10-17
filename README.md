# Piggy Chess

A chess trainer for a five-year-old, built as a static web app for iPad.

## Play it

Once GitHub Pages is on (Settings > Pages > Deploy from a branch), the game is
at https://leinsjon.github.io/chess_trainer/. On the iPad, open it in Safari and
use Share > Add to Home Screen for a full-screen app with its own icon.

## Daily email

See [docs/daily-email.md](docs/daily-email.md).

## Run it locally

Any static file server works, for example:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Tests

```
node tests/lessons.test.mjs
node tests/bot.test.mjs
```

`node tests/bot.test.mjs` plays the bot against a simple greedy player to check it stays easy to beat.

The first checks that every lesson level can be solved.

## Credits

- Chess pieces: "cburnett" set by Colin M.L. Burnett, CC BY-SA 3.0 (via lichess.org).
- Rules engine: [chess.js](https://github.com/jhlywa/chess.js) 1.4.0, BSD 2-Clause (see `vendor/chess.js.LICENSE`).
