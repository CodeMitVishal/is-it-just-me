// @ts-check
// Publisher: writes the Atom feeds (built by domain/feeds.js) to disk, e.g. web/feeds/.
import path from 'node:path';
import { buildFeeds } from '../domain/feeds.js';
import { writeText } from './file-system.js';

/**
 * @param {{ siteRoot: string, siteUrl: string }} options  siteRoot = folder that holds feeds/ (web/)
 * @returns {import('../application/ports.js').Publisher}
 */
export function createAtomFeedPublisher({ siteRoot, siteUrl }) {
  return {
    async publish(snapshot, history) {
      for (const file of buildFeeds(snapshot, history, siteUrl)) await writeText(path.join(siteRoot, file.path), file.content);
    },
  };
}
