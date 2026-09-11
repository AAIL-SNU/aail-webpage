# AAIL Website

The official website of Aerospace Autonomy and Intelligence Laboratory @ Seoul National University

---

## Maintanence guide

All datas are stored in `/src/data`

### Update publications
Add a new publication in `.bibtex` format in `/src/data/publications.bib`

For example,

```latex
@article{example,
  author  = {Author 1 and Author 2},
  title   = {Example Title},
  journal = {Control Engineering Practice},
  year    = {2026},
  volume  = {173},
  number  = {106961},
}
```

### Update members
Modify `src/data/members.json`


### Update projects
Modify `src/data/projects.json`

### Update collaborators
Modify `src/data/collaborators.json`

### Update news / gallery
Write a new article in `.md` format and add in `/src/content/gallery` or `/src/content/news`

## How to run

```bash
git clone https://github.com/AAIL-SNU/aail-webpage.git
npm install
npm run dev
```


### TODO (For maintainers)
- Add permalink url for collaborators
- Publish to `https://aail-snu.github.io`