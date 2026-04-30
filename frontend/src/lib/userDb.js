/**
 * Local User Database
 * 
 * A localStorage-based user database that works without API.
 * Stores user credentials locally so users can login even when API is down.
 * 
 * Functions:
 * - createUser: Create a new user account
 * - validateUser: Validate email and password
 * - getUser: Get user by ID or email
 * - updateUser: Update user profile
 * - deleteUser: Delete user account
 * - getAllUsers: List all registered users (admin only)
 */

const USER_DB_KEY = 'om-satarkar-store-users';

/**
 * Generate a unique user ID
 */
function generateUserId() {
  return 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Simple hash function for passwords (local storage only - not for production)
 * Note: This is for local demo purposes only. In production, always use server-side hashing.
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

/**
 * Load all users from localStorage
 */
function loadUsers() {
  try {
    const raw = window.localStorage.getItem(USER_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save all users to localStorage
 */
function saveUsers(users) {
  try {
    window.localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a new user account
 * @param {Object} userData - User data object
 * @param {string} userData.name - Full name
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @param {string} [userData.role='user'] - User role ('user' or 'admin')
 * @returns {Object} Created user object (without password)
 */
export function createUser({ name, email, password, role = 'user' }) {
  const users = loadUsers();
  
  // Check if email already exists
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email already exists');
  }
  
  // Create new user
  const newUser = {
    id: generateUserId(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: simpleHash(password),
    role: role === 'admin' ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  
  // Return user without password
  const { passwordHash, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

/**
 * Validate user credentials
 * @param {string} identifier - Email or username
 * @param {string} password - Password
 * @param {string} [role='user'] - User role to validate against
 * @returns {Object|null} User object if valid, null otherwise
 */
export function validateUser(identifier, password, role = 'user') {
  const users = loadUsers();
  const normalizedIdentifier = String(identifier).trim().toLowerCase();
  const passwordHash = simpleHash(password);
  
  const user = users.find(u => {
    const emailMatch = u.email.toLowerCase() === normalizedIdentifier;
    const usernameMatch = u.username && u.username.toLowerCase() === normalizedIdentifier;
    return (emailMatch || usernameMatch) && u.role === role;
  });
  
  if (!user || user.passwordHash !== passwordHash) {
    return null;
  }
  
  // Return user without password
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object|null} User object or null
 */
export function getUser(userId) {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return null;
  }
  
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get user by email
 * @param {string} email - Email address
 * @returns {Object|null} User object or null
 */
export function getUserByEmail(email) {
  const users = loadUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return null;
  }
  
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated user object or null
 */
export function updateUser(userId, updates) {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    return null;
  }
  
  // Don't allow updating id, email, or role directly
  const { id, email, role, createdAt, ...allowedUpdates } = updates;
  
  // Update user fields
  users[index] = { ...users[index], ...allowedUpdates };
  saveUsers(users);
  
  const { passwordHash, ...userWithoutPassword } = users[index];
  return userWithoutPassword;
}

/**
 * Delete user account
 * @param {string} userId - User ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteUser(userId) {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    return false;
  }
  
  users.splice(index, 1);
  saveUsers(users);
  return true;
}

/**
 * Get all users (admin only)
 * @returns {Array} Array of user objects without passwords
 */
export function getAllUsers() {
  const users = loadUsers();
  return users.map(({ passwordHash, ...user }) => user);
}

/**
 * Check if email is available
 * @param {string} email - Email to check
 * @returns {boolean} True if available, false if taken
 */
export function isEmailAvailable(email) {
  const users = loadUsers();
  return !users.some(u => u.email.toLowerCase() === email.toLowerCase());
}

export default {
  createUser,
  validateUser,
  getUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  getAllUsers,
  isEmailAvailable,
};
