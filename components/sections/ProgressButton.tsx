"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

interface ProgressButtonProps {
  courseId: string;
  sectionId: string;
  isCompleted: boolean;
}

const ProgressButton = ({
  courseId,
  sectionId,
  isCompleted: initialIsCompleted,
}: ProgressButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);

  const onClick = async () => {
    try {
      setIsLoading(true);
      setIsCompleted(!isCompleted); // Update local state immediately
      await axios.post(
        `/api/courses/${courseId}/sections/${sectionId}/progress`,
        {
          isCompleted: !isCompleted,
        }
      );
      toast.success("Progress updated!");
      // Optionally, refresh router or fetch new data if needed
      // router.refresh();
    } catch (err) {
      console.log("Failed to update progress", err);
      toast.error("Something went wrong!");
      // Revert the local state change if the request fails
      setIsCompleted(isCompleted);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant={isCompleted ? "complete" : "default"} onClick={onClick}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isCompleted ? (
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span>Completed</span>
        </div>
      ) : (
        "Mark as complete"
      )}
    </Button>
  );
};

export default ProgressButton;
