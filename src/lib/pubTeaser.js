const publications = require("./publications");

function getPubUrl(pub) {
  if (pub.url) return pub.url;
  const m = pub.venue.match(/arXiv:(\d+\.\d+)/);
  if (m) return "https://arxiv.org/abs/" + m[1];
  return "https://scholar.google.com/scholar?q=" + encodeURIComponent(pub.title);
}

module.exports = publications
  .filter(p => p.year !== "Preprints")
  .sort((a, b) => parseInt(b.year) - parseInt(a.year))
  .slice(0, 3)
  .map(p => ({ ...p, computedUrl: getPubUrl(p) }));
