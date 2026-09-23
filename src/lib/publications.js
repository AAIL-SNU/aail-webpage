// Parses content/publications.bib at Eleventy build time.
// No pre-generated JSON needed — .bib is the single source of truth.
const fs   = require("fs");
const path = require("path");

// ── BibTeX parser ─────────────────────────────────────────────

function readBraced(text, pos) {
  let depth = 0, start = pos + 1, i = pos;
  while (i < text.length) {
    if (text[i] === "{")      depth++;
    else if (text[i] === "}") { depth--; if (depth === 0) return [text.slice(start, i), i + 1]; }
    i++;
  }
  return [text.slice(start), text.length];
}

function readQuoted(text, pos) {
  let i = pos + 1, start = i;
  while (i < text.length) {
    if (text[i] === "\\") { i += 2; continue; }
    if (text[i] === '"')  return [text.slice(start, i), i + 1];
    i++;
  }
  return [text.slice(start), text.length];
}

function parseBibtex(text) {
  const entries = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    while (i < n && /\s/.test(text[i])) i++;
    if (i < n && text[i] === "%") { while (i < n && text[i] !== "\n") i++; continue; }
    if (i >= n) break;
    if (text[i] !== "@") { i++; continue; }
    i++;

    const typeStart = i;
    while (i < n && /[a-zA-Z_]/.test(text[i])) i++;
    const entryType = text.slice(typeStart, i).toLowerCase();

    while (i < n && text[i] !== "{") i++;
    if (i >= n) break;
    i++;

    while (i < n && /\s/.test(text[i])) i++;

    const keyStart = i;
    while (i < n && !/[,}\s]/.test(text[i])) i++;
    const key = text.slice(keyStart, i).trim();

    while (i < n && /\s/.test(text[i])) i++;
    if (i < n && text[i] === ",") i++;

    const entry = { ENTRYTYPE: entryType, ID: key };

    while (i < n) {
      while (i < n && /\s/.test(text[i])) i++;
      if (i >= n) break;
      if (text[i] === "}") { i++; break; }

      const fnStart = i;
      while (i < n && !/[=\s}]/.test(text[i])) i++;
      const fname = text.slice(fnStart, i).trim().toLowerCase();
      if (!fname) { i++; continue; }

      while (i < n && /\s/.test(text[i])) i++;
      if (i >= n || text[i] !== "=") continue;
      i++;

      while (i < n && /\s/.test(text[i])) i++;
      if (i >= n) break;

      let value;
      if      (text[i] === "{") { [value, i] = readBraced(text, i); }
      else if (text[i] === '"') { [value, i] = readQuoted(text, i); }
      else {
        const vStart = i;
        while (i < n && !/[,}\n\r]/.test(text[i])) i++;
        value = text.slice(vStart, i).trim();
      }

      entry[fname] = value.replace(/\s+/g, " ").trim();

      while (i < n && /\s/.test(text[i])) i++;
      if (i < n && text[i] === ",") i++;
    }

    if (key && !["comment", "string", "preamble"].includes(entryType)) {
      entries.push(entry);
    }
  }
  return entries;
}

// ── LaTeX / author helpers ────────────────────────────────────

const MONTHS = {
  "1":"January","2":"February","3":"March","4":"April",
  "5":"May","6":"June","7":"July","8":"August",
  "9":"September","10":"October","11":"November","12":"December",
  jan:"January",feb:"February",mar:"March",apr:"April",
  may:"May",jun:"June",jul:"July",aug:"August",
  sep:"September",oct:"October",nov:"November",dec:"December",
};

function cleanLatex(t) {
  if (!t) return "";
  const subs = [
    ["---","—"],["--","–"],["``","“"],["''","”"],
    ["\\&","&"],["\\%","%"],["\\$","$"],
    ['\\"a',"ä"],['\\"o',"ö"],['\\"u',"ü"],['\\"A',"Ä"],['\\"O',"Ö"],['\\"U',"Ü"],
    ["\\'e","é"],["\\'a","á"],["\\'o","ó"],["\\'i","í"],
    ["\\`e","è"],["\\`a","à"],["\\ss","ß"],["\\Pi","Π"],["\\pi","π"],
  ];
  for (const [s, d] of subs) t = t.split(s).join(d);
  t = t.replace(/\\text\w+\{([^}]*)\}/g, "$1")
       .replace(/\\emph\{([^}]*)\}/g, "$1")
       .replace(/\{([^{}]*)\}/g, "$1")
       .replace(/\\[a-zA-Z]+\s*/g, "")
       .replace(/[{}]/g, "");
  return t.trim();
}

