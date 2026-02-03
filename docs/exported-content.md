## Messages API – DELETE /api/v1/messages/:id

This endpoint **soft-deletes** an existing chat message by marking its `isDeleted` flag to `true`. Clients must be authenticated via JWT. Only the **original sender** may delete their message.

### 🔒 Authentication

- Use a valid JWT in the `Authorization` header:

**Authorization:** Bearer <token>

- The `authenticate` middleware verifies the token and populates `req.user.id` .

### 🛣️ Request

```bash
DELETE /api/v1/messages/:id HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJI...
Content-Type: application/json
```

**Path Parameters**

| Name | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| **id** | path | string | yes | Unique ID of the message |


```api
{
    "title": "Delete Message",
    "description": "Soft-delete a chat message by its ID",
    "method": "DELETE",
    "baseUrl": "https://api.example.com",
    "endpoint": "/api/v1/messages/:id",
    "headers": [
        {
            "key": "Authorization",
            "value": "Bearer <token>",
            "required": true
        }
    ],
    "queryParams": [],
    "pathParams": [
        {
            "key": "id",
            "value": "Message ID",
            "required": true
        }
    ],
    "bodyType": "none",
    "requestBody": "",
    "formData": [],
    "rawBody": "",
    "responses": {
        "200": {
            "description": "Message marked as deleted",
            "body": "{\n  \"status\": \"success\",\n  \"data\": {\n    \"id\": 42,\n    \"chat_group_id\": \"abc123\",\n    \"sender\": 7,\n    \"senderName\": \"jane.doe@example.com\",\n    \"msg\": \"Hello, world!\",\n    \"isDeleted\": true,\n    \"isEdited\": false,\n    \"hidefrom\": [],\n    \"readList\": [],\n    \"sentAt\": \"2024-01-01T12:00:00.000Z\"\n  }\n}"
        },
        "204": {
            "description": "No content (alternative implementation)",
            "body": ""
        },
        "401": {
            "description": "Unauthorized \u2013 JWT missing or invalid",
            "body": "{ \"status\": \"error\", \"message\": \"Authentication token is required.\" }"
        },
        "403": {
            "description": "Forbidden \u2013 not the original sender",
            "body": "{ \"status\": \"error\", \"message\": \"Not allowed to delete this message.\" }"
        },
        "404": {
            "description": "Not Found \u2013 message does not exist",
            "body": "{ \"status\": \"error\", \"message\": \"Message not found.\" }"
        },
        "500": {
            "description": "Internal Server Error",
            "body": "{ \"status\": \"error\", \"message\": \"Failed to delete message. Error: <details>\" }"
        }
    }
}
```

### ✅ Success Response Patterns

| HTTP Code | Behavior |
| --- | --- |
| **200 OK** | Returns the **updated** message object with `isDeleted: true`. |
| **204 No Content** | (Optional) No response body. |


### ⚙️ Implementation Details

> Most services return the updated resource to confirm the deletion; adjust per team preference.

- The controller locates the message via `Message.findByPk(id)` and checks `message.sender === req.user.id`.
- If valid, it calls `message.update({ isDeleted: true })` on the Sequelize model .
- The model schema defines `isDeleted` as a boolean with default `false` .

### 🔗 Relations & Dependencies

- **Middleware**:
- `authenticate` ensures JWT validity.
- **Model**:
- `Message` (Sequelize) maps to the `messages` table.
- **Socket-Io Events**:
- For real-time deletion notifications, the same update logic emits a `message_deleted` event to the chat room.

---

<div align="center">🎉 **Message delete feature complete!** 🎉</div>