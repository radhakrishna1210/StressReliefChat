import { getAuthToken } from '../authApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const adminApi = {
    // Get all listeners
    getListeners: async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/listeners`, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Error fetching listeners:', data);
                return { success: false, error: data.message || data.error || 'Failed to fetch listeners' };
            }

            return data;
        } catch (error) {
            console.error('Error fetching listeners:', error);
            return { success: false, error: 'Failed to fetch listeners' };
        }
    },

    // Add new listener
    addListener: async (listenerData: { name: string; email: string; specialties?: string[]; bio?: string }) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/listeners`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(listenerData),
            });

            const data = await response.json();

            // Check if response was successful
            if (!response.ok) {
                console.error('Error adding listener:', data);
                return { success: false, error: data.message || data.error || 'Failed to add listener' };
            }

            return data;
        } catch (error) {
            console.error('Error adding listener:', error);
            return { success: false, error: 'Failed to add listener' };
        }
    },

    // Update listener
    updateListener: async (id: string, updates: any) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/listeners/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(updates),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Error updating listener:', data);
                return { success: false, error: data.message || data.error || 'Failed to update listener' };
            }

            return data;
        } catch (error) {
            console.error('Error updating listener:', error);
            return { success: false, error: 'Failed to update listener' };
        }
    },

    // Delete listener
    deleteListener: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/listeners/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Error deleting listener:', data);
                return { success: false, error: data.message || data.error || 'Failed to delete listener' };
            }

            return data;
        } catch (error) {
            console.error('Error deleting listener:', error);
            return { success: false, error: 'Failed to delete listener' };
        }
    },

    // Get admin stats
    getStats: async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/stats`, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return { success: false, error: 'Failed to fetch statistics' };
        }
    },
};
