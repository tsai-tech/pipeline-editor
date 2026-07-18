import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'board' },
  {
    path: 'ui-kit',
    title: 'UI Kit · Playground',
    loadComponent: () =>
      import('./playgrounds/ui-kit/ui-kit-playground').then(
        (m) => m.UiKitPlayground,
      ),
  },
  {
    path: 'board',
    title: 'Board · Playground',
    loadComponent: () =>
      import('./playgrounds/board/board-playground').then(
        (m) => m.BoardPlayground,
      ),
  },
  {
    path: 'pipeline-ui-kit',
    title: 'Pipeline UI Kit · Playground',
    loadComponent: () =>
      import('./playgrounds/pipeline-ui-kit/pipeline-ui-kit-playground').then(
        (m) => m.PipelineUiKitPlayground,
      ),
  },
  { path: '**', redirectTo: 'board' },
];
