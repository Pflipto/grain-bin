# SB: Grain Bin

## Project purpose

SB: Grain Bin is a personal analytics and learning project within the broader Shelterbelt portfolio.

Its purpose is to explore the stablecoin market through accessible, data-driven tools, starting with supply, market capitalization, issuer concentration, and market structure.

This is a learning project first, a useful tool second, and a potential portfolio case study third.

## Developer context

The project owner is a product manager learning technical development.

- Comfortable with basic APIs, Postman, and editing code.
- Uses AI to implement most code while learning the underlying concepts.
- Has approximately 3–5 hours per week for development.
- Values simplicity, reliability, and understandable architecture over technical sophistication.

## Engineering principles

1. **Keep it simple.** Prefer straightforward solutions over clever abstractions.
2. **Build incrementally.** Make small, focused changes rather than broad rewrites.
3. **Preserve working functionality.** Avoid unrelated changes.
4. **Validate before delivery.** Run the build, TypeScript checks, and relevant tests when available.
5. **Be explicit about uncertainty.** Never claim code works unless it has been tested.
6. **Avoid unnecessary dependencies.** Explain why any new package is needed.
7. **Protect credentials.** Never commit API keys, tokens, or secrets.
8. **Respect data integrity.** Do not silently substitute missing values with zero or present estimates as verified figures.

## Product principles

- Prioritize understandable, useful stablecoin market insights.
- Make data sources, timestamps, and methodology visible.
- Distinguish circulating supply, market capitalization, and other financial metrics.
- Prefer trustworthy data over impressive-looking dashboards.
- Build reusable foundations without overengineering for hypothetical future features.

## Working with the project owner

Before implementing substantial changes:

- Explain the proposed approach and why it makes sense.
- Identify meaningful tradeoffs.
- Flag changes that could introduce cost, complexity, or breaking behavior.

After implementing changes:

- Summarize what changed in plain English.
- Explain one or two important technical concepts.
- Report which tests and build checks passed or failed.
- Identify remaining limitations.

Avoid overwhelming the owner with implementation details unless requested.

## Git and deployment

- Use focused branches and descriptive commits.
- Do not push directly to the main branch unless explicitly requested.
- Prefer reviewable pull requests.
- Do not modify production configuration, deployment settings, or secrets without approval.
- Never deploy to production without explicit authorization.

## Initial assignment

Before making feature changes, inspect the existing repository and establish a reliable development baseline.

Identify build failures, TypeScript errors, data-quality risks, and the highest-priority improvements.

Do not rewrite the application simply to improve its architecture.
