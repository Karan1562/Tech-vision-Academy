import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  {
    params,
  }: { params: { courseId: string; sectionId: string; resourceId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { resourceId } = params;
    const course = db.course.findUnique({
      where: {
        id: params.courseId,
        instructorId: userId,
      },
    });
    if (!course) {
      return new NextResponse("Course not Found", { status: 404 });
    }
    const section = db.section.findUnique({
      where: {
        id: params.sectionId,
        courseId: params.courseId,
      },
    });
    if (!section) {
      return new NextResponse("Section not found", { status: 404 });
    }

    await db.resource.delete({
      where: {
        id: resourceId,
        sectionId: params.sectionId,
      },
    });

    return NextResponse.json("Resource Deleted", { status: 200 });
  } catch (err) {
    console.log("[resourceId_Delete]", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
};
