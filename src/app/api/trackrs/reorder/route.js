import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trackr from "@/models/Trackr";
import { getDataFromToken } from "@/lib/auth";

export async function PUT(request) {
  try {
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackrs } = await request.json();

    if (!Array.isArray(trackrs)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await connectDB();

    // Bulk write for better performance
    const operations = trackrs.map((trackr) => ({
      updateOne: {
        filter: { _id: trackr._id, userId },
        update: {
          $set: {
            order: trackr.order,
            status: trackr.status,
            completed: trackr.status === "done",
          },
        },
      },
    }));

    if (operations.length > 0) {
      await Trackr.bulkWrite(operations);
    }

    return NextResponse.json({
      message: "Order updated",
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
