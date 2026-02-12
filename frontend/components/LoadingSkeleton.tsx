interface LoadingSkeletonProps {
    type?: 'card' | 'list' | 'profile' | 'text';
    count?: number;
}

export default function LoadingSkeleton({
    type = 'card',
    count = 1
}: LoadingSkeletonProps) {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gray-300 rounded-full" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-full" />
                            <div className="h-3 bg-gray-200 rounded w-5/6" />
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div className="bg-white rounded-lg p-4 shadow animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-300 rounded-full" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-300 rounded w-2/3 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="bg-white rounded-xl p-8 shadow-lg animate-pulse">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-gray-300 rounded-full mb-4" />
                            <div className="h-5 bg-gray-300 rounded w-40 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
                            <div className="w-full space-y-3">
                                <div className="h-3 bg-gray-200 rounded w-full" />
                                <div className="h-3 bg-gray-200 rounded w-full" />
                                <div className="h-3 bg-gray-200 rounded w-3/4" />
                            </div>
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                        <div className="h-4 bg-gray-200 rounded w-4/6" />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index}>{renderSkeleton()}</div>
            ))}
        </div>
    );
}
