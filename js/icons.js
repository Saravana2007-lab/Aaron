/* ==========================================================================
   Aaron Recovery — Icon set
   A small, consistent line-icon library (stroke-based, currentColor) used
   in place of emoji throughout the app for a calmer, more premium feel.
   Each entry is inner SVG markup; wrap with svgIcon() to get a full <svg>.
   ========================================================================== */

const ICON_PATHS = {
  home: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10.2V20a1 1 0 0 0 1 1h3v-6.5h4V21h3a1 1 0 0 0 1-1v-9.8"/>',
  calendar: '<rect x="3.5" y="5.5" width="17" height="15.5" rx="2.2"/><path d="M3.5 9.8h17"/><path d="M8 3.3v4"/><path d="M16 3.3v4"/>',
  droplet: '<path d="M12 3.2c3.6 4.2 6.2 7.7 6.2 10.6a6.2 6.2 0 0 1-12.4 0c0-2.9 2.6-6.4 6.2-10.6z"/>',
  trending: '<path d="M4 16.5 9 11l4 3 6.5-7.3"/><path d="M15.2 6.2h4.3v4.3"/>',
  dots: '<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>',
  leaf: '<path d="M19.5 4.5C10 4.5 4.5 10 4.5 19.5c9.5 0 15-5.5 15-15z"/><path d="M5.5 18.5 18 6"/>',
  clipboardCheck: '<rect x="5" y="4" width="14" height="17" rx="2.2"/><path d="M9 4h6v2.4H9z"/><path d="M8.5 13.2l2.3 2.3 4.7-4.9"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2.2"/><path d="M9 4h6v2.4H9z"/><path d="M8.5 11.2h7"/><path d="M8.5 14.6h7"/><path d="M8.5 18h4"/>',
  utensils: '<path d="M7.5 3.2v6.6a1.9 1.9 0 1 0 3.8 0V3.2"/><path d="M9.4 9.8V21"/><path d="M15.8 3.2c-1.4.4-2.2 2-2.2 4.1s.8 3.7 2.2 4.1"/><path d="M15.8 3.2V21"/>',
  receipt: '<path d="M6.5 3h11v18l-2-1.4-1.8 1.4-1.8-1.4L10 21l-1.8-1.4L6.5 21z"/><path d="M9.3 8.2h5.4"/><path d="M9.3 11.8h5.4"/>',
  flame: '<path d="M12 3.3c1 3.1-2.6 4.2-2.6 7.7a2.6 2.6 0 1 0 5.2 0c0-1.3-.8-1.9-.8-3.1 1 1 1.9 2.9 1.9 5a4.7 4.7 0 1 1-9.4 0C5.3 8.6 8.9 7.3 12 3.3z"/>',
  fruit: '<path d="M12 8.3c-3 0-5.2 2.3-5.2 5.4a5.7 5.7 0 0 0 10.9 2.3 5.7 5.7 0 0 0-.5-7.7C16.2 9 14.4 8.3 12 8.3z"/><path d="M12 8.3c-.2-2 .1-3.4 1.6-4.4"/><path d="M9.6 5.9c1 .5 1.8 1.2 2.1 2.1"/>',
  cart: '<circle cx="9" cy="20.2" r="1.3"/><circle cx="17" cy="20.2" r="1.3"/><path d="M3 4h2.2l2.3 12.1a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L20.5 8H6.1"/>',
  lifeBuoy: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M6.1 6.1l3.4 3.4"/><path d="M14.5 14.5l3.4 3.4"/><path d="M17.9 6.1l-3.4 3.4"/><path d="M9.5 14.5l-3.4 3.4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.4 4.4l2.1 2.1M17.5 17.5l2.1 2.1M2.5 12h3M18.5 12h3M4.4 19.6l2.1-2.1M17.5 6.5l2.1-2.1"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="M19.8 19.8 15.5 15.5"/>',
  phone: '<path d="M6.3 3h2.9l1.4 4.3-2 1.8a12.3 12.3 0 0 0 6 6l1.8-2 4.3 1.4V18a2 2 0 0 1-2 2C10.8 20 4 13.2 4 5.3a2 2 0 0 1 2-2z"/>',
  alertTriangle: '<path d="M12 4 2.2 20.5h19.6z"/><path d="M12 10.3v3.6"/><path d="M12 16.9h.01"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.6 2.6L16.2 9"/>',
  egg: '<path d="M12 3.2c-4.1 5-6.3 9.7-6.3 12.6a6.3 6.3 0 1 0 12.6 0c0-2.9-2.2-7.6-6.3-12.6z"/>',
  salad: '<path d="M4 13.2a8 8 0 0 1 16 0z"/><path d="M4 13.2h16"/><path d="M8.2 13.2c0-3 .8-5 .8-5"/><path d="M12 13.2c0-4 .8-6.4.8-6.4"/><path d="M15.8 13.2c0-3-.8-5-.8-5"/>',
  bowl: '<path d="M4 12.3a8 8 0 0 0 16 0z"/><path d="M4 12.3h16"/><path d="M12 4.3v4"/>',
  cup: '<path d="M7.2 9h9.6l-1 9.2a2 2 0 0 1-2 1.8h-3.6a2 2 0 0 1-2-1.8z"/><path d="M7.2 9V5.8h9.6V9"/>',
  building: '<rect x="5" y="9" width="14" height="12" rx="1.2"/><path d="M9.2 21v-4h5.6v4"/><path d="M9.2 5h5.6v4H9.2z"/>',
  square: '<rect x="5" y="5" width="14" height="14" rx="3"/>',
  medal: '<circle cx="12" cy="9" r="5.2"/><path d="M9 13.6 7 21l5-2.6 5 2.6-2-7.4"/>',
  dash: '<path d="M6 12h12"/>',
  moon: '<path d="M20 14.8A8.5 8.5 0 1 1 9.2 4a7 7 0 0 0 10.8 10.8z"/>',
};

function svgIcon(name, size) {
  const s = size || 20;
  const inner = ICON_PATHS[name];
  if (!inner) return "";
  return `<svg class="icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

function renderStaticIcons(root) {
  const scope = root || document;
  scope.querySelectorAll("[data-icon]").forEach((el) => {
    const name = el.getAttribute("data-icon");
    const size = parseInt(el.getAttribute("data-icon-size") || "20", 10);
    el.innerHTML = svgIcon(name, size);
  });
}
