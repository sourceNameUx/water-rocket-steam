---
name: Water Rocket Project
description: A handmade experiment presented as a bold, evidence-led project exhibit.
colors:
  blue: "#1645e8"
  yellow: "#ffdc4e"
  green: "#bcec9d"
  paper: "#f7f8f2"
  ink: "#172724"
  line: "#cbd2c7"
  exhibit: "#e7ebde"
  film-muted: "#d3e3d4"
  white: "white"
typography:
  display:
    fontFamily: 'Barlow, "Arial Narrow", sans-serif'
    fontSize: "clamp(64px, 7.1vw, 96px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: 'Barlow, "Arial Narrow", sans-serif'
    fontSize: "clamp(44px, 4.5vw, 64px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.015em"
  title:
    fontFamily: 'Barlow, "Arial Narrow", sans-serif'
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.02
  statement:
    fontFamily: 'Barlow, "Arial Narrow", sans-serif'
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "Atkinson, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Atkinson, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Atkinson, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.5
  navigation:
    fontFamily: "Atkinson, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  square: "0px"
spacing:
  compact: "12px"
  inline: "14px"
  small: "16px"
  control-gap: "18px"
  medium: "20px"
  standard: "24px"
  panel-gap: "28px"
  content-gap: "30px"
  large: "36px"
  section: "104px"
  color-section: "76px"
  section-mobile: "65px"
  color-section-mobile: "60px"
components:
  button-primary:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "#ffe777"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "14px 24px"
  button-dark-hover:
    backgroundColor: "#29483e"
  text-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  navigation:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    typography: "{typography.navigation}"
    padding: "24px max(5vw, 24px)"
  exhibit-panel:
    backgroundColor: "{colors.exhibit}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "20px 25px 22px"
  part-control:
    backgroundColor: "transparent"
    textColor: "ButtonText"
    typography: "{typography.label}"
    padding: "21px 4px"
    width: "100%"
  part-control-selected:
    textColor: "{colors.blue}"
    padding: "19px 4px 21px"
  chapter-control:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    padding: "16px 8px"
    width: "100%"
  chapter-control-current:
    backgroundColor: "{colors.green}"
    textColor: "{colors.ink}"
  chapter-control-hover:
    backgroundColor: "#355347"
  chapter-control-current-hover:
    backgroundColor: "#c9f6b0"
  result-track:
    height: "35px"
  estimate-ledger:
    backgroundColor: "{colors.green}"
    textColor: "{colors.ink}"
  disclosure:
    textColor: "{colors.ink}"
    padding: "17px 0"
---

# Design System: Water Rocket Project

## Overview

**Creative North Star: "The Handmade Project Exhibit"**

A real handmade rocket earns the spotlight. Large condensed lettering, saturated color fields and pale photographic panels give the school experiment the presence of an exhibition. The material remains recognizably handmade; the interface helps visitors inspect it rather than decorating away its imperfections.

The tone is lively, direct and honest about evidence. Generous section spacing surrounds compact controls, captions and ruled comparisons. Reported results, assumptions and limitations remain readable alongside the visual highlights, so an improved appearance never implies an improved measured outcome.

**Key Characteristics:**
- Cobalt fields, yellow actions and green evidence surfaces.
- Condensed exhibition headings paired with readable humanist body text.
- Real project photographs with the complete object contained in its frame.
- Flat, square surfaces and fine rules instead of ornamental depth.
- Explicit selection, readable caveats and restrained motion.

This records `docs/index.html`, the complete cascade in `docs/styles.css`, interaction behavior in `docs/app.js`, and the path geometry in `docs/icons.svg`. The machine-readable tokens above are normative. Names without matching custom properties describe repeated source values, not a new CSS API. Component previews and schema extensions live in `.impeccable/design.json`; the selected page composition remains in `.impeccable/surface-brief.md`. Sidecar tonal ramps are generated swatch aids, not additional shipped palette tokens.

## Colors

The palette combines energetic school-project colors with warm pale surfaces and green-black text.

### Primary

- **Exhibition Cobalt** (`blue`; CSS `--blue`): header and hero fields, title emphasis, selected part controls and the first comparison bar. It establishes identity and marks a precise selection.

### Secondary

- **Action Yellow** (`yellow`; CSS `--yellow`): the watch action, hero emphasis, project-question strip and report section. It supports both action and strong section-level contrast.

### Tertiary

- **Evidence Green** (`green`; CSS `--green`): the estimate section and current chapter. It highlights explanatory material and playback position, not a claim of scientific success.

### Neutral

- **Warm Paper** (`paper`; CSS `--paper`): the reading canvas and light text on dark fields.
- **Green-black Ink** (`ink`; CSS `--ink`): body text, totals and the dark download action.
- **Sage Rule** (`line`; CSS `--line`): boundaries between controls, chart annotations and disclosure content.
- **Pale Exhibit** (`exhibit`): the hero photograph's panel and image background. The part photograph has its own nearby pale background in source; preserve that local treatment.
- **Muted Film Text** (`film-muted`): supporting copy, film metadata and evidence notes against the dark screening section.
- **White** (`white`): header navigation and text on the dark download action.

