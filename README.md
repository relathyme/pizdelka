# pizdelka
бот который пиздит
собирает сообщения из чата и отвечает ими

пример config.json:
```json
{
  "token": "yourtoken",
  "limit": 1000,
  "phrase": "phrase to activate/deactivate",
  "owner": "yourid",
  "users": ["user id to talk with", "or leave empty to talk with all", "..."],
  "channel": "channel ID to fetch messages from or leave empty to fetch from channel where it was used"
}
```
