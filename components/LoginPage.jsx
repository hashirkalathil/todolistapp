"use client"

import { useRouter } from "next/navigation"
import { useState } from "react";
import { supabase } from "@/lib/client";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        setLoading(false);

        if (error) {
            console.error("Login Error:", error.message, error);
            setError(error.message);
            return;
        }

        console.log("Login Successful! User Session Data:", data);
        router.push("/");
        router.refresh();
    }

    return (
        <div className="max-w-lg md:mx-auto mx-4 md:p-10 p-5 m-2 flex flex-col gap-6 mt-10 border-2 border-orange-500 rounded-2xl">
            <div className="p-4 border-b border-orange-500">
                <h1 className="text-xl font-bold uppercase text-center">Login Form</h1>
            </div>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full py-2 px-5 outline-none border-2 border-orange-500 rounded-xl"
                    required
                />
                <br /><br />
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full py-2 px-5 outline-none border-2 border-orange-500 rounded-xl"
                    required
                />
                <br /><br />
                <button disabled={loading} className="w-full p-2 bg-orange-500 text-white rounded-full hover:bg-orange-700 transition-colors cursor-pointer">
                    {loading ? "logging in..." : "Login"}
                </button>

                <div className="py-4">
                    {error && <p className="text-xs text-center text-red-500" >{error}</p>}
                </div>

                <br />
                <p className="text-xs text-center text-gray-500">Don't have an account? <Link className="text-orange-500" href="/signup">Sign up here</Link></p>
            </form>
        </div>
    )
}