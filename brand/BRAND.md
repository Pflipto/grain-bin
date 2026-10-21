# Shelterbelt / Grain Bin brand system
Version 0.3 · Creative direction: **60% Digital Agrarian / 40% Modern Editorial**

## Identity
Shelterbelt is the parent workshop: useful, independent, thoughtful products. Grain Bin is Experiment 001: stablecoin market intelligence with the visual sensibility of a Midwestern financial journal.

**Personality:** grounded, independent, useful, enduring. Express agricultural heritage through architecture, materiality, typography and a disciplined palette, not novelty farm clip-art.

**Voice:** plainspoken, precise, curious, measured. Never crypto-hype, financial promises or breathless jargon.

Working copy:
- Shelterbelt: *Build useful things.*
- Grain Bin: *A clearer view of digital dollars.*

## Color system
| Token | Hex | Role |
| --- | --- | --- |
| Silo | `#171C17` | Primary ink, dark backgrounds, navigation |
| Canvas | `#F2EBDD` | Warm base |
| Paper | `#FAF7F0` | Card and reading surfaces |
| Harvest | `#C58A42` | Signature accent, primary chart series |
| Sage | `#68755B` | Secondary chart series |
| Oxblood | `#762D36` | Editorial accent, tertiary series |
| Rust | `#A64F3B` | Reserved caution/decline accent |
| Line | `#D9D0BF` | Rules, borders |
| Muted | `#60685D` | Secondary text |

Use Silo on Canvas/Paper for body copy. Harvest is an accent, not a body-text color on light backgrounds. Positive/negative status must use labels and +/- in addition to color. Use chart colors consistently.

## Typography
- **Newsreader:** editorial display headlines and occasional hero figures, not small dashboard labels.
- **Inter:** UI, navigation, charts, tables, compact statistics.
- **Tabular numerals:** use for financial figures and aligned columns.
- Fall back to Georgia and system sans. Avoid more than these two families.

## Composition
- Default: warm light editorial canvas. Silo can anchor nav, footer or dark feature panels.
- Architectural hierarchy: generous margins, deliberate alignment, thin rules, minimal shadows.
- Card radius: 12px maximum for primary panels; avoid excessively pill-shaped financial UI.
- Chart gridlines subdued; prioritize labels, source attribution, dates, methodology.
- Photography: authentic grain elevators, prairie fields and industrial textures only as *supporting editorial imagery*. Never obscure data with photos.
- Shelterbelt maker's mark is secondary to Grain Bin product identity.

## Mark system
**Primary concept:** a stylized, symmetrical wheat-stalk emblem, selected from the approved brand exploration. Five strong grain shapes and a single stem form a distinctive silhouette at small sizes. The more detailed grain elevator illustration is reserved for large editorial imagery and optional future secondary lockups.

- Favicon source: `grain-bin-app/src/app/icon.svg` (Next.js App Router).
- Dark Silo field with a solid Harvest wheat emblem. A Canvas-field / Silo-emblem reverse variant may be developed later.
- This is a *simplified symbol* intended for 16px–64px; it is not a detailed engraving. Detailed grain-elevator illustration can be used at larger sizes, separately from the favicon.
- Keep clear space around the symbol. Do not add decorative strokes, gradients, emoji, or micro-detail.
- Review at 16px, 32px and browser-tab size before final approval. A favicon should read as a silhouette, not as a miniature illustration.
- Brand wordmark treatment: editorial serif “GRAIN BIN” with generous tracking in surrounding UI; final vector wordmark to be designed separately.

## Product application and AI collaboration
- Tokens live in `brand/tokens.css`. Reuse them instead of inventing values.
- Read this file before designing new Shelterbelt or Grain Bin screens.
- Contrast, responsive behavior, and actual font loading must be tested when implementing the UI.
- Any new product can have a distinct name/mark, while inheriting Shelterbelt's disciplined palette and typography principles.

## Release boundary
This PR establishes identity documentation, reusable tokens and the favicon. **It does not yet apply the visual system to the dashboard.** That is a separate implementation PR, after design approval.
