import { InjectionToken } from '@angular/core';
import type { NodeCatalog } from '@tsai-pe/nodes';

/**
 * Node catalog a `<pe-board>` uses for palette entries, inspector forms, dynamic
 * ports and expression help. Host apps/backends provide it; when absent, the
 * board renders an empty builder shell.
 */
export const PIPELINE_NODE_CATALOG = new InjectionToken<NodeCatalog>(
  'PIPELINE_NODE_CATALOG',
);
