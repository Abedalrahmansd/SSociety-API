## 📨 Messages API – GET /api/v1/messages/:id

Retrieves a single chat message by its unique identifier. This endpoint lets clients fetch the full details of a specific message, including sender info and metadata. It integrates with the **Message** model and shares the same JWT-based security as other `/api/v1` routes.

### Route Definition

Defines the HTTP GET route for fetching one message by ID.

```js
// routes/messages.routes.js
import { Router } from 'express';
import { getMessageById } from '../controllers/messages.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Fetch a specific message
router.get('/:id', authenticate, getMessageById);

export default router;
```

*Located alongside the list‐fetch route in the messages router*

### Controller Implementation

Handles the request, queries the database, and returns JSON or an error.

```js
// controllers/messages.controller.js
import Message from '../models/message.model.js';

export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByPk(id);

    if (!message) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Message not found.' });
    }

    return res
      .status(200)
      .json({ status: 'success', data: message.toJSON() });
  } catch (error) {
    console.error('getMessageById error:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Server error: ' + error.message });
  }
};
```

*Uses Sequelize’s `findByPk` to fetch by primary key*

### Message Model

The **Message** schema outlines all stored fields for a chat message:

| Field | Type | Description |
| --- | --- | --- |
| `id` | int | Auto-increment primary key |
| `chat_group_id` | string | Identifier of the chat room |
| `sender` | int | User ID of the sender |
| `senderName` | string | Display name of the sender |
| `msg` | text | Message content |
| `isDeleted` | boolean | Soft-delete flag |
| `isEdited` | boolean | Edit flag |
| `hidefrom` | JSON | Array of user IDs who have hidden this message |
| `readList` | JSON | Array of user IDs who have read this message |
| `sentAt` | date | Timestamp when the message was sent |


*Defined in models/message.model.js*

### Authentication

All message endpoints require a valid JWT in the `Authorization` header.

- **Header**:
- `Authorization: Bearer <token>`
- **Failure**:
- Missing or invalid token returns **401 Unauthorized**.

### Path Parameters

| Name | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| id | path | string | yes | Message’s `id` |


### Responses

| Status | Description | Body Example |
| --- | --- | --- |
| 200 | Message found and returned | `{ "status":"success", "data": { /* message object */ } }` |
| 401 | Invalid or missing token | `{ "status":"error", "message":"Authentication required." }` |
| 404 | Message not found | `{ "status":"error", "message":"Message not found." }` |
| 500 | Internal server error | `{ "status":"error", "message":"Server error: <details>" }` |


### Dependencies & Related Components

- **Middleware**
- `authenticate` enforces JWT auth
- **Controller**
- `getMessageById` lives alongside `getMessages` in `messages.controller.js`
- **Model**
- Message schema in `models/message.model.js`
- **Error Handling**
- Unhandled exceptions propagated to the global error handler in `server.js`

```card
{
    "title": "Tip",
    "content": "Use this endpoint sparingly; clients should cache messages and avoid frequent single-message fetches to reduce load."
}
```

### API Example

```api
{
    "title": "Get Message by ID",
    "description": "Retrieve the details of a single chat message.",
    "method": "GET",
    "baseUrl": "https://api.yourdomain.com",
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
            "value": "The unique ID of the message",
            "required": true
        }
    ],
    "bodyType": "none",
    "requestBody": "",
    "formData": [],
    "rawBody": "",
    "responses": {
        "200": {
            "description": "Message retrieved successfully",
            "body": "{\n  \"status\": \"success\",\n  \"data\": {\n    \"id\": 123,\n    \"chat_group_id\": \"abc123\",\n    \"sender\": 45,\n    \"senderName\": \"jane.doe@example.com\",\n    \"msg\": \"Hello, world!\",\n    \"isDeleted\": false,\n    \"isEdited\": false,\n    \"hidefrom\": [],\n    \"readList\": [45, 67],\n    \"sentAt\": \"2026-01-24T12:34:56.789Z\"\n  }\n}"
        },
        "401": {
            "description": "Unauthorized",
            "body": "{\n  \"status\": \"error\",\n  \"message\": \"Authentication required.\"\n}"
        },
        "404": {
            "description": "Not Found",
            "body": "{\n  \"status\": \"error\",\n  \"message\": \"Message not found.\"\n}"
        },
        "500": {
            "description": "Server Error",
            "body": "{\n  \"status\": \"error\",\n  \"message\": \"Server error: <details>\"\n}"
        }
    }
}
```

This endpoint aligns with the project’s versioned REST API under `/api/v1`, reusing existing patterns for route definition, authentication, and error handling.