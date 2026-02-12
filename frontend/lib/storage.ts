/**
 * User-specific storage helper functions
 * Ensures each user has their own isolated data (wallet, favorites, history, etc.)
 * Now syncs with MongoDB backend for persistence
 */

export interface User {
  name: string;
  email: string;
  phone: string;
  provider?: string;
  picture?: string;
  role?: 'user' | 'listener' | 'admin';
}

// Backend API URL - defaults to separate backend server
const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? 'http://localhost:5000' : 'http://localhost:5000');

/**
 * Get a user-specific storage key
 */
export function getUserStorageKey(userId: string, key: string): string {
  return `user_${userId}_${key}`;
}

/**
 * Get user ID from user data (using email as unique identifier)
 */
export function getUserId(user: User | null): string | null {
  if (!user || !user.email) return null;
  // Use email as unique identifier, sanitize for storage key
  return user.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

/**
 * Get current logged-in user from storage
 * Uses sessionStorage for current session (cleared on tab close)
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userData = sessionStorage.getItem('currentUser');
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

/**
 * Set current logged-in user in storage
 * Uses sessionStorage for current session, localStorage for persistent data
 * Also syncs with backend
 */
export async function setCurrentUser(user: User): Promise<void> {
  if (typeof window === 'undefined') return;
  // Store current user in sessionStorage (cleared on tab close)
  sessionStorage.setItem('currentUser', JSON.stringify(user));

  // Store user info in localStorage for persistence (survives logout)
  localStorage.setItem('lastLoggedInUser', JSON.stringify(user));

  // Save user to backend
  await saveUserDataToBackend(user.email, user);

  // Initialize user-specific data in localStorage if it doesn't exist
  const userId = getUserId(user);
  if (userId) {
    // Try to load from backend first, fallback to localStorage
    const backendBalance = await fetchWalletBalanceFromBackend(user.email);
    const walletKey = getUserStorageKey(userId, 'walletBalance');
    if (backendBalance > 0) {
      localStorage.setItem(walletKey, backendBalance.toString());
    } else if (!localStorage.getItem(walletKey)) {
      localStorage.setItem(walletKey, '0');
    }

    // Load favorites from backend
    const backendFavorites = await fetchFavoritesFromBackend(user.email);
    const favoritesKey = getUserStorageKey(userId, 'favorites');
    if (backendFavorites.length > 0) {
      localStorage.setItem(favoritesKey, JSON.stringify(backendFavorites));
    } else if (!localStorage.getItem(favoritesKey)) {
      localStorage.setItem(favoritesKey, '[]');
    }

    // Initialize other user data arrays if not exists
    const transactionsKey = getUserStorageKey(userId, 'walletTransactions');
    if (!localStorage.getItem(transactionsKey)) {
      localStorage.setItem(transactionsKey, '[]');
    }

    const previousCallsKey = getUserStorageKey(userId, 'previousCalls');
    if (!localStorage.getItem(previousCallsKey)) {
      localStorage.setItem(previousCallsKey, '[]');
    }

    const callHistoryKey = getUserStorageKey(userId, 'callHistory');
    if (!localStorage.getItem(callHistoryKey)) {
      localStorage.setItem(callHistoryKey, '[]');
    }
  }
}

/**
 * Clear current user session (but keep data in localStorage for next login)
 * Only clears sessionStorage, keeps localStorage intact so data persists
 */
export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;
  // Clear session storage
  sessionStorage.removeItem('currentUser');
  // Clear auth tokens and user data
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  // Note: We don't clear user-specific data (wallet, favorites, etc.) - data persists for next login
}

/**
 * Get user-specific wallet balance
 * Reads from localStorage for persistence
 */
export function getUserWalletBalance(): number {
  const user = getCurrentUser();
  if (!user) return 0;
  const userId = getUserId(user);
  if (!userId) return 0;
  const balance = localStorage.getItem(getUserStorageKey(userId, 'walletBalance'));
  return parseFloat(balance || '0');
}

/**
 * Set user-specific wallet balance
 * Stores in localStorage for persistence and syncs with backend
 */
export async function setUserWalletBalance(amount: number): Promise<void> {
  const user = getCurrentUser();
  if (!user) return;
  const userId = getUserId(user);
  if (!userId) return;

  // Update localStorage
  localStorage.setItem(getUserStorageKey(userId, 'walletBalance'), amount.toString());

  // Sync with backend
  await updateWalletBalanceOnBackend(user.email, amount);
}

/**
 * Get user-specific favorites
 * Reads from localStorage for persistence
 */
export function getUserFavorites(): any[] {
  const user = getCurrentUser();
  if (!user) return [];
  const userId = getUserId(user);
  if (!userId) return [];
  const favorites = localStorage.getItem(getUserStorageKey(userId, 'favorites'));
  try {
    return JSON.parse(favorites || '[]');
  } catch {
    return [];
  }
}

/**
 * Set user-specific favorites
 * Stores in localStorage for persistence and syncs with backend
 */
