// @ts-check
// The service's official icon (taken from its own status page, stored in web/icons/).
// Falls back to a neutral letter tile if there is no icon or it fails to load.
import { el } from '../dom.js';
import { monogram } from '../messages.js';

/** @param {import('../../domain/status.js').Service} service */
export function serviceLogo(service) {
  const tile = el('span', 'mono');
  if (!service.icon) {
    tile.textContent = monogram(service.name);
    return tile;
  }
  const img = el('img', 'logo');
  img.src = service.icon; // validated in the domain: same-site "icons/…" paths only
  img.alt = '';           // decorative: the name is always written right next to it
  img.width = 24;
  img.height = 24;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', () => { tile.classList.remove('has-logo'); tile.replaceChildren(monogram(service.name)); }, { once: true });
  tile.classList.add('has-logo');
  tile.append(img);
  return tile;
}
