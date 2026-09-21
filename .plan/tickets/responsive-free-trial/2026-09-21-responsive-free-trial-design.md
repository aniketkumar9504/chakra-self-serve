# Responsive Free-Trial Page Design

## Understanding Summary

- Make `start-free-trial.html` responsive from 320px mobile widths through large desktop viewports.
- Preserve the current desktop two-column composition and Chakra transcription animation.
- Keep signup conversion as the primary task on narrow screens.
- Remove the tall animated Chakra showcase whenever it would stack beneath the form.
- Retain Chakra's product value on mobile and tablet through a compact static lockup.
- Improve header, form, company-logo, spacing, and short-viewport behavior without changing form functionality or copy.

## Assumptions

- The full Chakra showcase is useful only when it can sit beside the form without increasing page length.
- The narrow layout covers viewports below 960px; the desktop split begins at 960px.
- The existing form markup, destinations, conversation copy, visual assets, and HRDS tokens remain authoritative.
- The compact Chakra treatment reuses the existing mark, wordmark, `New` badge, and tagline; it adds no new marketing copy.
- No server-side or form-submission work is in scope.

## Decision Log

1. **Use a desktop-only animated showcase.** Keeping the large card below the form would add substantial vertical length where users are unlikely to engage with it.
2. **Use a static compact lockup below 960px.** This preserves the key Chakra differentiator without competing with form completion.
3. **Do not add an expandable preview.** An extra control would introduce a competing call to action and interaction complexity on a conversion page.
4. **Gate animation work by viewport.** CSS hiding alone is insufficient; the transcription script must not prepare or animate the hidden desktop conversation on narrow screens.
5. **Keep the responsive change local to the free-trial page.** Existing unrelated edits in `styles/main.css` and untracked assets are outside scope.

## Final Design

### Responsive Structure

At 960px and wider, the page keeps the current two-column split. Each column must tolerate narrower laptop widths and shorter viewports: the form remains centered within its column, the card uses fluid dimensions bounded by its current maximum, and neither column creates horizontal overflow. The full Chakra brand intro, mandala, conversation bubbles, and transcription animation remain visible.

Below 960px, the right pane is removed from layout. A compact static Chakra lockup appears within the left pane, after the signup form and before the trusted-company section. It contains the existing Chakra mark and wordmark, `New` badge, and tagline in a shallow presentation. It has no mandala, waveform, speech bubbles, or motion. The content order is therefore header, form, compact Chakra value statement, and trusted-company proof.

At compact mobile widths, the header receives enough reserved space to prevent overlap with the title; form padding and heading size become fluid; name fields and social providers stack; the company list wraps evenly; and tap targets retain at least their current 44px height. The page must have no horizontal scrolling at 320px.

### Performance and Motion

The transcription script checks the 960px media query before preparing messages or starting timers. It also responds safely if the viewport crosses the breakpoint: desktop animation can initialize once when entering desktop, while a transition to narrow mode stops timers and restores stable content. The decorative mandala should not be requested on narrow screens; its source will be attached only when the desktop experience initializes. The small Chakra identity assets may remain present because they are reused by the compact lockup.

Reduced-motion behavior remains static and fully readable. The narrow lockup never animates. Existing form-engagement and scroll safeguards continue to stop the desktop animation.

### Verification

Verify at 320x568, 390x844, 768x1024, 1024x768, and 1440x900. Confirm no overlap or horizontal overflow; mobile/tablet show only the compact Chakra treatment; desktop shows the full card; the animated sequence still completes; focusing the form stops it; and reduced motion reveals static conversation text. Compare screenshots across mobile, tablet, and desktop. Run token verification and inspect the final diff without modifying unrelated worktree changes.
