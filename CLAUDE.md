# rembednarczyk.github.io

Personal portfolio site with a CV generator. React + TypeScript + Vite,
Storybook for components, deployed to GitHub Pages from `main`.

## Read this first

**The engineering rules for this repo live in
`docs/guidelines/AI_INSTRUCTIONS.md`** — architecture, the Lighthouse
100/100/100/100 requirement, accessibility, where business data may and may not
live. That file is the authority; this one exists so a fresh session actually
finds it (only `CLAUDE.md` is auto-loaded, so an unlinked doc is invisible).

## Working agreement

**Never commit straight to `main`.** Every change goes:

```
git checkout -b <short-topic-branch>
# … work …
git push -u origin <branch>
# open a PR, then squash-merge it
```

Two reasons, and the second is the one that is easy to forget:

1. **The PR is where CI runs before the site is live.** `deploy.yml` builds and
   tests on `pull_request`, but its `deploy` job is gated on
   `github.ref == 'refs/heads/main'` — so a PR proves the build is green
   *without* publishing. A push straight to `main` deploys whatever it is.
2. **The PR is the record.** This is a public repo and the only place the
   reasoning for a change survives; a direct push leaves a one-line subject and
   nothing else.

Squash-merge, so `main` keeps one commit per change.

## Verification before opening a PR

```bash
npm run lint     # eslint + tsc --noEmit
npm run test     # vitest
npm run build    # vite build (+ the 404.html copy Pages needs)
```

`npm run check:quality` is the full gate — the three above plus the Storybook
interaction tests. Slower; run it when components changed.

**Install with `npm ci --legacy-peer-deps`** — that is what CI uses, and a
plain `npm ci` can fail on the peer tree.

Node 22 (what both workflows pin).

## Deployment

`main` → `deploy.yml` → GitHub Pages at <https://rembednarczyk.github.io/>.
`npm run build` copies `dist/index.html` to `dist/404.html` so client-side
routes survive a hard refresh — do not drop that step from the build script.
