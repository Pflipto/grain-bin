import type {MarketEvent} from "../lib/timeline";

// Owner-supplied editorial annotations, approved for use without source lines.
// Not independently source-verified; original input and review notes are in docs/research.
// Approximate months use their first day for positioning; chart values remain API data.
export const marketEvents:MarketEvent[]=[
  {
    "id": "tether-treasury-hack-2017",
    "date": "2017-11-19",
    "label": "Tether treasury hack",
    "summary": "About $31M of USDT was stolen from Tether's treasury wallet; Tether froze the funds and moved to a patched Omni Layer implementation.",
    "datePrecision": "day",
    "importance": 3
  },
  {
    "id": "sai-launch-2017",
    "date": "2017-12-18",
    "label": "MakerDAO launches Sai",
    "summary": "First major decentralized, crypto-collateralized stablecoin goes live on Ethereum (single-collateral DAI, later renamed Sai).",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "tusd-launch-2018",
    "date": "2018-03-01",
    "label": "TrueUSD launches",
    "summary": "TUSD debuts as one of the first fiat-backed stablecoins marketed on third-party attestations.",
    "datePrecision": "month",
    "importance": 3
  },
  {
    "id": "nydfs-pax-gusd-2018",
    "date": "2018-09-10",
    "label": "NYDFS approves PAX and GUSD",
    "summary": "New York regulators approve Paxos Standard and Gemini Dollar, the first regulated, fully reserved US dollar stablecoins.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "usdc-launch-2018",
    "date": "2018-09-26",
    "label": "USDC launches",
    "summary": "Circle and Coinbase (via the Centre consortium) launch USD Coin, which becomes the main regulated-leaning rival to USDT.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "nyag-bitfinex-tether-2019",
    "date": "2019-04-25",
    "label": "NY AG sues Bitfinex and Tether",
    "summary": "New York's attorney general alleges Bitfinex covered up about $850M in losses using Tether reserves; this starts the long reserve-transparency fight.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "libra-announced-2019",
    "date": "2019-06-18",
    "label": "Facebook announces Libra",
    "summary": "Facebook's Libra whitepaper puts stablecoins on the radar of global regulators and central banks. It was renamed Diem in Dec 2020 and wound down in Jan 2022.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "busd-launch-2019",
    "date": "2019-09-05",
    "label": "Binance USD launches",
    "summary": "Paxos-issued BUSD, branded by Binance and approved by NYDFS, launches. It grows to be a top-3 stablecoin before being wound down in 2023.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "mcd-launch-2019",
    "date": "2019-11-18",
    "label": "Multi-Collateral Dai",
    "summary": "MakerDAO upgrades to multi-collateral DAI, letting assets beyond ETH back the stablecoin.",
    "datePrecision": "day",
    "importance": 3
  },
  {
    "id": "black-thursday-2020",
    "date": "2020-03-12",
    "label": "Black Thursday",
    "summary": "A sharp ETH crash and network congestion cause Maker vault liquidation failures and DAI to trade off peg. Maker later adds USDC as collateral, deepening DAI's link to centralized stablecoins.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "defi-summer-2020",
    "date": "2020-06-01",
    "label": "DeFi summer begins",
    "summary": "Compound's COMP distribution kicks off yield farming; stablecoin demand as DeFi collateral and trading pairs drives the first big supply surge (about $5B to about $27B across 2020).",
    "datePrecision": "month",
    "importance": 1
  },
  {
    "id": "occ-1172-2020",
    "date": "2020-09-21",
    "label": "OCC says banks can back stablecoins",
    "summary": "OCC interpretive letter confirms national banks may hold reserves backing stablecoins, the first sign of US bank-regulator openness.",
    "datePrecision": "day",
    "importance": 3
  },
  {
    "id": "nyag-tether-settlement-2021",
    "date": "2021-02-23",
    "label": "Tether settles with NY AG",
    "summary": "Tether and Bitfinex pay $18.5M and agree to publish periodic reserve breakdowns and stop trading with New York.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "anchor-launch-2021",
    "date": "2021-03-01",
    "label": "Anchor Protocol launches on Terra",
    "summary": "A roughly 20% 'savings' yield on UST drives rapid growth of Terra's algorithmic stablecoin through 2021 and early 2022.",
    "datePrecision": "month",
    "importance": 2
  },
  {
    "id": "tether-reserves-breakdown-2021",
    "date": "2021-05-13",
    "label": "Tether reserve breakdown published",
    "summary": "First detailed reserve composition shows only a small share held as cash and a large share as commercial paper, fueling reserve-quality concerns.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "cftc-tether-2021",
    "date": "2021-10-15",
    "label": "CFTC fines Tether $41M",
    "summary": "CFTC orders Tether to pay $41M for misstatements about its reserves, and Bitfinex to pay $1.5M.",
    "datePrecision": "day",
    "importance": 3
  },
  {
    "id": "pwg-report-2021",
    "date": "2021-11-01",
    "label": "President's Working Group report",
    "summary": "US Treasury-led report urges Congress to restrict stablecoin issuance to insured depository institutions, setting the policy debate that led to GENIUS.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "diem-wind-down-2022",
    "date": "2022-01-31",
    "label": "Diem winds down",
    "summary": "Diem Association sells its assets to Silvergate and shuts down, ending Meta's stablecoin effort.",
    "datePrecision": "day",
    "importance": 3
  },
  {
    "id": "terra-collapse-2022",
    "date": "2022-05-09",
    "label": "Terra UST collapse",
    "summary": "UST loses its peg and LUNA hyperinflates over about a week; USDT briefly dips toward $0.95 on May 12. Total supply peaked just before and begins a roughly 18-month contraction.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "tornado-cash-sanctions-2022",
    "date": "2022-08-08",
    "label": "OFAC sanctions Tornado Cash",
    "summary": "First sanctions on a smart-contract protocol; Circle freezes USDC in sanctioned addresses, showing centralized issuers can and will blacklist.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "tether-commercial-paper-zero-2022",
    "date": "2022-10-01",
    "label": "Tether exits commercial paper",
    "summary": "Tether says it has reduced commercial paper to zero and shifted reserves toward US Treasuries.",
    "datePrecision": "month",
    "importance": 3
  },
  {
    "id": "ftx-collapse-2022",
    "date": "2022-11-11",
    "label": "FTX bankruptcy",
    "summary": "FTX files for bankruptcy; exchange-driven demand for stablecoins falls and supply keeps shrinking through 2023.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "busd-shutdown-2023",
    "date": "2023-02-13",
    "label": "BUSD minting halted",
    "summary": "NYDFS orders Paxos to stop minting BUSD and the SEC signals action; BUSD supply runs off over the next year, with much of it migrating to USDT and later TUSD/FDUSD.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "svb-usdc-depeg-2023",
    "date": "2023-03-10",
    "label": "SVB failure, USDC depegs",
    "summary": "Circle discloses $3.3B stuck at Silicon Valley Bank; USDC falls to about $0.87 on Mar 11 and DAI follows. It repegs on Mar 13 after US authorities backstop SVB depositors.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "mica-in-force-2023",
    "date": "2023-06-29",
    "label": "EU MiCA enters into force",
    "summary": "The EU's Markets in Crypto-Assets regulation becomes law, with stablecoin rules phased in from mid-2024.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "gho-launch-2023",
    "date": "2023-07-01",
    "label": "Aave launches GHO",
    "summary": "Aave's native overcollateralized stablecoin goes live on Ethereum mainnet.",
    "datePrecision": "month",
    "importance": 3
  },
  {
    "id": "pyusd-launch-2023",
    "date": "2023-08-07",
    "label": "PayPal launches PYUSD",
    "summary": "First stablecoin from a major US payments company, issued by Paxos.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "usde-launch-2024",
    "date": "2024-02-01",
    "label": "Ethena USDe launches",
    "summary": "Synthetic dollar backed by delta-hedged crypto collateral offers high yield and grows quickly, becoming a top-3 stablecoin in 2025.",
    "datePrecision": "month",
    "importance": 1
  },
  {
    "id": "mica-stablecoin-rules-2024",
    "date": "2024-06-30",
    "label": "MiCA stablecoin rules apply",
    "summary": "EU rules for asset-referenced and e-money tokens take effect; full MiCA applies Dec 30, 2024. Exchanges later restrict non-compliant stablecoins such as USDT for EEA users.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "stripe-bridge-2024",
    "date": "2024-10-21",
    "label": "Stripe to acquire Bridge",
    "summary": "Stripe announces a roughly $1.1B acquisition of stablecoin infrastructure firm Bridge, signaling big payments companies treating stablecoins as rails.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "rlusd-launch-2024",
    "date": "2024-12-17",
    "label": "Ripple launches RLUSD",
    "summary": "Ripple's NYDFS-regulated dollar stablecoin goes live.",
    "datePrecision": "day",
    "importance": 3
  },
  {
    "id": "trump-eo-digital-assets-2025",
    "date": "2025-01-23",
    "label": "Executive order backs USD stablecoins",
    "summary": "Trump signs a digital-assets executive order supporting dollar-backed stablecoins and barring a US CBDC.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "usd1-launch-2025",
    "date": "2025-03-01",
    "label": "World Liberty USD1",
    "summary": "Trump-family-linked World Liberty Financial launches USD1; it gains scale after being used for a $2B MGX investment in Binance (May 2025) and reaches top-5 by cap.",
    "datePrecision": "month",
    "importance": 2
  },
  {
    "id": "circle-ipo-2025",
    "date": "2025-06-05",
    "label": "Circle IPO",
    "summary": "Circle lists on the NYSE (CRCL), the first major public listing of a stablecoin issuer.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "genius-senate-2025",
    "date": "2025-06-17",
    "label": "Senate passes GENIUS Act",
    "summary": "Bipartisan Senate passage of the first US federal payment-stablecoin framework; the House followed on Jul 17.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "genius-signed-2025",
    "date": "2025-07-18",
    "label": "GENIUS Act signed into law",
    "summary": "First US federal stablecoin law: 1:1 reserves, monthly disclosures, redemption rights, issuer licensing. Effective on the earlier of Jan 18, 2027 or 120 days after final rules.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "hk-stablecoin-ordinance-2025",
    "date": "2025-08-01",
    "label": "Hong Kong stablecoin regime live",
    "summary": "Hong Kong's Stablecoins Ordinance takes effect, creating an issuer licensing regime.",
    "datePrecision": "day",
    "importance": 3
  },
  {
    "id": "treasury-anprm-2025",
    "date": "2025-09-19",
    "label": "Treasury GENIUS ANPRM",
    "summary": "Treasury opens implementation of the GENIUS Act with an advance notice seeking comment on safe harbors and comparability of foreign regimes.",
    "datePrecision": "day",
    "importance": 3
  },
  {
    "id": "oct10-crash-2025",
    "date": "2025-10-10",
    "label": "10/10 crash, USDe depegs on Binance",
    "summary": "About $19B of leveraged positions are liquidated in a day. USDe briefly traded near $0.65 on Binance while holding near $1 elsewhere; Ethena handled about $2B in redemptions. Growth stalled afterward.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "western-union-usdpt-2025",
    "date": "2025-10-01",
    "label": "Western Union plans stablecoin",
    "summary": "Western Union announces a dollar stablecoin on Solana issued by Anchorage Digital.",
    "datePrecision": "month",
    "importance": 3
  },
  {
    "id": "stream-xusd-collapse-2025",
    "date": "2025-11-04",
    "label": "Stream Finance xUSD collapse",
    "summary": "Yield-bearing xUSD loses its peg after Stream Finance discloses a large fund-manager loss; related synthetic dollars such as deUSD also unwind.",
    "datePrecision": "day",
    "importance": 3
  },
  {
    "id": "usat-launch-2026",
    "date": "2026-01-27",
    "label": "Tether launches USAT",
    "summary": "Tether launches a GENIUS-oriented US stablecoin issued by Anchorage Digital Bank, its return to the US market.",
    "datePrecision": "day",
    "importance": 1
  },
  {
    "id": "occ-nprm-2026",
    "date": "2026-02-25",
    "label": "OCC proposes GENIUS rule",
    "summary": "OCC issues its 376-page implementing proposal (Federal Register Mar 2) with a $5M capital floor for issuers. FDIC (Apr 7) and NCUA (May) followed with their own proposals.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "aml-and-state-rules-2026",
    "date": "2026-04-01",
    "label": "FinCEN/OFAC and state-regime proposals",
    "summary": "FinCEN and OFAC propose AML and sanctions rules for issuers; Treasury proposes principles for acceptable state stablecoin regimes.",
    "datePrecision": "month",
    "importance": 3
  },
  {
    "id": "mica-transition-end-2026",
    "date": "2026-07-01",
    "label": "MiCA transition period ends",
    "summary": "EU MiCA transitional arrangements expire, tightening enforcement on non-authorized crypto-asset service providers and stablecoins.",
    "datePrecision": "day",
    "importance": 3
  },
  {
    "id": "genius-deadline-missed-2026",
    "date": "2026-07-18",
    "label": "GENIUS rulemaking deadline missed",
    "summary": "The one-year statutory deadline passes without final rules from Treasury or the four primary regulators; the Jan 18, 2027 backstop effective date becomes the controlling date.",
    "datePrecision": "day",
    "importance": 2
  },
  {
    "id": "occ-final-rule-2026",
    "date": "2026-10-21",
    "label": "OCC finalizes GENIUS rule",
    "summary": "OCC issues its final implementing rule: $5M capital floor, more flexible reserve management, and waivers of up to 12 months for existing issuers. Other agencies' final rules still pending.",
    "datePrecision": "day",
    "importance": 1
  }
];
