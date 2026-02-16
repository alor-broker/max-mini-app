# Forms - Обзор

Компоненты форм для ввода данных.

## Input

Поле ввода текста.

```jsx
import { Input } from '@maxhub/max-ui';

<Input 
  placeholder="Введите текст"
  value={value}
  onChange={handleChange}
/>
```

## Textarea

Многострочное поле ввода.

```jsx
import { Textarea } from '@maxhub/max-ui';

<Textarea 
  placeholder="Введите сообщение"
  rows={4}
/>
```

## Switch

Переключатель (toggle).

```jsx
import { Switch } from '@maxhub/max-ui';

<Switch 
  checked={isOn}
  onChange={handleToggle}
/>
```

## SearchInput

Поле поиска с иконкой.

```jsx
import { SearchInput } from '@maxhub/max-ui';

<SearchInput 
  placeholder="Поиск..."
  value={query}
  onChange={handleSearch}
/>
```
