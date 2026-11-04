# 15. GuildLife visual design system (draft)

## Direction (approved by the product conversation)

**Isometric low-poly/illustrative city sim at dusk**, more mature than high-fantasy candy art. Geometric streets, modern guild architecture, subtle fantasy symbols, warm window lights, clean readable game UI. Focus on a stylized *city* rather than floating magical islands or huge crystal towers.

### Art direction — YES / NO

| YES | NO |
|---|---|
| Neat orthographic isometric map and real city blocks | Random perspective/isometric mixing |
|---|---|
| Dusk/navy background and warm windows | Pastel candy, syrupy cartoon castles |
| Small purple guild signs and understated iconography | Constant particle explosions and glowing magic everywhere |
| Modern district + modest guild fantasy cues | Generic high-fantasy RPG clutter |
| Legible large panels and consistent icon set | Tiny unreadable text baked into artwork |

## Proposed color tokens (to be refined from visual audit)

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#171827` | Main app background |
| `--panel` | `#24253B` | Left/right interface panels |
| `--panel-elevated` | `#2F304B` | Cards, hover |
| `--accent` | `#8C69D9` | Action, progress, selected nav |
| `--accent-soft` | `#B5A0F0` | Secondary highlight |
| `--warm` | `#FFBC78` | Currency / architecture lighting |
| `--positive` | `#92D18B` | Completed quest |
| `--text` | `#F4F2FC` | Primary UI text |
| `--text-muted` | `#BDBBD0` | Secondary text (verify contrast) |
| `--danger` | `#F18A8A` | Error messaging |

This is a **design proposal**, not exact color sampling or a finalized accessibility audit. Text contrast and WCAG should be checked in rendered UI.

## Layout rules

- Desktop reference: 1440×900; usable 1280×720. Split into left nav (240–260 px), center city, contextual right panel (300–340 px).
- Mobile: map can be cropped/zoomed, panels become drawers/tabs; primary quest flow remains accessible.
- Main city canvas must occupy more area than panels. Avoid full-screen overlays on every action.
- User input and accessible text are **real HTML/React elements**, not baked into PNG.
- Hotspots aligned with building footprints in normalized map coordinates; avoid text baked into map art.

## Component inventory

`AppShell`, `SidebarNav`, `ResourceBar`, `PlayerCard`, `CityMap`, `BuildingHotspot`, `QuestList`, `QuestCard`, `CampaignWizard`, `PlanPreview`, `RewardToast`, `BuildModal`, `AiStatusCard`, `WeeklySummary`, `ErrorState`, `EmptyState`, `LoadingState`.

For each component specify: purpose, states, data source, interactions, accessibility notes, responsive behavior. Keep one source of truth for colors/spacing/radius.

## Iconography & motion

- UI icons from a consistent icon library with commercial-friendly license; no mixed icon families.
- Animations: subtle door glow / building reveal / currency toast. Respect `prefers-reduced-motion`.
- No misleading agent animation: only if true job state is running.
- Buildings render as separate layered assets (PNG/WebP with transparent background or SVG), not a single irreversibly flat screenshot for interactive v1.

## Asset production pipeline

1. Draw/lock ground tile grid and perspective; set fixed camera angle/scale.
2. Create building concepts using one palette, perspective, lighting direction.
3. Produce **isolated cutouts on transparent background** per building and decorative element.
4. Export standardized dimensions/anchor points and safe hit areas.
5. Assemble map with real UI overlays; test 1440px/1280px/390px.
6. Track source/license/creation method in asset register before public release.

Reference images supplied for *art direction* should not be republished as owned art without permission. Generated concepts are mockups; final sprites may require redraw/cleanup and license checks.

## Screen source map

`01` Campaign create · `02` AI plan review · `03` Quest list · `04` Focus stretch · `05` Building · `06` Agent vision · `07` Kanban stretch · `08` Weekly recap. These screens are concept references; their content is not a promise of shipping every UI feature.
