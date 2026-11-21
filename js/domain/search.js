// @ts-check
// Domain: "Which tool isn't working for you?" — find services by name, description or alias.
import { bySeverity } from './status.js';

/**
 * Scores how well a service matches the query (0 = no match).
 * @param {import('./status.js').Service} s
 * @param {string} q  lowercase, trimmed
 */
export function matchScore(s, q) {
  const name = s.name.toLowerCase();
  const haystack = `${name} ${s.sub} ${s.aka}`.toLowerCase();
  const words = haystack.split(/[\s,()]+/);
  if (name === q) return 5;
  if (name.startsWith(q)) return 4;
  if (words.includes(q)) return 3;
  if (words.some((w) => w.startsWith(q))) return 2;
  if (haystack.includes(q)) return 1;
  return 0;
}

/**
 * @param {import('./status.js').Service[]} services
 * @param {string} query
 * @returns {import('./status.js').Service[] | null}  null when there is no query
 */
export function searchServices(services, query) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return services
    .map((s) => ({ s, score: matchScore(s, q) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || bySeverity(a.s, b.s))
    .map((m) => m.s);
}
