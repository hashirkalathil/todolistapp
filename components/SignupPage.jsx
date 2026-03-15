"use client"

import { useRouter } from "next/navigation"
import { useState } from "react";
import { supabase } from "@/lib/client";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [secret, setSecret] = useState("");

    async function handleSignup(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg("");

        if (secret !== process.env.NEXT_PUBLIC_SIGNUP_SECRET) {
            setLoading(false);
            setError("Invalid secret. Please contact the administrator.");
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        setLoading(false);

        if (error) {
            console.error("Signup Error:", error.message, error);
            setError(error.message);
            return;
        }

        setSuccessMsg("Signup successful! You can now log in.");
        setTimeout(() => {
            router.push("/login");
        }, 2000);
    }

    return (
        <div className="max-w-lg mx-auto p-10 flex flex-col gap-6 mt-10 border-2 border-orange-500 rounded-2xl">
            <div className="p-4 border-b border-orange-500">
                <h1 className="text-xl font-bold uppercase text-center">Sign Up Form</h1>
            </div>
            <form onSubmit={handleSignup}>
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

                <input
                    type="text"
                    placeholder="secret"
                    value={secret}
                    onChange={e => setSecret(e.target.value)}
                    className="w-full py-2 px-5 outline-none border-2 border-orange-500 rounded-xl"
                    required
                />
                <br /><br />
                <button disabled={loading} className="w-full p-2 bg-orange-500 text-white rounded-full hover:bg-orange-700 transition-colors cursor-pointer">
                    {loading ? "signing up..." : "Sign Up"}
                </button>

                <div className="py-4">
                    {error && <p className="text-xs text-center text-red-500" >{error}</p>}
                    {successMsg && <p className="text-xs text-center text-green-500" >{successMsg}</p>}
                </div>

                <br /><br />
                <p className="text-xs text-center text-gray-500">Already have an account? <Link className="text-orange-500" href="/login">Login here</Link></p>
            </form>
        </div>
    )
}
