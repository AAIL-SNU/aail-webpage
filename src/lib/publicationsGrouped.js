const publications = require("./publications");

// Group by real calendar year only, so preprints sort chronologically
// alongside journal/conference papers instead of being bucketed apart.
const groupMap = {};
publications.forEach(pub => {
  const key = pub.year;
  if (!groupMap[key]) groupMap[key] = { year: pub.year, items: [] };
  groupMap[key].items.push(pub);
});

// Items keep the year/month order from publications.js.
module.exports = Object.values(groupMap).sort((a, b) => parseInt(b.year) - parseInt(a.year));
