import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  sessionId: String,
  deviceInfo: String,
  lastLogin: Date,
  isActive: Boolean
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  image: String,
  emailVerified: Date,
  sessions: [SessionSchema]
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
