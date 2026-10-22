# PR 0: stablecoin API discovery

Observed October 22, 2026 (UTC). This is a point-in-time inspection, not a guarantee of future schema or source freshness. No application behavior changes in this PR.

## The six contract questions

### 1. Can previous values be absent or zero?

Yes. Among 334 USD-pegged records:

| Baseline | Nonzero | Missing/null peg amount | Zero |
| --- | ---: | ---: | ---: |
| Previous day | 330 | 3 | 1 |
| Previous week | 330 | 3 | 1 |
| Previous month | 325 | 8 | 1 |

Missing includes absent `peggedUSD` keys, not only an absent parent object. Zero is real input but cannot be a percentage denominator. Neither missing nor zero proves that a coin is new. The response includes 87 USD-pegged records without a numeric price. `gecko_id` and `priceSource` must also tolerate missing/null values. No coin-list or price observation timestamp is exposed; record retrieval time separately from source freshness.

### 2. Do chain values add up?

All 334 USD-pegged coins have nonempty chain records, with finite current USD amounts in this response. For the 333 coins with positive circulating totals, chain sums match circulating values within floating-point error (maximum relative difference about 6.1e-16); none exceed 1%. One coin has a zero circulating total. This does not eliminate the need to handle missing chain data, invalid amounts, zero denominators, or future discrepancies. Chain shares should use available chain totals, not silently substitute coin totals.

### 3. What mechanisms exist?

| Raw value | USD-pegged coin count |
| --- | ---: |
| `crypto-backed` | 217 |
| `fiat-backed` | 93 |
| `algorithmic` | 23 |
| `crytpo-backed` | 1 |

No USD-pegged coin lacked a mechanism in this snapshot. The misspelling is real upstream input: preserve it in fixtures and raw data, use a documented display alias, and retain an unknown/unclassified path. These are provider classifications, not verified descriptions of reserve assets. Do not translate “fiat-backed” into “cash and Treasuries” without separate evidence.

### 4. Are USDT and USDC unique?

Exactly one of each among USD-pegged records: Tether/USDT has id `1`; USD Coin/USDC has id `2`. The application must still resolve identity from records and handle ambiguity; these observed ids belong in fixtures, not hardcoded application lookup logic.

### 5. How large are histories, and do they cache?

All four live endpoints returned HTTP 200 and parsed as JSON.

| Endpoint suffix | Raw response bytes | Records | Observed first date | Last date |
| --- | ---: | ---: | --- | --- |
| `/stablecoins?includePrices=true` | 553,493 | 334 USD-pegged coins | Not exposed | Not exposed |
| `/stablecoincharts/all` | 1,327,638 | 3,250 | 2017-11-29 | 2026-10-22 |
| `/stablecoincharts/all?stablecoin=1` | 471,492 | 3,250 | 2017-11-29 | 2026-10-22 |
| `/stablecoincharts/all?stablecoin=2` | 396,160 | 2,964 | 2018-09-11 | 2026-10-22 |

All chart dates were string Unix seconds at midnight UTC, sorted ascending with no duplicate dates. Observed records include both `totalCirculating` and `totalCirculatingUSD`; they are not interchangeable. Other fields such as `totalUnreleased` are not needed by the proposed views.

Read the bundled Next 16.4.2 fetch documentation (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md`): positive `next.revalidate` configures the fetch cache lifetime; GET memoization during a render is separate from persistence across requests. The bundled incremental cache implementation (`dist/server/lib/incremental-cache/index.js`, around lines 530–543) limits serialized fetch entries to 2 MiB without a custom handler. Oversize entries throw in development and warn/skip cache writes in production. The fetch documentation does not itself document that size limit.

A temporary app outside this repository exercised all four live fetches with `next: { revalidate: 3600 }`, Next 16.4.2, React 19.3, `cacheComponents: true`, and `partialPrefetching: true`. A production build and production server produced four persisted fetch entries with `revalidate: 3600`:

| Response | Persisted entry bytes |
| --- | ---: |
| Coin list | 738,656 |
| Aggregate history | 1,770,839 |
| USDT history | 629,305 |
| USDC history | 528,865 |

After initial asynchronous writes settled, a repeated HTTP request returned 200 without changing any entry's size or modification time. All entries currently fit, but the aggregate is substantially closer to the limit than its raw body suggests: stored response bodies are encoded and have metadata overhead. Server-side slicing **after fetch does not reduce the cached upstream response**. Recheck sizes when implementing PR 4. This local probe does not prove Vercel's deployed cache configuration or behavior over an hour; verify that in the feature preview. The probe's first direct Node fetch failed DNS in this environment; using Node 24's `NODE_USE_ENV_PROXY=1` succeeded through the provided network proxy. No production settings changed.

### 6. What does previous month mean?

Inspected provider source at commit [`f42cee5325c5fd82c8726f5d40d6f69d5578e3c9`](https://github.com/DefiLlama/peggedassets-server/tree/f42cee5325c5fd82c8726f5d40d6f69d5578e3c9):

- [`getStableCoins.ts`](https://github.com/DefiLlama/peggedassets-server/blob/f42cee5325c5fd82c8726f5d40d6f69d5578e3c9/api2/cron-task/getStableCoins.ts#L15) selects the last balance on/before each coin's latest observation minus 30 days, searching back a further 36 hours. A missing observation produces an empty amount object.
- The same source multiplies **both current and previous balances by the current conversion price** (with a fiat FX fallback when market price is unavailable). The separately exposed `price` can still be null. `circulating` and chain values are already USD-valued in this implementation; multiplying them by the exposed price again would double-convert them.
- [`storeCharts.ts`](https://github.com/DefiLlama/peggedassets-server/blob/f42cee5325c5fd82c8726f5d40d6f69d5578e3c9/api2/cron-task/storeCharts.ts#L251) uses historical price observations, with a fallback, for historical USD-valued totals.

The API does not expose the deployed source revision or each coin's observation/baseline timestamps. Source inspection explains the current public implementation, not proof that this revision is deployed. The safe UI contract is to label provider-month token changes separately from historical USD-valued changes and avoid claiming their numerical difference has one verified cause. A reported price is also a quote of unknown freshness, not proof of a live depeg.

## Fixtures and implementation boundary

Fixtures are in `grain-bin-app/src/lib/__fixtures__/`, with their own provenance README. They include the top five coins, additional observed missing/zero/typo examples, and the last 60 observations for total/USDT/USDC. They preserve raw values; they are not production data or a complete market universe. Fixture totals must not be presented as whole-market totals.

The spec now narrows the largest-coins table and classification claims, distinguishes timestamps and valuation methods, and defines baseline tolerances, partial aggregates, flat ranges, and invalid history joins. These are proposed implementation contracts; no arithmetic, runtime data access, page, style, dependency, or deployment configuration changes here.

Owner choices still pending: off-peg threshold, 12/24-month share window, and sourced event list. Do not begin PR 1 before this discovery/spec PR has been reviewed. Historical events and legal dates have not been verified in this PR and must remain unshipped until their dedicated review.
