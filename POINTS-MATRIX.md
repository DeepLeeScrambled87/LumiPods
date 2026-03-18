# LumiPods Points Matrix

This matrix defines how points should be awarded across LumiPods so rewards, achievements, and learner motivation stay consistent.

## Core principles

- Points should reward effort, consistency, and meaningful evidence of learning.
- Core schedule completion remains the backbone of daily points.
- Bonus point events should layer on top of progress, not replace it.
- The same action should not be awarded twice accidentally.
- Portfolio evidence and project work should matter more than passive completion alone.

## Live today

These are wired into the active runtime path now.

| Action | Points | Notes |
| --- | ---: | --- |
| Completed tracked schedule block | 10 | Derived from daily progress sync |
| Learner portfolio artifact saved | 15 | Shared pod-library assets do not count |
| Reflection entry saved | 10 | Structured block reflection |
| Completed project | 40 | From project status |
| Completed external session | 10 | From external activity sync |
| Achievement unlock | variable | Uses achievement config |
| Session note added | 4 | New action ledger event |
| Maths game completed | 8-10 | Accuracy bonus included |
| Maths mastery / personal best | 6 | Level-up or best-time bonus |
| French game completed | 8-10 | Accuracy bonus included |
| French vocabulary bonus | up to 8 | Based on words learned in a session |
| Full day completed | 20 | Awarded once per learner per date |
| Parent bonus | custom | Parent-controlled bonus points |
| Resource opened | 2 | Linked sources, docs, or articles |
| Teaching video opened | 5 | Pod teaching assets and other videos |

## Queued next

These are intentionally planned but not fully wired yet.

| Action | Target points | Notes |
| --- | ---: | --- |
| French sentence shared after a session | 4 | Best attached to the block popup |
| Lumi deep-dive every 30 minutes | 12 | Should use real tracked tutor time |
| On-time block start | 3 | Best awarded once per session start |
| Full perfect day bonus | 10 | Stack on top of full-day completion only if no skipped tracked blocks |
| Streak day | 10 | Best awarded once per day, not per page load |
| Work shared / presentation uploaded | 12 | Distinct from ordinary artifact save |
| Watched long-form teaching video fully | 8 | Requires actual watch completion tracking |

## Things to avoid

- Awarding points every time a learner reopens the same resource link.
- Double-counting the same work through both a raw point event and an existing aggregate bonus.
- Giving large rewards for passive actions that do not show effort or engagement.
- Letting parent bonus points bypass the need for evidence entirely.

## Recommended balancing direction

- Completion should keep the baseline moving.
- Games should reward practice plus mastery, not speed alone.
- French and maths should feel worth returning to daily.
- Portfolio, projects, and reflection should remain the biggest “proof of learning” earners.
