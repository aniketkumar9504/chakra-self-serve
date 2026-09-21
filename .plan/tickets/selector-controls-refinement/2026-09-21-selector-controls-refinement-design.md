# Selector Controls Refinement

**Date:** 2026-09-21
**Status:** Approved for localhost implementation

## Understanding Summary

- Move the temporary V1/V2 selector comparison control out of the form area and into the page header.
- Keep the toggle easy to access without competing with the Hiring solutions / For developers tabs.
- Add an explicit “Change” action to the V2 selected-product trigger.
- Clicking the trigger or its Change label must open the same rich dropdown.
- Preserve all dropdown keyboard behavior, state synchronization, responsive layouts, V1 cards, and Community flow.
- Keep production unchanged until localhost approval.

## Assumptions

- The header toggle belongs immediately before Log In inside a right-aligned actions group.
- The “Selector style” label remains visible on desktop/tablet and is visually hidden on phone to protect header space.
- “Change” is styled as text within the existing trigger button, not as a nested interactive element.

## Approaches Considered

1. **Change label inside the trigger — selected.** Keeps one valid button target and makes the existing interaction explicit.
2. **Separate adjacent Change button.** Creates redundant controls for one menu and complicates focus/ARIA ownership.
3. **Replace the chevron with Change.** Clearer than the current state but removes a familiar disclosure cue.

## Final Design

- Move `.selector-preview` from the product fieldset into `.nav__actions` before the Log In link.
- Add `.nav__actions` as a flex row aligned to the header's right edge.
- Retain the existing V1/V2 buttons, `aria-pressed` synchronization, and variant state.
- Keep the desktop/tablet “Selector style” label; hide only the label at phone width.
- Extend the V2 trigger grid with a fourth column.
- Add `<span class="product-dropdown__change">Change</span>` before the chevron.
- Style Change with information-colored, medium-weight text and a subtle underline/hover treatment.
- Keep the outer trigger as the only button and update its accessible label to clarify that it changes the hiring product.
- Do not change V1 cards, dropdown options, or selection behavior.

## Verification

- Confirm the page selector area no longer contains the V1/V2 control.
- Confirm the header contains the toggle before Log In at 1280px, 768px, and 390px.
- Confirm the phone header fits without document overflow and hides only the Selector style label.
- Confirm the V2 trigger visibly contains Change and both pointer and keyboard activation open the menu.
- Confirm V1/V2 switching, option selection, state preservation, and Community behavior still work.
- Capture desktop and phone screenshots and run static checks.

## Decision Log

- Selected a header actions group to remove prototype controls from the form hierarchy.
- Selected a non-interactive Change span inside the trigger to keep HTML semantics valid while making the action explicit.
