# Cell Components

Компоненты для отображения ячеек списка.

## CellSimple

Простая ячейка с текстом.

```jsx
import { CellSimple } from '@maxhub/max-ui';

<CellSimple 
  title="Заголовок"
  subtitle="Подзаголовок"
/>
```

### Свойства

| Свойство | Тип | Описание |
|----------|-----|----------|
| **title** | string | Заголовок ячейки |
| **subtitle** | string | Подзаголовок |

## CellHeader

Ячейка-заголовок секции.

```jsx
import { CellHeader } from '@maxhub/max-ui';

<CellHeader>Название секции</CellHeader>
```

## CellAction

Ячейка с действием (кнопкой).

```jsx
import { CellAction } from '@maxhub/max-ui';

<CellAction 
  title="Настройки"
  onClick={handleClick}
/>
```

## CellInput

Ячейка с полем ввода.

```jsx
import { CellInput } from '@maxhub/max-ui';

<CellInput 
  placeholder="Введите значение"
  value={value}
  onChange={handleChange}
/>
```

## CellList

Список ячеек.

```jsx
import { CellList } from '@maxhub/max-ui';

<CellList>
  <CellSimple title="Пункт 1" />
  <CellSimple title="Пункт 2" />
</CellList>
```
