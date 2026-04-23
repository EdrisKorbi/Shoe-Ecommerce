import type { User } from './types';

const API_URL = 'http://localhost:8080';
const CURRENT_USER_KEY = 'app_current_user';
const TOKEN_KEY = 'app_token';

// Get currently logged in user from localStorage
export function getCurrentUser(): User | null {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
}

// Save currently logged in user to localStorage
function setCurrentUser(user: User | null): void {
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
}

// Save/remove token
function setToken(token: string | null): void {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

// Sign up using Go backend
export async function signup(
    email: string,
    password: string,
    name: string
): Promise<{ success: boolean; error?: string }> {
    if (!email || !password || !name) {
        return { success: false, error: 'All fields are required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return { success: false, error: 'Invalid email format (example: user@gmail.com)' };
    }

    if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Signup failed',
            };
        }

        const newUser: User = {
            id: String(data.user.id),
            email: data.user.email,
            name: data.user.name,
            profilePicture: data.user.profilePicture || '',

            createdAt: new Date().toISOString(),
        };

        setCurrentUser(newUser);
        setToken(data.token);

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Could not connect to server' };
    }
}

// Login using Go backend
export async function login(
    email: string,
    password: string
): Promise<{ success: boolean; error?: string }> {
    if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Invalid email or password',
            };
        }

        const user: User = {
            id: String(data.user.id),
            email: data.user.email,
            name: data.user.name,
            profilePicture: data.user.profilePicture || '',
            createdAt: new Date().toISOString(),
        };

        setCurrentUser(user);
        setToken(data.token);

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Could not connect to server' };
    }
}

// Logout
export function logout(): void {
    setCurrentUser(null);
    setToken(null);
}

// Update user profile locally for now
export async function updateUserProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        return { success: false, error: 'Not logged in' };
    }

    const updatedUser: User = {
        ...currentUser,
        ...updates,
    };

    if (updates.profilePicture !== undefined) {
        const token = getToken();

        const response = await fetch(`${API_URL}/auth/profile-picture`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                profilePicture: updates.profilePicture,
            }),
        });

        if (!response.ok) {
            return { success: false, error: 'Could not update profile picture' };
        }
    }

    setCurrentUser(updatedUser);

    return { success: true };
}