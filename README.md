# Certroute — Career Intelligence Platform

A full-stack MVP that analyzes job postings and recommends ranked certifications.

## Tech Stack
- **Frontend/Backend**: Next.js 16 (App Router)  
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Styling**: TailwindCSS + custom CSS variables
- **Matching Engine**: Custom keyword-based skill extractor + weighted scoring algorithm

## Quick Start

```bash
npm install
npm run dev
```
Open http://localhost:3000

## Pages
| Route | Description |
|-------|-------------|
| `/` | Job input form + example presets |
| `/jobs` | All saved job analyses |
| `/jobs/[id]` | Job detail + ranked certification recommendations |
| `/analytics` | Dashboard: top certs, skills, gaps |

## API Routes
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs` | POST | Submit job → extract skills → match → save recommendations |
| `/api/jobs` | GET | List all jobs |
| `/api/jobs/[id]` | GET | Job detail + recommendations |
| `/api/analytics` | GET | Aggregated insights |

## Matching Algorithm

```
final_score = 0.6 × skill_overlap + 0.2 × industry_match + 0.2 × difficulty_fit
```

- **Skill overlap**: matched skills / total extracted job skills  
- **Industry match**: 1 if cert domain === detected job domain  
- **Difficulty fit**: penalizes certs too far from target level (default: entry)

## Certification Database (20 certs across 6 domains)
- ☁️ Cloud/IT: AWS CCP, AWS SAA, AWS Developer, Azure AZ-900, GCP ACE, CompTIA Net+
- 🔒 Cybersecurity: CompTIA Sec+, CEH, Google Cybersecurity
- 📊 Data: Google Data Analytics, SQL Cert, IBM Data Science, Tableau, Excel Expert
- 💹 Finance: CFA L1, Bloomberg Market Concepts
- 📣 Marketing: Google Analytics, Google Ads, HubSpot Marketing
- 💼 Management: PMP

## Production Notes
- Run `supabase/schema.sql` once in the Supabase SQL editor to create tables
- Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your env
- Certifications are auto-seeded from JSON on first API request if the table is empty
- Add OpenAI skill extraction by calling the API in `lib/matcher.ts → extractSkills()`
