"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  AlignLeft,
  Clock,
} from "lucide-react";
import { clsx } from "clsx";
import { format } from "date-fns";

export default function TrackrCard({ trackr, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(trackr.title);
  const [editedDesc, setEditedDesc] = useState(trackr.description || "");
  const [editedDate, setEditedDate] = useState(
    trackr.dueDate ? new Date(trackr.dueDate).toISOString().split("T")[0] : "",
  );
  useEffect(() => {
    setEditedTitle(trackr.title);
    setEditedDesc(trackr.description || "");
    setEditedDate(
      trackr.dueDate
        ? new Date(trackr.dueDate).toISOString().split("T")[0]
        : "",
    );
  }, [trackr]);

  const handleUpdate = () => {
    onUpdate(trackr._id, {
      title: editedTitle,
      description: editedDesc,
      dueDate: editedDate || null,
    });
    setIsEditing(false);
  };

  const toggleComplete = () => {
    onUpdate(trackr._id, { completed: !trackr.completed });
  };

  const isOverdue =
    trackr.dueDate &&
    new Date(trackr.dueDate).setHours(0, 0, 0, 0) <
      new Date().setHours(0, 0, 0, 0) &&
    !trackr.completed;

  return (
    <div
      className={clsx(
        "group relative p-5 bg-white rounded-xl border transition-all duration-200",
        "hover:shadow-md hover:border-gray-300",
        trackr.completed
          ? "border-gray-100 bg-gray-50/50 opacity-75"
          : "border-gray-200",
      )}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          id={`complete-trackr-${trackr._id}`}
          onClick={toggleComplete}
          className={clsx(
            "mt-1 shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            trackr.completed
              ? "bg-black border-black text-white"
              : "border-gray-300 hover:border-black bg-transparent",
          )}
        >
          {trackr.completed && <Check className="h-3.5 w-3.5" />}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-lg font-semibold bg-transparent border-b border-gray-300 focus:border-black outline-none pb-1"
                placeholder="Trackr title"
                autoFocus
              />
              <div className="flex items-start gap-2">
                <AlignLeft className="w-4 h-4 text-gray-400 mt-1" />
                <textarea
                  value={editedDesc}
                  onChange={(e) => setEditedDesc(e.target.value)}
                  className="w-full text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:border-black outline-none resize-none"
                  placeholder="Description"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                  className="bg-transparent text-sm text-gray-600 focus:outline-none cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1.5 text-xs font-medium bg-black text-white rounded-md hover:bg-black/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <h3
                className={clsx(
                  "text-lg font-medium leading-tight transition-colors",
                  trackr.completed
                    ? "text-gray-400 line-through"
                    : "text-gray-900",
                )}
              >
                {trackr.title}
              </h3>

              {trackr.description && (
                <p
                  className={clsx(
                    "text-sm line-clamp-2",
                    trackr.completed ? "text-gray-300" : "text-gray-500",
                  )}
                >
                  {trackr.description}
                </p>
              )}

              {trackr.dueDate && (
                <div
                  className={clsx(
                    "flex items-center gap-1.5 text-xs mt-2 w-fit px-2 py-1 rounded-md",
                    trackr.completed
                      ? "text-gray-400 bg-gray-100"
                      : isOverdue
                        ? "text-red-600 bg-red-50"
                        : "text-gray-500 bg-gray-100",
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(trackr.dueDate), "MMM d, yyyy")}</span>
                  {isOverdue && (
                    <span className="font-medium ml-1">Overdue</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              id={`edit-trackr-${trackr._id}`}
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              id={`delete-trackr-${trackr._id}`}
              onClick={() => onDelete(trackr._id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
