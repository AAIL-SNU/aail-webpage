const publications = require("./publications");

const TYPE_ORDER = { preprint: 0, journal: 1, conference: 2 };

function getPubUrl(pub) {
  if (pub.url) return pub.url;
  const m = pub.venue.match(/arXiv:(\d+\.\d+)/);
  if (m) return "https://arxiv.org/abs/" + m[1];
  return "https://scholar.google.com/scholar?q=" + encodeURIComponent(pub.title);
}

const groupMap = {};
publications.forEach(pub => {
  const key = pub.type + "__" + pub.year;
  if (!groupMap[key]) groupMap[key] = { type: pub.type, year: pub.year, items: [] };
  groupMap[key].items.push({ ...pub, computedUrl: getPubUrl(pub) });
});

module.exports = Object.values(groupMap).sort((a, b) => {
  if (a.type !== b.type) return TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
  if (a.year === "Preprints") return -1;
  if (b.year === "Preprints") return  1;
  return parseInt(b.year) - parseInt(a.year);
});
