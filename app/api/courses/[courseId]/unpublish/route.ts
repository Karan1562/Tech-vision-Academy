require("dotenv").config();
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
require("dotenv").config();
export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    const { courseId } = params;
    if (!userId) return new NextResponse("Unauthorised", { status: 401 });
    const course = await db.course.findUnique({
      where: { id: courseId, instructorId: userId },
      include: {
        sections: {
          include: {
            muxData: true,
          },
        },
      },
    });
    if (!course) {
      return new NextResponse("Course Not Found", { status: 404 });
    }

    const unpublishedCourse = await db.course.update({
      where: {
        id: courseId,
        instructorId: userId,
      },
      data: {
        isPublished: false,
      },
    });
    return NextResponse.json(unpublishedCourse, { status: 200 });
  } catch (err) {
    console.log("[courseId_publish_POST]", err);
    return new NextResponse("Something Went Wrong", { status: 500 });
  }
};
