// @ts-check
// Small file helpers + the HistoryStore implementation (data/history.json).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

/** @param {string} file */
export async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

/** @param {string} file @param {string} content */
export async function writeText(file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

/**
 * @param {string} file
 * @returns {import('../application/ports.js').HistoryStore}
 */
export function createHistoryStore(file) {
  return {
    async load() {
      try { return await readJson(file); } catch { return {}; } // first run: no history yet
    },
    async save(history) {
      await writeText(file, JSON.stringify(history, null, 1) + '\n');
    },
  };
}
