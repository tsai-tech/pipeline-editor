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

## workflow — execution domain (next)

- [ ] Extract the node-type registry into its own `shared/nodes` lib once it
      grows (config schemas + `derivePorts`; today it lives in `shared/models`).
- [ ] `workflow/engine`: run a pipeline — trigger → actions/effects, split/merge
      buffer semantics, per-run node status, whole-pipeline context resolution
      (the `{{ $node["…"] }}` references the control-flow config already uses).
- [ ] Expression evaluation + a real context/variable model (node output shapes).
- [ ] `/workflow` playground: drive a run and reflect node status on the board.
