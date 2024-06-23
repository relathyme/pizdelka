# pizdelka
бот который пиздит
собирает сообщения из чата и отвечает ими

пример config.json:
```json
{
  "token": "yourtoken",
  "limit": 1000,
  "owner": "yourid",
  "users": ["user id to talk with", "or leave empty to talk with all", "..."],
  "channel_from": "channel ID to fetch messages from",
  "channel_to": "channel ID to post messages",
  "prefix": "prefix for eval and exec commands"
}
```
