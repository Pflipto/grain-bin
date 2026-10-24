# Event-source review — draft, not production annotations

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
