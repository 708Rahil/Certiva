# Certificate Data Schema

Use this template to enrich certificate information. Fill out for each certification.

## Template

```json
{
  "id": 1,
  "name": "AWS Cloud Practitioner",
  "provider": "Amazon Web Services",
  "industry": "cloud",
  "difficulty": 1,
  "description": "Entry-level AWS certification covering cloud concepts, core AWS services, security, and pricing.",
  
  // Matching & Skills
  "skills": ["AWS", "cloud computing", "EC2", "S3", "IAM", "billing", "infrastructure", "cloud services"],
  "primary_skills": ["AWS", "cloud computing"],
  "secondary_skills": ["EC2", "S3", "IAM", "billing"],
  
  // Prerequisites
  "prerequisites": [],
  "recommended_prior_knowledge": ["Basic networking", "Cloud fundamentals"],
  "skill_gaps_addressed": ["Cloud computing basics", "AWS service overview"],
  
  // Job Alignment
  "target_job_titles": ["Cloud Support Associate", "Junior Cloud Engineer", "DevOps Engineer", "Solutions Architect"],
  "job_postings_count": 45000,
  "job_postings_source": "LinkedIn Jobs (2026)",
  
  // Career Path
  "next_certs": ["AWS Solutions Architect Associate", "AWS Developer Associate"],
  "prerequisite_for": ["AWS Solutions Architect Professional", "AWS DevOps Engineer Professional"],
  
  // Cost & Time
  "cost": "$100",
  "cost_source": "AWS Official (May 2026)",
  "duration_weeks": 4,
  "study_hours": 40,
  "exam_hours": 1.5,
  "total_hours": 41.5,
  
  // Exam Details
  "exam_format": "Multiple choice, 65 questions",
  "exam_duration_minutes": 90,
  "passing_score": 70,
  "pass_rate_percent": 78,
  "pass_rate_source": "Reddit/certification forums (estimated)",
  
  // Renewal
  "valid_years": 3,
  "renewal_required": true,
  "renewal_cost": "$100",
  "renewal_method": "Retake exam or take newer version",
  
  // Value & ROI
  "salary_boost_low": 2000,
  "salary_boost_high": 5000,
  "salary_boost_source": "Glassdoor/PayScale (estimated)",
  "worth_it_rating": 8.5,
  "top_feedback": "Great entry point, good for job prospects, relatively easy",
  "common_pain_points": ["Exam cost adds up", "Material can be dry"],
  
  // Resources
  "official_course_url": "https://aws.amazon.com/training/",
  "official_course_cost": "Free to ~$200",
  "recommended_study_resources": [
    {
      "name": "Udemy - AWS Cloud Practitioner",
      "provider": "Udemy",
      "cost": "$15",
      "rating": 4.6,
      "hours": 20
    },
    {
      "name": "A Cloud Guru",
      "provider": "ACloudGuru",
      "cost": "$39/month",
      "rating": 4.5,
      "hours": 25
    },
    {
      "name": "Linux Academy Practice Tests",
      "provider": "Linux Academy",
      "cost": "$15",
      "rating": 4.7,
      "hours": 5
    }
  ],
  
  // Market Demand
  "trending": true,
  "trending_note": "Cloud skills in high demand 2024-2026",
  "seasonal_demand": "Peak Q1 & Q3",
  "industry_hotspots": ["Fintech", "Healthcare", "SaaS"],
  
  // Metadata
  "last_verified": "2026-05-20",
  "data_confidence": "high",
  "notes": "Most popular entry-level cloud cert globally"
}
```

## Field Descriptions

| Field | Type | Priority | Notes |
|-------|------|----------|-------|
| `primary_skills` | array | HIGH | Top 2-3 skills this cert teaches |
| `secondary_skills` | array | HIGH | Supporting skills |
| `target_job_titles` | array | HIGH | Jobs that hire for this cert |
| `job_postings_count` | number | HIGH | Estimated job openings |
| `duration_weeks` | number | HIGH | Realistic timeline |
| `pass_rate_percent` | number | MEDIUM | First-attempt success rate |
| `salary_boost_low/high` | number | MEDIUM | USD salary increase |
| `next_certs` | array | MEDIUM | Natural progression path |
| `prerequisites` | array | MEDIUM | Required knowledge |
| `exam_format` | string | MEDIUM | Question types & count |
| `renewal_required` | boolean | LOW | Is recertification needed? |
| `recommended_study_resources` | array | LOW | Best 3rd party courses |
| `worth_it_rating` | number | LOW | 1-10 recommendation score |

## Priority Level

- **HIGH**: Use for matching algorithm & display prominently
- **MEDIUM**: Show in detail view, use for career paths
- **LOW**: Reference info, nice-to-have

## How to Fill Out

1. **Start with HIGH priority fields** for all 20 certs
2. **Use multiple sources**: Official sites, Glassdoor, Reddit, LinkedIn data
3. **Estimate conservatively**: If unsure on salary, use lower range
4. **Add dates**: When you last verified each field
5. **Track confidence**: How sure are you? (high/medium/low)

## Example Sources

- **Official info** (cost, format): Provider websites
- **Job postings**: LinkedIn, Indeed, Glassdoor
- **Pass rates & reviews**: Reddit r/certs, certification forums
- **Salary data**: Glassdoor, PayScale, BLS.gov
- **Study resources**: Udemy, Coursera, A Cloud Guru reviews
