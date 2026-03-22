# AdmitGuard v2 — API Contract

## POST /api/applications

**Purpose:** Submit a new applicant for validation, intelligence scoring, and persistence.  
**Authentication:** None in v2 prototype. Add in future hardening.

---

### Request

```json
{
  "applicant": {
    "fullName": "Priya Sharma",
    "email": "priya@example.com",
    "phone": "9876543210",
    "dateOfBirth": "2000-06-15",
    "aadhaarNumber": "123456789012",
    "interviewStatus": "scheduled",
    "offerLetterSent": false
  },
  "education": [
    {
      "level": "10th",
      "boardUniversity": "CBSE",
      "stream": "Science",
      "yearOfPassing": 2016,
      "scoreValue": 85,
      "scoreScale": "percentage",
      "backlogCount": 0,
      "gapAfterLevelMonths": 0,
      "pathTag": "A"
    },
    {
      "level": "12th",
      "boardUniversity": "CBSE",
      "stream": "Science",
      "yearOfPassing": 2018,
      "scoreValue": 78,
      "scoreScale": "percentage",
      "backlogCount": 0,
      "gapAfterLevelMonths": 0,
      "pathTag": "A"
    },
    {
      "level": "UG",
      "boardUniversity": "Mumbai University",
      "stream": "Computer Science",
      "yearOfPassing": 2022,
      "scoreValue": 7.5,
      "scoreScale": "cgpa_10",
      "backlogCount": 0,
      "gapAfterLevelMonths": 0,
      "pathTag": "A"
    }
  ],
  "work": [
    {
      "companyName": "Tech Corp",
      "designation": "Software Engineer",
      "domain": "Software Engineering",
      "startDate": "2022-07-01",
      "endDate": null,
      "isCurrent": true,
      "employmentType": "full_time",
      "keySkills": ["React", "Node.js", "TypeScript"]
    }
  ]
}
```

---

### Responses

#### 422 — Validation Failed (Tier 1 Rejection)

```json
{
  "success": false,
  "errors": {
    "applicant.phone": "Must be a valid 10-digit Indian mobile number starting with 6–9",
    "education[1].yearOfPassing": "Year must be after 10th passing year"
  },
  "flags": []
}
```

#### 200 — Accepted (Clean)

```json
{
  "success": true,
  "status": "ACCEPTED",
  "applicantId": "uuid-v4-string",
  "flags": [],
  "derived": {
    "riskScore": 18,
    "categorization": "Strong Fit",
    "dataQualityScore": 95,
    "experienceBucket": "entry",
    "totalEducationGapMonths": 0,
    "totalWorkExperienceMonths": 33,
    "applicationCompletenessPercent": 98,
    "anomalyFlags": [],
    "softFlags": []
  }
}
```

#### 200 — Accepted with Flags (Tier 2)

```json
{
  "success": true,
  "status": "FLAGGED",
  "applicantId": "uuid-v4-string",
  "flags": [
    "Education gap exceeds 24 months",
    "Backlog count > 0 at UG level"
  ],
  "derived": {
    "riskScore": 52,
    "categorization": "Needs Review",
    "dataQualityScore": 80,
    "experienceBucket": "mid",
    "totalEducationGapMonths": 30,
    "totalWorkExperienceMonths": 48,
    "applicationCompletenessPercent": 92,
    "anomalyFlags": ["too_many_domain_switches"],
    "softFlags": ["Education gap exceeds 24 months", "Backlog count > 0 at UG level"]
  }
}
```

---

## GET /api/health

```json
{
  "status": "ok",
  "timestamp": "2025-03-21T11:37:00.000Z"
}
```
