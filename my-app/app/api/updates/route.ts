import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Update from "@/lib/models/Update";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const updates = await Update.find().sort({ createdAt: -1 }).limit(100);

    return NextResponse.json(
      {
        message: "Updates fetched successfully",
        updates,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Fetch updates error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch updates" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Verify token
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { title, content, status, username } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: "Please provide title and content" },
        { status: 400 },
      );
    }

    const update = await Update.create({
      userId: decoded.userId,
      username,
      title,
      content,
      status: status || "pending",
    });

    return NextResponse.json(
      {
        message: "Update created successfully",
        update,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create update error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create update" },
      { status: 500 },
    );
  }
}
