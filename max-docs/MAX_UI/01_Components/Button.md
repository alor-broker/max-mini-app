# Button

Кнопка с различными вариантами отображения.

## Импорт

```jsx
import { Button } from '@maxhub/max-ui';
```

## Использование

```jsx
<Button>
  Нажми меня
</Button>

<Button asChild>
  <a href="/link">Ссылка как кнопка</a>
</Button>
```

## Свойства

| Свойство | Тип | Описание |
|----------|-----|----------|
| **asChild** | boolean | Полиморфный компонент — позволяет использовать дочерний элемент как корневой |
| **disabled** | boolean | Отключена ли кнопка |
| **iconBefore** | ReactNode | Иконка перед текстом |
| **innerClassNames** | object | Кастомизация внутренних элементов |

## Кастомизация

```jsx
<Button 
  disabled={true}
  iconBefore={<svg />}
  innerClassNames={{
    iconBefore: 'my-custom-icon-class'
  }}
>
  Кнопка с иконкой
</Button>
```
