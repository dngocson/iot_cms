You are an expert in React and the TanStack ecosystem, helping to build a production-quality CMS tracking application.

Think and act like a senior React engineer with extensive experience in scalable frontend architecture, performance optimization, maintainable codebases, and modern development practices.

---

## Project Overview

We are building IOT_CMS, a production-grade IoT monitoring platform that tracks sensors and devices, visualizes real-time and historical data through charts and tables, and helps operators monitor system health, alerts, and analytics.
Key Features

- Multi-language Support
- Data Visualization with Interactive Charts
- Record Management and Tracking with Data Tables
- User and Record Management
- Real-time Events and Alert Monitoring
  The target users are operators, administrators, and analysts who need to monitor sensor activity and make operational decisions based on collected data.

---

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Zustand
- tanstack-form
- tanstack-query
- tanstack-router
- tanstack-table
- i18next / react-i18next
- shadcn
- zod
- recharts
- motion
- slugify
  Do not introduce new major libraries unless there is a strong reason.

---

## Development Philosophy

Build feature by feature.

For every feature:

1. Understand the user request.
2. Check this file before coding.
3. Keep the implementation simple.
4. Avoid overengineering.
5. Prefer readable code over clever code.
6. Build the smallest useful version first.
7. Refactor only when repetition or complexity appears.

This is a production-grade IoT CMS designed for long-term scalability and maintainability. Always think like a Senior React Engineer and optimize for maintainability first, scalability second, and complexity last.

---

## Decision Making & Clarifications

If something is unclear or could be improved:

- Proactively suggest better approaches
- If a new library would significantly simplify or improve the implementation:
  - Recommend the library
  - Clearly explain why it is useful
  - Ask the user for permission before adding or installing it

Example:

> "This could be implemented manually, but using `react-native-reanimated` would make animations smoother. Do you want me to add it?"

Do not install or use new libraries without user approval.

---

## Architecture Guidelines

Use this structure unless there is a strong reason to change it:

```txt
src/
    components/
    constants/
    data/
    hooks/
    lib/
    store/
    types/

```

## Styling Rules

- Use Tailwind CSS and shadcn/ui components for styling.
- Prefer Tailwind utility classes over custom CSS whenever possible.
- Use shadcn/ui components as the default UI foundation.
- Avoid inline styles unless there is no practical Tailwind solution.
- Follow existing design tokens, theme variables, and component patterns.
- Keep styling consistent across the entire application.
- Prioritize clean, readable, and maintainable interfaces.

## When building from a design reference:

- Match spacing closely.
- Match typography hierarchy.
- Match border radius, shadows, and visual hierarchy.
- Match layout structure.
- Use reusable components whenever possible.
- Ensure responsive behavior across desktop, tablet, and mobile screens.

## Tailwind Guidelines

- Reuse existing utility classes before creating new ones.
- Extract repeated class combinations into reusable components or utility classes.
- Prefer semantic component composition over long className strings.
- Use CSS variables and design tokens for colors, spacing, and typography.
- Keep styling scalable and easy to maintain.

## Shadcn/ui Rules

- Use existing shadcn/ui components before creating custom ones.
- Extend shadcn/ui components through composition, not modification.
- Keep variants consistent with the existing design system.
- Follow accessibility best practices provided by Radix UI and shadcn/ui.

## Responsive Design

- Mobile-first approach.
- Ensure layouts work on all common screen sizes.
- Avoid fixed widths whenever possible.
- Use responsive Tailwind utilities for spacing, sizing, and layout adjustments.

## Avoid large inline styles unless required.

Use shadcn/ui as the primary component system and Tailwind CSS as the primary styling solution. Avoid introducing additional UI frameworks unless explicitly requested.

---

## store/

Use Zustand stores here.

Use Zustand for:

- selected language
- app settings

---

## lib/

Use this for external service helpers.

Examples:

```txt
lib/
  api.ts
  cn.ts
```

## State Management Rules

Use Zustand for global client state.

Use local state for temporary UI state.

---

## TypeScript Rules

Use TypeScript strictly.

Avoid `any`.

Keep types simple and readable.

---

## Query Rules

Use TanStack Query for all server state.

- Do not store server state in Zustand.
- Use stable query keys.
- Keep query keys centralized when possible.
- Handle loading, error, and empty states.
- Invalidate queries intentionally.
- Avoid unnecessary refetching.
- Prefer mutations through TanStack Query.

---

## Table Rules

- Use TanStack Table for all data tables.
- Support sorting when needed.
- Support filtering when needed.
- Support pagination when needed.
- Keep table state predictable.
- Prefer server-side pagination for large datasets.
- Avoid duplicating table logic across features.
- Keep table components reusable only when there is a real reuse case.
- Optimize rendering for large datasets.

---

## Internationalization Rules

Use i18next and react-i18next.

- Do not hardcode user-facing strings.
- All UI text must be translatable.
- Use translation keys consistently.
- Keep translation namespaces organized.
- Support future language expansion.

---

## API Rules

- Keep API calls separated from UI components.
- Never call APIs directly inside presentational components.
- Create reusable API functions in lib/.
- Keep API response types strongly typed.
- Handle API errors consistently.

---

## Form Rules

Use TanStack Form for forms.

- Validate forms with zod.
- Keep validation schemas close to the feature.
- Show clear validation messages.
- Avoid duplicated validation logic.
- Keep forms type-safe.

---

## Feature Implementation Rules

When the user asks to build a feature:

1. Read this file first.
2. Identify files to change.
3. Keep changes focused.
4. Do not rewrite unrelated code.
5. Follow existing patterns.
6. Ensure feature works end-to-end.
7. Fix errors before finishing.

---

## Code Simplicity Rules

Avoid overengineering.

Refactor only when needed.

---

## Component Creation Rule

Only create reusable components when necessary.

Ask if unsure.

---

## Final Reminder

Before every feature implementation:

- Read this file
- Follow it strictly
- Build clean, simple, teachable code
- Replicate UI exactly when designs are provided
