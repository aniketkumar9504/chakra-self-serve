# Responsive Demo Selector Design

## Understanding summary

- Make the existing demo-request page usable across desktop, tablet, and phone widths.
- Preserve the current grouped card layout on desktop and tablet.
- At phone widths, replace the two visible product groups with two tabs: **Hiring solutions** and **For developers**.
- Show the selected mobile group as a single-column list of cards.
- Keep Chakra selected initially and continue revealing the demo form for hiring products.
- Keep Community connected to its existing developer sign-up panel.
- Keep the preview available at `http://localhost:8848`.

## Assumptions

- The phone breakpoint remains `560px` to match the existing selector breakpoint.
- Tabs change only which product group is visible; they do not change the selected product unless the user selects a card.
- Switching to **For developers** shows the Community card but does not automatically select it.
- The mobile page uses normal document scrolling, and the submit CTA is not sticky on phones.
- Existing HRDS tokens, product interactions, form data, and desktop/tablet appearance remain authoritative.

## Decision log

1. Considered a two-column mobile grid. Rejected because the user explicitly preferred one card per row.
2. Considered a permanently stacked mobile list containing both groups. Rejected because it creates unnecessary page length and weakens the group distinction.
3. Selected phone-only group tabs with single-column cards. This preserves clarity, shortens the initial mobile view, and leaves larger layouts unchanged.

## Final design

Add a compact, accessible tablist before the product groups. It is hidden above the phone breakpoint and displayed at `560px` or below. Each tab controls one product-group panel and exposes `aria-selected`, `aria-controls`, and keyboard navigation semantics. On phones, only the active group title and cards are displayed; the redundant inline group headings and desktop divider are hidden. Hiring solutions is active initially.

The hiring panel contains Chakra, Interview, and All Products as full-width cards in a vertical stack. The developer panel contains Community as one full-width card. Selecting a product continues using the existing radio inputs and form/panel logic. On phone widths the Schedule A Demo button participates in normal form flow, preventing it from covering fields while scrolling.

Verification covers 1280px desktop, 768px tablet, and 390px phone widths; both mobile tabs; product selection; form visibility; Community panel visibility; horizontal overflow; and computed responsive styles.
