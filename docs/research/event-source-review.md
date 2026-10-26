# Event-source review and editorial provenance

The owner approved an aggregate timeline beginning with the data available in 2017, rather than a fabricated pre-history back to 2014. The chart uses the actual earliest observation (currently November 29, 2017). A 2014 Tether/Realcoin launch marker is outside that observed range and is not included.

## Verification blocker

Direct requests to issuer and government primary-source pages were rejected by the cloud network proxy with CONNECT 403. Additional network permission was granted, but the proxy still rejected those hosts. An approved direct-network attempt also failed external DNS. This is an environment restriction, not proof that the source pages are missing.

**No candidate below is wired into the production event list.** `marketEvents` is empty until primary-source bodies/dates and the owner's event selection are verified. The draft PR supplies the timeline, marker rendering, accessible source-link list, and source/date validation. Tests use explicitly synthetic events only.

## Candidate market events to verify

| Candidate | Candidate date | Primary source to check | Status |
| --- | --- | --- | --- |
| GENIUS Act enacted | 2025-07-18 | https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm | Date from the existing spec; primary text not retrieved |
| Circle NYSE trading begins | 2025-06-05 | https://www.circle.com/pressroom/circle-announces-pricing-of-upsized-initial-public-offering | Candidate issuer URL/date; verify exact title, URL, date and trading-start language |
| USDC launch | 2018-09-26 | https://www.circle.com/blog/introducing-usd-coin | Candidate issuer URL/date; primary text not retrieved |

Do not publish these URLs as verified sources until checked; candidate paths may need correction. Do not use the prior secondary-source claims about missed rulemaking deadlines or a future legal compliance date as historical events. Event proximity is context, not evidence of causation.

## Available alternative primary evidence

The issuer's GitHub release API at https://api.github.com/repos/circlefin/stablecoin-evm/releases is accessible. It contains verified publication timestamps and release notes for contract-package milestones, including the January 23, 2024 release and later Bridged USDC Standard changes. These are software-release publications, not proof of the market-event dates above. They have not been substituted silently for the requested market context. The owner has been asked whether to use those narrower milestones or keep this PR in draft pending market-source verification.

## To finish the draft

1. Retrieve the primary body for each selected event and record the supporting date/wording here.
2. Obtain the owner's final event-list approval.
3. Add only those verified entries to `src/data/market-events.ts` with id, ISO UTC date, neutral label, and HTTPS source URL.
4. Re-run unit checks and browser checks of numbered markers/source links, all-history/one-year ranges, hover/touch/keyboard behavior, and mobile layout before marking ready.

## Owner-supplied candidate dataset — October 26, 2026

The supplied JSON is preserved unchanged in [inputs/stablecoin-event-candidates.json](inputs/stablecoin-event-candidates.json) as research input, not runtime chart data. Its confidence labels are supplied assertions, not independent verification. None of its event records includes a source URL. A fresh request to Circle's launch page still returned proxy CONNECT 403.

Before promotion:

- Attach a supporting primary-source URL and relevant dated text to each selected event. Prefer a small initial set over dozens of numbered markers across the full chart.
- Resolve month-precision records with non-first-of-month dates: DeFi summer (2020-06-15), GHO (2023-07-15), USD1 (2025-03-25), and the proposed supply record (2026-05-15). Never present an approximate month as a verified exact day.
- Keep the 2017-11-19 Tether hack outside the chart: it predates the first aggregate observation. Do not extend the line with invented data to accommodate it.
- Keep the scheduled 2027 event outside observed history. Its effective-date wording depends on statutory conditions and requires legal-source verification.
- Verify recent rulemaking claims, especially the asserted missed deadline and October 2026 final rule. Confidence labels alone do not establish either the facts or their legal effects.
- Distinguish announcements from operational changes. For example, a BUSD halt announcement date need not be the date minting actually ceased; an IPO pricing announcement is distinct from first trading.
- Rewrite summaries neutrally after verification. Remove unsupported causal claims about supply changes and avoid broad comparative claims such as “first” without evidence.
- Do not import market-cap anchors or the approximate supply-record event as chart measurements. The chart continues to use its own DefiLlama aggregate series; cross-provider totals have different coverage.

The draft remains open with an empty runtime event list. Source URLs plus the relevant source excerpts will allow review to continue even while direct access is blocked.

## Owner decision — use supplied events without source lines

The owner explicitly approved using the supplied information without source lines. This supersedes the earlier source-verification and owner-selection gate above. Runtime annotations are owner-supplied editorial content, not independently verified primary-source facts. No source URLs or verification claims are invented.

The runtime dataset retains 47 candidate events. Approximate month dates are normalized to the first day for positioning and displayed as month/year in the event list. The scheduled 2027 event is omitted, as is the cross-provider approximate supply record. Events outside actual aggregate coverage do not render. Supply values still come exclusively from the existing API series. Importance 1 markers appear in all history; importance 1–2 markers appear in the one-year range; all in-range events and supplied summaries are available in a collapsed disclosure. Marker numbers match the full event list. The externally supplied market-cap anchors are never used as chart measurements.

The PR can now leave draft under this explicit editorial decision. The earlier verification findings remain recorded for future fact-checking.
