---
name: Avant-Garde Noir
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#383939'
  surface-container-lowest: '#0d0e0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#292a2a'
  surface-container-highest: '#343535'
  on-surface: '#e3e2e2'
  on-surface-variant: '#cfc4c5'
  inverse-surface: '#e3e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#988e90'
  outline-variant: '#4c4546'
  surface-tint: '#c6c6c6'
  primary: '#c6c6c6'
  on-primary: '#303030'
  primary-container: '#000000'
  on-primary-container: '#757575'
  inverse-primary: '#5e5e5e'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c6c6c6'
  on-tertiary: '#2f3131'
  tertiary-container: '#000000'
  on-tertiary-container: '#747575'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#121414'
  on-background: '#e3e2e2'
  surface-variant: '#343535'
typography:
  display-xl:
    fontFamily: Jost
    fontSize: 80px
    fontWeight: '300'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Jost
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: 0.05em
  headline-md:
    fontFamily: Jost
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Jost
    fontSize: 18px
    fontWeight: '300'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Jost
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Jost
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.2em
  price:
    fontFamily: Jost
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
spacing:
  unit: 4px
  section-gap: 160px
  grid-gutter: 1px
  container-margin: 40px
  marquee-height: 48px
---

## Brand & Style

The design system is engineered for the high-end avant-garde fashion sector, characterized by a "Post-Apocalyptic Minimalist" aesthetic. The brand personality is cold, mysterious, and architectural, prioritizing the product as a piece of structural art.

The visual style is a fusion of **Brutalism** and **High-Contrast Minimalism**. It rejects the soft ornamentation of traditional e-commerce in favor of raw, uncompromising geometry. By utilizing an absolute black environment, the design system creates a vacuum where textures, drapes, and silhouettes of the garments are the sole focus. The intended emotional response is one of exclusivity, intensity, and intellectual depth.

## Colors

The color palette is strictly monochromatic to maintain an editorial atmosphere.

- **Primary Background (#000000):** A pure, "ink" black used for all page backgrounds to eliminate perceived boundaries and create a seamless flow between sections.
- **Primary Text (#FFFFFF):** High-contrast white for maximum legibility and a sharp, clinical feel.
- **Secondary Text (#999999):** A muted grey for metadata, descriptions, and secondary information to maintain visual hierarchy.
- **Accents (#CCCCCC):** A light silver-grey used for borders, icons, and subtle UI hints.
- **Sale/Alert (#FF0000):** A visceral, saturated red used sparingly for urgency, price reductions, or critical errors.

## Typography

This design system utilizes **Jost** as its sole typeface to achieve a geometric, Bauhaus-inspired clarity. 

The typographic scale emphasizes extreme contrast between oversized display headers and disciplined, functional body text. Headlines should frequently utilize uppercase styling and expanded letter spacing to evoke a cinematic or editorial quality. Paragraphs are set with generous line height to ensure breathability within the dark interface. Numerical data, specifically pricing, should remain clean and unadorned.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid Grid**. Content is primarily structured on a 12-column grid, but key editorial moments utilize full-bleed photography that ignores standard margins.

- **Editorial Grids:** Product listings and lookbooks use 1px "ghost" gutters, creating the appearance of images stitched together rather than separated by white space.
- **Spaciousness:** Vertical rhythm is defined by large gaps (160px+) between major sections to allow the eye to rest.
- **Sticky Navigation:** A minimalist top bar (60-80px height) remains fixed, using a 0.95 opacity black background or a sharp bottom border.
- **Announcement Marquee:** A continuous horizontal scroll at the very top or bottom of the viewport, moving at a slow, hypnotic pace.

## Elevation & Depth

In this design system, depth is achieved through **structural stacking** and **high-contrast outlines** rather than shadows. 

- **Flatness:** There are no shadows or blurs. Every element exists on the same perceived physical plane.
- **Tonal Layering:** To differentiate a modal or a mega menu from the background, use a slightly lightened black (#0A0A0A) or a thin 1px border of #CCCCCC.
- **Transparency:** Mega menus may use a 98% solid black to allow a hint of the high-contrast imagery behind it to show through, maintaining the "noir" atmosphere.

## Shapes

The shape language is strictly **Sharp (0px radius)**. Every button, input field, card, and modal must feature 90-degree corners. This evokes a sense of architectural precision and industrial coldness. No exceptions are made for "pill" shapes or softened corners, as they conflict with the avant-garde aesthetic.

## Components

- **Buttons:** Rectangular with 1px #FFFFFF borders. Default state is transparent background with white text; hover state inverts to white background with black text. No transitions or easing; the change should be instantaneous.
- **Product Cards:** Portrait orientation (2:3 or 3:4 aspect ratio). By default, the image is a high-contrast studio shot. On hover, the image swaps immediately to a "detail" or "movement" shot. Price and title appear in small caps below the image.
- **Mega Menus:** Full-width drawers that drop down from the sticky nav. Layout is divided into columns of text links on the left and a featured editorial image on the right.
- **Announcement Marquee:** A full-bleed strip with #FFFFFF background and #000000 text, or vice versa, scrolling indefinitely.
- **Inputs:** A single 1px line at the bottom (#999999) that turns white (#FFFFFF) on focus. Labels are small caps above the line.
- **Chips/Filters:** Simple boxes with 1px grey borders. Active states are indicated by a solid white fill.