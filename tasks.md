# Backlog

Actionable, not-yet-done work only. No history.

## board / workflow — next

- [ ] Persistence, remaining: Save / Open / list UI is wired (`PIPELINE_STORE`);
      still todo — a run-history view (surface `runHistory`), naming / "Save as"
      (today Save overwrites the current id), a confirm before Open replaces
      unsaved work, and a real REST `PipelineStore`.
- [ ] Backend contract maturity (rest of it): node catalog supplied by the backend
      (replaces the seed `NODE_CATALOG`), credentials/secrets model, validation
      from the backend. Also reconsider the sync `startRun(): string` — the REST
      adapter has to mint a local id and reconcile the server id async; an async
      `startRun` would drop that seam.

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
