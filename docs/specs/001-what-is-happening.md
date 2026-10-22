[grain-bin-redesign-spec.md](https://github.com/user-attachments/files/33846285/grain-bin-redesign-spec.md)
# Grain Bin overhaul: "What is happening with stablecoins?"

Build spec for Codex · written Oct 22, 2026 · owner: Thomas Pflipsen

Suggested home in the repo: `docs/specs/001-what-is-happening.md`.

---

## 0. How to use this document

1. Read, in order: root `AGENTS.md`, `grain-bin-app/AGENTS.md`, `brand/BRAND.md`, `brand/tokens.css`, `grain-bin-app/src/app/page.tsx`, `FieldGuide.tsx`, `globals.css`.
2. `grain-bin-app/AGENTS.md` says this is **not the Next.js you know** (Next 16.4.2, React 19.3). Read the relevant guide in `grain-bin-app/node_modules/next/dist/docs/` before writing code. Do not rely on training data for caching, fetch, or routing behaviour.
3. Work in the PR sequence in section 8. One focused branch per PR. Never push to `main`.
4. Before each PR, post a short plan: approach, tradeoffs, and anything that adds cost, complexity, or breaking behaviour. Wait for approval on anything marked **OWNER DECISION**.
5. After each PR, report in plain English: what changed, one or two concepts worth learning, which checks passed or failed, remaining limitations. The owner is a product manager learning to build; keep implementation detail light unless asked.

---

## 1. Context: why this overhaul

**The owner and the project.** Grain Bin is a learning project first, a useful tool second, a portfolio case study third. The owner has roughly 3 to 5 hours a week and values simple, reliable, understandable code. AI writes most of it; the owner wants to learn the concepts as it goes.

**The new job of the page.** The owner is using it to understand the stablecoin market. The core question, in the owner's words: *what is happening with stablecoins?* The page should answer that with **data doing the heavy lifting**. Field notes become short captions, not the main content.

**What is wrong today.** The page (`src/app/page.tsx`, one 251-line server component) shows a handful of snapshot numbers:

- Total USD-pegged supply, and one 30-day change. The change is never explained: nothing says who grew or shrank.
- A peg-type breakdown (99.4% USD) that is true but does not change what a reader concludes.
- A one-year line chart with only min and max labelled.
- Share by coin (USDT, USDC, other) as a snapshot only.
- A closing question ("will smaller stablecoins gain ground, or will the big two grow with it?") that the page **cannot answer**, because it has no share-over-time data.

**What the page becomes.** Each section answers one question, in this order:

| # | Question | View |
|---|----------|------|
| A | Is the market growing, flat, or shrinking? | Momentum strip |
| B | Who gained and who lost, and is anything off its peg? | Movers table |
| C | Where do the dollars live? | Chain view |
| D | Is the market getting more concentrated? | Share over time |
| E | What backs these dollars? | Backing view |
| F | What happened around the moves? | Event markers (last) |

**Hypotheses the data should confirm or refute.** These come from third-party articles (June to July 2026, different measures than ours). They are **not** facts. Do not hardcode or publish them; let the dashboard compute whatever is true.

- Supply grew roughly 50% in 2025, then went flat to slightly down in 2026, with a peak near mid-June.
- USDT's share has slipped a few percentage points year over year while USDC's rose.
- USDT sits mostly on Tron and Ethereum; USDC mostly on Ethereum. They behave like different products.
- Newer entrants (PYUSD, USD1, USDe and others) are small.

**Non-goals for this overhaul.**

- No visual redesign. Keep the current look and use the existing tokens (`brand/tokens.css`, `--sb-*` variables, existing classes). A visual pass comes later.
- No new pages, database, auth, or API keys.
- No new dependencies unless justified in the PR plan (see section 8, PR 1 for tests).
- No predictions, no investment framing, no causal claims.
- Do not rewrite the app for architecture's sake. Extract only what the new views need.

---

## 2. Principles that apply to every view

**Data integrity** (from `AGENTS.md`):

- Never silently substitute zero for missing data. Missing means "not available", shown as such.
- Every view shows its source and "as of" date, in UTC.
- Estimates are labelled as estimates; derived numbers are labelled as derived.
- Every view has an empty or error state. One failing optional fetch must not blank the page.

**Editorial rules** (from `BRAND.md`): *observe before interpreting*; keep measured facts, tentative observations, and questions visibly separate.

- **Computed captions** state arithmetic only. Allowed: "Supply is down 0.55% over 30 days and 3.76% below its 12-month high." Not allowed: "because", "driven by", "bullish", "bearish", "expected to", "likely".
- Signed numbers use a real minus (`−`) or `+` **and** a word ("Up", "Down"). Colour is never the only signal.
- Decline accent is `--sb-rust` (reserved caution/decline). There is no brand "positive" colour: show gains in Silo with `+` and the word "Up".
- Harvest is an accent, never body text on light backgrounds. Use tabular numerals for all figures.

**Chart colours, consistent in every view** (BRAND.md: Harvest primary, Sage secondary, Oxblood tertiary):

| Series | Token |
|--------|-------|
| USDT | `--sb-harvest` |
| USDC | `--sb-sage` |
| All other coins | `--sb-oxblood` |

The existing "Where the Dollars Gather" bar uses Silo for USDT and Harvest for USDC. Update it to this mapping in PR 2 so colours mean one thing everywhere. Colours that must be told apart also differ in lightness.

**Layout:** server-rendered by default. No client JavaScript unless a view truly needs it. Real `<table>` elements for tables. SVG charts carry `role="img"` with an `aria-label` summarising the finding, plus a collapsed `<details>` "View the data" table. Must work at 390px width. Card radius 12px max. Charts are hand-rolled SVG like the existing one; share small helpers rather than adding a chart library.

---

## 3. Data contract (DefiLlama, no API key)

Base URL: `https://stablecoins.llama.fi`. Already used by the app: `/stablecoins?includePrices=true` and `/stablecoincharts/all`.

| Endpoint | Used for |
|----------|----------|
| `GET /stablecoins?includePrices=true` | Coin list: supply, previous-period supply, chains, backing, price (views A, B, C, E) |
| `GET /stablecoincharts/all` | Total USD-pegged history (views A, D) |
| `GET /stablecoincharts/all?stablecoin={id}` | One coin's history (view D) |

Optional later: `/stablecoinchains`, `/stablecoinprices`.

**Fields observed on Oct 22, 2026.** These were read through a summarizing fetch, not a raw download, so **PR 0 must confirm every one** before anything depends on it.

Coin object (`peggedAssets[]`):

| Field | Shape |
|-------|-------|
| `id` | string (Tether is `"1"`) |
| `name`, `symbol`, `gecko_id`, `priceSource` | string |
| `pegType` | string (`"peggedUSD"` for the coins we use) |
| `pegMechanism` | string (set of values to be listed in PR 0) |
| `circulating` | `{ peggedUSD: number }` |
| `circulatingPrevDay`, `circulatingPrevWeek`, `circulatingPrevMonth` | `{ peggedUSD: number }` |
| `chainCirculating` | `{ [chain]: { current, circulatingPrevDay, circulatingPrevWeek, circulatingPrevMonth } }`, each `{ peggedUSD: number }` |
| `chains` | string[] |
| `price` | number |

Chart record (`/stablecoincharts/all`, with or without `?stablecoin=`): array of daily records, oldest first.

| Field | Shape |
|-------|-------|
| `date` | Unix **seconds** as a string, midnight UTC |
| `totalCirculating` | `{ peggedUSD: number }` |
| `totalCirculatingUSD` | `{ peggedUSD: number }` |
| `totalUnreleased` | `{ peggedUSD: number }`, appears only in some periods |

The existing code already handles the `date` seconds-to-milliseconds conversion and filters to finite, positive values. Keep that.

**Questions PR 0 must answer** (and record in the PR description):

1. Can `circulatingPrev*` be missing, null, or zero for new coins? (Assume yes; see edge cases.)
2. Does `sum(chainCirculating[*].current)` equal `circulating` per coin, or differ?
3. What is the full set of `pegMechanism` values, and are any coins missing it?
4. Is there exactly one `USDT` and one `USDC` among `peggedUSD` coins? (The existing `supplyFor(symbol)` sums duplicates; the per-coin history needs a single id.)
5. How large are the per-coin history responses, and does Next cache them? Next's fetch cache has a per-item size limit; confirm in the bundled docs how it behaves and whether `revalidate: 3600` actually holds for these.
6. Does the `prevMonth` baseline correspond to about 30 days, and does DefiLlama define it differently from the app's "30 days earlier" lookup?

---

## 4. Shared plumbing (PR 1)

Move data access and arithmetic out of `page.tsx` so views stay small and testable.

- `src/lib/stablecoins.ts`: types, `getCoinList()`, `getTotalHistory()`, `getCoinHistory(id)`. All use `revalidate: 3600`. Fetch the list and total history **once per render** and share them across views.
- `src/lib/calc.ts`: pure functions, no I/O (see section 5 for the ones each view needs).
- `src/lib/format.ts`: move `money`, `percent`, `shortDate` here, unchanged.
- Optional views fetch with `Promise.allSettled` so a failure renders that view's empty state only.
- Tests: the repo has no test suite. Prefer Node's built-in `node:test` on Node 24 with native TypeScript type stripping, which adds **no dependency**. If that does not work, ask before adding Vitest.
- PR 0 saves trimmed fixtures (top 5 coins, last 60 chart records) under `src/lib/__fixtures__/` for the tests.

---

## 5. The views

Placement top to bottom: header and intro (keep), A, B, C, D, E, then field note, Data notes, footer (keep), Field Guide drawer (keep). Reuse existing section markup and CSS classes.

### A. Momentum strip (replaces the hero stat and "Since last month")

**Question:** is the market growing, flat, or shrinking?

**Data:** the existing `total`, `latest`, and `history` logic, unchanged.

**Show:**

1. Headline: total USD-pegged circulating value, with as-of date (as today).
2. A row of signed changes for 7 days, 30 days, 90 days, year to date, 1 year. Each shows `$` change, `%` change, and the word Up or Down.
3. "Distance from the 12-month high": `latest / max − 1`, plus the date of the high.
4. "Position in the 12-month range": `(latest − min) / (max − min)`, plus the dates of the low and high.
5. One computed caption in the pattern: *"Supply is {up|down} {x}% over 30 days and {y}% below its 12-month high ({date})."*
6. Keep the 1-year chart, with the high and low points marked and labelled with their dates (it currently labels only min and max values).

**Calculations** (`calc.ts`):

- `changeOver(history, latest, days)`: baseline is the **last point on or before** `latest.date − days × 86,400,000` (the existing `previous` pattern). If no baseline, return `null` and show "n/a".
- Year to date: baseline is the last point on or before Dec 31 of the prior year, UTC.
- Percent is `change / baseline`; guard baseline ≤ 0.

**Sanity check** (values on Oct 22, 2026; they will have moved): total $303.67B, 30-day change −$1.69B (−0.55%), 12-month range $298.33B to $315.54B. Derived: about −3.76% from the high, about 31.0% of the way up the range.

### B. Movers table ("Who gained, who lost")

**Question:** who explains the headline change, and is anything off its peg?

**Data:** coin list only (already fetched). Filter `pegType === "peggedUSD"`.

**Show:** top 10 coins by `circulating.peggedUSD`, one row each, plus an "All other coins" row and a total row.

| Column | Definition |
|--------|------------|
| Coin | name and symbol |
| Supply | `circulating.peggedUSD` |
| Share | supply ÷ sum of token-level supply (same denominator as the current "Big Two" stat) |
| 30-day change ($) | `circulating.peggedUSD − circulatingPrevMonth.peggedUSD` |
| 30-day change (%) | change ÷ previous month; if previous is missing or 0, show "New" or "n/a", never infinity or 0 |
| Price | `price` as reported; missing shows "No price", never assumed $1 |
| vs $1 | `(price − 1) × 100` as a signed percent; see threshold below |

**Off-peg label:** a named constant `OFF_PEG_THRESHOLD_PCT = 0.5`. Within it, show "Near $1"; beyond it, show "Off peg" with the signed deviation. This is a snapshot only: say so ("current price only; past depegs are not shown"). **OWNER DECISION:** threshold value.

**Reconciliation line under the table (required):**
*"Token-level 30-day changes sum to {x}. The headline historical series changed {y}. The {z} gap reflects different as-of times and coverage (see Data notes)."*
Compute both numbers and show both. Never force them to match. Coins with a missing previous-month value are excluded from the sum and counted: "{n} coins had no previous-month figure."

**Notes:** server-rendered `<table>`, default sort by supply descending, no client interactivity in v1. State that DefiLlama defines the previous-month baseline, which may not be exactly 30 days.

### C. Where it lives (chains)

**Question:** where do the dollars live, and do USDT and USDC live in different places?

**Data:** `chainCirculating` from the coin list (no new fetch).

**Show:**

1. Horizontal bars of the top 8 chains by USD-pegged supply, with an "Other chains" bucket. Chain supply = sum over USD-pegged coins of `chainCirculating[chain].current.peggedUSD`.
2. For USDT and USDC separately: their top 3 chains with each chain's share of that coin's supply.

**Integrity:** use the sum of chain values as the denominator for chain shares. If a coin's chain sum differs from its `circulating` by more than 1% (named constant), mention it in Data notes. A coin with no `chainCirculating` is excluded and counted, not zeroed.

### D. Share over time

**Question:** is the market getting more concentrated? This is the question the page already asks.

**Data:** total history (already fetched) plus per-coin history for USDT and USDC (`/stablecoincharts/all?stablecoin={id}`), ids looked up by symbol from the coin list. Do not hardcode ids.

**Calculation:** join the three series on date. Use only dates present in all three. For each date: `usdt`, `usdc`, `others = total − usdt − usdc`, shares of `total`. All three come from the same historical dataset, so the denominator is consistent. Default window: 24 months, falling back to 12 if history is short. **OWNER DECISION:** 12 vs 24 months.

**Show:**

- 100% stacked area (USDT, USDC, others) using the colour mapping in section 2.
- Computed caption: *"The two largest coins held {a}% of supply {window} ago and {b}% now: {+/−}{c} percentage points."* Use "percentage points", not "%".
- A note: the latest point comes from the historical series, so it may differ slightly from the token-level Big Two stat elsewhere on the page.

**Risk to flag in the PR plan:** two extra large fetches. Slice to the window server-side and confirm caching (see PR 0 question 5).

### E. What backs it

**Question:** how much of the market is something other than dollars held in a bank or Treasuries?

**Data:** `pegMechanism` from the coin list.

**Show:** group USD-pegged coins by `pegMechanism`: supply, share, and the top 3 coins in each group. Use DefiLlama's labels as returned. Coins with no `pegMechanism` go in a "Not classified" group; never merge them into another group. Add plain-English Field Guide entries only for values PR 0 actually finds. Do not invent definitions; keep them factual and cite DefiLlama's classification as the source.

### F. Event markers (last PR)

**Question:** what happened around the moves?

**Data:** a typed static list, `src/data/events.ts`: `{ date, label, sourceUrl }`. **No event ships without a source URL.** Render as small dated ticks on the momentum chart, with labels in a list below for accessibility.

**Seed candidates, each to be verified against a primary source before shipping:**

- Jul 18, 2025: GENIUS Act signed.
- Jul 18, 2026: statutory deadline for final implementing rules; agencies missed it (secondary source below).
- Jan 18, 2027 or 120 days after final rules, whichever is earlier: GENIUS Act compliance date (secondary source below).
- Jun 2025: Circle's NYSE listing.

**OWNER DECISION:** final event list.

### Demotions and edits to existing sections

- **Peg composition:** remove the bar, legend, and tooltips. Keep the existing logic and reduce it to one factual sentence in Data notes (for example, "USD-pegged coins are {x}% of circulating value; EUR {y}%; other {z}%"). Owner-approved demotion.
- **Notes from the field:** keep the voice. Update the closing question once view D exists, so it is one the page can almost answer. Draft new copy in the PR and get approval. Field notes stay short.
- **Data notes:** add sentences for the reconciliation gap (view B), the chain-sum check (view C), and the denominator difference (view D).
- **Field Guide:** read `FieldGuide.tsx` first and match its format. Add entries only for terms the new views introduce (for example, percentage points, chain, and any backing labels PR 0 confirms).

---

## 6. Edge cases (apply everywhere)

- Missing, null, or non-finite value → "n/a" or "No price"; never 0.
- Previous value of 0 or missing → label "New" or "n/a"; never divide by zero.
- Date lookups use the last point on or before the target; history can have gaps.
- All dates and "as of" labels are UTC.
- Duplicate symbols: group by id, display by symbol; resolve USDT and USDC ids explicitly.
- Coins with no price: show supply, skip the peg check, count them.
- A stale or partial upstream response must show an honest empty state with the as-of time, not a broken chart.

---

## 7. Acceptance criteria

**Every PR:**

- `npm run lint` (max-warnings 0), `npm run typecheck`, and `npm run build` pass from `grain-bin-app/`.
- No new dependency without prior approval.
- No hardcoded market values anywhere in code.
- Each new view has loading-safe, empty, and error states.
- Accessible: real tables, labelled SVGs, "View the data" fallback, text contrast per BRAND.md, usable at 390px.
- Checked against live data in a **Vercel preview**, as the README requires (a passing build does not replace this).
- PR description follows the `AGENTS.md` report format.

**Page-level:** a first-time visitor can answer, from the page alone: is supply up or down and by how much; who moved; where it lives; whether the top two are gaining or losing share; and how much is not simply dollar-backed.

---

## 8. PR sequence

| PR | Scope | Notes |
|----|-------|-------|
| 0 | Discovery | Hit the live endpoints, answer the six questions in section 3, save trimmed fixtures, correct this spec if reality differs. No app change. |
| 1 | Extract data layer, formatters, tests | Output must be identical to production. Choose test runner per section 4. |
| 2 | Momentum strip + Movers table (with price column) + reconciliation line + share-bar colour fix + peg demotion | Biggest payoff; uses only data already fetched. |
| 3 | Chains view | No new fetch. |
| 4 | Share over time | Adds per-coin fetches; confirm caching first. |
| 5 | Backing view + Field Guide entries | Only values PR 0 confirms. |
| 6 | Event markers | Only sourced events. |

Each PR waits for the owner's review of the preview before the next begins.

---

## 9. Owner decisions, with defaults

| Decision | Default |
|----------|---------|
| Share-over-time window | 24 months (12 if history is short) |
| Off-peg threshold | 0.5% |
| Movers table size | Top 10 plus "All other" |
| Chain view size | Top 8 plus "Other chains" |
| Event list | Seeds in view F, each source-verified first |
| Backing labels | DefiLlama's own labels, shown as returned |
| Updated closing question | Drafted in PR 2 or 4 for approval |

---

## 10. Secondary sources behind the hypotheses (not ground truth)

- Sumsub, GENIUS Act implementation falls behind: https://sumsub.com/media/news/genius-act-implementation-falls-behind-as-agencies-miss-deadline/ (agencies missed the Jul 18, 2026 rulemaking deadline; effective date is the earlier of 18 months after signing or 120 days after final rules).
- Transak, Stablecoin market cap in 2026: https://transak.com/blog/stablecoin-market-cap-2026 (about $316B on Jun 12, 2026 per DefiLlama; about $308B at end-2025).
- Spark, USDT vs USDC: https://www.spark.money/research/stablecoin-competitive-dynamics-usdt-usdc (USDT share down about 3 points year over year; chain mix; new entrants).

These use different measures and dates than Grain Bin. Use them to decide what to look for, never what to display.