The screening field, chart-series colors and specialized dividers remain component-local values, preserved in source and the relevant previews. They are not additional global accent families.

**The Evidence Is Not Success Rule.** Green identifies evidence or the current chapter; approximate values and explanatory text carry the meaning of a result.

## Typography

**Display font:** the locally hosted Barlow Condensed Bold file, registered as `Barlow`, with `Arial Narrow` and sans-serif fallbacks. **Body font:** locally hosted Atkinson regular and bold, registered as `Atkinson`, with Arial and sans-serif fallbacks. Both use `font-display: swap`.

The pairing puts exhibition-scale compression in headings and open, readable forms in explanations. Hierarchy is deliberately discontinuous: large titles introduce the subject, normal-size prose does the explaining, and bold condensed numerals make quantities easy to compare. There is no separate monospace face.

| Role | Application |
| --- | --- |
| Display | The hero title; short uppercase phrases and yellow emphasis inside the heading. |
| Headline | Section headings; balanced wraps and sentence case where authored. |
| Title | Subheadings and prominent chart quantities; part-detail headings use a local smaller size (28px). |
| Statement | A condensed quotation with comfortable leading; the final cascade sets line-height to 1.3. |
| Body | Reading copy; general paragraphs are limited to 70ch, with introductory columns typically 32–46ch. |
| Body-small | Explanations beside imagery and in the screening section. |
| Label | Bold actions and part controls, without decorative tracking. |
| Navigation | Compact section links with generous vertical hit areas. |

The statement is a paragraph that inherits regular weight in CSS; only the bold Barlow face is shipped, so the preview must use that same font availability rather than inventing a regular display font. Condensed numbers also appear in the goal, ledger rows and total, with local sizes reflecting their hierarchy.

**The Two Voices Rule.** Use Barlow for exhibition headings and emphasized quantities, and Atkinson for explanations, navigation and controls.

Compact uppercase text is reserved for functional identification: exhibit metadata, the project question, goal and chapter navigation. It is not a reusable above-heading decoration.

## Layout

### Spatial model

Full-width color bands contain asymmetric grids. The hero pairs a wider text column with a tall exhibit (1.15fr / 1fr, with a 7vw gap); the construction, results, estimates and report sections each size their columns to their content. This is a family of editorial splits, not a mandatory equal-card grid.

Outer presentation bands use horizontal gutters of 5vw; reading sections use 7vw. The frontmatter records the repeated section and control spacing. At wide screens (1600px and above), the outer bands use `max(5vw, calc((100vw - 1440px) / 2))`; reading sections use `max(7vw, calc((100vw - 1380px) / 2))`. These are responsive padding formulas, not fixed-width container elements.

The film uses a flexible player with a chapter rail (252px), moving to a narrower rail (225px) at the intermediate breakpoint. The player preserves its native widescreen ratio (16:9). The rocket photograph uses `object-fit: contain` so its silhouette stays visible; the desktop hero image has a tall display box (240px by 452px).

### Responsive cascade

| Viewport | Effective behavior |
| --- | --- |
| At or below 1100px | Construction becomes one outer column; its heading and introduction sit side by side. The part explanation pairs image and copy. Hero gap narrows, and the film rail becomes smaller. |
| At or below 760px | Hero and major content splits stack. Side gutters become 24px. Part controls and chapters use two columns; part image and copy remain side by side. The exhibit centers within a maximum width of 480px, with a contained 190px by 380px image. |
| At or below 360px | Major section gutters become 20px; part details and chapters become single-column. The header wraps and its navigation spans the available width. |

On phones the body becomes 17px, section headings 46px and the hero title `clamp(61px, 12.5vw, 84px)`; the narrowest hero title is 57px. The quotation becomes 33px and retains the final line-height of 1.3.

The final accessibility overrides take precedence over earlier mobile declarations: navigation is 14px with a 14px gap; chapter buttons are 14px with a minimum height of 66px and 12px timestamps. Film notes, evidence notes, chart notes, ledger notes, chart scale and result annotations are 14px. Ledger row explanations are 13px. Named navigation, exhibit, film, text-download and footer links have a minimum height of 44px at all widths.

**The Whole Object Rule.** Preserve the complete rocket silhouette within its exhibit frame and keep explanatory detail adjacent until the viewport requires stacking.

## Elevation & Depth

The interface is flat: no box shadows, text shadows, glass effects or floating card stack. Depth comes from alternating color fields, the darker screening space, fine dividers and the physical detail already present in the project photographs. Primary actions move upward slightly on hover; this is a motion cue, not a shadow-based elevation system.

**The Flat Exhibit Rule.** Separate content with color, spacing and rules; let photography provide the material depth.

Hero copy enters with a short fade and upward settle (0.5s); the exhibit follows (0.6s, delayed 0.1s). Comparison bars grow from 70% of their own final length over 0.7s. These animations run on document load rather than scroll observation. Under reduced-motion preference, all CSS animations and transitions stop and anchor scrolling becomes immediate. Exact motion values live in the sidecar.

## Shapes

