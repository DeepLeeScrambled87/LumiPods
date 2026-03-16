# Foundational Rails Architecture

This document defines the next layer above the monthly pod mix.

## Purpose

Foundational rails are continuous core learning strands that should stay available across the year and across thematic pods.

They are not the same as:
- primary monthly pods
- companion/support pods used for cross-topic transfer

They sit above the monthly pod mix and feed into it continuously.

## Why Rails Exist

Some areas should be reinforced consistently, regardless of the current thematic pod.

Examples:
- maths
- writing and grammar
- language development

These are not small thematic companions. They are major foundational domains.

## Product Rules

- Foundational rails do not count against the 3-pod thematic monthly limit.
- Rails should be assignable per learner, not automatically to every learner.
- Rails should be able to run continuously alongside a primary pod and optional companion pods.
- Rails should inform schedules regularly without replacing the main lesson spine of the chosen thematic pod.
- Rails should be age-band aware and level-aware.
- Rails should be able to deepen or simplify independently of learner age where needed.

## Initial Rails

- Maths Rail
- Writing & Grammar Rail
- Language Rail

Later candidates:
- Coding & Computational Thinking Rail
- Reading & Comprehension Rail

## Scheduling Model

Thematic pods:
- own the main daily lesson spine
- drive the core weekly topic sequence

Foundational rails:
- inject recurring foundation blocks across the week
- provide consistent reinforcement and transfer opportunities
- adapt examples and tasks to the current primary pod when relevant

Example:
- primary pod = Atomic Foundations
- maths rail = measurement, ratios, graphing, patterns, data
- writing rail = observation notes, explanation sentences, lab reflections
- language rail = atom vocabulary, bilingual description, oral explanation

## Difference From Current Support Pods

Current support pod logic is best for:
- thematic crossover
- project links
- reflection links
- transfer and comparison thinking

Foundational rails should instead:
- run continuously
- stay conceptually stable
- revisit core skills over time
- support mastery and fluency

So they should not be implemented as ordinary support pods.

## Required Data Model Direction

Each learner should eventually support:
- assigned thematic pod plan
- assigned foundational rails
- per-rail level and pacing
- per-rail weekly frequency
- per-rail preferred tools or modes

Suggested future structure:

- `foundationalRails`
  - `maths`
  - `writing`
  - `language`

Each rail assignment should track:
- learnerId
- railId
- status
- level
- frequencyPerWeek
- plannedMinutesPerSession
- activeFrom
- activeUntil
- notes

## Curriculum Direction

Each rail should have:
- canonical concept spine
- age-band and level adaptations
- reusable mini-lessons
- quick checks
- flashcards
- applied tasks
- project hooks
- tool-use pathways

## UX Direction

Parents should be able to:
- assign or unassign rails per learner
- choose intensity and pacing
- keep rails continuous while switching thematic pods

Learners should experience rails as:
- regular, predictable blocks
- connected to real current learning
- helpful, not repetitive

## Immediate Build Direction

Build next:
- Maths rail framework and outline

Then follow with:
- Writing & Grammar rail
- Language rail