export async function setUserFavorites(favorites: any[]): Promise<void> {
  const user = getCurrentUser();
  if (!user) return;
  const userId = getUserId(user);
  if (!userId) return;

  // Update localStorage
  localStorage.setItem(getUserStorageKey(userId, 'favorites'), JSON.stringify(favorites));

  // Sync with backend
  await updateFavoritesOnBackend(user.email, favorites);
}

/**
 * Get user-specific transactions
 * Reads from localStorage for persistence
 */
export function getUserTransactions(): any[] {
  const user = getCurrentUser();
  if (!user) return [];
  const userId = getUserId(user);
  if (!userId) return [];
  const transactions = localStorage.getItem(getUserStorageKey(userId, 'walletTransactions'));
  try {
    return JSON.parse(transactions || '[]');
  } catch {
    return [];
  }
}

/**
 * Add user-specific transaction
 * Stores in localStorage for persistence and syncs with backend
 */
export async function addUserTransaction(transaction: any): Promise<void> {
  const user = getCurrentUser();
  if (!user) return;
  const userId = getUserId(user);
  if (!userId) return;

  // Update localStorage
  const transactions = getUserTransactions();
  transactions.push(transaction);
  localStorage.setItem(getUserStorageKey(userId, 'walletTransactions'), JSON.stringify(transactions));

  // Sync with backend
  await addTransactionToBackend(user.email, transaction);
}

/**
 * Get user-specific previous calls
 * Reads from localStorage for persistence
 */
export function getUserPreviousCalls(): string[] {
  const user = getCurrentUser();
  if (!user) return [];
  const userId = getUserId(user);
  if (!userId) return [];
  const previousCalls = localStorage.getItem(getUserStorageKey(userId, 'previousCalls'));
  try {
    return JSON.parse(previousCalls || '[]');
  } catch {
    return [];
  }
}

/**
 * Add to user-specific previous calls
 * Stores in localStorage for persistence and syncs with backend
 */
export async function addUserPreviousCall(callId: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) return;
  const userId = getUserId(user);
  if (!userId) return;

  const previousCalls = getUserPreviousCalls();
  if (!previousCalls.includes(callId)) {
    previousCalls.push(callId);
    // Update localStorage
    localStorage.setItem(getUserStorageKey(userId, 'previousCalls'), JSON.stringify(previousCalls));

    // Sync with backend
    await updatePreviousCallsOnBackend(user.email, previousCalls);
  }
}

/**
 * Optional: Clear all user data (for account deletion)
 * Use this only if user explicitly wants to delete their account
 */
export function deleteUserData(userId: string): void {
  if (typeof window === 'undefined') return;
  const keys = [
    getUserStorageKey(userId, 'walletBalance'),
    getUserStorageKey(userId, 'favorites'),
    getUserStorageKey(userId, 'walletTransactions'),
    getUserStorageKey(userId, 'previousCalls'),
    getUserStorageKey(userId, 'callHistory'),
  ];
  keys.forEach(key => localStorage.removeItem(key));
  localStorage.removeItem('lastLoggedInUser');
}

// ==================== Backend API Functions ====================

/**
 * Save user data to backend
 */
export async function saveUserDataToBackend(email: string, userData: User): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving user data to backend:', error);
    return false;
  }
}

/**
 * Get wallet balance from backend
 */
export async function fetchWalletBalanceFromBackend(email: string): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(email)}/wallet`);
    if (!response.ok) return 0;
    const data = await response.json();
    return data.balance || 0;
  } catch (error) {
    console.error('Error fetching wallet from backend:', error);
    return 0;
  }
}

/**
 * Update wallet balance on backend
 */
export async function updateWalletBalanceOnBackend(email: string, amount: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(email)}/wallet`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating wallet on backend:', error);
    return false;
  }
}

/**
 * Get transactions from backend
 */
export async function fetchTransactionsFromBackend(email: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(email)}/transactions`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions from backend:', error);
    return [];
  }
}

/**
 * Add transaction to backend
 */
export async function addTransactionToBackend(email: string, transaction: any): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(email)}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    return response.ok;
  } catch (error) {
    console.error('Error adding transaction to backend:', error);
    return false;
  }
}

/**
 * Get favorites from backend
 */
export async function fetchFavoritesFromBackend(email: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(email)}/favorites`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching favorites from backend:', error);
    return [];
  }
}

/**
 * Update favorites on backend
 */
export async function updateFavoritesOnBackend(email: string, favorites: any[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(email)}/favorites`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorites }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating favorites on backend:', error);
    return false;
  }
}

/**
 * Get previous calls from backend
 */
export async function fetchPreviousCallsFromBackend(email: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(email)}/previous-calls`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching previous calls from backend:', error);
    return [];
  }
}

/**
 * Update previous calls on backend
 */
export async function updatePreviousCallsOnBackend(email: string, previousCalls: string[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(email)}/previous-calls`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ previousCalls }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating previous calls on backend:', error);
    return false;
  }
}

