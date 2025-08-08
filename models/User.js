// User model for Firestore (optional, for future extensibility)
class User {
  constructor({ uid, email, phoneNumber, displayName, createdAt }) {
    this.uid = uid;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.displayName = displayName;
    this.createdAt = createdAt || new Date().toISOString();
  }
}

module.exports = User;
