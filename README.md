# See HackerRank in action

Static demo-request landing page. Plain HTML + CSS, no build step. Layout follows
the Figma proposal (node `71-2735`); all colour, type, radius and shadow values
come from the HackerRank Design System (HRDS).

## Run

```bash
npm install        # pulls @hackerrank/design-atoms from the private Nexus registry
npm start          # serves at http://localhost:8848
```

Then open http://localhost:8848.

> `npm install` needs access to HackerRank's private npm registry. Put the
> credentials in a local, **gitignored** `.npmrc` (see the team's registry docs).
> The token is never committed.

## Design tokens (HRDS)

Tokens are sourced from **`@hackerrank/design-atoms`** (pinned in `package.json` /
`package-lock.json`). The page can't consume the package's Tailwind `theme.css`,
so it uses the package's standalone raw-value stylesheet:

| File | Source |
| --- | --- |
| `styles/hrds/tokens.css` | Vendored verbatim from `@hackerrank/design-atoms/tokens.css`. **Do not edit by hand.** |
| `styles/hrds/theme.css`  | Font-role aliases (`--font-ds`, `--font-mono`) mirrored from the package's `@theme` (Tailwind-only, so re-declared as plain CSS here). |
| `styles/hrds/fonts.css`  | `@font-face` for Satoshi + Geist Mono. Self-hosted in `assets/fonts/` because the npm package doesn't ship font binaries. |
| `styles/main.css`        | Page layout — references only HRDS `--*` tokens, never raw hex. |

Keep the vendored tokens in sync with the installed package:

```bash
npm run sync:tokens     # copy tokens.css from node_modules -> styles/hrds/
npm run verify:tokens   # fail if they have drifted
```

The dark form card is scoped with `class="dark"`, which triggers the `.dark`
token overrides shipped in `tokens.css`.

## Notes vs. the Figma proposal

The Figma predates the current HRDS palette, so adopting the tokens shifts a few
visuals (this is intended — the design system is authoritative):

- **Primary button / links** render HRDS lime `--primary` (`#aef96c`) with dark
  text, not the Figma's `#19aa59` green.
- **Mono accent** ("action") uses HRDS `--font-mono` (Geist Mono); Departure Mono
  from the Figma is not part of HRDS.
- **Form card** uses the HRDS dark surface (`--card` → `#202025`) rather than the
  Figma near-black.
- The **hero display heading** keeps the Figma marketing size (56px); HRDS's
  product type scale tops out at `--hrds-text-display-lg` (36/56). Its font and
  colour still come from tokens.
