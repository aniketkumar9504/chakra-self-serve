# Product Selector Comparison Variants

**Date:** 2026-09-21
**Status:** Approved for localhost implementation

## Understanding Summary

- Keep the all-breakpoint Hiring solutions / For developers tabs.
- Add a separate V1/V2 preview toggle for comparing two hiring product-selector styles.
- V1 uses three compact landscape cards displayed side by side.
- V2 uses a rich dropdown whose trigger and options show product logos, names, and descriptions.
- Both versions control the same hiring selection and demo form.
- Switching versions must preserve the selected product and entered form values.
- Production must remain unchanged until the user approves the localhost prototype.

## Assumptions

- V1/V2 is a temporary evaluation control rather than final production navigation.
- The toggle appears above the Hiring solutions / For developers tabs with a visible “Selector style” label.
- A custom dropdown is required because native select options cannot reliably render rich content.
- The Community journey is unchanged and does not display either hiring selector.

## Approaches Considered

1. **Custom rich dropdown — selected for V2.** Provides logos, descriptions, selection styling, and predictable cross-browser rendering.
2. **Native select with helper content.** Simpler but cannot consistently render rich option rows.
3. **Inline accordion.** Accessible but occupies nearly as much vertical space as cards and weakens the comparison.

## Final Design

### Shared comparison toggle

- Add a small segmented control labeled “Selector style” above the journey tabs.
- Provide “V1” and “V2” buttons with V1 selected initially.
- Use `aria-pressed` and keyboard-operable native buttons.
- Switching variants changes only the hiring selector presentation.

### V1 — compact landscape cards

- Keep three cards side by side on desktop and tablet and in one horizontal scroll row on phone.
- Reduce each card to approximately 92px tall.
- Use a 28px logo on the left and product name beside it in the first row.
- Place the short description below the title row, left-aligned.
- Retain the green selected border and subtle success tint.
- Keep the full card clickable through native radio labels.

### V2 — rich dropdown

- Render a full-width 64px trigger showing the selected product logo, name, description, and a chevron.
- Open a floating listbox containing three rich option rows.
- Each option displays a 28px logo, product name, description, and selected checkmark.
- Apply a green tint to the selected option.
- Clicking an option selects it, updates the trigger and form, and closes the listbox.
- Support Enter/Space to open, ArrowUp/ArrowDown navigation, Enter to select, Escape to close, and outside-click dismissal.

### State behavior

- Use the existing product radio inputs as the canonical hiring selection.
- Keep V1 and V2 synchronized whenever a product changes.
- Preserve the selected hiring product when switching to For developers and back.
- Preserve form field values when switching either selector variant or journey tab.
- Hide both product-selector variants while For developers is active.

### Responsive behavior

- Desktop and tablet V1 remain a three-column row.
- Phone V1 remains a horizontally scrolling compact row.
- V2 is full width at every breakpoint, and its popup stays within the viewport.
- No document-level horizontal overflow is permitted.

## Verification

- Verify V1 card size, alignment, selection, and mobile scrolling at 1280×800, 768×900, and 390×844.
- Verify V2 trigger content, open/close behavior, all three option descriptions, selection synchronization, and keyboard controls.
- Verify variant switching preserves selection and form values.
- Verify For developers hides both selectors and opens Community directly.
- Capture localhost screenshots for desktop V1, desktop V2 open, and phone V2.
- Run token, syntax, whitespace, security, and localhost response checks.

## Non-Goals

- Deploying the comparison before explicit approval.
- Changing the Community panel.
- Changing the demo form fields or submission behavior.
- Persisting the chosen V1/V2 comparison across page loads.

## Decision Log

- Kept the approved tabs as the primary journey distinction.
- Selected compact cards for V1 to reduce visual weight without losing scanability.
- Selected a custom listbox dropdown for V2 because it supports rich option content that a native select cannot.
- Made the existing radio inputs canonical so both prototypes share one product state.
