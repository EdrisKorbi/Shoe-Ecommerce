// src/auth.ts
import type { User } from './types';

const USERS_KEY = 'app_users';
const CURRENT_USER_KEY = 'app_current_user';

// Get all registered users from localStorage
function getAllUsers(): User[] {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Save all users to localStorage
function saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get currently logged in user
export function getCurrentUser(): User | null {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
}

// Set currently logged in user
function setCurrentUser(user: User | null): void {
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
}

// Sign up: create a new user
export function signup(email: string, password: string, name: string): { success: boolean; error?: string } {
    const users = getAllUsers();

    if (users.find(u => u.email === email)) {
        return { success: false, error: 'Email already registered' };
    }

    if (!email || !password || !name) {
        return { success: false, error: 'All fields are required' };
    }

    if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Create new user
    const newUser: User = {
        id: Date.now().toString(),  // Simple ID generator
        email,
        password,  // TODO: Hash this in real app!
        name,
        createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    return { success: true };
}

// Login: authenticate user
export function login(email: string, password: string): { success: boolean; error?: string } {
    const users = getAllUsers();

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return { success: false, error: 'Invalid email or password' };
    }

    setCurrentUser(user);
    return { success: true };
}

// Logout
export function logout(): void {
    setCurrentUser(null);
}

// Update user profile
export function updateUserProfile(updates: Partial<User>): { success: boolean; error?: string } {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return { success: false, error: 'Not logged in' };
    }

    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
        return { success: false, error: 'User not found' };
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    saveUsers(users);
    setCurrentUser(users[userIndex]);

    return { success: true };
}
