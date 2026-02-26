"use client";

import { useState, useEffect } from "react";
import TrackrCard from "@/components/TrackrCard";
import CreateTrackr from "@/components/CreateTrackr";
import KanbanBoard from "@/components/KanbanBoard";
import { LayoutGrid, Kanban as KanbanIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function TodosPage() {
  const [trackrs, setTrackrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'board'
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTrackrs();
  }, []);

  const fetchTrackrs = async () => {
    try {
      const res = await axios.get("/api/trackrs");
      if (res.data.success) {
        setTrackrs(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch Trackrs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrackr = async (trackrData) => {
    setCreating(true);
    try {
      const res = await axios.post("/api/trackrs", trackrData);
      const data = res.data;
      if (data.success) {
        setTrackrs([data.data, ...trackrs]);
        toast.success("Trackr created successfully");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to create Trackr";
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTrackr = async (id, updates) => {
    const oldTrackrs = [...trackrs];
    setTrackrs(trackrs.map((t) => (t._id === id ? { ...t, ...updates } : t)));
    try {
      await axios.put(`/api/trackrs/${id}`, updates);
    } catch (error) {
      setTrackrs(oldTrackrs);
      toast.error("Failed to update Trackr");
    }
  };

  const handleDeleteTrackr = async (id) => {
    const oldTrackrs = [...trackrs];
    setTrackrs(trackrs.filter((t) => t._id !== id));
    try {
      await axios.delete(`/api/trackrs/${id}`);
      toast.success("Trackr deleted");
    } catch (error) {
      setTrackrs(oldTrackrs);
      toast.error("Failed to delete Trackr");
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Todos
          </h1>
          <p className="text-lg text-gray-500">Your personal task list.</p>
        </div>

        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
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

      <CreateTrackr onCreate={handleCreateTrackr} creating={creating} />

      {viewMode === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trackrs.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400">
                No Trackrs found. Start by creating one!
              </p>
            </div>
          ) : (
            trackrs.map((trackr) => (
              <TrackrCard
                key={trackr._id}
                trackr={trackr}
                onUpdate={handleUpdateTrackr}
                onDelete={handleDeleteTrackr}
              />
            ))
          )}
        </div>
      ) : (
        <KanbanBoard
          trackrs={trackrs}
          onUpdate={handleUpdateTrackr}
          onDelete={handleDeleteTrackr}
        />
      )}
    </div>
  );
}
