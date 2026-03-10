
export default function Loading() {
    return (
        <div className="min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-[#fafafa]">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center justify-center mb-20 space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-12">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-4">
                            <div className="aspect-[4/5] bg-gray-200 rounded-sm animate-pulse"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
