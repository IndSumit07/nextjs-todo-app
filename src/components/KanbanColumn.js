"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TrackrCard from "./TrackrCard";
import clsx from "clsx";

function SortableTrackrItem({ trackr, onUpdate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: trackr._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3"
    >
      <TrackrCard trackr={trackr} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
}

export default function KanbanColumn({
  id,
  title,
  count,
  trackrs,
  onUpdate,
  onDelete,
}) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  /* Minimal Coloring Logic */
  let colorClasses = "bg-gray-50/50 border-gray-100";
  let titleColor = "text-gray-700";
  let badgeColor = "text-gray-400 border-gray-100";

  return (
    <div
      className={`flex flex-col h-full rounded-xl p-4 border min-w-[300px] ${colorClasses}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold ${titleColor}`}>{title}</h3>
          <span
            className={`text-xs bg-white px-2 py-0.5 rounded-full border ${badgeColor}`}
          >
            {count}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          "flex-1 overflow-y-auto space-y-3 min-h-[200px] transition-colors",
          trackrs.length === 0 &&
            "bg-gray-100/50 rounded-lg border-2 border-dashed border-gray-200",
        )}
      >
        <SortableContext
          items={trackrs.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {trackrs.map((trackr) => (
            <SortableTrackrItem
              key={trackr._id}
              trackr={trackr}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
