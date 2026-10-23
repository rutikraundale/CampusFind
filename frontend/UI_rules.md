# CampusFind — UI Rules

## 1. Purpose

This document is the single source of truth for the CampusFind frontend redesign.

The new CampusFind interface should feel like a **premium editorial product**: dark, restrained, monochromatic, spacious, typography-led, and highly intentional.

The visual direction is inspired by the supplied Origin Financial style reference, but CampusFind must NOT copy its financial branding, content, or chromatic palette.

The redesign must remove the typical AI-generated SaaS appearance:
- no purple/violet default theme
- no blue/green/orange/red accent soup
- no excessive gradients
- no glowing cards
- no excessive shadows
- no random rounded rectangles
- no oversized icon decoration
- no inconsistent typography
- no unnecessary animations
- no visual changes that damage existing functionality

---

# 2. Non-Negotiable Rules

1. **Do not change backend code, APIs, database schemas, authentication logic, or business logic.**
2. **Do not remove existing CampusFind functionality.**
3. **Do not replace working components merely for stylistic reasons unless necessary for the new design system.**
4. Preserve existing routes, navigation behavior, API calls, form validation, state management, and data flow.
5. Read the entire existing frontend before making broad changes.
6. Reuse existing components when possible.
7. Do not introduce a new UI library unless the project already uses it or it is clearly required.
8. Do not create fake data just to make a page look better.
9. Do not change functional behavior while redesigning the UI.
10. Every page must follow this document consistently.

---

# 3. Design Direction

CampusFind should look like a:

**dark editorial campus utility platform**

The visual hierarchy should come primarily from:
- typography
- spacing
- surface contrast
- borders
- composition
- restrained motion

It should NOT depend on bright colors.

Think:
- premium
- calm
- modern
- minimal
- technical
- trustworthy
- monochromatic
- editorial

Avoid:
- startup-dashboard clichés
- neon SaaS styling
- cartoonish interfaces
- excessive glassmorphism
- colorful status badges everywhere
- gradients used as decoration

---

# 4. Color System

## Primary Palette

Use a near-black monochromatic palette.

```css
--color-bg: #0F1011;
--color-bg-deep: #090A0B;

--color-surface: #18191A;
--color-surface-elevated: #2E2E2E;
--color-surface-hover: #3F4041;

--color-border: rgba(255,255,255,0.12);
--color-border-strong: rgba(255,255,255,0.22);

--color-text-primary: #FFFFFF;
--color-text-heading: #F5F5F7;
--color-text-secondary: #C0C0C0;
--color-text-muted: #9F9FA0;
--color-text-disabled: #6A6B6B;

--color-inverted: #CACACA;
--color-black: #000000;
```

## Critical Color Restriction

CampusFind must NOT use these as normal UI accents:

- purple
- violet
- indigo
- cyan
- bright blue
- green
- orange
- red
- pink
- multicolor gradients

Do not add Tailwind classes such as:

```text
bg-purple-*
text-purple-*
border-purple-*
bg-violet-*
text-violet-*
bg-blue-*
text-blue-*
bg-green-*
text-green-*
bg-orange-*
text-orange-*
bg-red-*
text-red-*
```

unless a genuine functional state absolutely requires semantic color.

Even then, prefer monochrome first.

### Functional States

Success, warning, error, and information states should primarily use:
- border contrast
- iconography
- text labels
- surface contrast

If semantic color is genuinely necessary for accessibility, use it extremely sparingly and never as the dominant visual theme.

---

# 5. Primary Action

The primary action is always monochrome.

```text
Background: #FFFFFF
Text: #000000
Border radius: 8px
Padding: 12px 18px
Font: UI sans-serif
```

Example:

```css
background: #ffffff;
color: #000000;
border-radius: 8px;
```

Primary buttons should feel extremely high contrast.

Do not use:
- purple buttons
- blue buttons
- gradient buttons
- glowing buttons
- colorful CTA buttons

---

# 6. Secondary / Ghost Buttons

Use:

```css
background: transparent;
border: 1px solid rgba(255,255,255,0.22);
color: #ffffff;
border-radius: 8px;
```

Hover:

```css
background: rgba(255,255,255,0.08);
border-color: rgba(255,255,255,0.35);
```

Do not use colored borders.

---

# 7. Typography

Typography is one of the most important parts of this design.

Use a three-level typography system.

## Display

Preferred:
- Lyon Display if available

Fallback:
- DM Serif Display
- Playfair Display

Use only for major hero/section headlines.

Recommended:

```text
Desktop: 64–96px
Weight: 300–400
Line-height: 0.9–1.0
```

Do not make serif display headings bold.

## UI / Body

Preferred:
- Suisse Int'l / Suisse Int'l Trial

Fallback:
- Inter
- Geist
- system-ui

