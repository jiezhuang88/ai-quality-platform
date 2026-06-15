# Prompt Guidelines for Safer AI Coding

## Required Prompt Context

When asking AI to implement code, include:

- Business goal.
- Files or modules that may be changed.
- Files or modules that must not be changed.
- Acceptance criteria.
- Test expectations.
- Error handling expectations.
- Security and privacy constraints.
- Existing patterns to follow.

## Good Prompt Shape

```text
Implement [change] in [module].

Constraints:
- Follow existing architecture and naming.
- Do not change public API behavior except [explicit behavior].
- Add or update tests for success, failure, and boundary cases.
- Do not log secrets or personal data.
- Explain assumptions and residual risks.

Acceptance criteria:
- [criterion 1]
- [criterion 2]
```

## Review Prompt

Use this after AI generates code:

```text
Review this change as a senior test engineer.
Focus on correctness, edge cases, security, missing tests, and operational risk.
List concrete risks and the tests that should catch them.
```

## Anti-Patterns

- Asking for large changes without boundaries.
- Asking for code without tests.
- Accepting generated tests without checking whether they can fail.
- Letting AI invent business rules.
- Letting AI replace established local patterns with generic examples.
