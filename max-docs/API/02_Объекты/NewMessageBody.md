# NewMessageBody

## Пример объекта

```json
{
  "text": "string",
  "attachments": [{ ... }],
  "link": { ... },
  "notify": true,
  "format": "markdown"
}
```

## Поля

| Поле | Тип | Описание |
|------|-----|----------|
| **text** | string Nullable | до 4000 символов. Новый текст сообщения |
| **attachments** | AttachmentRequest[] Nullable | Вложения сообщения |
| **link** | object NewMessageLink Nullable | Ссылка на сообщение |
| **notify** | boolean optional | По умолчанию: `true`. Если `false`, участники чата не будут уведомлены |
| **format** | enum TextFormat Nullable optional | Enum: `"markdown"`, `"html"`. Если установлен, текст сообщения будет форматирован данным способом |
