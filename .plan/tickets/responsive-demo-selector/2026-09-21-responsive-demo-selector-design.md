# Responsive Demo Selector Design

## Understanding summary

- Make the existing demo-request page usable across desktop, tablet, and phone widths.
- Preserve the current grouped card layout on desktop and tablet.
- At phone widths, replace the two visible product groups with two tabs: **Hiring solutions** and **For developers**.
- Show hiring products as one horizontally scrollable card row on phones.
- Keep Chakra selected initially and continue revealing the demo form for hiring products.
- Keep Community connected to its existing developer sign-up panel.
- Keep the preview available at `http://localhost:8848`.

## Assumptions

- The phone breakpoint remains `560px` to match the existing selector breakpoint.
- Tabs use the installed HRDS pills contract: `--tab-container`, `--tab-selected`, `--card-shadow`, `--radius`, and `--hrds-radius-sm`.
- Switching to **For developers** selects Community immediately and reveals its existing sign-up panel.
- The Community chooser card remains available in the desktop/tablet selector but is omitted from the phone Developers tab.
- Returning to **Hiring solutions** restores the most recently selected hiring product, defaulting to Chakra.
- The mobile page uses normal document scrolling, and the submit CTA is not sticky on phones.
- Existing HRDS tokens, product interactions, form data, and desktop/tablet appearance remain authoritative.

## Decision log

1. Considered a two-column mobile grid. Rejected because the user explicitly preferred one card per row.
2. Considered a permanently stacked mobile list containing both groups. Rejected because it creates unnecessary page length and weakens the group distinction.
3. Initially selected phone-only group tabs with single-column cards. User review showed that the vertical stack remained too long.
4. Revised the phone hiring panel to a horizontal snap-scroll row, preserving one large card at a time while revealing part of the next card as a scroll cue.
5. Replaced the custom segmented-control treatment with the installed HRDS pills specification and token set.
6. Made category tabs own selection state: Developers selects Community immediately, while Hiring restores the last hiring product.
7. Removed the redundant phone Community chooser card because the Developers tab already performs that selection.
8. Reduced phone hiring cards to a compact 168px-wide, approximately 120px-tall treatment so nearly two products are visible at once.

## Final design

Add a compact, accessible tablist before the product groups. It is hidden above the phone breakpoint and displayed at `560px` or below. Each tab controls one product-group panel and exposes `aria-selected`, `aria-controls`, and keyboard navigation semantics. Its markup and styling mirror the installed HRDS `Tabs` component's `pills` variant, including `data-slot`/`data-variant` hooks, 32px triggers, the HRDS tab surface tokens, and a sliding selected indicator. On phones, only the active group is displayed; the redundant inline group headings and desktop divider are hidden. Hiring solutions is active initially.

The hiring panel contains Chakra, Interview, and All Products in one horizontally scrollable, snap-aligned row. Phone cards are compact—168px wide with reduced logo, padding, and gaps—so nearly two products are visible at once. The desktop/tablet developer group retains its Community chooser card. On phones that chooser is hidden: activating Developers selects Community and goes directly to the Community panel. Activating Hiring restores the last hiring selection and its demo form. On phone widths the Schedule A Demo button participates in normal form flow, preventing it from covering fields while scrolling.

Verification covers 1280px desktop, 768px tablet, and 390px phone widths; both mobile tabs; product selection; form visibility; Community panel visibility; horizontal overflow; and computed responsive styles.
