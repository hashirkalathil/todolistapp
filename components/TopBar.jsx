"use client";

import { supabase } from "@/lib/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TopBar() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleLogout() {
        setLoading(true);
        await supabase.auth.signOut();
        setLoading(false);
        router.push("/login");
    }

    return (
        <div className="w-full bg-transparent flex items-center justify-between">
            <div className="max-w-200 mt-2 py-4 px-5 bg-orange-500 rounded-full w-full flex flex-row justify-between items-center md:mx-auto mx-4">
                <h1 className="text-sm text-gray-100 uppercase font-bold tracking-wide">Todo list App</h1>
                <button
                    className="px-4 py-2 bg-white rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                    onClick={handleLogout}
                >
                    {loading ? "loggig out..." : "Logout"}
                </button>
            </div>
        </div>
    )
}