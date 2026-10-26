"use client";

import { useEffect, useRef, useState } from "react";

type Entry = { term: string; subtitle: string; category: "Projects" | "Concepts"; description: string; link?: string };
const entries: Entry[] = [
  { term: "Provider-month change", subtitle: "A separate comparison", category: "Concepts", description: "The difference between DefiLlama’s current and previous-month reported coin values. The inspected provider implementation values both balances at the current conversion price; it is not the same measure as the change between historical USD-valued snapshots." },
  { term: "Price quote", subtitle: "An available observation", category: "Concepts", description: "A price reported by the data provider. Its observation time is not supplied here. A deviation from $1 describes that quote, not proof of a live depeg or its duration." },
  { term: "USDT", subtitle: "Tether", category: "Projects", description: "A US dollar-pegged stablecoin issued by Tether. Its circulating supply makes it a major part of the market tracked in Grain Bin.", link: "https://tether.to/" },
  { term: "USDC", subtitle: "USD Coin", category: "Projects", description: "A US dollar-pegged stablecoin issued by Circle. Like USDT, it is designed to maintain a value close to one US dollar.", link: "https://www.circle.com/usdc" },
  { term: "DAI", subtitle: "Sky ecosystem", category: "Projects", description: "A dollar-pegged crypto-backed stablecoin associated with the MakerDAO system, now part of the Sky ecosystem. Its mechanisms differ from those of USDT and USDC.", link: "https://sky.money/" },
  { term: "PYUSD", subtitle: "PayPal USD", category: "Projects", description: "A US dollar-pegged stablecoin offered through PayPal and issued by Paxos.", link: "https://www.paypal.com/us/digital-wallet/manage-money/crypto/pyusd" },
  { term: "Chain", subtitle: "Where balances are reported", category: "Concepts", description: "A blockchain network on which the provider reports circulating token balances. Chain shares use available chain-level amounts; they do not measure transfers, users, or activity." },
  { term: "Stablecoin", subtitle: "The basic idea", category: "Concepts", description: "A crypto token designed to track the value of another asset, often a national currency. A target price is not a guarantee." },
  { term: "USD peg", subtitle: "The target", category: "Concepts", description: "An arrangement intended to keep a token's value near one US dollar. Market prices can still move above or below the target." },
  { term: "Issuer", subtitle: "Who's behind it", category: "Concepts", description: "The organization or protocol responsible for creating and managing a stablecoin. Issuers and governance structures vary." },
  { term: "Reserves", subtitle: "What backs a token", category: "Concepts", description: "Assets held or managed to support a stablecoin's value or redemptions. Composition, transparency and redemption rights differ by project." },
  { term: "Provider classification", subtitle: "Metadata, not a reserve audit", category: "Concepts", description: "DefiLlama labels peg mechanisms as fiat-backed, crypto-backed, or algorithmic. Grain Bin groups reported values by those labels; it does not independently verify reserves or infer missing labels.", link: "https://stablecoins.llama.fi/stablecoins?includePrices=true" },
  { term: "Circulating supply", subtitle: "How much exists", category: "Concepts", description: "The amount of a token counted as circulating. Grain Bin uses DefiLlama's supply data to estimate the USD-pegged market." },
  { term: "Market share", subtitle: "A slice of the whole", category: "Concepts", description: "One token's circulating supply divided by the total supply in the selected market." },
  { term: "Percentage points", subtitle: "A change in share", category: "Concepts", description: "The arithmetic difference between two percentages. A share rising from 60% to 65% increases by 5 percentage points, not 5 percent." },
  { term: "Concentration", subtitle: "The big players", category: "Concepts", description: "How much of a market is represented by a small number of participants. Grain Bin tracks the combined share of USDT and USDC." },
  { term: "Depeg", subtitle: "When the price wanders", category: "Concepts", description: "When a stablecoin's market price moves away from its intended reference value, temporarily or for longer." },
];

export default function FieldGuide() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; trigger?.focus(); };
  }, [open]);
  const results = entries.filter((entry) => [entry.term, entry.subtitle, entry.category, entry.description].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <button ref={triggerRef} type="button" className="field-guide-trigger" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
      <span aria-hidden="true">▤</span> Field Guide
    </button>
    {open && <div className="field-guide-layer">
      <button className="field-guide-scrim" aria-label="Close Field Guide" onClick={() => setOpen(false)} />
      <aside className="field-guide-drawer" role="dialog" aria-modal="true" aria-labelledby="field-guide-title">
        <div className="field-guide-top">
          <div><p className="field-guide-kicker">GRAIN BIN / REFERENCE NOTES</p><h2 id="field-guide-title">Field Guide</h2><p>A few names and ideas worth knowing.</p></div>
          <button ref={closeRef} type="button" className="field-guide-close" onClick={() => setOpen(false)} aria-label="Close Field Guide">×</button>
        </div>
        <label className="field-guide-search-label" htmlFor="field-guide-search">LOOK UP A TERM</label>
        <input id="field-guide-search" className="field-guide-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="USDT, reserves, depeg..." />
        <div className="field-guide-results" aria-live="polite">
          {results.length ? results.map((entry) => <article className="field-guide-entry" key={entry.term}>
            <div className="field-guide-entry-heading"><h3>{entry.term}</h3><span>{entry.category}</span></div>
            <p className="field-guide-subtitle">{entry.subtitle}</p>
            <p>{entry.description}</p>
            {entry.link && <a href={entry.link} target="_blank" rel="noopener noreferrer">Project website ↗</a>}
          </article>) : <p className="field-guide-empty">Nothing in the notes yet. Try another term.</p>}
        </div>
        <p className="field-guide-bottom">A short reference, not a complete encyclopedia. Project details can change.</p>
      </aside>
    </div>}
  </>;
}