Rectangular buttons, image panels, chart tracks and section fields have square corners. Thin horizontal rules define lists and ledgers. The selected part uses a stronger top rule (3px), while the chart goal is a dashed right edge and the ledger total has a stronger bottom rule (2px).

The circular student-initial mark is a specific credit device, not a universal rounded-container style. Photograph and video proportions follow the underlying material. Repeating chart grid lines are measurement scaffolding; they are the implemented functional gradient, not a decorative background treatment.

Icons are small stroked SVGs (18px square; stroke width 1.8; round caps and joins). Direction arrows share the sprite vocabulary; the play icon is filled. Decorative icons remain hidden from assistive technology and accompany visible link text.

## Components

### Action buttons and text downloads

**Confident, rectangular and clearly labeled.** The yellow watch action and dark PDF download share bold body typography and generous padding, with a minimum height of 56px. A narrow divider separates the watch action's duration. Text downloads remain underlined and use the same SVG arrow family.

Filled actions lighten on hover and move upward (2px), with background and transform transitions (0.16s). Their phone treatment uses a minimum height of 54px, smaller text (15px) and tighter padding (13px 18px); the narrowest width tightens padding again (12px). Text links retain their ordinary underline rather than gaining an invented filled hover state.

### Navigation and credit

**Compact framing for the exhibit.** A condensed wordmark and an exposed row of section links sit on cobalt. Navigation links are plain at rest and underlined on hover, with the final minimum hit height (44px). On the narrowest screens the row wraps below the wordmark instead of becoming a hidden menu. The initials and student name form a small credit lockup.

### Photographic exhibit

**A pale mount for the real object.** The square hero panel contains identifying metadata, the full-height photograph and a two-part caption with an exploration link. It has no border or shadow. Keep original aspect ratios, meaningful alt text and the contained silhouette. The panel's link follows the shared focus treatment and minimum link height.

### Part explorer

**A ruled selector beside physical evidence.** Four native buttons expose `aria-pressed` and control a polite, atomic live description. The selected control uses cobalt text and a stronger top rule, with compensating padding so the row does not jump. Activating a part updates the real photograph, alt text, title and explanation together.

Inactive selectors retain the browser's native button foreground (`ButtonText`); the source does not define a separate pointer-hover color for them. Preserve the selected-state distinction and shared keyboard focus instead of inventing a new visual state. This is a button group, not a tab widget or a set of chips.

### Film player and chapter controls

**A dark screening area with a readable index.** The native video player retains controls, inline playback, a poster, captions and a direct download. Ruled chapter buttons place a timestamp before a title. Current playback uses a green fill with dark bold text; hover colors differ for current and inactive chapters.

Chapter selection seeks and requests playback. Time updates set `aria-current` on the active chapter. A visible status region explains blocked playback or load errors. Keep the functional chapter label local to this navigation context.

### Results comparison

**A common scale that makes the shortfall visible.** Ruled tracks share the same goal endpoint, five equal grid divisions and a dashed goal edge. Each result has a textual version label, approximate height, percentage and shortfall; the chart also has a complete accessible description.

Series colors distinguish versions, not success and failure. Preserve the relationship between stated values and bar lengths. The current three values occupy 40%, 10% and 20% of the common scale; those are data, not reusable design tokens.

### Estimate ledger

**An open calculation on green.** Each ruled row aligns the material and its assumption to the left, with a larger condensed quantity to the right. The total is larger and receives the stronger bottom rule. Assumptions, approximation marks and the range note remain directly attached to the calculation; the layout must not imply a scale reading.

### Disclosure

**A quiet, native explanation.** A `details` element uses top and bottom rules, a bold `summary`, and revealed body copy with a modest top margin. Retain the native disclosure marker and keyboard behavior. The source has no separate hover decoration for this control.

### Shared interaction behavior

Keyboard focus on buttons, links, summaries and video uses a current-color outline (3px) with an offset (5px). A yellow skip link becomes visible when focused. Preserve native link, button and disclosure semantics, explicit states, and reduced-motion behavior. The component previews include the shipped hover treatments where present and focus rules without adding application logic.

## Do's and Don'ts

### Do:

- **Do** use cobalt for identity, yellow for prominent actions and green for evidence or current playback.
- **Do** pair condensed exhibition headings with readable Atkinson explanations and controls.
- **Do** contain the real rocket in its photographic frame and supply descriptive alternative text.
- **Do** keep estimates, assumptions and shortfalls visible beside the quantities they qualify.
- **Do** preserve the final mobile type sizes, link hit areas, focus outlines and reduced-motion override.
- **Do** use the shared SVG paths with visible action labels and explicit selection states.

### Don't:

- **Don't** add decorative above-heading eyebrows or turn functional exhibit and chapter labels into a universal heading pattern.
- **Don't** substitute glyph icons or a system display face for the shipped SVG vocabulary and Barlow font.
- **Don't** add shadows, rounded card grids or glass layers to this flat exhibit system.
- **Don't** crop away the rocket's silhouette to fill an arbitrary card ratio.
- **Don't** use green, bar length or larger numerals to imply a successful measurement that the evidence does not support.
- **Don't** apply earlier, superseded mobile declarations as if they were the finished accessibility treatment.
