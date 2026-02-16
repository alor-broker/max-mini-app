# Panel

Панель — контейнер для группировки контента.

## Импорт

```jsx
import { Panel } from '@maxhub/max-ui';
```

## Использование

```jsx
<Panel mode="secondary" className="panel">
  <Grid gap={12} cols={1}>
    <Container>
      <Flex direction="column" align="center">
        <Avatar.Container size={72} form="squircle">
          <Avatar.Image src="https://example.com/avatar.jpg" />
        </Avatar.Container>
        <Typography.Title>Иван Иванов</Typography.Title>
      </Flex>
    </Container>
  </Grid>
</Panel>
```

## Свойства

| Свойство | Тип | Описание |
|----------|-----|----------|
| **mode** | `'primary' \| 'secondary'` | Режим отображения панели |
| **className** | string | Дополнительные CSS-классы |
