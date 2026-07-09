import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  Accordion,
  AccordionItem,
  Badge,
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  RadioGroup,
  RadioOption,
  Select,
  SelectOption,
  Switch,
  Tab,
  Tabs,
  Textarea,
} from '@tsai-pe/ui-kit';

/**
 * Playground showcase — renders every `@tsai-pe/ui-kit` component so the
 * design language can be reviewed locally (`nx serve playground`).
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    Field,
    Input,
    Textarea,
    Checkbox,
    Switch,
    RadioGroup,
    Select,
    Tabs,
    Tab,
    Accordion,
    AccordionItem,
    Badge,
    Card,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = 'ui-kit playground';
  protected readonly isLight = signal(false);

  protected readonly triggerOptions: SelectOption[] = [
    { value: 'manual', label: 'Manual trigger' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'schedule', label: 'Schedule' },
    { value: 'disabled', label: 'Coming soon', disabled: true },
  ];

  protected readonly actionOptions: SelectOption[] = [
    { value: 'http', label: 'HTTP Request' },
    { value: 'transform', label: 'Transform' },
    { value: 'code', label: 'Code' },
    { value: 'log', label: 'Log' },
  ];

  protected readonly roleOptions: RadioOption[] = [
    { value: 'trigger', label: 'Trigger' },
    { value: 'middleware', label: 'Middleware' },
    { value: 'result', label: 'Result' },
  ];

  protected readonly selectValue = signal<string[]>(['webhook']);
  protected readonly multiValue = signal<string[]>(['http', 'log']);
  protected readonly role = signal<string | undefined>('middleware');
  protected readonly agree = signal(true);
  protected readonly notify = signal(false);
  protected readonly enabled = signal(true);
  protected readonly name = signal('My first pipeline');
  protected readonly notes = signal('');

  protected toggleTheme(): void {
    const light = !this.isLight();
    this.isLight.set(light);
    document.documentElement.classList.toggle('light', light);
  }
}
