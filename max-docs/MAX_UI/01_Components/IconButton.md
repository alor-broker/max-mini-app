# IconButton

Кнопка с иконкой.

## Импорт

```jsx
import { IconButton } from '@maxhub/max-ui';
```

## Использование

```jsx
<IconButton icon={<SettingsIcon />} />
<IconButton icon={<CloseIcon />} onClick={handleClose} />
```

## Свойства

| Свойство | Тип | Описание |
|----------|-----|----------|
| **icon** | ReactNode | Иконка |
| **onClick** | function | Обработчик нажатия |
| **disabled** | boolean | Отключена ли кнопка |
