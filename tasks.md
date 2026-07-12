# Tasks

Контекст проверки: проект должен быть набором `ui-kit` + pipeline builder/editor
kit для построения интерфейсов пайплайнов. Выполнение нод не должно жить в
публичном editor/builder коде; вся эмуляция допустима только в simulation/mock
backend, подключенном через backend contract.

## P0 - закрепить границу editor vs simulation

- [x] Перевести формы и порты на backend-provided node catalog.
  `@tsai-pe/nodes` теперь содержит только contract/helpers (`NodeCatalog`,
  `NodeTypeSpec`, `ParamField`, dynamic ports, default data, output schema/example).
  Конкретный demo/mock catalog живет в `workflow/mock`.
  - Done: mock runtime fields появляются только потому, что mock catalog вернул
    section `Mock runtime`; реальный backend вернет свои поля.

- [x] Убрать demo-флаг mock runtime controls из публичного `<pe-board>`.
  - Done: `showMockRuntimeControls` удален, формы полностью schema-driven.

- [x] Перевести control-flow на data-driven fields/ports.
  Switch cases теперь обычный `array` field, который UI умеет добавлять/удалять;
  output ports выводятся из `data.cases`. Legacy `node.config` оставлен только как
  compatibility fallback для старых документов/tests.

## P1 - привести публичную поверхность к сути проекта

- [x] Определиться с названием main package: `pipeline-builder-kit` vs
  текущий `@tsai-pe/board`.
  - Done: текущее имя `@tsai-pe/board` остается package name, а документация
    описывает его как visual pipeline editor/builder kit.

- [x] Сделать catalog обязательной внешней зависимостью или явно именовать
  статический catalog как demo fallback.
  - Done: `<pe-board>` использует `EMPTY_NODE_CATALOG` без provider; playground
    явно подключает `MOCK_NODE_CATALOG`.

- [x] Добавить тест/guard на отсутствие workflow imports и runtime execution в
  board packages.
  Nx boundaries уже запрещают прямые `board -> workflow` импорты, но стоит
  зафиксировать архитектурное правило регрессионным тестом или lint-паттерном:
  `packages/board/**` не должен импортировать workflow packages или содержать
  execution semantics.
  - Done: lint/test падает при появлении `workflow-mock`, `TestBackendSystem`,
    simulation engine logic внутри `packages/board/**`.

## P1 - синхронизировать demo flow и catalog/runtime

- [x] Удалить неподдерживаемый demo effect из внешнего
  `multi-channel-support-flow.json`.
  Этот browser-only effect не реализуем.
  - Done: внешний demo flow не содержит неподдерживаемый effect и связанный edge.

- [x] Выбрать один источник правды для demo pipeline.
  Сейчас seed pipeline живет в `apps/playground/.../board-playground.ts`, а
  внешний JSON отличается по fan-out count, effects и веткам.
  - Done: внешний JSON синхронизирован с catalog-driven control-flow моделью;
    typed seed в playground остается source of truth для приложения.

## P2 - зрелость backend contract

- [x] Решить sync/async форму `PipelineBackend.startRun`.
  `RestWsBackend` уже содержит workaround с local id, потому что REST start
  асинхронный. До production-интеграций лучше закрепить контракт: либо
  `startRun(): string` с локальным id как официальным поведением, либо
  `startRun(): Promise<string>`.
  - Done: выбран `startRun(): string`; local id + background reconciliation
    зафиксированы в contract docs как официальное поведение.

- [x] Формализовать side effects в backend contract или оставить их строго
  mock/playground-only.
  Mock backend имеет `observeSideEffects`, а board про это не знает - это хорошо.
  Но browser demo effects (`toast`, `dialog`, `download`) стоит явно
  задокументировать как extension outside `PipelineBackend` или вынести в
  отдельный optional port.
  - Done: side effects остаются mock/playground-only extension outside
    `PipelineBackend`; `@tsai-pe/board` остается только observer/editor.

## Что уже соответствует

- Nx dependency graph подтверждает ключевую границу: `board/*` не импортирует
  `workflow/*`; `workflow/mock` и `workflow/http` связаны с editor только через
  `@tsai-pe/models` и `@tsai-pe/nodes`.
- `PipelineBackend` вынесен в framework-free `shared/models` и используется
  `<pe-board>` только через injection token.
- `workflow/mock` действительно является simulation backend: именно там
  находятся expression evaluation, trigger passes, control-flow execution,
  split/merge fan-out, retry/continue behavior и mock side effects.
- `ui-kit` выглядит как самостоятельный shared UI layer и не зависит от board или
  workflow domains.
