import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { Button, Menu, MenuItem, MenuTrigger, Navbar } from '@tsai-pe/ui-kit';

interface PlaygroundLink {
  path: string;
  label: string;
}

/**
 * Shell for the playground app: a shared navbar with a dropdown to switch
 * between per-domain playgrounds (`/ui-kit`, `/board`, `/workflow`) and a theme
 * toggle, plus the routed outlet.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    Navbar,
    Button,
    Menu,
    MenuItem,
    MenuTrigger,
  ],
  templateUrl: './app.html',
})
export class App {
  protected readonly isLight = signal(false);

  protected readonly playgrounds: PlaygroundLink[] = [
    { path: '/ui-kit', label: 'UI Kit' },
    { path: '/board', label: 'Board' },
    { path: '/workflow', label: 'Workflow' },
  ];

  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly currentLabel = computed(
    () =>
      this.playgrounds.find((p) => this.url().startsWith(p.path))?.label ??
      'UI Kit',
  );

  protected toggleTheme(): void {
    const light = !this.isLight();
    this.isLight.set(light);
    document.documentElement.classList.toggle('light', light);
  }
}
