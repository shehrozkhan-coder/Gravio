import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "User is not Authenticated" },
        { status: 400 },
      );
    }
    await connectDb(); // ← yeh missing tha!
    const user = await User.findOne({ email: session.user.email }).select(
      "-password",
    );
    if (!user) {
      return NextResponse.json(
        { message: "User is not Authenticated" },
        { status: 400 },
      );
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `get me error ${error}` },
      { status: 500 },
    );
  }
}