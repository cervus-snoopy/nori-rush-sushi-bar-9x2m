# Nori Rush — Sushi Bar

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/cervus-snoopy/nori-rush-sushi-bar-9x2m/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/cervus-snoopy/nori-rush-sushi-bar-9x2m/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Entry for the make.fun bounty
[Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137).

## The game

Nori Rush is a sushi-bar rush game. Tickets arrive on the order board; build
each dish on the prep plate and ring the serve bell before the customer's
patience runs out.

- **Plan your route:** rice cooks for 3 seconds and fish slices for 1.5 — start them early, add the direct ingredients while they finish.
- **Recipes combine:** 10 recipes across 5 levels, from Salmon Maki to the Dragon Roll and Rainbow Maki, with new ingredients unlocking as you level up.
- **Pressure grows:** tickets arrive faster, patience drains quicker, and up to 4 orders sit on the board at once. Tips reward fast serves; combos reward clean streaks. Three walk-outs end the shift.

## How to play

Click ingredient bins (or press keys 1–8) to add them; click the rice cooker
and knife board to prep rice and fish, then take finished items from the
ready tray — or press the ingredient's key again to take it straight onto
the plate. Press Space (or click the bell) to serve a plate that matches an
order. C clears the plate, P pauses, M mutes, R restarts.

## Run

Serve the game folder with any static server and open `game/index.html` in
desktop Chrome — no network, no build step, no library. `main.ts` hands the
game in: it copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored `vendor/makefun-game.ts`.
