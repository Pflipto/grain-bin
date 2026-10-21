# Grain Bin 🌾

### Notes on a New Kind of Money

*A Shelterbelt project · Experiment 001*

[**Explore Grain Bin ↗**](https://grain-bin.vercel.app/) · [**Meet the maker ↗**](https://www.linkedin.com/in/thomas-pflipsen/)

---

Stablecoins are an unusual corner of finance: digital tokens designed to hold a familiar value, growing into a market with its own institutions, patterns, and unanswered questions.

**Grain Bin is my field journal for making sense of it.** A small, evolving place to follow the numbers, notice what changes, and learn a little more with each experiment.

No trading signals. No predictions dressed up as facts. Just a clearer view of what's there.

## What's in the bin?

- **The market at a glance.** Total circulating supply of USD-pegged stablecoins.
- **Signs of movement.** The change in historical circulating supply over roughly 30 days.
- **The long view.** A one-year chart of circulating supply.
- **Where the dollars gather.** USDT, USDC, and the rest of the USD-pegged market, including the combined share of the two largest tokens.
- **A Field Guide.** A searchable, right-side glossary of projects and concepts, from USDT and USDC to reserves and depegs.
- **Questions for further study.** Observations that point toward the next investigation, without pretending to know the answer.

The goal is to make the market approachable, not to make it sound simple.

## Where the numbers come from

Market data comes from [DefiLlama's stablecoin dataset](https://defillama.com/stablecoins). The app reads its stablecoin list and aggregate supply history, focusing on **USD-pegged assets**.

A few useful distinctions:

- **Supply is not trading volume.** These charts describe tokens in circulation, not how frequently they change hands.
- **The 30-day comparison uses historical snapshots.** It may differ slightly from a comparison against the current token-level total.
- **Market share is based on circulating supply**, grouped here into USDT, USDC, and other USD-pegged assets.
- Data requests are cached for up to **one hour**. Values are estimates from a third-party dataset and may be revised.

Grain Bin is an independent learning project, not an investment recommendation.

## Why I built it

I'm a product manager learning to work closer to the code. Shelterbelt is the workshop for that process: a collection of useful, small products built with curiosity, deliberate product decisions, and AI-assisted development.

Grain Bin is the first experiment. The subject is stablecoins, but the broader work is learning to turn a question into a usable product, ship it, inspect what works, and improve it in public.

**The working rhythm:** frame the problem → build with AI assistance → review the changes → test a preview → merge and learn.

## Under the hood

- **Next.js App Router**, **React**, and **TypeScript**
- **CSS / Tailwind CSS** for the interface
- **DefiLlama** for stablecoin market data
- **Vercel** for deployment and pull-request previews
- **GitHub** for source control and incremental feature work

The visual language is deliberately a little different from the typical crypto dashboard: warm paper, agricultural colors, editorial typography, and the restraint of a well-kept notebook. The shared design notes live in [`brand/BRAND.md`](brand/BRAND.md).

## Run it yourself

The Next.js app lives in the **`grain-bin-app/`** subdirectory.

```bash
git clone https://github.com/Pflipto/grain-bin.git
cd grain-bin/grain-bin-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run a production build:

```bash
npm run build
npm run start
```

The dashboard requests public DefiLlama endpoints at runtime, so an internet connection is needed for live data. No API key is currently required.

## The next questions

Grain Bin is intentionally small. Future investigations might explore how supply shifts between issuers, how stablecoins spread across blockchains, and what concentration looks like over time.

Those are directions for further study, not features already shipped.

---

**Grain Bin is a [Shelterbelt](https://github.com/Pflipto) project.** Build useful things.

Made by [Thomas Pflipsen](https://www.linkedin.com/in/thomas-pflipsen/) · [GitHub](https://github.com/Pflipto)
