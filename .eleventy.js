module.exports = function (eleventyConfig) {
  // ── Passthrough: assets live at repo root ──────────────────────
  eleventyConfig.addPassthroughCopy({ "style.css":   "style.css"   });
  eleventyConfig.addPassthroughCopy({ "images":       "images"      });
  eleventyConfig.addPassthroughCopy({ "robots.txt":   "robots.txt"  });
  eleventyConfig.addPassthroughCopy({ "sitemap.xml":  "sitemap.xml" });
  eleventyConfig.addPassthroughCopy({ "404.html":     "404.html"    });

  // ── Passthrough: interaction-only script ─────────────────────
  eleventyConfig.addPassthroughCopy({ "src/script.js": "script.js" });

  // ── Collections ───────────────────────────────────────────────
  eleventyConfig.addCollection("news", col =>
    col.getFilteredByGlob("src/content/news/*.md")
       .sort((a, b) => b.data.date - a.data.date)
  );
  eleventyConfig.addCollection("gallery", col =>
    col.getFilteredByGlob("src/content/gallery/*.md")
       .sort((a, b) => b.data.date - a.data.date)
  );
  eleventyConfig.addCollection("research", col =>
    col.getFilteredByGlob("src/content/research/*.md")
  );

  // ── Filters ───────────────────────────────────────────────────
  eleventyConfig.addFilter("take", (arr, n) => (arr || []).slice(0, n));

  eleventyConfig.addFilter("monthNum", month => {
    const map = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04",
      May: "05", Jun: "06", Jul: "07", Aug: "08",
      Sep: "09", Oct: "10", Nov: "11", Dec: "12",
    };
    return map[month] || "??";
  });

  eleventyConfig.addFilter("striptags", str =>
    (str || "").replace(/<[^>]+>/g, "").trim()
  );

  function decodeEntities(str) {
    return (str || "")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g,  "'")
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g,   "<")
      .replace(/&gt;/g,   ">")
      .replace(/&amp;/g,  "&");
  }

  eleventyConfig.addFilter("splitFirst", str => {
    const i = (str || "").indexOf(" ");
    return i < 0 ? [str, ""] : [str.slice(0, i), str.slice(i + 1)];
  });

  eleventyConfig.addFilter("padNum", n => String(n).padStart(2, "0"));

  // Serialise to JSON for inline <script> injection
  eleventyConfig.addFilter("json", obj => JSON.stringify(obj));

  // Build NEWS array for modal JS from the collection
  eleventyConfig.addFilter("newsJson", collection =>
    JSON.stringify((collection || []).map(item => ({
      month: item.data.month,
      year:  item.data.year,
      title: item.data.title,
      text:  decodeEntities((item.templateContent || "").replace(/<[^>]+>/g, "").trim()),
      image: item.data.image || "",
    })))
  );

  // Build GALLERY array for modal JS from the collection
  eleventyConfig.addFilter("galleryJson", collection =>
    JSON.stringify((collection || []).map(item => ({
      title: item.data.title,
      date:  item.data.displayDate,
      cover: item.data.cover || "",
      body:  decodeEntities((item.templateContent || "").replace(/<[^>]+>/g, "").trim()),
    })))
  );

  eleventyConfig.addGlobalData("publications",        () => require("./src/lib/publications"));
  eleventyConfig.addGlobalData("pubTeaser",           () => require("./src/lib/pubTeaser"));
  eleventyConfig.addGlobalData("publicationsGrouped", () => require("./src/lib/publicationsGrouped"));

  return {
    dir: {
      input:    "src",
      output:   "_site",
      includes: "_includes",
      data:     "data",
    },
    htmlTemplateEngine:     "njk",
    markdownTemplateEngine: "njk",
  };
};
