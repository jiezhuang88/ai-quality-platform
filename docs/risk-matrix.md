# Risk Matrix

## Risk Score

Score each dimension from 1 to 5.

| Dimension | 1 | 3 | 5 |
| --- | --- | --- | --- |
| User impact | Internal only | Some users affected | Critical user journey |
| Data impact | No persisted data | Limited persisted data | Financial, personal, or regulated data |
| Complexity | Isolated change | Multiple modules | Cross-system behavior |
| Reversibility | Easy rollback | Manual recovery | Hard or impossible rollback |
| Confidence | Strong existing tests | Partial tests | Weak or no tests |

Total score:

- 5-8: Low risk.
- 9-14: Medium risk.
- 15-20: High risk.
- 21-25: Critical risk.

## Required Evidence by Risk

| Risk | Required Evidence |
| --- | --- |
| Low | Passing tests, reviewer approval |
| Medium | Risk assessment, unit and integration tests |
| High | Test plan, rollback plan, security review if relevant |
| Critical | Explicit approval, release monitoring, staged rollout |

## Example AI Change Risks

| Change | Likely Risk | Notes |
| --- | --- | --- |
| Refactor internal formatter | Low | Require parity tests |
| Add API validation | Medium | Include invalid input and compatibility tests |
| Change permission model | High | Require negative auth tests |
| Data migration for billing | Critical | Require dry run, backup, rollback, monitoring |
