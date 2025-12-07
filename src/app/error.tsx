"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-8 text-white">
            <div className="max-w-md text-center">
                <h2 className="mb-4 text-2xl font-bold text-red-500">Something went wrong!</h2>
                <p className="mb-6 text-gray-400">
                    We encountered an error while loading the dashboard. Please try again or contact support.
                </p>
                <div className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 text-left">
                    <p className="font-mono text-xs text-red-400">{error.message}</p>
                </div>
                <button
                    onClick={() => reset()}
                    className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
