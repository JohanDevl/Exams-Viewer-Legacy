---
name: Scraping Issue
about: Report issues with exam data scraping
title: "[SCRAPING] "
labels: ["scraping", "bug"]
assignees: ""
---

## Scraping Issue Description

A clear and concise description of the scraping problem.

## Affected Exam(s)

- **Exam Code(s)**: [e.g. CIS-ITSM, CAD, ALL]
- **Total Questions Expected**: [e.g. 150]
- **Questions Actually Scraped**: [e.g. 120]

## Issue Type

- [ ] Questions missing from scraping
- [ ] Incorrect question content
- [ ] Images not loading/missing
- [ ] Answer choices malformed
- [ ] Rate limiting issues
- [ ] Website structure changes
- [ ] JSON format issues
- [ ] Links extraction problems

## Error Details

```
Paste any error messages from the scraper here
```

## Scraping Environment

- **Python Version**: [e.g. 3.9]
- **Dependencies**: [Check requirements.txt versions]
- **Scraping Date**: [When did this issue occur]
- **ExamTopics URL**: [If specific URL is problematic]

## Expected Data Format

```json
{
  "example": "of expected JSON structure"
}
```

## Actual Data Received

```json
{
  "example": "of actual malformed data"
}
```

## Reproduction Steps

1. Run scraper with command: `python scripts/scraper.py EXAM_CODE`
2. Observe error at step: [specific step]
3. Check output files: [which files are affected]

## Website Changes

- [ ] I've checked if ExamTopics.com structure has changed
- [ ] I've verified the exam URL is still valid
- [ ] I've tested with different exam codes

## Additional Context

Add any other context about the scraping issue here.

## Suggested Fix

If you have an idea of how to fix the scraping issue, please describe it here.
