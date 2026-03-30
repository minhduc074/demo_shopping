# Design System Strategy: The Kinetic Marketplace

## 1. Overview & Creative North Star: "Hyper-Dense Editorial"
This design system moves away from the "flat grid" of traditional e-commerce. Our Creative North Star is **Hyper-Dense Editorial**. We are blending the high-energy urgency of a global marketplace with the sophisticated layout logic of a premium fashion magazine. 

Instead of a rigid, boxed-in layout, we utilize **intentional asymmetry** and **tonal layering**. We embrace the "Vibrant" energy by allowing promotional banners to overlap container edges and using a sophisticated typography scale to guide the eye through high-density information without visual fatigue. The goal is a "controlled chaos" that feels expensive, intentional, and endlessly energetic.

---

## 2. Colors: Vibrancy through Depth
We use our signature oranges not just as accents, but as light sources that define the interface's energy.

*   **Primary (#b22203) & Secondary (#b22101):** These are our "Heat Zones." Use `primary` for high-conversion actions. Use the `primary_container` (#ff775b) for large surface areas like promotional headers to prevent "color-stinging" while maintaining brand recognition.
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Differentiation must be achieved through background shifts. A product grid sitting on `surface` (#f6f6f6) should use `surface_container_low` (#f0f1f1) to define its region—never a stroke.
*   **Surface Hierarchy & Nesting:** Use the `surface_container` tiers to build depth. 
    *   *Base:* `background` (#f6f6f6).
    *   *Sectioning:* `surface_container_low` (#f0f1f1).
    *   *Interactive Elements (Cards):* `surface_container_lowest` (#ffffff).
*   **The "Glass & Gradient" Rule:** Floating search bars and "Flash Deal" timers must utilize glassmorphism. Use `surface_container_lowest` at 80% opacity with a `backdrop-blur` of 20px. 
*   **Signature Textures:** Apply a linear gradient from `primary` (#b22203) to `secondary_dim` (#9d1b00) on all primary CTAs to provide a tactile, weighted feel that flat hex codes lack.

---

## 3. Typography: The Curated Voice
We have transitioned to **Inter** to provide a more modern, geometric foundation than standard system fonts, ensuring legibility at high densities.

*   **Display & Headlines:** Use `display-md` (2.75rem) for major sales events. These should have a tight `letter-spacing` (-0.02em) to feel "editorial" and authoritative.
*   **The Price Hierarchy:** Prices are the heartbeat of this system. Use `title-lg` (1.375rem) in `primary` (#b22203) for price tags. Pair it with `label-sm` in `outline` for original prices (strikethrough), creating a clear psychological gap between "value" and "cost."
*   **Body & Labels:** `body-md` (0.875rem) is our workhorse for product titles. Restrict product titles to 2 lines maximum to maintain the vertical rhythm of the high-density grid.

---

## 4. Elevation & Depth: Tonal Layering
We reject the 2010s "Drop Shadow." We define space through physics and light.

*   **The Layering Principle:** Stack `surface-container-lowest` (#ffffff) cards on a `surface-container-low` (#f0f1f1) background. This creates a "soft lift."
*   **Ambient Shadows:** For floating navigation or "Flash Sale" pop-ups, use a `24px` blur with 4% opacity, using the `on_surface` (#2d2f2f) color. It should feel like a soft glow, not a dark smudge.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in-field inputs), use `outline_variant` (#acadad) at 15% opacity. If the user can see the border clearly, it is too heavy.
*   **Glassmorphism:** Navigation top bars must use a semi-transparent `surface_bright` with a backdrop filter. This allows the vibrant promotional banners to "peek through" as the user scrolls, maintaining a sense of place.

---

## 5. Components: Style & Logic

### Buttons
*   **Primary:** `primary` background, `on_primary` text. `sm` (0.125rem) roundedness for a sharp, "pro" look.
*   **Flash Deal CTA:** Use a horizontal gradient. Add a subtle pulse animation (scale 1.02) to create urgency.

### Product Cards
*   **Structure:** No borders. Use `surface_container_lowest` (#ffffff). 
*   **Spacing:** Use `spacing-2.5` (0.5rem) for internal padding.
*   **Price Tags:** Bold, `primary` color text, positioned at the bottom left. 

### Search Bar (The "Anchor")
*   **Style:** `surface_container_highest` (#dbdddd) background. 
*   **Iconography:** Use "Bold" weight icons in `primary` to ensure they pop against the high-density UI.
*   **Placement:** Fixed at the top with a glassmorphism blur effect.

### Chips & Badges
*   **Promotion Badges:** Use `tertiary_container` (#de98ff) for "Exclusive" or "Mall" tags to contrast against the sea of orange, creating a secondary visual interest point.

### Lists & Navigation
*   **Top Bar Quick Links:** Use `label-md` in `on_surface_variant`. 
*   **Dividers:** Strictly forbidden. Use `spacing-4` (0.9rem) of empty space or a shift to `surface_container_low` to separate categories.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use overlapping elements. A product image can slightly break the container of its card to create a 3D effect.
*   **DO** use the `tertiary` (#7f3f9f) color for high-end "shoppertainment" features (Live streams, games).
*   **DO** use `spacing-1` (0.2rem) for micro-adjustments to keep the "High-Density" feel without looking cluttered.

### Don’t:
*   **DON’T** use 100% black (#000000) for text. Always use `on_surface` (#2d2f2f) to keep the "Editorial" softness.
*   **DON’T** use rounded corners larger than `md` (0.375rem) for product cards; stay sharp to maintain a "Premium Marketplace" vibe.
*   **DON’T** use standard grey dividers. If you need a line, use a 1px height `surface_container_high` (#e1e3e3) block, never a stroke.