function formatAuthors(str) {
  if (!str) return "";
  return str.split(/\s+and\s+/i).map(raw => {
    const a = cleanLatex(raw.trim());
    if (!a) return "";
    if (a.includes(",") && !/^[A-Z][-.]/.test(a)) {
      const [last, firstRaw = ""] = a.split(",", 2);
      const initials = firstRaw.trim().split(/\s+/).map(tok => {
        if (tok.includes("-")) return tok.split("-").map(x => x ? x[0] + "." : "").join("-");
        return (tok && !tok.endsWith(".")) ? tok[0] + "." : tok;
      });
      return `${initials.join(" ")} ${last.trim()}`.trim();
    }
    return a;
  }).filter(Boolean).join(", ");
}

function buildVenue(entry) {
  const etype = (entry.ENTRYTYPE || "").toLowerCase();
  if (entry.venue) return entry.venue;

  if (etype === "article") {
    const j = cleanLatex(entry.journal || "");
    const v = cleanLatex(entry.volume  || "");
    const n = cleanLatex(entry.number  || "");
    const p = cleanLatex(entry.pages   || "").replace(/--/g, "–");
    const parts = j ? [`<em>${j}</em>`] : [];
    if (v) parts.push(`Vol. ${v}`);
    if (n) parts.push(`No. ${n}`);
    if (p) parts.push(`pp. ${p}`);
    return parts.join(", ");
  }

  if (["inproceedings","conference","proceedings"].includes(etype)) {
    const bt   = cleanLatex(entry.booktitle || "");
    const addr = cleanLatex(entry.address   || "");
    return [bt, addr].filter(Boolean).join(", ");
  }

  const eprint = entry.eprint || "";
  if (eprint) {
    const mRaw  = (entry.month || "").trim();
    const yRaw  = (entry.year  || "").trim();
    const mName = MONTHS[mRaw.toLowerCase()] || (mRaw ? mRaw.charAt(0).toUpperCase() + mRaw.slice(1) : "");
    const date  = [mName, yRaw].filter(Boolean).join(" ");
    return `arXiv:${eprint}` + (date ? `, ${date}` : "");
  }

  return cleanLatex(entry.note || entry.howpublished || "");
}

function entryToPub(entry) {
  const etype = (entry.ENTRYTYPE || "").toLowerCase();
  let type = etype === "article" ? "journal"
    : ["inproceedings","conference","proceedings"].includes(etype) ? "conference"
    : "preprint";
  if (entry.aail_type) type = entry.aail_type.trim();

  let url = entry.url || "";
  const doi = entry.doi || "";
  if (!url && doi) url = doi.startsWith("http") ? doi : `https://doi.org/${doi}`;

  // Most entries carry the DOI inside `url` rather than a `doi` field.
  let doiId = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, "");
  if (!doiId) {
    const m = url.match(/^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/);
    if (m) doiId = m[1];
  }

  return {
    type,
    year:    cleanLatex(entry.year || ""),
    title:   cleanLatex(entry.title  || ""),
    authors: formatAuthors(entry.author || ""),
    venue:   buildVenue(entry),
    url,
    doi:     doiId,
  };
}

// ── Load and export ───────────────────────────────────────────

const bibPath = path.join(__dirname, "../content/publications.bib");
const text    = fs.readFileSync(bibPath, "utf-8");

const TYPE_ORDER = { journal: 0, conference: 1, preprint: 2 };

const pubs = parseBibtex(text)
  .map(e => { try { return entryToPub(e); } catch { return null; } })
  .filter(Boolean)
  .sort((a, b) => {
    const dy = (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
    if (dy !== 0) return dy;
    return (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99);
  });

module.exports = pubs;
