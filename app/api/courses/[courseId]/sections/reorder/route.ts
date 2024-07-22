import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorised", { status: 401 });
    }
    const { list } = await req.json();
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        instructorId: userId,
      },
    });
    if (!course) {
      return new NextResponse("Course Not found", { status: 404 });
    }

    for (let item of list) {
      await db.section.update({
        where: {
          id: item.id,
        },
        data: {
          position: item.position,
        },
      });
    }

    return new NextResponse("Reorder Sections Successful", { status: 200 });
  } catch (err) {
    console.log("[reorder_put]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
