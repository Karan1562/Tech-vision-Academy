import { useState, useEffect } from "react";
import axios from "axios";

interface Section {
  id: string;
  title: string;
  isPublished: boolean;
  position: number;
}

const useCourseProgress = (courseId: string, studentId: string) => {
  const [publishedSections, setPublishedSections] = useState<Section[]>([]);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);

  const fetchProgress = async () => {
    try {
      const { data: sections } = await axios.get<Section[]>(
        `/api/courses/${courseId}/sections`
      );
      const publishedSections = sections.filter(
        (section) => section.isPublished
      );
      const publishedSectionIds = publishedSections.map(
        (section) => section.id
      );

      const { data: completedCount } = await axios.post<number>(
        `/api/courses/${courseId}/completedSections`,
        {
          studentId,
          sectionIds: publishedSectionIds,
        }
      );

      const percentage = (completedCount / publishedSectionIds.length) * 100;
      setPublishedSections(publishedSections);
      setProgressPercentage(percentage);
    } catch (err) {
      console.error("Failed to fetch course progress", err);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [courseId, studentId]);

  return { publishedSections, progressPercentage, fetchProgress };
};

export default useCourseProgress;
