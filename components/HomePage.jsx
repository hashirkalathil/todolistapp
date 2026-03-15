"use client";

import { supabase } from "@/lib/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

export default function HomePage() {
    // Component State
    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    
    const [editing, setEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [editingDescription, setEditingDescription] = useState("");

    // 1. Fetch Todos
    async function loadTodos() {
        const { data, error } = await supabase
            .from("todos")
            .select("id, user_id, title, description, is_completed, created_at")
            .order("created_at", { ascending: true });

        if (error) { 
            console.error("Failed to load todos:", error); 
            return; 
        }
        setTodos(data || []);
    }

    // 2. Add Todo
    async function addTodo(e) {
        e.preventDefault();
        if (!title.trim()) return;

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (!userId) {
            console.error("You must be logged in to add a task.");
            return;
        }

        const { error } = await supabase.from("todos").insert({
            user_id: userId, // Required by our RLS and schema
            title: title.trim(),
            description: description.trim() || null,
            is_completed: false,
        });

        if (error) { 
            console.error("Failed to add todo:", error); 
            return; 
        }
        
        setTitle("");
        setDescription("");
        loadTodos();
    }

    // 3. Toggle Complete Status
    async function toggleTodo(todoId, currentState) {
        const { error } = await supabase
            .from("todos")
            .update({ is_completed: !currentState }) // FIXED: matched to DB schema
            .eq("id", todoId);

        if (error) { 
            console.error("Failed to toggle todo:", error); 
            return; 
        }
        loadTodos();
    }

    // 4. Edit Todo
    async function editTodo(todoId) {
        setEditing(true);

        if (!editingTitle.trim()) return;

        const { error } = await supabase
            .from("todos")
            .update({
                title: editingTitle.trim(),
                description: editingDescription.trim() || null,
            })
            .eq("id", todoId);
        
        setEditing(false);

        if (error) { 
            console.error("Failed to edit todo:", error); 
            return; 
        }
        
        setEditingId(null);
        setEditingTitle("");
        setEditingDescription("");
        loadTodos();
    }

    // 5. Delete Todo
    async function deleteTodo(todoId) {
        const { error } = await supabase.from("todos").delete().eq("id", todoId);
        if (error) { 
            console.error("Failed to delete todo:", error); 
            return; 
        }
        loadTodos();
    }

    // 7. Setup Realtime Subscription
    useEffect(() => {
        loadTodos();

        const channel = supabase.channel(`public:todos`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "todos" }, // Removed list_id filter for the global home page
                () => { loadTodos(); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const completedCount = todos.filter(t => t.is_completed).length;

    return (
        <div className="max-w-lg md:mx-auto m-4 md:p-10 p-5 flex flex-col gap-6 mt-10 border-2 border-orange-500 rounded-2xl">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-xl text-center uppercase font-bold text-orange-600">Shared Workspace</h1>
                <p className="text-sm text-center text-gray-500">Anyone logged in can edit this list.</p>
            </div>

            {/* Progress + Members */}
            <div className="flex items-center justify-between border-b border-orange-500 pb-4">
                {todos.length > 0 ? (
                    <p className="text-sm text-gray-500">
                        <span className="font-bold text-lg text-gray-800">{completedCount}</span> / {todos.length} completed
                    </p>
                ) : (
                    <p className="text-sm font-medium text-gray-400">No tasks yet</p>
                )}
            </div>

            {/* Add Todo Form */}
            <form onSubmit={addTodo} className="flex flex-col gap-3 bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                <h2 className="text-sm font-semibold text-black">Add New Task</h2>
                <input
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none rounded-md px-3 py-2 text-sm"
                />
                <input
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 outline-none rounded-md px-3 py-2 text-sm"
                />
                <button
                    type="submit"
                    disabled={!title.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium px-4 py-2 rounded-full text-sm transition-colors mt-1"
                >
                    Add Task
                </button>
            </form>

            {/* Todo List */}
            <ul className="flex flex-col gap-3">
                {todos.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-orange-200">
                        <p className="text-gray-500 text-sm">You're all caught up!</p>
                        <p className="text-gray-400 text-xs mt-1">Add a task above to get started.</p>
                    </div>
                )}
                {todos.map(todo => (
                    <li
                        key={todo.id}
                        className={`flex items-start gap-3 border rounded-lg px-4 py-3 transition-colors ${todo.is_completed ? 'bg-gray-50 border-orange-200' : 'bg-white border-orange-200 shadow-sm'}`}
                    >
                        <input
                            type="checkbox"
                            checked={todo.is_completed}
                            onChange={() => toggleTodo(todo.id, todo.is_completed)}
                            className="cursor-pointer w-5 h-5 mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                        />

                        {editingId === todo.id ? (
                            <div className="flex flex-col gap-2 flex-1">
                                <input
                                    autoFocus
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") editTodo(todo.id);
                                        if (e.key === "Escape") { 
                                            setEditingId(null); 
                                            setEditingTitle(""); 
                                            setEditingDescription(""); 
                                        }
                                    }}
                                    className="border border-gray-300 focus:border-orange-400 outline-none rounded px-2 py-1.5 text-sm"
                                    placeholder="Title"
                                />
                                <input
                                    value={editingDescription}
                                    onChange={(e) => setEditingDescription(e.target.value)}
                                    className="border border-orange-300 focus:border-orange-400 outline-none rounded px-2 py-1.5 text-sm"
                                    placeholder="Description (optional)"
                                />
                                <div className="w-full flex flex-row justify-between gap-2 mt-1">
                                    <button
                                        onClick={() => editTodo(todo.id)}
                                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium px-3 py-1 rounded-full text-xs"
                                    >
                                        {editing ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        onClick={() => { 
                                            setEditingId(null); 
                                            setEditingTitle(""); 
                                            setEditingDescription(""); 
                                        }}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-3 py-1 rounded-full text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1">
                                    <p className={`font-medium text-sm ${todo.is_completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                                        {todo.title}
                                    </p>
                                    {todo.description && (
                                        <p className={`text-xs mt-1 ${todo.is_completed ? "line-through text-gray-400" : "text-gray-500"}`}>
                                            {todo.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 opacity-60 hover:opacity-100 transition-opacity">
                                    <button onClick={() => {
                                        setEditingId(todo.id);
                                        setEditingTitle(todo.title);
                                        setEditingDescription(todo.description || "");
                                    }}>
                                        <CiEdit size={20} className="text-gray-500 hover:text-blue-600 cursor-pointer" />
                                    </button>
                                    <button onClick={() => deleteTodo(todo.id)}>
                                        <MdDeleteForever size={20} className="text-gray-500 hover:text-red-600 cursor-pointer" />
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}