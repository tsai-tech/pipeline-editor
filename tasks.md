# Backlog

Actionable, not-yet-done work only. No history.

## ui-kit

- [ ] Extract a shared **anchored-overlay** helper (`tsai-popover`) once Select /
      Menu / Tooltip patterns converge.
- [ ] Dialog **imperative service** (`open(component)` → ref + `afterClosed()`).
- [ ] Menu: checkbox / radio items and submenus.
- [ ] Tooltip arrow.
- [ ] Combobox async options (fold onto Aria Combobox).
- [ ] DatePicker date range + min/max.
- [ ] Input prefix / suffix **text** addons.
- [ ] Auto-wire `Field` error text / `aria-describedby` from signal-form state.
- [ ] Table `@angular/cdk` virtual scroll for long lists.
- [ ] Avatar group / stacked; image fallback on load error.
- [ ] Full keyboard + screen-reader audit (Menu submenus, Drawer, Toast focus).
- [ ] Contrast check all text tiers ≥ 4.5:1 in both themes.
- [ ] Overlay tests (Dialog / Menu / Toast) with TestBed + fake async.
- [ ] Storybook (or docs route) with per-component variant matrices.
- [ ] Self-host Geist / Inter.
- [ ] Lib README (theming / `@source` / usage); CDK + Aria notes in ARCHITECTURE.

## board — UI-layer prep (next)

- [ ] Node runtime status (idle / running / success / error) — border + badge +
      pulse; groundwork for the workflow execution overlay.
- [ ] Edge labels (control-flow branch names, e.g. then / else).
- [ ] Empty-state hint on an empty canvas ("drag a node from the palette").
- [ ] Arrow-key nudge of selected nodes; Ctrl+= / Ctrl+- zoom; Space+drag pan.
- [ ] Alignment guides / snap hints while dragging.
- [ ] Node resize + auto-size to content / ports.
- [ ] Read-only mode (`readonly` input — view without editing).
- [ ] Keyboard node navigation + `aria` on the canvas.
- [ ] Manual reroute waypoints on edges (over the auto A* routing).
