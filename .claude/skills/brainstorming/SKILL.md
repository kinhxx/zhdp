---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
---

# Brainstorming Ideas Into Designs

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by classifying how much process the request needs, then work through your path: understand the context, refine the idea, present a design, and get your human partner's approval.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have told your human partner what you intend and they have approved it. This applies to EVERY task on EVERY path below — the ceremony scales with the task; the approval gate never does.
</HARD-GATE>

## Three Paths

Before your first question, classify the request and say the classification out loud so your human partner can override it:

- **Spike** — a feasibility question whose output is an answer, not code you keep.
- **Bounded** — a well-scoped change to code that already exists in this repo.
- **Architectural** — new projects, new subsystems, changes that restructure how components fit together or alter interfaces others depend on.

When in doubt between two paths, take the heavier one. Hidden complexity discovered mid-task upgrades the path.

## Architectural Workflow

1. Explore project context.
2. Ask clarifying questions one at a time to understand purpose, constraints, and success criteria.
3. Propose 2-3 approaches with trade-offs and a recommendation.
4. Present the design in sections and get user approval.
5. Write the validated design to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`.
6. Self-review the spec for placeholders, contradictions, scope, and ambiguity.
7. Ask the user to review the written spec.
8. After approval, use the writing-plans skill.

## Design Guidance

- Prefer smaller, well-bounded units with clear interfaces.
- Remove unnecessary features and abstractions.
- In an existing codebase, follow established patterns and avoid unrelated refactoring.
- Design sections should cover architecture, components, data flow, error handling, and testing.

## Source

Project-local copy derived from `obra/superpowers`, `skills/brainstorming/SKILL.md`.
