# SSociety API

A production-ready Node.js/Express REST API with Socket.io real-time capabilities for a Flutter-based student school management application. Features include real-time chat, assignments management, file uploads, user management, and grade/class management.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Manager, Student)
- **Real-Time Chat**: Socket.io-powered chat rooms per grade/class with typing indicators, read receipts, message editing/deletion
- **Real-Time Assignments**: Instant updates when assignments are created, verified, or deleted
- **File Management**: Secure file uploads with category-based organization
- **User Presence**: Track online/offline status in chat rooms
- **Database**: MySQL with Sequelize ORM, optimized with indexes and associations
- **Security**: Helmet.js, CORS, rate limiting, input validation with Joi
- **Production Ready**: Error handling, logging, environment-based configuration

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SSociety-API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.development.local` file (or `.env.production.local` for production) in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=ssociety_db
   DB_USER=root
   DB_PASSWORD=your_password_here

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=7d

   # CORS Configuration (comma-separated origins, or * for all)
   CORS_ORIGIN=*
   ```

4. **Create the database**
   ```sql
   CREATE DATABASE ssociety_db;
   ```

5. **Run the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

   The server will automatically create tables on first run (development only). For production, use migrations.

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register a new user | No |
| POST | `/auth/login` | Login and get JWT token | No |
| POST | `/auth/forgot_password` | Request password reset code | No |
| POST | `/auth/change_password` | Change password with verification code | No |
| POST | `/auth/verify_email` | Verify email with code | No |
| POST | `/auth/verify_code` | Verify a code (generic) | No |
| POST | `/auth/check_email` | Check if email exists | No |
| GET | `/auth/fetch_grades` | Get all grades | Yes |

#### Assignments (`/assignments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/assignments` | Create new assignment | Yes |
| GET | `/assignments?grade_id=1` | Get assignments for a grade | Yes |
| PATCH | `/assignments/:id/verify` | Verify assignment (Admin) | Yes (Admin) |
| DELETE | `/assignments` | Bulk delete assignments | Yes (Admin) |
| GET | `/assignments/admin/all` | Get all assignments (Admin) | Yes (Admin) |
| POST | `/assignments/admin` | Create assignment (Admin) | Yes (Admin) |
| PUT | `/assignments/admin/:id` | Update assignment (Admin) | Yes (Admin) |
| DELETE | `/assignments/admin/:id` | Delete assignment (Admin) | Yes (Admin) |

#### Files (`/files`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/files?grade_id=1&category=notes` | Get files by grade and category | Yes |
| POST | `/files` | Upload file (multipart/form-data) | Yes |
| PUT | `/files/:id` | Update file metadata (owner only) | Yes |
| DELETE | `/files` | Bulk delete files | Yes |
| GET | `/files/admin/all` | Get all files (Admin) | Yes (Admin) |
| POST | `/files/admin` | Create file record (Admin) | Yes (Admin) |
| PUT | `/files/admin/:id` | Update file (Admin) | Yes (Admin) |
| DELETE | `/files/admin/:id` | Delete file (Admin) | Yes (Admin) |

#### Users (`/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get current user profile | Yes |
| PUT | `/users/me` | Update own profile | Yes |
| GET | `/users/admin/all` | Get all users (Admin) | Yes (Admin) |
| POST | `/users/admin` | Create user (Admin) | Yes (Admin) |
| PUT | `/users/admin/:id` | Update user (Admin) | Yes (Admin) |
| DELETE | `/users/admin/:id` | Delete user (Admin) | Yes (Admin) |

#### Grades (`/grades`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/grades/:id/chat-group-id` | Get chat group ID for grade | Yes |
| GET | `/grades/admin/all` | Get all grades (Admin) | Yes (Admin) |
| POST | `/grades/admin` | Create grade (Admin) | Yes (Admin) |
| PUT | `/grades/admin/:id` | Update grade (Admin) | Yes (Admin) |
| DELETE | `/grades/admin/:id` | Delete grade (Admin) | Yes (Admin) |

#### Messages (`/messages`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/messages?chat_group_id=xxx&limit=50&before=2024-01-01` | Get messages for a chat room | Yes |

#### Version (`/version`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/version?platform=android` | Get app version info | No |
| GET | `/version/admin/all` | Get all versions (Admin) | Yes (Admin) |
| POST | `/version/admin` | Upsert version (Admin) | Yes (Admin) |