Use for:
- navigation
- body text
- descriptions
- buttons
- forms
- cards
- labels

Recommended:

```text
Body: 16px
Small body: 14px
Subheading: 18px
```

## Mono

Use:
- Roboto Mono

Use only for:
- metadata
- timestamps
- technical labels
- compact status information
- IDs
- category labels
- small uppercase eyebrow text

Recommended:

```text
10–12px
uppercase
slight letter spacing
```

Do not use monospace for normal paragraphs.

---

# 8. Typography Hierarchy

Use:

```text
Hero display       64–96px / light
Page heading       38–56px / light
Section heading    28–38px / light
Card heading       20–28px / regular
Body               16px / regular
Secondary body     14px
Metadata           10–12px / mono / uppercase
```

Headings should have strong whitespace around them.

Do not:
- use 700/800/900 weights everywhere
- make every card heading huge
- use multiple unrelated fonts
- use uppercase for normal headings

---

# 9. Spacing

Base spacing unit:

```text
4px
```

Preferred scale:

```text
4
8
12
16
20
24
32
40
48
60
80
100
120
```

Use generous spacing.

Recommended:
- page horizontal padding: 24–48px
- card padding: 24–32px
- section gap: 64–100px
- normal element gap: 12–20px

Avoid cramped layouts.

Whitespace is a major part of the visual identity.

---

# 10. Border Radius

Use a controlled radius system.

```text
Buttons:       8px
Inputs:        8px
Navigation:    8px
Normal cards:  16px
Large cards:   24–30px
Pills:         9999px
```

Do not make every element pill-shaped.

Do not use excessive rounded corners.

---

# 11. Cards

Cards should be flat and restrained.

Preferred surfaces:

```text
Page:       #0F1011
Secondary:  #090A0B
Card:       #18191A / #2E2E2E
Hover:      #3F4041
```

Use borders when separation is required:

```css
border: 1px solid rgba(255,255,255,0.10);
```

Avoid heavy shadows.

Cards should not look like floating colorful tiles.

---

# 12. Shadows

Default:

**No shadow.**

Depth should come from:
- surface color changes
- borders
- spacing
- layering

If a shadow is absolutely necessary, keep it subtle.

Never use:
- neon shadows
- colored shadows
- glowing card effects

---

# 13. Navigation

Navigation should be minimal.

Preferred style:

- dark background
- subtle translucent treatment where appropriate
- thin borders
- restrained spacing
- clear active state
- monochrome icons
- white primary action

If glassmorphism is used:

```css
backdrop-filter: blur(24px);
background: rgba(255,255,255,0.06);
border: 1px solid rgba(255,255,255,0.12);
```

Do not turn the entire application into a glassmorphism showcase.

---

# 14. Forms and Inputs

Inputs:

```text
Background: #090A0B
Border: rgba(255,255,255,0.12)
Text: #F5F5F7
Placeholder: #6A6B6B
Radius: 8px
```

Focus:

```text
border-color: rgba(255,255,255,0.40)
```

Do not use bright blue/purple focus rings.

Forms should feel clean and premium.

---

# 15. Icons

Use simple monoline icons.

Preferred:
- Lucide
- existing project icon library

Rules:
- consistent stroke width
- monochrome
- no colorful icon backgrounds unless functionally required
- do not place an icon inside every decorative card
- icons should support hierarchy, not replace it

---

# 16. CampusFind-Specific Visual Language

CampusFind is a campus utility / lost-and-found platform.

The design should communicate:

```text
Find
Report
Verify
Recover
Trust
Community
```

Use visual hierarchy rather than bright colors to communicate these concepts.

For example:

### Lost Item

Use:
- strong item title
- item image
- location
- date
- concise metadata
- clear action

Do not make the card red.

### Found Item

Use:
- same component structure
- different content
- subtle metadata distinction

Do not make it green.

### Verification

Use:
- clear status label
- icon
- border/surface contrast
- concise explanation

Do not rely entirely on colored badges.

---

# 17. Images

Images should be treated as content, not decoration.

Use:
- large clean image areas
- controlled aspect ratios
- consistent object-fit behavior
- 16–24px radius depending on component

Do not add:
- colored overlays
- excessive glow
- random gradients
- decorative stickers

If an item image is missing, use a clean monochrome placeholder.

---

# 18. Empty States

Empty states should be calm.

Structure:

```text
small icon
heading
short explanation
single relevant action
```

Do not use giant colorful illustrations.

---

# 19. Loading States

Prefer:
- skeleton blocks
- subtle opacity animation
- monochrome shimmer only if necessary

Avoid:
- spinning rainbow loaders
- colorful skeletons
- excessive animation

---

# 20. Motion

Motion must be restrained.

Default transition:

```css
transition: 200ms ease;
```

