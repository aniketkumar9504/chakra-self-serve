# Compact Product Card Alignment Refinement

**Date:** 2026-09-21
**Status:** Approved for localhost implementation

## Understanding Summary

- Refine only the V1 compact landscape hiring cards.
- Increase the visual prominence of each product logo.
- Align the product name and description to the same left edge.
- Keep every text element left-aligned.
- Preserve the three-card side-by-side desktop/tablet layout and mobile horizontal carousel.
- Preserve selection, focus, hover, journey tabs, V1/V2 switching, and all V2 dropdown behavior.
- Keep the work local until the user approves deployment.

## Assumptions

- The screenshot feedback applies to V1 cards on every breakpoint.
- A clean two-column media-object layout is preferred over a tinted icon tile.
- Card height may remain near 100px if needed for two-line descriptions.

## Approaches Considered

1. **Two-column media object — selected.** A 40px logo spans both text rows while name and description share one text column. This directly fixes alignment with minimal visual weight.
2. **Tinted logo tile.** Creates more emphasis but adds another surface and competes with the selected card tint.
3. **Large top-row logo.** Preserves the current structure but does not solve the shared text alignment as cleanly.

## Final Design

- Set each V1 card to a two-column grid: a fixed 40px logo column and a flexible text column.
- Make `.product-card__heading` use `display: contents` so the logo and name participate in the parent grid.
- Place the logo in column 1 spanning both rows and center it vertically.
- Place the product name in column 2, row 1.
- Place the description in column 2, row 2.
- Use a 38–40px logo, 12px column gap, 4px row gap, and 14px card padding.
- Keep card height around 100px and maintain equal heights.
- Retain existing selected, hover, focus, and responsive states.
- Do not modify V2 dropdown markup, styling, or behavior.

## Verification

- At 1280×800, confirm all three logos are visibly larger and all names/descriptions share the same left coordinate per card.
- At 390×844, confirm the 168px cards remain in one horizontal scroll row with no document overflow.
- Confirm V1 selection and V1/V2 switching still work.
- Confirm V2 dimensions and option behavior are unchanged.
- Capture refreshed desktop and phone V1 screenshots.
- Run token, syntax, whitespace, security, and localhost response checks.

## Decision Log

- Selected the two-column media-object layout because it directly addresses both requested changes without adding decorative complexity.
- Kept V2 unchanged so the prototype remains a clean comparison between cards and dropdown.
