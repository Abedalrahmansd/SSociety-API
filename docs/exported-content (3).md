# Messages API – Create a New Chat Message

This endpoint allows clients to send chat messages over HTTP, complementing the real-time Socket.IO events. It persists the message to the database and returns the created message object.

## Route & Middleware

- **URL:** `/api/v1/messages`
- **Method:** `POST`
- **Authentication:** JWT token required
- **Middleware:**
- `authenticate` parses and verifies the `Authorization` header
- (Currently, messages.routes.js only defines GET; POST should be added alongside GET in the same router)

## Request Headers

- **Authorization**: `Bearer <JWT_TOKEN>` (required)
- **Content-Type**: `application/json` (required)

## Request Body

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| chat_group_id | string | ID of the chat group (from `grades.chat_group_id`) | **Yes** |
| msg | string | The message text or caption | **Yes** |
| attachments | array\<integer\> | List of file IDs attached to this message | No |
| replyToId | integer | ID of the message being replied to | No |
| messageType | `"text"`,`"file"`,`"system"` | Type of message being sent (defaults to `"text"` if omitted) | No |


```json
{
  "chat_group_id": "room123",
  "msg": "Hello everyone!",
  "attachments": [45, 46],
  "replyToId": 12,
  "messageType": "text"
}
```

## Responses

### Success (201 Created)

- **Content-Type:** `application/json`
- **Body:** The newly created message object, matching the Sequelize `Message` model.

```json
{
  "id": 123,
  "chat_group_id": "room123",
  "sender": 7,
  "senderName": "alice@example.com",
  "msg": "Hello everyone!",
  "attachments": [45, 46],
  "replyToId": 12,
  "messageType": "text",
  "isDeleted": false,
  "isEdited": false,
  "hidefrom": [],
  "readList": [],
  "sentAt": "2024-07-01T12:34:56.789Z"
}
```

### Error Responses

| Status | Scenario | Body |
| --- | --- | --- |
| 400 | Missing or invalid fields | `{ "status": "error", "message": "chat_group_id and msg are required." }` |
| 401 | Missing or invalid JWT | `{ "status": "error", "message": "Authentication token is required." }` |
| 403 | Forbidden (e.g., user not allowed in group) | `{ "status": "error", "message": "Not allowed to create message." }` |
| 500 | Server or database error | `{ "status": "error", "message": "Failed to create message. Error: <details>" }` |


## 🔧 Under the Hood

1. **Controller Logic**

The HTTP POST handler should mirror the Socket.IO `send_message` event, which validates `chat_group_id`, creates a new record, and broadcasts via WebSocket:

```js
   const message = await Message.create({
     chat_group_id,
     sender: req.user.id,
     senderName: req.user.email,
     msg,
     attachments,
     replyToId,
     messageType,
     sentAt: new Date(),
   });
```

1. **Model Definition**

The `Message` Sequelize model defines the table structure and defaults:

```js
   const Message = sequelize.define('Message', {
     chat_group_id: { type: DataTypes.STRING, allowNull: false },
     sender:        { type: DataTypes.INTEGER, allowNull: false },
     senderName:    { type: DataTypes.STRING, allowNull: false },
     msg:           { type: DataTypes.TEXT, allowNull: false },
     isDeleted:     { type: DataTypes.BOOLEAN, defaultValue: false },
     isEdited:      { type: DataTypes.BOOLEAN, defaultValue: false },
     hidefrom:      { type: DataTypes.JSON,    defaultValue: [] },
     readList:      { type: DataTypes.JSON,    defaultValue: [] },
     sentAt:        { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
   }, {
     tableName: 'messages',
     timestamps: false,
   });
```

1. **Chat Group Validation**

Before creation, the controller should verify that `chat_group_id` exists in the `Grade` table to prevent invalid rooms.

## Related Components

- **Grade Model** (`grades.chat_group_id`) for room mapping
- **Authentication Middleware** (`authenticate`) enforcing JWT
- **Socket.IO Events** (`send_message`) for real-time broadcasting

```card
{
    "title": "Tip",
    "content": "Use this HTTP endpoint alongside Socket.IO to support clients without WebSocket capability."
}
```

### API Block

```api
{
    "title": "Create Chat Message",
    "description": "Persist a new chat message to the database and broadcast it to the room.",
    "method": "POST",
    "baseUrl": "https://api.example.com/api/v1",
    "endpoint": "/messages",
    "headers": [
        {
            "key": "Authorization",
            "value": "Bearer <token>",
            "required": true
        },
        {
            "key": "Content-Type",
            "value": "application/json",
            "required": true
        }
    ],
    "queryParams": [],
    "pathParams": [],
    "bodyType": "json",
    "requestBody": "{\n  \"chat_group_id\": \"room123\",\n  \"msg\": \"Hello everyone!\",\n  \"attachments\": [45, 46],\n  \"replyToId\": 12,\n  \"messageType\": \"text\"\n}",
    "formData": [],
    "rawBody": "",
    "responses": {
        "201": {
            "description": "Message created successfully.",
            "body": "{\n  \"id\": 123,\n  \"chat_group_id\": \"room123\",\n  \"sender\": 7,\n  \"senderName\": \"alice@example.com\",\n  \"msg\": \"Hello everyone!\",\n  \"attachments\": [45, 46],\n  \"replyToId\": 12,\n  \"messageType\": \"text\",\n  \"isDeleted\": false,\n  \"isEdited\": false,\n  \"hidefrom\": [],\n  \"readList\": [],\n  \"sentAt\": \"2024-07-01T12:34:56.789Z\"\n}"
        },
        "400": {
            "description": "Validation error.",
            "body": "{ \"status\": \"error\", \"message\": \"chat_group_id and msg are required.\" }"
        },
        "401": {
            "description": "Unauthorized.",
            "body": "{ \"status\": \"error\", \"message\": \"Authentication token is required.\" }"
        },
        "403": {
            "description": "Forbidden.",
            "body": "{ \"status\": \"error\", \"message\": \"Not allowed to create message.\" }"
        },
        "500": {
            "description": "Server error.",
            "body": "{ \"status\": \"error\", \"message\": \"Failed to create message. Error: <details>\" }"
        }
    }
}
```

This comprehensive documentation outlines the purpose, usage, and internal mechanics of the HTTP-based message creation endpoint, ensuring clarity for integrators and maintainers alike.