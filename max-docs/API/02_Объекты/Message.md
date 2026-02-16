# Message

## Поля

| Поле | Тип | Описание |
|------|-----|----------|
| **sender** | object [User](./User.md) optional | Пользователь, отправивший сообщение |
| **recipient** | object Recipient | Получатель сообщения. Может быть пользователем или чатом |
| **timestamp** | integer <int64> | Время создания сообщения в формате Unix-time |
| **link** | object LinkedMessage Nullable optional | Пересланное или ответное сообщение |
| **body** | object MessageBody | Содержимое сообщения. Текст + вложения. Может быть null, если сообщение содержит только пересланное сообщение |
| **stat** | object MessageStat Nullable optional | Статистика сообщения |
| **url** | string Nullable optional | Публичная ссылка на пост в канале. Отсутствует для диалогов и групповых чатов |

## Пример объекта

```json
{
  "sender": { ... },
  "recipient": { ... },
  "timestamp": 0,
  "link": { ... },
  "body": { ... },
  "stat": { ... },
  "url": "string"
}
```
