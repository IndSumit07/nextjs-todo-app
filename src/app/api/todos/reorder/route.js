import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Todo from "@/models/Todo";
import { getDataFromToken } from "@/lib/auth";

export async function PUT(request) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { todos } = await request.json();

    if (!Array.isArray(todos)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await connectDB();

    // Bulk write for better performance
    const operations = todos.map((todo) => ({
      updateOne: {
        filter: { _id: todo._id, userId },
        update: {
          $set: {
            order: todo.order,
            status: todo.status,
            completed: todo.status === "done",
          },
        },
      },
    }));

    if (operations.length > 0) {
      await Todo.bulkWrite(operations);
    }

    return NextResponse.json({
      message: "Order updated",
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
