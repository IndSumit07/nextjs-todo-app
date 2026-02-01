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
import TodoCard from "./TodoCard";
import axios from "axios";
import { toast } from "sonner";

export default function KanbanBoard({ todos, onUpdate, onDelete }) {
  const [activeId, setActiveId] = useState(null);
  const [localTodos, setLocalTodos] = useState(todos);

  useEffect(() => {
    setLocalTodos(todos);
  }, [todos]);

  // Local state to handle smooth drag and drop without waiting for API
  // We effectively need to lift some state from page.js logic here or just rely on parent 'todos' + optimistic updates.
  // Using 'todos' prop directly with optimistic update on dragEnd in parent would be laggy.
  // Better: Maintain local sorted state, then sync. But 'todos' comes from different statuses.
  // Let's rely on parent passing valid data, but we can compute column-groups efficiently.

  // Actually, to make reordering instant, we should handle the `onDragOver` and `onDragEnd` logic carefully.

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
    const activeIndex = localTodos.findIndex((t) => t._id === draggingId);
    if (activeIndex === -1) return;
    const activeTodo = localTodos[activeIndex];

    // Determine Status
    let newStatus =
      activeTodo.status || (activeTodo.completed ? "done" : "todo");
    let overColumnId;

    if (columns.some((col) => col.id === overId)) {
      overColumnId = overId;
    } else {
      const overTodo = localTodos.find((t) => t._id === overId);
      overColumnId = overTodo
        ? overTodo.status || (overTodo.completed ? "done" : "todo")
        : "todo";
    }

    // Check if status changed
    if (newStatus !== overColumnId) {
      newStatus = overColumnId;
    }

    // CALCULATE NEW ORDER
    let newItems = [...localTodos];

    // 1. Remove active item
    newItems.splice(activeIndex, 1);

    // 2. Insert at new position
    const targetColumnItems = newItems
      .filter(
        (t) => (t.status || (t.completed ? "done" : "todo")) === overColumnId,
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));

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
      ...activeTodo,
      status: newStatus,
      completed: newStatus === "done",
    };
    newItems.splice(
      insertIndex < 0 ? newItems.length : insertIndex,
      0,
      updatedItem,
    );

    // 3. Re-normalize orders
    const normalizedItems = newItems.map((t) => t);

    // Update Local State Immediately
    setLocalTodos(normalizedItems);

    // Prepare API Update
    const itemsToSave = normalizedItems.map((item, index) => {
      const colItems = normalizedItems.filter(
        (t) =>
          (t.status || (t.completed ? "done" : "todo")) ===
          (item.status || (item.completed ? "done" : "todo")),
      );
      const myOrder = colItems.indexOf(item);
      return { ...item, order: myOrder };
    });

    // Also ensuring local state has correct orders for next drag
    setLocalTodos(itemsToSave);

    try {
      await axios.put("/api/todos/reorder", { todos: itemsToSave });
    } catch (e) {
      toast.error("Failed to save order");
      setLocalTodos(todos);
    }
  };

  const getTodosForColumn = (status) => {
    return localTodos
      .filter(
        (todo) =>
          (todo.status || (todo.completed ? "done" : "todo")) === status,
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const activeTodo = activeId
    ? localTodos.find((t) => t._id === activeId)
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
          const columnTodos = getTodosForColumn(col.status);
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              count={columnTodos.length}
              todos={columnTodos}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTodo ? (
          <div className="opacity-80 rotate-2 cursor-grabbing w-[300px]">
            <TodoCard
              todo={activeTodo}
              onUpdate={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
