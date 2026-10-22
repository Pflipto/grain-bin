# Discovery fixtures

Captured from raw JSON on **2026-10-22 UTC**, during PR 0. See [the discovery report](../../../../docs/discovery/001-stablecoin-contract.md) for measurements and limitations.

| File | Source | Selection |
| --- | --- | --- |
| `coins-top-five.json` | `https://stablecoins.llama.fi/stablecoins?includePrices=true` | USD-pegged coins sorted descending by reported circulating value; first five |
| `coins-edge-cases.json` | Same coin-list response | First observed examples of missing previous-month peg amount, zero previous-month amount, null price, and `crytpo-backed`; deduplicated by record |
| `total-history-60.json` | `https://stablecoins.llama.fi/stablecoincharts/all` | Last 60 records |
| `usdt-history-60.json` | `https://stablecoins.llama.fi/stablecoincharts/all?stablecoin=1` | Last 60 records |
| `usdc-history-60.json` | `https://stablecoins.llama.fi/stablecoincharts/all?stablecoin=2` | Last 60 records |

Coin records retain only identity, peg/classification, source, price, circulating/previous values, chains, and chain amounts. History records retain only `date`, `totalCirculating`, and `totalCirculatingUSD`. Retained values and missing/null/zero distinctions are unchanged. The aggregate history retains all peg keys for future composition tests. These are partial samples: summing fixture coins does not reproduce the market total.

Do not import these into runtime views. PR 1 should supplement these observed cases with small, explicitly synthetic fixtures for non-finite numbers, conflicting dates, negative residuals, stale dates, missing chain fields, flat ranges, and long-window lookups. Sixty daily observations cannot test a full year's metrics.

To refresh, download the endpoint responses, record the UTC retrieval date, repeat the selections above, and update the discovery measurements. A retrieval timestamp is not an upstream observation timestamp. Do not normalize spelling, impute prices, or fill missing values during capture.
