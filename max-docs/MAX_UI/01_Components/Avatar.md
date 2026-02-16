# Avatar

Компонент для отображения аватара пользователя или бота.

## Импорт

```jsx
import { Avatar } from '@maxhub/max-ui';
```

## Использование

```jsx
<Avatar.Container size={72} form="squircle">
  <Avatar.Image src="https://example.com/avatar.jpg" />
</Avatar.Container>
```

## Подкомпоненты

- `Avatar.Container` — контейнер аватара
- `Avatar.Image` — изображение аватара
- `Avatar.Text` — текстовый аватар (буквы/инициалы)
- `Avatar.Icon` — аватар с иконкой
- `Avatar.OnlineDot` — индикатор онлайн-статуса
- `Avatar.Overlay` — оверлей поверх аватара
- `Avatar.CloseButton` — кнопка закрытия

## Свойства Avatar.Container

| Свойство | Тип | Описание |
|----------|-----|----------|
| **size** | number | Размер аватара в пикселях |
| **form** | `'circle' \| 'squircle'` | Форма аватара |

## Свойства Avatar.Image

| Свойство | Тип | Описание |
|----------|-----|----------|
| **src** | string | URL изображения |
| **alt** | string | Альтернативный текст |
