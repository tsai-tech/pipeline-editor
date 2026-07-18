# @tsai-pe/pipeline-ui-kit

Composable Angular primitives for building custom pipeline editors.

Use this package when `@tsai-pe/board` is too assembled for your host app. The
components render board-specific UI and emit intents, but they do not own
persistence, backend execution, modals, drawers or application navigation.

## Components

- `pe-board-surface` — viewport shell with grid/world slots and raw surface
  events.
- `pe-board-grid` — infinite dot grid.
- `pe-pipeline-node` — visual node with ports, status overlays and resize/open
  intents.
- `pe-pipeline-edge` / `pe-pipeline-edge-layer` — SVG connections with labels,
  arrows and draft path rendering.
- `pe-node-picker` — catalog-driven add-node content.
- `pe-node-inspector` — catalog-driven node edit content.

## Example

```html
<pe-board-surface [pan]="store.viewport.pan()" [zoom]="store.viewport.zoom()">
  <ng-container pe-board-world>
    <pe-pipeline-edge-layer [edges]="store.edgeGeometries()" />

    @for (node of store.nodes(); track node.id) {
    <pe-pipeline-node [node]="node" [selected]="store.isSelected(node.id)" (bodyPointerDown)="store.select(node.id)" />
    }
  </ng-container>
</pe-board-surface>

<app-drawer [open]="!!selectedNode()">
  @if (selectedNode(); as node) {
  <pe-node-inspector [node]="node" [catalog]="catalog" (nodeChange)="store.updateNode($event.id, $event)" />
  }
</app-drawer>
```

## Running unit tests

Run `nx test pipeline-ui-kit` to execute the unit tests.
