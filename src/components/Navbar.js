"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, CheckSquare } from "lucide-react";
import axios from "axios";

export default function Navbar({ user }) {
  const router = useRouter();

  const logout = async () => {
    try {
      await axios.get("/api/auth/logout");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="border-b border-gray-200 bg-white/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-black" />
            <span className="font-bold text-xl tracking-tight">Todos</span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-gray-500 hover:text-black hover:bg-gray-100 h-9 px-4 py-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </>
            )}
            {!user && (
              <Link
                href="/login"
                className="text-sm font-medium hover:underline"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
