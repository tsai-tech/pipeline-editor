import { InjectionToken } from '@angular/core';
import type { PipelineBackend } from '@tsai-pe/models';

/**
 * The backend a `<pe-board>` talks to when running a pipeline. Provide a
 * concrete implementation through the host app. When absent, the board's Run
 * control is hidden.
 */
export const PIPELINE_BACKEND = new InjectionToken<PipelineBackend>(
  'PIPELINE_BACKEND',
);
