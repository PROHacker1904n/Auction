import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document automatically deleted after 600 seconds (10 minutes)
  }
});

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

export default PasswordReset;
