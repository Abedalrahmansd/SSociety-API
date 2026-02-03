# Flutter Migration Guide: PHP API → Node.js API

This guide helps migrate your Flutter app from the old PHP API to the new Node.js API.

## 🔄 Endpoint Mapping

### Authentication

| Old PHP Endpoint | New Node.js Endpoint | Changes |
|-----------------|---------------------|---------|
| `POST /auth.php?action=signup` | `POST /api/v1/auth/signup` | Same payload, returns `{ status, message, data: { user, token } }` |
| `POST /auth.php?action=login` | `POST /api/v1/auth/login` | Same payload, returns `{ status, message, data: { user, token, chat_group_id } }` |
| `POST /auth.php?action=forgot_password` | `POST /api/v1/auth/forgot_password` | Same |
| `POST /auth.php?action=change_password` | `POST /api/v1/auth/change_password` | Same |
| `POST /auth.php?action=verify_email` | `POST /api/v1/auth/verify_email` | Same |
| `POST /auth.php?action=verify_code` | `POST /api/v1/auth/verify_code` | Same |
| `POST /auth.php?action=check_email` | `POST /api/v1/auth/check_email` | Same |
| `POST /auth.php?action=fetch_grades` | `GET /api/v1/auth/fetch_grades` | Now GET, requires JWT token |

### Assignments

| Old PHP Endpoint | New Node.js Endpoint | Changes |
|-----------------|---------------------|---------|
| `POST /assinments.php` | `POST /api/v1/assignments` | Requires JWT token |
| `GET /assinments.php?grade_id=X` | `GET /api/v1/assignments?grade_id=X` | Requires JWT token |
| `PATCH /assinments.php` | `PATCH /api/v1/assignments/:id/verify` | Admin only, requires JWT |
| `DELETE /assinments.php` | `DELETE /api/v1/assignments` | Body: `{ ids: [] }`, Admin only |
| `POST /manager_assignments.php?action=get_all` | `GET /api/v1/assignments/admin/all` | Admin only |
| `POST /manager_assignments.php?action=create` | `POST /api/v1/assignments/admin` | Admin only |
| `POST /manager_assignments.php?action=update` | `PUT /api/v1/assignments/admin/:id` | Admin only |
| `POST /manager_assignments.php?action=delete` | `DELETE /api/v1/assignments/admin/:id` | Admin only |

### Files

| Old PHP Endpoint | New Node.js Endpoint | Changes |
|-----------------|---------------------|---------|
| `GET /files.php?grade_id=X&category=Y` | `GET /api/v1/files?grade_id=X&category=Y` | Requires JWT token |
| `POST /files.php` (multipart) | `POST /api/v1/files` (multipart) | Requires JWT token, same fields |
| `PUT /files.php` | `PUT /api/v1/files/:id` | Requires JWT token, owner only |
| `DELETE /files.php` | `DELETE /api/v1/files` | Body: `{ file_ids: [] }`, requires JWT |
| `POST /manager_files.php?action=get_all` | `GET /api/v1/files/admin/all` | Admin only |
| `POST /manager_files.php?action=create` | `POST /api/v1/files/admin` | Admin only |
| `POST /manager_files.php?action=update` | `PUT /api/v1/files/admin/:id` | Admin only |
| `POST /manager_files.php?action=delete` | `DELETE /api/v1/files/admin/:id` | Admin only |

### Users

| Old PHP Endpoint | New Node.js Endpoint | Changes |
|-----------------|---------------------|---------|
| `POST /users.php?action=getUser` | `GET /api/v1/users/me` | Returns current user + chat_group_id |
| `POST /update_user.php` | `PUT /api/v1/users/me` | Same fields, requires JWT |
| `POST /manager_users.php?action=get_users` | `GET /api/v1/users/admin/all` | Admin only |
| `POST /manager_users.php?action=create_user` | `POST /api/v1/users/admin` | Admin only |
| `POST /manager_users.php?action=update_user` | `PUT /api/v1/users/admin/:id` | Admin only |
| `POST /manager_users.php?action=delete_user` | `DELETE /api/v1/users/admin/:id` | Admin only |

### Grades

| Old PHP Endpoint | New Node.js Endpoint | Changes |
|-----------------|---------------------|---------|
| `POST /manager_grades.php?action=get_all` | `GET /api/v1/grades/admin/all` | Admin only |
| `POST /manager_grades.php?action=create` | `POST /api/v1/grades/admin` | Admin only |
| `POST /manager_grades.php?action=update` | `PUT /api/v1/grades/admin/:id` | Admin only |
| `POST /manager_grades.php?action=delete` | `DELETE /api/v1/grades/admin/:id` | Admin only |
| `POST /manager_grades.php?action=get_chat_group_id` | `GET /api/v1/grades/:id/chat-group-id` | Returns `{ chat_group_id }` |

