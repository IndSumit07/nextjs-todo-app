"use client";

import { useState } from "react";
import {
  Plus,
  AlignLeft,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";

export default function CreateTrackr({ onCreate, creating }) {
  const [newTrackrTitle, setNewTrackrTitle] = useState("");
  const [newTrackrDesc, setNewTrackrDesc] = useState("");
  const [newTrackrDate, setNewTrackrDate] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTrackrTitle.trim()) return;

    onCreate({
      title: newTrackrTitle,
      description: newTrackrDesc,
      dueDate: newTrackrDate || null,
    });

    // Reset fields only if successful (handled by parent usually, but we can do it here if it's simpler or via a prop)
    // For now let's assume parent will handle the creation and we'll reset on success if we pass a callback.
    // Or just reset here and assume it's fine.
    setNewTrackrTitle("");
    setNewTrackrDesc("");
    setNewTrackrDate("");
    setIsExpanded(false);
  };

  return (
    <div
      className={`relative group transition-all duration-300 ${isExpanded ? "scale-100" : "hover:scale-[1.01]"}`}
    >
      <div className="absolute -inset-0.5 bg-linear-to-r from-gray-200 to-gray-100 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        onFocus={() => setIsExpanded(true)}
      >
        <div className="p-2">
          <input
            id="new-trackr-title"
            type="text"
            value={newTrackrTitle}
            onChange={(e) => setNewTrackrTitle(e.target.value)}
            placeholder="What needs to be tracked?"
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
                value={newTrackrDesc}
                onChange={(e) => setNewTrackrDesc(e.target.value)}
                placeholder="Add a description..."
                rows={2}
                className="flex-1 bg-transparent text-sm resize-none focus:outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={newTrackrDate}
                onChange={(e) => setNewTrackrDate(e.target.value)}
                className="bg-transparent text-sm text-gray-600 focus:outline-none cursor-pointer font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="add-trackr-btn"
              type="submit"
              disabled={creating || !newTrackrTitle.trim()}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-black/90 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Trackr"
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
  );
}
