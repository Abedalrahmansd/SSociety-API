# API Changes Summary for Flutter Migration

Quick reference of what changed from PHP to Node.js API.

## ✅ What Stayed the Same

- Most request/response formats
- Database schema (compatible)
- File upload format (multipart/form-data)
- Basic authentication flow (email/password)

## 🔄 What Changed

### 1. Authentication Required
- **Old**: No auth needed
- **New**: JWT token required for all protected routes
- **Action**: Add `Authorization: Bearer <token>` header

### 2. Base URL Structure
- **Old**: `http://server/auth.php?action=login`
- **New**: `http://server:3000/api/v1/auth/login`
- **Action**: Update base URL and remove `?action=` query params

### 3. User ID in Requests
- **Old**: Pass `user_id` in request body
- **New**: Server gets user ID from JWT token
- **Action**: Remove `user_id` from request bodies

### 4. Real-time Chat
- **Old**: Firebase Firestore
- **New**: Socket.io with JWT auth
- **Action**: Replace Firebase SDK with Socket.io client

### 5. HTTP Methods
- `fetch_grades`: POST → GET
- Admin routes: All under `/admin` subpath

## 🆕 New Features

1. **Real-time Assignments**: Listen for `new_assignment`, `assignment_updated`, `assignment_deleted`
2. **User Presence**: `user_online`, `user_offline` events
3. **Message Features**: Edit, delete, mark read, hide messages
4. **Typing Indicators**: Real-time typing status
5. **Read Receipts**: Track who read messages

## 📋 Quick Checklist

- [ ] Update base URL
- [ ] Add JWT token to headers
- [ ] Remove `user_id` from request bodies
- [ ] Update endpoint paths
- [ ] Replace Firebase with Socket.io
- [ ] Add real-time event listeners
- [ ] Update error handling
- [ ] Test all flows

---

Use this as a quick reference while migrating!

