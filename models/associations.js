// Centralized model associations for better maintainability
// Import all models
import User from './user.model.js';
import Grade from './grade.model.js';
import Assignment from './assignment.model.js';
import Message from './message.model.js';
import File from './file.model.js';

// User associations
User.belongsTo(Grade, { 
  foreignKey: 'grade_id', 
  as: 'grade' 
});

// Grade associations
Grade.hasMany(User, { 
  foreignKey: 'grade_id', 
  as: 'users' 
});

Grade.hasMany(Assignment, { 
  foreignKey: 'grade_id', 
  as: 'assignments' 
});

Grade.hasMany(File, { 
  foreignKey: 'grade_id', 
  as: 'files' 
});

// Assignment associations
Assignment.belongsTo(Grade, { 
  foreignKey: 'grade_id', 
  as: 'grade' 
});

Assignment.belongsTo(User, { 
  foreignKey: 'created_by', 
  as: 'creator' 
});

// Message associations
Message.belongsTo(User, { 
  foreignKey: 'sender', 
  as: 'senderUser' 
});

// Note: Message.chat_group_id is a string that maps to Grade.chat_group_id
// We can't use a direct foreign key, but we can query by chat_group_id

// File associations
File.belongsTo(Grade, { 
  foreignKey: 'grade_id', 
  as: 'grade' 
});

File.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'owner' 
});

File.belongsTo(User, { 
  foreignKey: 'uploaded_by', 
  as: 'uploader' 
});

export { User, Grade, Assignment, Message, File };

