# Layout - Обзор

Компоненты для построения макетов и разметки.

## Container

Контейнер с отступами и ограничением ширины.

```jsx
import { Container } from '@maxhub/max-ui';

<Container className="my-container">
  Контент внутри контейнера
</Container>
```

## Flex

Flexbox контейнер для гибкого расположения элементов.

```jsx
import { Flex } from '@maxhub/max-ui';

<Flex direction="column" align="center" gap={12}>
  <div>Элемент 1</div>
  <div>Элемент 2</div>
</Flex>
```

### Свойства

| Свойство | Тип | Описание |
|----------|-----|----------|
| **direction** | `'row' \| 'column'` | Направление flex |
| **align** | `'start' \| 'center' \| 'end' \| 'stretch'` | Выравнивание по поперечной оси |
| **justify** | `'start' \| 'center' \| 'end' \| 'between' \| 'around'` | Выравнивание по главной оси |
| **gap** | number | Отступ между элементами |
| **wrap** | boolean | Разрешить перенос элементов |

## Grid

Сетка для расположения элементов.

```jsx
import { Grid } from '@maxhub/max-ui';

<Grid gap={12} cols={2}>
  <div>Элемент 1</div>
  <div>Элемент 2</div>
  <div>Элемент 3</div>
  <div>Элемент 4</div>
</Grid>
```

### Свойства

| Свойство | Тип | Описание |
|----------|-----|----------|
| **cols** | number | Количество колонок |
| **gap** | number | Отступ между элементами |