### Version Control

| Old PHP Endpoint | New Node.js Endpoint | Changes |
|-----------------|---------------------|---------|
| `GET /version_control.php?platform=android` | `GET /api/v1/version?platform=android` | Same response |
| `POST /version_control.php?action=get_all` | `GET /api/v1/version/admin/all` | Admin only |
| `POST /version_control.php?action=update_version` | `POST /api/v1/version/admin` | Admin only |

### Messages (NEW - Real-time Chat)

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/messages?chat_group_id=X&limit=50&before=DATE` | Get messages for a chat room |
| Socket.io: `join_room` | Join a chat room |
| Socket.io: `send_message` | Send a message |
| Socket.io: `edit_message` | Edit own message |
| Socket.io: `delete_message` | Delete own message |
| Socket.io: `mark_read` | Mark messages as read |
| Socket.io: `hide_message` | Hide message for user |
| Socket.io: `typing_start/stop` | Typing indicators |

## 🔑 Authentication Changes

### Old PHP (No Auth)
- No authentication required
- User ID passed in request body

### New Node.js (JWT Required)
- **All protected routes require JWT token**
- Add header: `Authorization: Bearer <token>`
- Token obtained from `/auth/login` or `/auth/signup`
- Token expires (default: 7 days)

### Flutter Implementation

```dart
// Store token after login/signup
String? authToken;

// Add to all API requests
headers: {
  'Authorization': 'Bearer $authToken',
  'Content-Type': 'application/json',
}
```

## 📡 Socket.io Integration (NEW)

### Old: Firebase Real-time
- Used Firebase Firestore for real-time chat

### New: Socket.io
- Connect to: `http://your-server:3000`
- Authenticate with JWT token
- Join rooms by `chat_group_id`

### Flutter Implementation

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

final socket = IO.io(
  'http://your-server:3000',
  IO.OptionBuilder()
    .setTransports(['websocket'])
    .enableForceNew()
    .setAuth({'token': jwtToken})
    .build(),
);

// Join room
socket.emit('join_room', chatGroupId);

// Listen for events
socket.on('new_message', (data) {
  // Handle new message
});

socket.on('new_assignment', (data) {
  // Handle new assignment (real-time!)
});

socket.on('user_online', (data) {
  // Handle user came online
});
```

## 🔄 Response Format Changes

### Old PHP Response
```json
{
  "status": "success",
  "message": "...",
  "data": {...}
}
```

### New Node.js Response (Same Structure!)
- Most endpoints use the same format
- Some endpoints return arrays directly (e.g., `GET /assignments`)

### Error Responses
```json
{
  "status": "error",
  "message": "Error description"
}
```

## 📝 Key Changes Summary

1. **Base URL**: Change from PHP endpoints to `/api/v1/...`
2. **Authentication**: Add JWT token to all requests (except auth endpoints)
3. **HTTP Methods**: Some endpoints changed (e.g., `fetch_grades` is now GET)
4. **Real-time**: Replace Firebase with Socket.io
5. **User ID**: No longer pass `user_id` in body - use JWT token (server gets it from token)
6. **Admin Routes**: All admin routes now under `/admin` subpath

## 🚀 Migration Steps

1. **Update API Base URL**
   ```dart
   // Old
   final baseUrl = 'http://your-php-server';
   
   // New
   final baseUrl = 'http://your-node-server:3000/api/v1';
   ```

2. **Add JWT Token Storage**
   - Store token after login/signup
   - Add token to all API requests

3. **Update Endpoint Paths**
   - Use the mapping table above
   - Update HTTP methods where changed

4. **Replace Firebase with Socket.io**
   - Install `socket_io_client` package
   - Update chat implementation
   - Add real-time assignment listeners

5. **Remove `user_id` from Request Bodies**
   - Server gets user ID from JWT token
   - Only admin routes might need user IDs

6. **Update Error Handling**
   - Check for `status: 'error'` in responses
   - Handle 401 (unauthorized) for expired tokens

## 🐛 Common Issues

### "Authentication token is required"
- Make sure you're sending JWT in `Authorization` header
- Token might be expired - re-login

### "Administrator privileges are required"
- User is not admin - check `is_admin` field
- Use admin user for admin routes

### Socket.io not connecting
- Check server is running
- Verify JWT token is valid
- Check CORS settings

### Foreign key constraint errors
- Make sure referenced IDs exist (e.g., `grade_id` must exist in `grades` table)

## 📚 Additional Resources

- See `README.md` for full API documentation
- See `tests/TESTING_GUIDE.md` for testing examples
- Socket.io events documented in `README.md`

---

**Ready to migrate?** Share your Flutter project and I'll help update it! 🚀

