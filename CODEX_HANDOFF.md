# Codex Handoff: Shelterbelt / SB: Grain Bin

**Prepared:** October 21, 2026  
**Read first:** Root-level `AGENTS.md` (PR #12 if not yet merged). This document provides project context and priorities; AGENTS.md contains standing working rules.

## Project and owner context

Shelterbelt is a personal portfolio of useful software experiments, intended to build technical fluency and demonstrate hands-on product judgment. Its tagline is **“Build useful things.”**

**SB: Grain Bin** is Experiment 001: a stablecoin market analytics and learning tool. The owner is a product manager who has used APIs/Postman and edited code, but uses AI for most implementation while learning. Available development time is about **3–5 hours per week**. Prioritize understandable, reliable, incremental work over sophistication.

- Repository: https://github.com/Pflipto/grain-bin
- App directory: `grain-bin-app/`
- Production: https://grain-bin.vercel.app/
- Stack: Next.js, TypeScript, Vercel
- Purchased parent domain: **shelterbelt.xyz**, registered through **Cloudflare Registrar**
- Target Grain Bin domain: **grainbin.shelterbelt.xyz**
- Target parent site: **https://shelterbelt.xyz**

The custom domain and parent-site setup have **not been confirmed completed**. Inspect actual state before proposing DNS or deployment steps.

## Product and design identity

Grain Bin is “a field journal of digital dollars,” with headline **“Notes on a New Kind of Money.”** Visual direction is approximately **60% Digital Agrarian / 40% Modern Editorial**: dark greens, wheat tones, paper-inspired surfaces, editorial serif typography, and restrained visualizations. Preserve existing design; do not convert it into a generic crypto/fintech dashboard.

The goal is a trustworthy, accessible overview of stablecoin supply and market structure, with deeper analytics as a later phase. This is learning first, usefulness second, portfolio case study third.

## Current data implementation and unresolved reconciliation

Data comes from DefiLlama public endpoints:
- `https://stablecoins.llama.fi/stablecoins?includePrices=true`
- `https://stablecoins.llama.fi/stablecoincharts/all`

PR #9 (merged) aligned the headline, monthly change, and historical chart to the historical USD-valued circulating supply aggregate. Do not conflate this with DefiLlama's website market-cap metric.

A diagnostic on **October 21, 2026** returned:
- Historical USD-pegged aggregate: **$303.42B**
- Sum of individual USD-pegged asset supply: **$304.19B**
- Individual supply multiplied by reported token prices: **$303.85B**
- DefiLlama website USD-pegged market cap observed separately: **about $299.38B**
- 333 USD-pegged assets; 87 missing prices

The **~$4.04B** historical-aggregate-versus-website gap remains unexplained. Differences in timing, coverage, methodology, or pricing are hypotheses, not established causes. Never fabricate exclusions or force agreement. The agreed product direction is to label the API headline **“USD-Pegged Circulating Value,”** document source/methodology/as-of time, and use the individual-asset total as the denominator for individual market shares.

PR status at handoff (verify current state):
- **#9** historical aggregate alignment: merged
- **#10** temporary reconciliation API route: open at last check
- **#11** methodology and concentration fixes: open at last check; a TypeScript denominator fix was pushed after a failed build
- **#12** root `AGENTS.md`: opened for review

## Recent engineering problem

Several Vercel preview builds failed. Issues included a Next.js configuration conflict with a dynamic route setting and a TypeScript `number | null` argument passed where `number` was required. The latest known TypeScript fix was pushed to PR #11, **but build success was not independently verified**.

Do not claim builds or tests pass without running them. A reliable baseline is the immediate prerequisite for further work.

## Next five priorities, in order

### 1. Establish a reliable engineering baseline

Inspect repository, branches, and open PRs. Identify package manager, available scripts, build and TypeScript errors, and data-quality risks. Run the production build and relevant tests. Propose lightweight automated PR checks so failures are detected before review. Do not rewrite architecture.

**Acceptance:** Known failures are identified/resolved through focused reviewed changes, and there is a reproducible validation workflow.

### 2. Configure Grain Bin's custom domain

**Target:** `grainbin.shelterbelt.xyz`.

Check current Vercel project/domain and Cloudflare DNS state. Recommend exact Vercel domain configuration and DNS records using values actually shown by Vercel. Confirm HTTPS, routing, and canonical/redirect behavior. Preserve `grain-bin.vercel.app` access where practical.

**Important:** Domain/DNS and production deployment changes require explicit owner approval. Codex should present the plan first, not silently execute infrastructure changes.

### 3. Establish the parent Shelterbelt website

**Target:** `https://shelterbelt.xyz`.

Create a minimal, polished parent landing page with Shelterbelt identity, tagline **“Build useful things,”** a short explanation of the experiments, and a featured link to Grain Bin, with room for future projects. Keep design consistent with Digital Agrarian / Modern Editorial. No CMS or unnecessary infrastructure.

**Owner's architecture preference:** Use a **separate GitHub repository and separate Vercel project** for the Shelterbelt parent site, so each experiment has an independent codebase and deployment lifecycle. Evaluate that preference and briefly explain any compelling alternative before implementation. Do not create repositories or deployment projects without approval.

### 4. Connect navigation and branding

Add a clear parent Shelterbelt link in Grain Bin, and a Grain Bin entry on the parent site. Keep project naming consistent, links accessible, and mobile behavior solid. Preserve independent deployments.

**Acceptance:** Visitors can navigate between parent portfolio and Experiment 001 without confusion.

### 5. Prepare Grain Bin for a public portfolio presentation

Review data labels, source methodology, UTC timestamps, responsive layout, error/loading/empty states, and README. Finish or document the outstanding DefiLlama discrepancy. Explain the problem, design decisions, implementation, and lessons learned in accessible terms.

**Acceptance:** A visitor can understand what Grain Bin measures, where the data comes from, and why it is a credible first Shelterbelt experiment.

## Later product ideas (not the immediate infrastructure roadmap)

After the five items above: issuer/stablecoin concentration trends, a sortable stablecoin explorer, and chain-level supply analysis. These are candidates, not committed scope. Verify underlying data quality before adding them.

## Collaboration and approval rules

- Prefer small, focused PRs and plain-English explanations.
- Explain approach, tradeoffs, costs, and breaking risks before substantial changes.
- After changes, report exactly which build/tests ran and their outcomes.
- Teach one or two useful technical concepts, without overwhelming the owner.
- Do not push directly to main, merge PRs, alter production configuration, change DNS, create paid resources, or deploy to production without explicit approval.
- Do not commit secrets.
- Preserve working functionality and existing visual identity.

## First Codex assignment

**Read `AGENTS.md` and this handoff. Do not make code or infrastructure changes yet.**

1. Audit current repository structure and data flow.
2. Run available build, TypeScript, and test checks, reporting actual results.
3. Check current PR statuses and identify integration risks.
4. Assess data integrity and outstanding metric discrepancies.
5. Recommend the next **three small PRs** and a separate **domain/DNS deployment checklist**, identifying every step that requires owner approval.
6. Assess whether the Shelterbelt parent site should live in a separate repository/Vercel project (preferred).

Return a concise assessment with proposed sequencing, complexity, acceptance criteria, and any questions that genuinely block implementation.
