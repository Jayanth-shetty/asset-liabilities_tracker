import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Liability from "@/lib/models/Liability";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const liabilities = await Liability.find({ userId: decoded.userId }).sort({
      dateGiven: 1,
    });

    return NextResponse.json({ liabilities }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch liabilities" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();

    const { personName, amount, dateGiven, daysToReturn, description } = body;

    if (!personName || !amount || !dateGiven || !daysToReturn) {
      return NextResponse.json(
        { message: "Please provide all required fields" },
        { status: 400 },
      );
    }

    const createData = {
      userId: decoded.userId,
      personName,
      amount: parseFloat(amount),
      dateGiven: new Date(dateGiven),
      daysToReturn: parseInt(daysToReturn),
      description: description || "",
      status: "pending",
    };

    const liability = await Liability.create(createData);

    return NextResponse.json(
      {
        message: "Liability created successfully",
        liability,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || "Failed to create liability",
        error:
          process.env.NODE_ENV === "development"
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : undefined,
      },
      { status: 500 },
    );
  }
}
