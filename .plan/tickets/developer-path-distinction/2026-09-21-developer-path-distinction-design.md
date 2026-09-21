# Developer Path Visual Distinction

**Date:** 2026-09-21  
**Status:** Approved design; awaiting implementation  
**Scope:** See HackerRank in action product selector

## Understanding Summary

- The current desktop and tablet selector makes Community look like a fourth hiring product.
- Developers need to recognize immediately that Community is a separate destination and does not require a sales demo.
- The three hiring products must continue to control the demo form.
- The Community choice must continue to replace the demo form with the existing Community panel.
- The phone-only Hiring solutions / For developers tabs and direct Community behavior must remain intact.
- The change must use the existing HRDS token system and preserve the overall page layout.

## Assumptions

- The feedback primarily concerns desktop and tablet, where both product categories are visible simultaneously.
- No new page, external destination, or JavaScript flow is required.
- Existing Community links and copy remain authoritative unless explicitly changed below.
- Production remains unchanged until the user approves the localhost preview.

## Approaches Considered

1. **Blue Community callout — selected.** Uses the HRDS information palette, explicit developer messaging, and a no-demo badge. This creates clear category separation without overpowering the page.
2. **Dark developer card.** Provides maximum contrast but competes too strongly with the primary hiring flow.
3. **Divider and heading emphasis only.** Preserves the existing composition but is unlikely to resolve the quick-glance ambiguity.

## Final Design

### Desktop and tablet

The right-hand developer group becomes a self-contained Community callout rather than a product card that visually matches the hiring choices.

- Use `--info-alt` for the callout surface and `--info-border` for its border.
- Keep the heading “For developers,” styled as an information-colored eyebrow.
- Retain the Community icon and Community name.
- Replace the hiring-card-style description with “Practice, compete, and prepare for your next role.”
- Add a visible “No demo required” badge.
- Add an “Explore Community →” directional cue.
- Keep the entire callout interactive through the existing Community radio control.
- Remove the dotted divider because the distinct callout surface provides stronger category separation.

The three hiring products remain neutral product cards under “Hiring solutions for the agentic era.” Selecting one continues to display the demo form.

### Phone

- Preserve the HRDS pills tabs and compact horizontal hiring carousel.
- Preserve direct activation: selecting “For developers” immediately selects Community and displays the existing Community panel.
- Do not render the desktop/tablet developer callout on phone widths.
- The Community panel continues to state that no demo is required.

### Interaction and accessibility

- Preserve the native radio input and full-surface label interaction on desktop/tablet.
- Preserve keyboard focus styling and selected state.
- Maintain sufficient information-color contrast through HRDS tokens.
- Keep the tablist semantics and keyboard behavior unchanged on phone widths.

## Verification

- At 1280×800 and 768×900, confirm the developer callout is visibly differentiated and the hiring cards remain unchanged.
- Confirm the callout contains “For developers,” “Community,” “No demo required,” and “Explore Community.”
- Confirm selecting the callout hides the demo form and shows the Community panel.
- At 390×844, confirm the developer callout remains hidden, the tabs work directly, and document overflow is zero.
- Run HRDS token verification, JavaScript syntax validation, whitespace checks, and responsive browser screenshots.
- Share the localhost preview for user approval before any production push.

## Non-Goals

- Redesigning the Community destination panel.
- Changing the demo form or its validation.
- Adding navigation routes or analytics.
- Deploying before explicit user approval of the localhost preview.

## Decision Log

- Selected the blue Community callout over a dark card or stronger divider because it communicates a separate informational destination while staying visually balanced.
- Kept the mobile tab flow unchanged because it already separates developer and hiring paths.
- Made “No demo required” explicit to prevent developers from mistaking the hiring form for their next step.
