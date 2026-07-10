import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'ui-kit' },
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
    path: 'workflow',
    title: 'Workflow · Playground',
    loadComponent: () =>
      import('./playgrounds/workflow/workflow-playground').then(
        (m) => m.WorkflowPlayground,
      ),
  },
  { path: '**', redirectTo: 'ui-kit' },
];
