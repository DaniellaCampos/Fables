---
name: Newspring Liquid
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#3e494a'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#6f797a'
  outline-variant: '#bec8ca'
  surface-tint: '#006972'
  primary: '#00535b'
  on-primary: '#ffffff'
  primary-container: '#006d77'
  on-primary-container: '#9becf7'
  inverse-primary: '#82d3de'
  secondary: '#ac3509'
  on-secondary: '#ffffff'
  secondary-container: '#fe6f42'
  on-secondary-container: '#631800'
  tertiary: '#5e4800'
  on-tertiary: '#ffffff'
  tertiary-container: '#7a5f0b'
  on-tertiary-container: '#ffdb87'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9ff0fb'
  primary-fixed-dim: '#82d3de'
  on-primary-fixed: '#001f23'
  on-primary-fixed-variant: '#004f56'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59f'
  on-secondary-fixed: '#3a0a00'
  on-secondary-fixed-variant: '#852300'
  tertiary-fixed: '#ffdf96'
  tertiary-fixed-dim: '#e7c269'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Epilogue
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Epilogue
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style
The design system embodies the "Newspring Liquid" aesthetic: a fusion of airy editorial layouts and translucent depth. It is designed for tourism entrepreneurs in El Salvador, capturing the optimistic energy of a Pacific sunrise and the refreshing clarity of tropical waters. 

The brand personality is **inspiring, professional, and vibrant**. It balances high-end editorial sophistication with a playful, "postcard-modern" charm. 

**Core Visual Principles:**
- **Liquid Glass:** Use of `backdrop-filter: blur()` to create layers of information that feel light and integrated.
- **Editorial Rhythm:** Large, confident typography and generous whitespace that mimics a premium travel magazine.
- **Retro-Modern Accents:** Subtle 90s-inspired "sticker" badges and offset borders provide a nostalgic yet fresh personality.
- **Atmospheric Depth:** Surfaces do not just sit on top of each other; they interact through translucency and soft, tinted reflections.

## Colors
The palette is inspired by the Salvadoran landscape—shifting from the deep volcanic teals of Coatepeque to the warm corals of a Libertad sunset.

- **Primary (Deep Ocean Blue/Teal):** Used for primary actions, branding, and authoritative text.
- **Secondary (Warm Coral/Sunset Orange):** Used for highlights, CTAs, and energetic accents.
- **Tertiary (Pale Yellow/Sand):** Used for "sticker" accents, secondary badges, and subtle warnings.
- **Neutral (Warm Cream):** The base surface is a soft cream (#FDFBF7), avoiding the sterility of pure white to maintain a welcoming, organic feel.
- **Liquid Layers:** Translucent white overlays with high blur levels are used to create the "Liquid Glass" effect over background gradients or imagery.

## Typography
The typographic hierarchy uses three distinct families to achieve the "Newspring" editorial look:

1.  **Epilogue (Headings):** A geometric sans-serif with a heavy weight and distinct personality. It provides the "bold editorial" energy. Use tight letter-spacing for large displays.
2.  **Plus Jakarta Sans (Body):** A modern, friendly sans-serif that ensures high readability for descriptions and marketing copy. Its soft curves complement the rounded UI.
3.  **Space Grotesk (UI Labels/Retro Accents):** A technical, slightly quirky font used for "stickers," buttons, and metadata. This introduces the subtle 90s/2000s tech-optimism.

**Localization:** All Spanish copy should favor active, inspiring verbs (*"Crea tu impacto"* vs *"Crear"*).

## Layout & Spacing
The layout follows a **Fluid Editorial Grid** that prioritizes asymmetrical balance and white space.

- **Grid:** Use a 12-column grid for desktop and a 4-column grid for mobile.
- **Rhythm:** Spacing should feel "airy." Avoid crowding elements; use `lg` (48px) and `xl` (80px) blocks to separate major sections.
- **Postcard Layouts:** Experiment with overlapping elements. For example, an image card may span 6 columns while a "Liquid Glass" text panel overlaps it by 2 columns.
- **Mobile:** Margins remain at 24px to ensure touch-friendly safety zones, with content reflowing into a single stacked column.

## Elevation & Depth
Depth in this design system is achieved through light and transparency rather than heavy shadows.

- **Level 1 (Base):** The warm cream background.
- **Level 2 (Glass Cards):** Semi-transparent white (`rgba(255,255,255, 0.65)`) with a `backdrop-filter: blur(12px)`. These have a 1px solid white border at 40% opacity to catch "light."
- **Level 3 (Floating Elements):** Items like primary buttons or "stickers" use a soft, tinted shadow: `0px 10px 30px rgba(0, 109, 119, 0.1)`.
- **Reflections:** Use linear gradients (top-left to bottom-right) on glass panels to simulate a subtle light source.

## Shapes
The shape language is ultra-soft and approachable. 

- **Containers:** Large cards and glass panels use a radius of **24px to 28px**.
- **Buttons/Inputs:** Use a consistent **16px** radius to maintain a "squishy" but professional feel.
- **Stickers:** Small labels or badges can use a **pill-shape (full round)** or a slightly irregular "cut" corner to mimic physical travel stickers.
- **Icons:** Use simple, thin-stroke outline icons (2px stroke) with rounded terminals.

## Components
- **Primary Buttons:** High-contrast Teal (#006D77) with white text. On hover, a subtle scale-up (1.02x) and an increased glow.
- **Glass Cards:** The signature container. Must include a subtle inner glow (white border) and background blur.
- **Sticker Chips:** Small, high-energy badges using the Pale Yellow (#FFD97D) or Coral (#FF7043). They often feature `Space Grotesk` in all-caps.
- **Input Fields:** Soft cream background (slightly darker than the page) with a 1px teal border on focus. Labels should sit above the field in `Space Grotesk`.
- **Image Frames:** Photos of Salvadoran destinations should have rounded corners (24px) and a very subtle inner shadow to look "inset" into the layout.
- **Reflective Tabs:** Navigation items that look like tabs on a folder, using the Glassmorphism style to show the content "behind" the inactive tabs.