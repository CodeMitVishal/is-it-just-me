// @ts-check
// Publisher: writes the snapshot the website reads (web/data/status.json).
import { writeText } from './file-system.js';

/**
 * @param {string} file
 * @returns {import('../application/ports.js').Publisher}
 */
export function createStatusJsonPublisher(file) {
  return {
    publish: (snapshot) => writeText(file, JSON.stringify(snapshot)),
  };
}
