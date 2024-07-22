import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string; sectionId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
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

    const { name, fileUrl } = await req.json();

    const resource = await db.resource.create({
      data: {
        name,
        fileUrl,
        sectionId: params.sectionId,
      },
    });
    return NextResponse.json(resource, { status: 200 });
  } catch (err) {
    console.log("[resources_POST]", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
};
