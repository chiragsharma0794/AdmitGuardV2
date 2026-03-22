# AdmitGuard v2 — Test Cases

## Manual Test Personas

### Persona 1: Standard-path Fresher (should ACCEPT)
```
Name: Priya Sharma
DOB: 2000-06-15
Email: priya.sharma@example.com
Phone: 9876543210
Aadhaar: 123456789012

Education Path: A
  10th: CBSE, Science, 2016, 85%, Percentage
  12th: CBSE, Science, 2018, 78%, Percentage
  UG: Mumbai University, Computer Science, 2022, 7.5 CGPA, cgpa_10, 0 backlogs

Work: None
```
Expected: `ACCEPTED`, categorization `Needs Review` or `Strong Fit`

---

### Persona 2: Diploma-path Student (should ACCEPT)
```
Name: Amit Desai
DOB: 1998-03-20
Email: amit.desai@example.com
Phone: 8765432109
Aadhaar: 234567890123

Education Path: B
  10th: Maharashtra Board, 2014, 72%, Percentage
  Diploma: MSBTE, Electronics, 2017, 65%, Percentage, 0 backlogs
  UG: Pune University, Electronics Eng, 2020, 6.8 CGPA, cgpa_10, 1 backlog

Work:
  Company: Infosys, Designation: Systems Analyst, Domain: IT, 2020-07 to present, Full-time
```
Expected: `FLAGGED` (1 backlog), categorization `Needs Review`

---

### Persona 3: Experienced Professional with Gap (should ACCEPT + flags)
```
Name: Rahul Mehta
DOB: 1990-11-05
Email: rahul.mehta@example.com
Phone: 7654321098
Aadhaar: 345678901234

Education Path: A
  10th: CBSE, 2006, 88%, Percentage
  12th: CBSE, Science, 2008, 76%, Percentage
  UG: Delhi University, Commerce, 2012, 60%, Percentage

Work:
  Company: HDFC Bank, Domain: Finance, 2012-06 to 2017-03, Full-time
  GAP: 8 months
  Company: StartupXYZ, Domain: EdTech, 2018-01 to 2021-06, Full-time
```
Expected: `FLAGGED` (career gap > 6 months, domain switch), categorization `Needs Review`

---

### Persona 4: Weak Profile (should ACCEPT with high risk)
```
Name: Deepak Singh
DOB: 2001-01-10
Email: deepak.singh@example.com
Phone: 6543210987
Aadhaar: 456789012345

Education Path: A
  10th: UP Board, 2016, 45%, Percentage
  12th: UP Board, Science, 2018, 38%, Percentage
  UG: Local University, Arts, 2022, 40%, Percentage, 3 backlogs

Work: None (graduated 3+ years ago)
```
Expected: `FLAGGED`, categorization `Weak Fit`, high risk score

---

## Edge Cases

| Test | Input | Expected |
|---|---|---|
| Duplicate email | Same email as existing record | Tier 1 REJECT |
| Duplicate phone | Same phone as existing record | Tier 1 REJECT |
| Age < 18 | DOB = 2 years ago | Tier 1 REJECT |
| Percentage > 100 | scoreValue: 105, scale: percentage | Tier 1 REJECT |
| CGPA > 10 | scoreValue: 11, scale: cgpa_10 | Tier 1 REJECT |
| Chronology violation | 12th year < 10th year | Tier 1 REJECT |
| Overlapping work | two jobs with same dates | Tier 1 REJECT |
| Negative tenure | endDate before startDate | Tier 1 REJECT |
| Invalid Aadhaar | 11 digits | Tier 1 REJECT |
| Invalid phone | starts with 5 | Tier 1 REJECT |
| many domain switches | 4+ domain changes | Tier 2 FLAG |

---

## Expected API Response Shapes

### Tier 1 Rejection
```json
{
  "success": false,
  "errors": {
    "applicant.phone": "Must be a valid 10-digit Indian mobile number starting with 6–9",
    "education[1].yearOfPassing": "Year of passing must be later than the previous education level."
  },
  "flags": []
}
```

### Tier 2 Flagged (saved)
```json
{
  "success": true,
  "status": "FLAGGED",
  "flags": [
    "Education gap exceeds 24 months",
    "Career gap exceeds 6 months"
  ],
  "derived": {
    "riskScore": 52,
    "categorization": "Needs Review",
    "dataQualityScore": 88,
    "experienceBucket": "mid"
  }
}
```

### Clean Acceptance
```json
{
  "success": true,
  "status": "ACCEPTED",
  "flags": [],
  "derived": {
    "riskScore": 18,
    "categorization": "Strong Fit",
    "dataQualityScore": 95,
    "experienceBucket": "entry"
  }
}
```
