---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

Write comprehensive implementation plans from an approved design/spec before touching code.

## Required behavior

- Announce that the writing-plans skill is being used.
- Save plans to `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md` unless the user specifies another location.
- Map the file structure before defining tasks.
- Keep each task independently testable and reviewable.
- Use exact file paths, interfaces, commands, and expected results.
- Do not use placeholders such as TBD, TODO, "implement later", or vague instructions.
- Prefer DRY, YAGNI, TDD, and frequent commits.

## Plan header

Every plan should state:

- Goal
- Architecture
- Tech Stack
- Spec path
- Global constraints

## Self-review

Before handoff, check:

1. Every spec requirement maps to an implementation task.
2. There are no placeholders or vague implementation instructions.
3. Function names, types, and interfaces are consistent across tasks.

## Execution handoff

After the plan is saved, implementation proceeds using an execution workflow such as subagent-driven development or executing-plans.

## Source

Project-local copy derived from `obra/superpowers`, `skills/writing-plans/SKILL.md`.
