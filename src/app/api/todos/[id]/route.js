import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Todo from "@/models/Todo";
import { getDataFromToken } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, completed, dueDate, status } =
      await request.json();

    await connectDB();
    const todo = await Todo.findOne({ _id: id, userId });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (dueDate !== undefined) todo.dueDate = dueDate;

    // Handle status and completion sync
    if (status !== undefined) {
      todo.status = status;
      todo.completed = status === "done";
    } else if (completed !== undefined) {
      todo.completed = completed;
      todo.status = completed ? "done" : "todo";
    }

    await todo.save();

    return NextResponse.json({
      message: "Todo updated",
      success: true,
      data: todo,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const result = await Todo.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Todo deleted",
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
