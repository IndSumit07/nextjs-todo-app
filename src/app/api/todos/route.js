import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Todo from "@/models/Todo";
import { getDataFromToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const todos = await Todo.find({ userId }).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: todos,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { title, description, dueDate } = await request.json();

    const newTodo = new Todo({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      userId,
    });

    await newTodo.save();

    return NextResponse.json({
      message: "Todo created",
      success: true,
      data: newTodo,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
