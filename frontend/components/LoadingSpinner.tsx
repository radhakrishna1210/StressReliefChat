interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    text?: string;
}

export default function LoadingSpinner({
    size = 'md',
    color = 'text-primary-blue',
    text
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-12 h-12 border-3',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            />
            {text && (
                <p className="text-sm text-gray-600 animate-pulse">{text}</p>
            )}
        </div>
    );
}
