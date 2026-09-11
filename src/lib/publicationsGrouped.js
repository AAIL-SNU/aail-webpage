const publications = require("./publications");

const TYPE_ORDER = { journal: 0, conference: 1, preprint: 2 };

function getPubUrl(pub) {
  if (pub.url) return pub.url;
  const m = pub.venue.match(/arXiv:(\d+\.\d+)/);
  if (m) return "https://arxiv.org/abs/" + m[1];
  return "https://scholar.google.com/scholar?q=" + encodeURIComponent(pub.title);
}

// Group by real calendar year only, so preprints sort chronologically
// alongside journal/conference papers instead of being bucketed apart.
const groupMap = {};
publications.forEach(pub => {
  const key = pub.year;
  if (!groupMap[key]) groupMap[key] = { year: pub.year, items: [] };
  groupMap[key].items.push({ ...pub, computedUrl: getPubUrl(pub) });
});

Object.values(groupMap).forEach(group => {
  group.items.sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]);
});

module.exports = Object.values(groupMap).sort((a, b) => parseInt(b.year) - parseInt(a.year));