Use motion for:
- hover
- focus
- menu opening
- modal entry
- page transitions
- subtle content reveal

Do not use:
- bouncing cards
- excessive spring animations
- constant floating elements
- parallax everywhere
- dramatic scaling
- decorative animation loops

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

---

# 21. Responsive Design

Desktop, tablet, and mobile must be designed intentionally.

Do not simply shrink desktop.

Mobile requirements:
- no horizontal overflow
- no overlapping navigation
- hamburger/menu layers must appear above page content
- touch targets should be comfortable
- cards become single-column when required
- typography scales down proportionally
- spacing is reduced without becoming cramped
- modals fit within the viewport
- images remain correctly cropped

The mobile menu must have a higher stacking context than dashboard/page content.

Example principle:

```css
z-index: 50;
```

Do not fix mobile issues by hiding functionality.

---

# 22. Accessibility

Maintain:
- semantic HTML
- keyboard navigation
- visible focus state
- sufficient text contrast
- accessible labels
- alt text for meaningful images
- proper button/input semantics

Never sacrifice accessibility for visual minimalism.

---

# 23. Responsive Typography

Recommended:

```text
Desktop hero: 64–96px
Tablet hero: 48–64px
Mobile hero: 40–52px

Desktop heading: 38–56px
Mobile heading: 28–36px

Body: 16px
Mobile body: 15–16px
```

Use CSS `clamp()` where appropriate.

---

# 24. Layout

Use a centered content container.

Recommended maximum width:

```text
1200px
```

Use full-width dark sections when useful, but keep readable content inside the container.

Avoid:
- arbitrary widths
- excessive nested containers
- inconsistent left alignment
- cramped dashboards

---

# 25. Do

- Use black, white, charcoal, graphite, silver and muted gray.
- Use typography as the primary visual feature.
- Use generous whitespace.
- Use thin borders.
- Use flat surfaces.
- Use subtle hover transitions.
- Use consistent 8px / 16px / 24px / 30px radius hierarchy.
- Use monochrome primary and secondary buttons.
- Keep layouts visually quiet.
- Make important information obvious through size and spacing.
- Preserve all existing functionality.

---

# 26. Don't

- Don't use purple/violet as the brand color.
- Don't use blue/green/orange/red as decorative accents.
- Don't use gradient buttons.
- Don't use rainbow dashboards.
- Don't use excessive shadows.
- Don't use glowing borders.
- Don't use excessive glassmorphism.
- Don't use giant icons everywhere.
- Don't make every card look like a colorful SaaS tile.
- Don't use random font families.
- Don't use bold serif display headings.
- Don't redesign backend functionality.
- Don't replace working business logic.
- Don't create fake content.
- Don't introduce unnecessary dependencies.

---

# 27. Component Consistency

Before creating a new component, check whether an existing CampusFind component can be reused.

Shared components should have consistent:
- spacing
- typography
- border radius
- hover behavior
- focus behavior
- icon sizing
- responsive behavior

A component should not invent its own color palette.

---

# 28. Implementation Priority

When redesigning a page, apply changes in this order:

1. Page background and surface system
2. Global typography
3. Navigation
4. Page/container layout
5. Cards
6. Buttons
7. Forms
8. Tables/lists
9. Empty/loading states
10. Responsive behavior
11. Motion
12. Final visual cleanup

---

# 29. Final Quality Gate

Before considering the redesign complete, verify:

- [ ] No purple/violet theme remains
- [ ] No unnecessary blue/green/orange/red accents remain
- [ ] No AI-generated gradient-heavy styling
- [ ] Typography is consistent
- [ ] All pages share the same visual system
- [ ] Buttons are monochrome
- [ ] Cards use controlled surfaces
- [ ] Shadows are minimal or absent
- [ ] Mobile layout works
- [ ] Navigation works
- [ ] Existing APIs still work
- [ ] Existing forms still work
- [ ] Existing authentication still works
- [ ] No backend code was changed
- [ ] No business logic was removed
- [ ] No fake data was introduced
- [ ] No unnecessary dependency was added
- [ ] Accessibility was preserved
- [ ] `prefers-reduced-motion` is respected
- [ ] The UI looks intentionally designed rather than AI-generated

---

# 30. Reference Interpretation

The supplied design reference establishes these important principles:

- near-black canvas
- editorial display typography
- sans-serif UI typography
- monospace metadata
- monochrome primary actions
- restrained surfaces
- generous spacing
- 8px controls and 16–30px cards
- minimal shadows
- restrained motion
- strong typography-driven hierarchy

The original reference contains violet, cyan, pink and blue category colors. **Those colors are intentionally excluded from CampusFind's primary visual system.**

CampusFind should preserve the reference's **design philosophy**, not its financial branding or exact color palette.
