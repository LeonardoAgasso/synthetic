# Synthetic

A public, sourced register of brands that have said they use AI-generated models in their advertising. It also lists brands that have pledged not to.

It's a static site built for GitHub Pages: no build step, no dependencies, no cookies.

```
synthetic/
├── index.html               Main page (register, filters, search)
├── how-it-works.html        How it works: criteria, corrections, privacy
├── data/
│   └── brands.json          The data: the only file to edit when adding cases
├── assets/
│   ├── config.js            Repo URL, external form, email
│   ├── common.js            Interface strings and links
│   ├── app.js               Filters, list, CSV export
│   ├── style.css
│   ├── favicon.svg
│   ├── og-image.png         Preview image for links shared on social media and chat apps
│   └── fonts/               Archivo font, self-hosted (OFL licence)
├── scripts/
│   └── validate.py          Checks that brands.json is valid
├── .github/
│   ├── ISSUE_TEMPLATE/      "Report a brand" and "Request a correction" forms
│   └── workflows/
│       └── validate.yml     Runs the data check on every push
└── .nojekyll
```

## Before publishing

1. **Replace `YOUR-USERNAME`** with your GitHub username in `index.html` (in the `og:` tags), and check `repoUrl` in `assets/config.js`. If your repository isn't called `synthetic`, change that too.
2. **Double-check the sources of the initial cases.** The entries in `data/brands.json` were compiled from press articles: open every link and check that it really says what the entry reports. Some articles may be paywalled or no longer online. This is the most important step, because a wrong attribution is the main risk for a project like this.
3. Optional: choose a licence. A common combination is MIT for the code and CC BY 4.0 for the data, so journalists and researchers know how they can reuse it.

## Running it locally

The site loads `data/brands.json`, and browsers block that if you open `index.html` by double-clicking it. You need a small local server:

```bash
cd synthetic
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Alternatively, with Node.js: `npx serve`.

## Publishing on GitHub Pages

1. Create an empty **public** repository at <https://github.com/new> (no README, no licence).
2. From the project folder:

   ```bash
   git init
   git add .
   git commit -m "First version"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/synthetic.git
   git push -u origin main
   ```

   With the GitHub CLI, this is enough: `gh repo create synthetic --public --source=. --push`

3. In the repository, go to **Settings → Pages**. Under "Build and deployment" choose **Deploy from a branch**, then branch `main` and folder `/ (root)`, and save.
4. After a couple of minutes the site is live at `https://YOUR-USERNAME.github.io/synthetic/`.
5. Go to **Issues → Labels** and create the `report` and `correction` labels: the forms use them, but GitHub only applies labels that already exist.

## Adding a case

Add an object to the `entries` list in `data/brands.json` and update the `updated` date at the top of the file.

| Field | Contents |
|---|---|
| `id` | Unique identifier, lowercase with hyphens: `guess-2025-vogue` |
| `brand` | Brand name |
| `category` | `ai` (uses AI models) or `no-ai` (pledged not to use them) |
| `sector` | `fashion`, `ecommerce`, `food`, `beauty`, `tech`, `auto`, `other` |
| `country` | Two-letter code of the brand's country: `IT`, `US`, `DE`… |
| `date` | When it came out or was disclosed: `2025`, `2025-08` or `2025-08-14` |
| `uses` | One or more of `campaign`, `social`, `ecommerce`, `video`, `digital-twins`, `virtual-influencer`. Empty for `no-ai` cases |
| `note` | What happened |
| `disclosure` | How the brand disclosed it |
| `sources` | One or more sources: `{ "publisher": "...", "date": "...", "url": "https://..." }` |

Then check the data before pushing:

```bash
python3 scripts/validate.py
```

The same check runs automatically on GitHub on every push that touches `data/` (**Actions** tab).

To add a new sector or use, update it in both `scripts/validate.py` and `assets/common.js`.

## Handling reports

People use the "Report a brand" button, which opens a structured form on GitHub. A simple workflow: verify the source, add the entry to `brands.json`, and close the report with a link to the commit.

People without a GitHub account can't open reports. If you want to collect them too, create a Google Form and paste its URL into `reportFormUrl` in `assets/config.js`: the "Report a brand" buttons will point there. You can also set a `contactEmail` for corrections.

Every entry has a "Report an error" link that opens the correction form pre-filled with the entry's name.

## Privacy and legal notes

- The site uses no cookies or analytics, and stores nothing in the browser. The font is hosted in the repository rather than on Google Fonts, so visitors' IP addresses aren't sent to third parties.
- GitHub Pages may log visitors' IP addresses for security purposes: the "How it works" page says so too.
- The Archivo font is distributed under the SIL Open Font License (`assets/fonts/OFL.txt`).
- The rules that protect the project are already written in `how-it-works.html`: only disclosed or confirmed cases, a source for every entry, no campaign images, quick and traceable corrections.
