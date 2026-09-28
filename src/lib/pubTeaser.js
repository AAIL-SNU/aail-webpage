const publications = require("./publications");

module.exports = publications
  .filter(p => p.year !== "Preprints")
  .sort((a, b) => parseInt(b.year) - parseInt(a.year))
  .slice(0, 3);
