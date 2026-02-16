# Update

Объект `Update` представляет различные типы событий, произошедших в чате. См. его наследников.

> Чтобы получать события из группового чата или канала, назначьте бота администратором.

## Поля

| Поле | Тип | Описание |
|------|-----|----------|
| **update_type** | string | Тип обновления. Примеры: `message_created`, `bot_started`, `message_callback` |
| **timestamp** | integer <int64> | Unix-время, когда произошло событие |
| **message** | object [Message](./Message.md) | Новое созданное сообщение |
| **user_locale** | string Nullable optional | Текущий язык пользователя в формате IETF BCP 47. Доступно только в диалогах |

## Типы обновлений

- `message_created` — создано новое сообщение
- `bot_started` — пользователь запустил бота
- `message_callback` — нажата кнопка callback
- `user_added` — пользователь добавлен в чат
- `user_removed` — пользователь удалён из чата
- `chat_title_changed` — изменено название чата
- `chat_photo_changed` — изменено фото чата

## Пример объекта

```json
{
  "update_type": "message_created",
  "timestamp": 0,
  "message": { ... },
  "user_locale": "ru-RU"
}
```
