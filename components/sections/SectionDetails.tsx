"use client";
import {
  Course,
  MuxData,
  Progress,
  Purchase,
  Resource,
  Section,
} from "@prisma/client";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { useState } from "react";
import axios from "axios";
import { File, Loader2, Lock } from "lucide-react";
import ReadText from "../custom/ReadText";
import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";
import ProgressButton from "./ProgressButton";

interface SectionsDetailsProps {
  course: Course & { sections: Section[] };
  section: Section;
  purchase: Purchase | null;
  muxData: MuxData | null;
  resources: Resource[] | [];
  progress: Progress | null;
}

const SectionDetails = ({
  course,
  section,
  purchase,
  muxData,
  resources,
  progress,
}: SectionsDetailsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isLocked = !purchase && !section.isFree;
  const buyCourse = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/api/courses/${course.id}/checkout`);
      window.location.assign(response.data.url);
    } catch (err) {
      console.log("Failed to checkout course", err);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="px-6 py-4 flex flex-col gap-5">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <h1 className="text-2xl font-bold max-md:mb-4">{section.title}</h1>
        {!purchase ? (
          <Button disabled={isLoading} onClick={buyCourse}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Buy This Course"
            )}
          </Button>
        ) : (
          <ProgressButton
            courseId={course.id}
            sectionId={section.id}
            isCompleted={!!progress?.isCompleted}
          /> //!! converts falsy values to boolean values
        )}
      </div>
      <ReadText value={section.description!} />
      {isLocked ? (
        <div className="px-10 flex flex-col gap-5 items-center bg-[#FFF8EB] ">
          <Lock className="h-8 w-8" />
          <p className="text-sm font-bold">
            Video and resources for this section are locked!. Please buy the
            course to access
          </p>
        </div>
      ) : (
        <>
          <MuxPlayer
            playbackId={muxData?.playbackId || ""}
            className="md:max-w-[600px]"
          />
          <div>
            <h2 className="text-xl font-bold mb-5">Resources</h2>
            {resources.length == 0
              ? "No resources for this course have been uploaded"
              : resources.map((resource) => (
                  <Link
                    key={resource.id}
                    href={resource.fileUrl}
                    target="_blank"
                    className="flex items-center bg-[#FFF8EB] rounded-lg text-sm font-medium p-3"
                  >
                    <File className="h-4 w-4 mr-4" />
                    {resource.name}
                  </Link>
                ))}

            {/* {resources.map((resource) => (
              <Link
                key={resource.id}
                href={resource.fileUrl}
                target="_blank"
                className="flex items-center bg-[#FFF8EB] rounded-lg text-sm font-medium p-3"
              >
                <File className="h-4 w-4 mr-4" />
                {resource.name}
              </Link>
            ))} */}
          </div>
        </>
      )}
    </div>
  );
};

export default SectionDetails;
