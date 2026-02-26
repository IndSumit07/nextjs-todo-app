"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import TrackrCard from "./TrackrCard";
import axios from "axios";
import { toast } from "sonner";

export default function KanbanBoard({ trackrs, onUpdate, onDelete }) {
  const [activeId, setActiveId] = useState(null);
  const [localTrackrs, setLocalTrackrs] = useState(trackrs);

  useEffect(() => {
    setLocalTrackrs(trackrs);
  }, [trackrs]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const columns = [
    { id: "todo", title: "To Do", status: "todo" },
    { id: "in-progress", title: "In Progress", status: "in-progress" },
    { id: "done", title: "Done", status: "done" },
  ];

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggingId = active.id;
    const overId = over.id;

    // Find dragged item index in current local state
    const activeIndex = localTrackrs.findIndex((t) => t._id === draggingId);
    if (activeIndex === -1) return;
    const draggingTrackr = localTrackrs[activeIndex];

    // Determine Status
    let newStatus =
      draggingTrackr.status || (draggingTrackr.completed ? "done" : "todo");
    let overColumnId;

    if (columns.some((col) => col.id === overId)) {
      overColumnId = overId;
    } else {
      const overTrackr = localTrackrs.find((t) => t._id === overId);
      overColumnId = overTrackr
        ? overTrackr.status || (overTrackr.completed ? "done" : "todo")
        : "todo";
    }

    // Check if status changed
    if (newStatus !== overColumnId) {
      newStatus = overColumnId;
    }

    // CALCULATE NEW ORDER
    let newItems = [...localTrackrs];

    // 1. Remove active item
    newItems.splice(activeIndex, 1);

    // 2. Insert at new position
    let insertIndex = -1;

    if (columns.some((c) => c.id === overId)) {
      // Dropped on column -> add to end
      insertIndex = newItems.length;
    } else {
      const overIndex = newItems.findIndex((t) => t._id === overId);
      if (overIndex !== -1) {
        insertIndex = overIndex;
      } else {
        insertIndex = newItems.length;
      }
    }

    // Perform insertion
    const updatedItem = {
      ...draggingTrackr,
      status: newStatus,
      completed: newStatus === "done",
    };
    newItems.splice(
      insertIndex < 0 ? newItems.length : insertIndex,
      0,
      updatedItem,
    );

    // 3. Re-normalize orders
    // Update Local State Immediately
    setLocalTrackrs(newItems);

    // Prepare API Update
    const itemsToSave = newItems.map((item, index) => {
      const colItems = newItems.filter(
        (t) =>
          (t.status || (t.completed ? "done" : "todo")) ===
          (item.status || (item.completed ? "done" : "todo")),
      );
      const myOrder = colItems.indexOf(item);
      return { ...item, order: myOrder };
    });

    // Also ensuring local state has correct orders for next drag
    setLocalTrackrs(itemsToSave);

    try {
      await axios.put("/api/trackrs/reorder", { trackrs: itemsToSave });
    } catch (e) {
      toast.error("Failed to update Trackr order");
      setLocalTrackrs(trackrs);
    }
  };

  const getTrackrsForColumn = (status) => {
    return localTrackrs
      .filter(
        (trackr) =>
          (trackr.status || (trackr.completed ? "done" : "todo")) === status,
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const activeTrackr = activeId
    ? localTrackrs.find((t) => t._id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-250px)]">
        {columns.map((col) => {
          const columnTrackrs = getTrackrsForColumn(col.status);
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              count={columnTrackrs.length}
              trackrs={columnTrackrs}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTrackr ? (
          <div className="opacity-80 rotate-2 cursor-grabbing w-[300px]">
            <TrackrCard
              trackr={activeTrackr}
              onUpdate={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
