# Pipeline Editor

> Встраиваемый Angular-редактор визуальных пайплайнов AI-агентов.

Холст, на котором пайплайн собирается из узлов (**trigger → action → effect**,
плюс control-flow if/switch/filter и буферы split/merge): узлы соединяются рёбрами,
перетаскиваются, холст панорамируется и масштабируется. Есть инспектор параметров,
валидация графа, экспорт/импорт, персистентность и прогон через подключаемый бэкенд.
Вдохновлён [n8n](https://n8n.io).

Проект — Nx-монорепозиторий; основной артефакт — набор публикуемых Angular-библиотек
(Angular 21, signals, standalone, OnPush, Tailwind v4). Приложение `playground` —
только площадка для локальной разработки, не публикуется.

> **Фронт не исполняет пайплайн** — семантикой владеет бэкенд. Редактор общается с ним
> через вендор-нейтральный порт `PipelineBackend` (`startRun` / `observe` / `stop`).
> Для разработки поставляется in-browser мок с настоящим вычислителем выражений.

Подробнее о доменах, слоях и границах — в [ARCHITECTURE.md](./ARCHITECTURE.md).

## Пакеты

| Пакет | Назначение |
| ----- | ---------- |
| `@tsai-pe/board` | Редактор `<pe-board>` — главный пакет |
| `@tsai-pe/board-core` | Стор борды, геометрия, A\*-роутинг связей |
| `@tsai-pe/board-ui` | Presentational-компоненты холста (узлы, сетка) |
| `@tsai-pe/ui-kit` | Headless (Angular Aria) + Tailwind компоненты |
| `@tsai-pe/models` | Модель данных, валидация, контракт бэкенда |
| `@tsai-pe/nodes` | Реестр типов узлов (порты, каталог, схемы параметров) |
| `@tsai-pe/theme` | Tailwind-токены и глобальный CSS |

`@tsai-pe/workflow-mock` (мок-бэкенд) и `@tsai-pe/workflow-http` (скелет REST/WS-адаптера)
— dev/reference-пакеты, в npm не публикуются.

## Быстрый старт

```bash
npm install
npx nx serve playground        # → http://localhost:4200/board
```

## Задачи

```bash
npx nx run-many -t vite:test         # unit-тесты
npx nx affected -t lint test build   # только затронутое (CI)
npx nx run-many -t build             # собрать все библиотеки
npx nx release                       # версии + публикация (independent, conv. commits)
npx nx graph                         # граф зависимостей
```

## Стек

Angular 21 · Angular Aria + CDK · Tailwind CSS v4 (своя dark-first тема) · Nx 23 ·
Vite + Vitest · Playwright (e2e playground).

## Лицензия

[MIT](./LICENSE) © Mikhail Tsai
