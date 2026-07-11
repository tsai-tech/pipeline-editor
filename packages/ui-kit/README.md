# @tsai-pe/ui-kit

Headless + Tailwind component kit used across
[Pipeline Editor](https://github.com/tsai-tech/pipeline-editor#readme). Built on
[Angular Aria](https://angular.dev/guide/aria/overview) and `@angular/cdk`
(accessible behaviour, overlays), styled with Tailwind v4 tokens from
[`@tsai-pe/theme`](../shared/theme). Standalone, `OnPush`, dark-first.

## Install

```bash
npm i @tsai-pe/ui-kit @tsai-pe/theme
```

Peer deps: `@angular/core` ^21, `@angular/cdk`, `@angular/aria`.

## Components

- **Actions** — Button, Spinner
- **Form controls** — Field, Input, NumberInput, DateInput, DatePicker, Textarea,
  Checkbox, Switch, RadioGroup, Select, Combobox, Segmented, Slider
- **Form structure** — Form, FormSection, FormRow
- **Disclosure & nav** — Tabs/Tab, Accordion/AccordionItem
- **Surfaces & layout** — Card, GlowSurface, Navbar, Sidebar/SidebarItem, Actionbar
- **Overlays** — Dialog, Drawer, Menu, Tooltip, Toast
- **Chat** — ChatMessage, ChatInput
- **Feedback & data** — Alert, Badge, Tag, Avatar, Skeleton, Table

## Usage

```ts
import { Button, Dialog } from '@tsai-pe/ui-kit';

@Component({
  imports: [Button, Dialog],
  template: `
    <tsai-button (click)="open.set(true)">Open</tsai-button>
    <tsai-dialog [(open)]="open" title="Hello">Body…</tsai-dialog>
  `,
})
```

Requires `@tsai-pe/theme` imported in global styles and
`@angular/cdk/overlay-prebuilt.css` for overlays.

## License

MIT © Mikhail Tsai
