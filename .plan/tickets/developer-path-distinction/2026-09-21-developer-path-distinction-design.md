# Developer Path Visual Distinction

**Date:** 2026-09-21
**Status:** Revised design approved; awaiting implementation
**Scope:** See HackerRank in action product selector

## Understanding Summary

- The current desktop and tablet selector makes Community look like a fourth hiring product.
- Developers need to recognize immediately that Community is a separate destination and does not require a sales demo.
- The three hiring products must continue to control the demo form.
- The Community choice must continue to replace the demo form with the existing Community panel.
- The Hiring solutions / For developers tabs and direct Community behavior must work consistently at every breakpoint.
- The change must use the existing HRDS token system and preserve the overall page layout.

## Assumptions

- The feedback primarily concerns desktop and tablet, where both product categories are currently visible simultaneously.
- No new page, external destination, or JavaScript flow is required.
- Existing Community links and copy remain authoritative unless explicitly changed below.
- Production remains unchanged until the user approves the localhost preview.

## Approaches Considered

1. **Tabs at every breakpoint — selected.** Presents Hiring solutions and For developers as mutually exclusive journeys and prevents the Community destination from reading as another hiring product.
2. **Blue Community callout.** Creates visual contrast, but still presents Community beside the hiring products and retains some quick-glance ambiguity.
3. **Divider and heading emphasis only.** Preserves the existing composition but is unlikely to resolve the underlying journey ambiguity.

## Final Design

### All breakpoints

- Display the existing HRDS pills tablist at the top of the selector on desktop, tablet, and phone.
- Keep two tabs: “Hiring solutions” and “For developers.”
- Default to Hiring solutions.
- Selecting For developers immediately selects Community and replaces both the hiring product chooser and demo form with the existing Community panel.
- Do not display a separate Community chooser card or dotted divider at any breakpoint.
- Switching back to Hiring solutions restores the previously selected hiring product and its form without clearing entered values.

### Desktop and tablet

- Render the three hiring products in the existing three-column card row below the tabs.
- Keep the tablist aligned with and spanning the selector/form column so the journey choice is the first visible control.
- Hide the Community product card wrapper; the Community panel is the complete developer destination.

### Phone

- Preserve the compact horizontal hiring carousel beneath the same tablist.
- Preserve direct Community activation and zero document-level horizontal overflow.

### Interaction and accessibility

- Preserve native radio inputs and full-surface hiring-card interaction.
- Preserve keyboard focus styling and selected state.
- Use the current HRDS pills tokens and markup contract at every breakpoint.
- Keep ArrowLeft, ArrowRight, Home, and End keyboard behavior for the tablist.

## Verification

- At 1280×800 and 768×900, confirm the tabs are visible and only the active journey content is displayed.
- Confirm selecting For developers hides the hiring cards and demo form and immediately shows the Community panel.
- Confirm switching back restores the previous hiring selection and preserves form values.
- At 390×844, confirm the same tab behavior, compact hiring carousel, and zero document overflow.
- Run HRDS token verification, JavaScript syntax validation, whitespace checks, and responsive browser screenshots.
- Share the localhost preview for user approval before any production push.

## Non-Goals

- Redesigning the Community destination panel.
- Changing the demo form or its validation.
- Adding navigation routes or analytics.
- Deploying before explicit user approval of the localhost preview.

## Decision Log

- Initially selected a blue Community callout over a dark card or stronger divider.
- Revised the decision after review: the existing HRDS pills tabs will appear at every breakpoint because mutually exclusive journeys resolve the ambiguity more completely than visual decoration.
- Retained direct Community activation so developers never encounter the hiring form after choosing their journey.
