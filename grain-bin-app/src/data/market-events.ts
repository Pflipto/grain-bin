import type {MarketEvent} from "../lib/timeline";

// Candidate market dates are not production annotations. Source-body verification
// is blocked in this environment; see docs/research/event-source-review.md.
// Populate only after both primary-source verification and owner event selection.
export const marketEvents:MarketEvent[]=[];
