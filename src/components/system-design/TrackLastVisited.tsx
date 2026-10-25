"use client";

import { useEffect } from "react";

interface TrackLastVisitedProps {
  title: string;
  moduleTitle: string;
  href: string;
}

export default function TrackLastVisited({ title, moduleTitle, href }: TrackLastVisitedProps) {
  useEffect(() => {
    try {
      localStorage.setItem(
        "system_design_last_visited",
        JSON.stringify({
          title,
          moduleTitle,
          href,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn("Could not record last visited topic", e);
    }
  }, [title, moduleTitle, href]);

  return null;
}
