# AEO Attribution Log

## 2026-07-17 AEO page launch

Purpose: record the three AEO pages added for Hotel Dilley so later traffic, search, AI-overview, lead, and conversion changes can be attributed back to this launch.

Source run:
- Factory output: `/Users/matthewbarge/DevProjects/aeofactory-personal/runs/hotel-dilley/hotel-dilley-peec-live-20260717-rerun`
- Peec export: `/Users/matthewbarge/DevProjects/aeofactory-personal/exports/peec-hotel-dilley-2026-07-17-rerun`
- Approval queue: `/Users/matthewbarge/DevProjects/aeofactory-personal/runs/hotel-dilley/hotel-dilley-peec-live-20260717-rerun/09_release/approval_queue.json`

Pages launched:

| Page | URL | Target query / intent |
| --- | --- | --- |
| Modern Efficiency Apartments | `https://hoteldilley.com/modern-efficiency-apartments-dilley` | Where can I find modern efficiency apartments in Dilley? |
| Workforce Housing | `https://hoteldilley.com/workforce-housing-dilley-tx` | Where can an oil field crew find furnished workforce housing near Dilley Texas? |
| Extended-Stay Kitchenettes | `https://hoteldilley.com/extended-stay-kitchenettes-dilley` | What extended-stay lodging in Dilley offers kitchenettes and flexible terms? |

Repository change:
- Git commit: `d7eca77` (`Add AEO landing pages for Hotel Dilley`)
- Added files: `modern-efficiency-apartments-dilley.html`, `workforce-housing-dilley-tx.html`, `extended-stay-kitchenettes-dilley.html`, `aeo-pages.css`, `netlify.toml`
- Updated discovery paths: `index.html`, `robots.txt`, `sitemap.xml`

Deployment:
- Netlify site: `hoteldilley`
- Production URL: `https://hoteldilley.com`
- Deploy ID: `6a5a9389d015408f445eaa4b`
- Deploy logs: `https://app.netlify.com/projects/hoteldilley/deploys/6a5a9389d015408f445eaa4b`

Validation at launch:
- All three live page URLs returned HTTP `200`.
- `https://hoteldilley.com/sitemap.xml` returned HTTP `200`.

Attribution notes:
- Compare analytics, form submissions, phone clicks, AI answers, and search impressions before and after 2026-07-17.
- Track both extensionless URLs above and their `.html` source files if logs expose both forms.
- Treat this as the launch baseline for the three AEO pages unless a later attribution log entry supersedes it.
