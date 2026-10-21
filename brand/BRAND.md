# Shelterbelt / Grain Bin brand system
Version: 0.1 · Direction approved: 60% Digital Agrarian, 40% Modern Editorial.

## Brand architecture
**Shelterbelt** is the parent workshop and portfolio: practical, independent, thoughtful tools.
**Grain Bin** is Experiment 001: an independent view of digital-dollar markets.

Brand voice: grounded, intelligent, concise, curious. Avoid crypto hype, empty futurism, and decorative farm clichés.
Working lines (not final trademarks):
- Shelterbelt: **Build useful things.**
- Grain Bin: **Making sense of digital dollar markets.**

## Color
| Token | Hex | Usage |
| --- | --- | --- |
| Silo | `#171C17` | Deep backgrounds, primary ink |
| Canvas | `#F2EBDD` | Primary warm light background |
| Paper | `#FAF7F0` | Raised cards and reading surfaces |
| Harvest | `#C58A42` | Primary brand accent, charts, highlights |
| Sage | `#68755B` | Secondary data series, muted accents |
| Oxblood | `#762D36` | Editorial accent and alternate data series |
| Rust | `#A64F3B` | Caution or negative trend, when appropriate |
| Line | `#D9D0BF` | Light borders and rules |
| Muted | `#60685D` | Secondary text on light surfaces |

Do not use color alone to indicate growth or decline. Label numbers with +/- and accessible text. Use chart colors consistently across screens.

## Typography
- Display/editorial: **Newsreader** (Google Fonts) for headlines, editorial statements and selected large metrics.
- UI/data: **Inter** (Google Fonts) for navigation, body, tables and controls.
- Numeric values: use tabular figures; prioritize legibility over flourish.
- Fallbacks: Georgia for display; system sans-serif for UI.

## Layout and components
- Default product theme: warm light (Canvas background, Paper cards, Silo text).
- Use spacious layouts, restrained thin dividers, and strong typographic hierarchy.
- Dashboard cards: modest 12px radius, subtle borders, little or no shadow.
- Charts: quiet gridlines, Harvest primary line, Sage secondary, Oxblood tertiary. Avoid gradients as the only information carrier.
- Product header should prominently name Grain Bin, with Shelterbelt as a subtle maker's mark.
- Agricultural imagery belongs in introductions, empty states or editorial storytelling, not behind important data.

## Icon and logo
- Primary icon: simplified grain elevator / bin silhouette, squared-off and recognizable at 16px.
- Favicon: `grain-bin-app/src/app/icon.svg` (Next.js App Router file convention).
- On dark Silo, use Canvas or Harvest icon. On light backgrounds, use Silo icon.
- Do not distort, add text to favicon, or replace it with emoji.
- Current SVG is an initial geometric brand mark, not a finalized trademark.

## Accessibility and implementation
- Target WCAG AA contrast for text, validate actual combinations before release.
- CSS source of truth: `brand/tokens.css`; copy or import tokens into product styling rather than inventing hex values.
- Future AI contributors: read this document before any UI work; preserve token names and product identity.
- Keep product-specific experiments subordinate to this brand system. Changes to core tokens require an explicit design decision.

## Status
This PR establishes **brand foundations and favicon only**. It does not yet restyle the dashboard. Visual QA, font availability and contrast checks are required during application rollout.
