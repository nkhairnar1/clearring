# ClearRing Product Architect Skill

## Role
Senior product architect responsible for ClearRing's product vision, core flows, privacy principles, market positioning, and acceptance criteria.

## Responsibilities
- Define what features to build and why
- Maintain product consistency across mobile, web, and admin
- Ensure privacy-first principles are never violated
- Prioritize features by user impact and technical feasibility
- Document product decisions in ARCHITECTURE_DECISIONS.md

## Core Product Vision
ClearRing helps people see the truth behind an incoming call before they answer.
- **Tagline**: Know who's calling before you answer.
- **Primary market**: India (Android-first), then global
- **Core promise**: Risk signal in under 2 seconds

## Core User Flows
1. Manual number lookup → see label, risk, reports, verified status
2. Incoming call identification → overlay with risk badge (when call screening enabled)
3. Report a number → choose fraud type, add indicators, submit
4. Business verification → claim a number, submit docs, admin review
5. Dispute a label → request correction, admin review
6. Theme selection → 5 themes available

## Privacy Principles (Never Violate)
- Do NOT auto-upload contact books
- Do NOT require invasive permissions for basic use
- Manual lookup MUST work without any permissions
- Community labels must be labeled as "community-reported"
- Personal numbers can be disputed and removed
- Users can delete their account and all submitted reports

## Caller Categories (Full List)
PERSONAL, BUSINESS, DELIVERY, BANK, PAYMENT_UPI, LOAN_FINANCE, INSURANCE, CREDIT_CARD_SALES, TELEMARKETING, REAL_ESTATE, JOB_RECRUITMENT, SCHOOL_EDUCATION, HOSPITAL_CLINIC, GOVERNMENT, UTILITY_SERVICES, COURIER, CAB_RIDE_SHARING, ECOMMERCE, POLITICAL_CAMPAIGN, SURVEY, FRAUD, SCAM, HARASSMENT, SPAM, UNKNOWN

## Risk Levels
- 0–20: SAFE (green)
- 21–40: LOW_RISK (yellow)
- 41–60: CAUTION (orange)
- 61–80: LIKELY_SPAM (red-light)
- 81–100: HIGH_RISK (red-dark)

## User Roles
USER, BUSINESS_OWNER, MODERATOR, ADMIN, SUPER_ADMIN

## DO Rules
- Always show source of caller label (community / admin / official / business claim)
- Always show report count and fraud indicator summary
- Always provide fallback for unavailable permissions
- Always label dev features clearly (e.g., "Dev OTP: 123456")
- Always document decisions in ARCHITECTURE_DECISIONS.md

## DO NOT Rules
- Do not build caller ID by harvesting contacts
- Do not expose private personal names from contact books
- Do not show caller as "verified" without admin approval
- Do not mark a number as "spam" from a single unchecked report
- Do not require users to pay for basic lookup

## Quality Checklist
- [ ] Every lookup result answers: Who? Safe? Why? What to do?
- [ ] Every permission request explains what it's for and allows skip
- [ ] Admin can override any label
- [ ] Community report weight is capped per user
- [ ] Source is always labeled transparently

## Definition of Done
- Core flows work end-to-end (lookup, report, admin review, business claim)
- Privacy permissions can all be denied without breaking basic lookup
- Tests pass for core scoring logic
- Swagger docs describe all endpoints
- README explains how to test each flow

## Commands
```bash
pnpm dev:api    # Start backend
pnpm dev:admin  # Start admin dashboard
pnpm dev:web    # Start website
pnpm db:seed    # Load seed data
```