### Socket.io Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `chatGroupId` (string) | Join a chat room |
| `send_message` | `{ chat_group_id, msg, senderName?, hidefrom?, readList? }` | Send a message |
| `edit_message` | `{ id, msg }` | Edit own message |
| `delete_message` | `{ id }` | Delete own message (soft delete) |
| `mark_read` | `{ ids: [], chat_group_id }` | Mark messages as read |
| `hide_message` | `{ id }` | Hide message for current user |
| `typing_start` | `chatGroupId` | Start typing indicator |
| `typing_stop` | `chatGroupId` | Stop typing indicator |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `Message object` | New message received |
| `message_edited` | `Message object` | Message was edited |
| `message_deleted` | `Message object` | Message was deleted |
| `messages_read` | `{ chat_group_id, message_ids, reader_id }` | Messages marked as read |
| `typing` | `{ chat_group_id, user_id, isTyping }` | User typing status |
| `user_online` | `{ chat_group_id, user_id }` | User came online |
| `user_offline` | `{ chat_group_id, user_id }` | User went offline |
| `online_users` | `{ chat_group_id, user_ids: [] }` | List of online users in room |
| `new_assignment` | `Assignment object` | New assignment created |
| `assignment_updated` | `Assignment object` | Assignment was updated |
| `assignment_deleted` | `{ id, grade_id }` | Assignment was deleted |

### Example Requests

#### Signup
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123!",
    "fullname": "John Doe",
    "grade_id": 1,
    "is_admin": 0,
    "is_manager": 0
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123!",
    "device_info": {"platform": "android"}
  }'
```

#### Create Assignment
```bash
curl -X POST http://localhost:3000/api/v1/assignments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Math Homework",
    "description": "Complete exercises 1-10",
    "start_date": "2024-01-25T10:00:00Z",
    "grade_id": 1
  }'
```

#### Upload File
```bash
curl -X POST http://localhost:3000/api/v1/files \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/file.pdf" \
  -F "title=Physics Notes" \
  -F "category=notes" \
  -F "grade_id=1" \
  -F "description=Chapter 1"
```

## 🔌 Socket.io Connection (Flutter Example)

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

final socket = IO.io(
  'http://localhost:3000',
  IO.OptionBuilder()
    .setTransports(['websocket'])
    .enableForceNew()
    .setAuth({'token': jwtToken})
    .build(),
);

socket.onConnect((_) {
  socket.emit('join_room', chatGroupId);
});

socket.on('new_message', (data) {
  // Handle new message
});

socket.on('new_assignment', (data) {
  // Handle new assignment
});
```

## 🗄️ Database Schema

### Models & Relationships

- **User** ↔ **Grade** (many-to-one)
- **Assignment** ↔ **Grade** (many-to-one)
- **Assignment** ↔ **User** (creator, many-to-one)
- **File** ↔ **Grade** (many-to-one)
- **File** ↔ **User** (owner/uploader, many-to-one)
- **Message** ↔ **User** (sender, many-to-one)
- **Message** ↔ **Grade** (via `chat_group_id`)

### Indexes

- `users`: email (unique), grade_id, is_verified, is_admin/is_manager
- `grades`: chat_group_id (unique)
- `assignments`: grade_id + start_date, created_by, is_verified
- `messages`: chat_group_id + sentAt, sender, isDeleted
- `files`: grade_id + category, user_id, uploaded_at

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: Admin, Manager, Student roles
- **Input Validation**: Joi schemas for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **Helmet.js**: Security headers
- **CORS**: Configurable origin restrictions
- **Password Hashing**: bcrypt with salt rounds
- **SQL Injection Protection**: Sequelize ORM parameterized queries

## 🚀 Production Deployment

1. **Set `NODE_ENV=production`** in your environment
2. **Disable auto-sync**: Already disabled in `database/mysqldb.js`
3. **Use migrations**: Set up Sequelize migrations for schema changes
4. **Configure CORS**: Set `CORS_ORIGIN` to your Flutter app domain(s)
5. **Use HTTPS**: Configure reverse proxy (nginx) with SSL certificates
6. **Set strong JWT_SECRET**: Use a long, random string
7. **Enable logging**: Consider Winston or similar for structured logging
8. **Use PM2**: For process management and clustering

## 📝 Environment Variables

See `.env.example` (create `.env.development.local` or `.env.production.local`):

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: MySQL connection
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: Token expiration (e.g., "7d")
- `CORS_ORIGIN`: Allowed origins (comma-separated or "*")

## 🧪 Testing

Test Socket.io connection:
```bash
node tests/test-socket.js
```

## 📦 Project Structure

```
SSociety-API/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── database/         # DB connection & setup
├── middleware/       # Auth, validation, upload
├── models/           # Sequelize models
├── routes/           # Express routes
├── utils/            # Utilities (socket.io export)
├── server.js         # Main server file
└── package.json      # Dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC

## 👤 Author

Abedalrahman

---

**Note**: This API is designed for a Flutter mobile application. All endpoints return JSON, and real-time features use Socket.io with JWT authentication.

