'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    color: '#333',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    padding: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                },
                success: {
                    iconTheme: {
                        primary: '#48BB78',
                        secondary: '#fff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#F56565',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
}
