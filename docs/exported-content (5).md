# Messages API – GET /api/v1/messages

Retrieve chat message history for a specific chat group. Supports simple cursor-based pagination and hides messages the requesting user has chosen to hide.

## 🔒 Authentication

All requests to this endpoint require a valid JSON Web Token in the `Authorization` header. The token is verified by the `authenticate` middleware before handling the request .

- Header
- **Authorization**: `Bearer <token>` (required)

## 🎯 Endpoint

```bash
GET /api/v1/messages
```

Base URL is determined by your deployment (e.g. `https://api.example.com`).

## ⚙️ Query Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| chat_group_id | string | yes | Identifier of the chat group (must exist in `grades.chat_group_id`). |
| limit | integer | no | Maximum number of messages to return. Defaults to `50`. |
| before | string | no | ISO 8601 timestamp. Returns only messages with `sentAt` < this value. |


## 🔍 Example Request

```bash
curl -X GET "https://api.example.com/api/v1/messages?chat_group_id=room123&limit=20&before=2023-10-10T12:00:00Z" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
```

## ✅ Success Response (200 OK)

> Only messages not present in the user’s `hidefrom` list are returned.

Returns a JSON object with a `status` and an array of message objects.

### Response Schema

| Field | Type | Description |
| --- | --- | --- |
| status | string | Always `"success"`. |
| data | array | List of message objects. |
|   id | integer | Unique message identifier (auto-increment PK). |
|   chat_group_id | string | Chat group identifier. |
|   sender | integer | User ID of the sender. |
|   senderName | string | Display name of the sender. |
|   msg | string | Text content of the message. |
|   isEdited | boolean | `true` if edited after sending. |
|   isDeleted | boolean | `true` if soft-deleted. |
|   hidefrom | array | User IDs who have hidden this message. |
|   readList | array | User IDs who have marked this message as read. |
|   sentAt | string | ISO 8601 timestamp when message was sent. |


### Example Body

```json
{
  "status": "success",
  "data": [
    {
      "id": 123,
      "chat_group_id": "room123",
      "sender": 42,
      "senderName": "alice@example.com",
      "msg": "Hello, everyone! 👋",
      "isEdited": false,
      "isDeleted": false,
      "hidefrom": [],
      "readList": [42, 7, 19],
      "sentAt": "2023-10-10T11:59:00.000Z"
    },
    {
      "id": 122,
      "chat_group_id": "room123",
      "sender": 7,
      "senderName": "bob@example.com",
      "msg": "Hi Alice!",
      "isEdited": false,
      "isDeleted": false,
      "hidefrom": [],
      "readList": [7],
      "sentAt": "2023-10-10T11:58:00.000Z"
    }
  ]
}
```

## ⚠️ Error Responses

| HTTP Status | Scenario | Body |
| --- | --- | --- |
| 400 Bad Request | Missing or invalid `chat_group_id` or invalid pagination value. | `{ "status": "error", "message": "chat_group_id is required." }` |
| 401 Unauthorized | Missing or malformed JWT. | `{ "status": "error", "message": "Authentication token is required." }` |
| 500 Internal Server Error | Unexpected server or database error. | `{ "status": "error", "message": "Failed to fetch messages. Error: <details>" }` |


### Example 400 Response

```json
{
  "status": "error",
  "message": "chat_group_id is required."
}
```

## 📈 Sequence Diagram

```mermaid
sequenceDiagram
  participant Client
  participant API
  participant Auth
  participant DB
  Client->>API: GET /api/v1/messages?chat_group_id=room123&...
  API->>Auth: validate JWT
  Auth-->>API: user info
  API->>DB: SELECT * FROM messages WHERE chat_group_id="room123" AND sentAt < ...
  DB-->>API: [message rows]
  API-->>Client: 200 OK { status, data }
```