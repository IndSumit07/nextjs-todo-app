"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TodoCard from "@/components/TodoCard";
import KanbanBoard from "@/components/KanbanBoard";
import {
  Loader2,
  Plus,
  Calendar as CalendarIcon,
  AlignLeft,
  LayoutGrid,
  Kanban as KanbanIcon,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'board'

  // New TODO state
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDesc, setNewTodoDesc] = useState("");
  const [newTodoDate, setNewTodoDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data.data);
      fetchTodos();
    } catch (error) {
      router.push("/login");
    }
  };

  const fetchTodos = async () => {
    try {
      const res = await axios.get("/api/todos");
      if (res.data.success) {
        setTodos(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (e) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    setCreating(true);
    try {
      const res = await axios.post("/api/todos", {
        title: newTodoTitle,
        description: newTodoDesc,
        dueDate: newTodoDate || null,
      });

      const data = res.data;
      if (data.success) {
        setTodos([data.data, ...todos]);
        setNewTodoTitle("");
        setNewTodoDesc("");
        setNewTodoDate("");
        setIsExpanded(false);
        toast.success("Todo created successfully");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to create todo";
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const updateTodo = async (id, updates) => {
    // Optimistic update
    const oldTodos = [...todos];
    setTodos(todos.map((t) => (t._id === id ? { ...t, ...updates } : t)));

    try {
      await axios.put(`/api/todos/${id}`, updates);
    } catch (error) {
      setTodos(oldTodos);
      toast.error("Failed to update todo");
    }
  };

  const deleteTodo = async (id) => {
    // Optimistic update
    const oldTodos = [...todos];
    setTodos(todos.filter((t) => t._id !== id));

    try {
      await axios.delete(`/api/todos/${id}`);
      toast.success("Todo deleted");
    } catch (error) {
      setTodos(oldTodos);
      toast.error("Failed to delete todo");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
            <p className="text-lg text-gray-500">
              Manage your tasks naturally.
            </p>
          </div>

          <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-gray-100 text-black" : "text-gray-400 hover:text-gray-600"}`}
              title="List View"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-2 rounded-md transition-colors ${viewMode === "board" ? "bg-gray-100 text-black" : "text-gray-400 hover:text-gray-600"}`}
              title="Kanban Board"
            >
              <KanbanIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Create Input - Only visible in List view or if desired in Board too. Keeping it global. */}
        <div
          className={`relative group transition-all duration-300 ${isExpanded ? "scale-100" : "hover:scale-[1.01]"}`}
        >
          <div className="absolute -inset-0.5 bg-linear-to-r from-gray-200 to-gray-100 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

          <form
            onSubmit={createTodo}
            className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            onFocus={() => setIsExpanded(true)}
          >
            <div className="p-2">
              <input
                id="new-todo-title"
                type="text"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 bg-transparent text-lg font-medium focus:outline-none placeholder:text-gray-400"
                autoComplete="off"
              />
            </div>

            {/* Expandable Section */}
            <div
              className={`
              px-4 transition-all duration-300 ease-in-out border-t border-gray-100 bg-gray-50/30
              ${isExpanded ? "max-h-96 py-4 opacity-100" : "max-h-0 py-0 opacity-0 overflow-hidden"}
            `}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlignLeft className="w-5 h-5 text-gray-400 mt-1" />
                  <textarea
                    value={newTodoDesc}
                    onChange={(e) => setNewTodoDesc(e.target.value)}
                    placeholder="Add a description..."
                    rows={2}
                    className="flex-1 bg-transparent text-sm resize-none focus:outline-none placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={newTodoDate}
                    onChange={(e) => setNewTodoDate(e.target.value)}
                    className="bg-transparent text-sm text-gray-600 focus:outline-none cursor-pointer font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="add-todo-btn"
                  type="submit"
                  disabled={creating || !newTodoTitle.trim()}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-black/90 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Task"
                  )}
                  {!creating && <Plus className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Collapsed State Actions */}
            {!isExpanded && (
              <div className="absolute right-2 top-2 bottom-2 flex items-center pr-2">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-black transition-colors"
                  onClick={() => setIsExpanded(true)}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            )}
          </form>
        </div>

        {viewMode === "list" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todos.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400">
                  No tasks found. Start by creating one!
                </p>
              </div>
            ) : (
              todos.map((todo) => (
                <TodoCard
                  key={todo._id}
                  todo={todo}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                />
              ))
            )}
          </div>
        ) : (
          <KanbanBoard
            todos={todos}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
          />
        )}
      </main>
    </div>
  );
}
