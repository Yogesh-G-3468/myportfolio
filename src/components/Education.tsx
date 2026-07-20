"use client";

import SectionWrapper from "./SectionWrapper";
import { education } from "@/lib/data";
import { GraduationCap, Award } from "lucide-react";

export default function Education() {
    return (
        <SectionWrapper id="education" title="Education">
            <div className="p-6 rounded-2xl bg-background-elevated border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="text-accent w-5 h-5 shrink-0" />
                        <h3 className="text-foreground font-semibold text-base sm:text-lg">
                            {education.degree}
                        </h3>
                    </div>
                    <p className="text-foreground-secondary text-sm font-medium pl-7">
                        {education.institution}
                    </p>
                    {education.distinction && (
                        <div className="flex items-center gap-1.5 pl-7 pt-1 text-emerald-500 text-xs font-bold">
                            <Award size={14} />
                            <span>{education.distinction}</span>
                        </div>
                    )}
                </div>

                <div className="sm:text-right shrink-0 pl-7 sm:pl-0">
                    <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent font-bold text-xs border border-accent/20">
                        CGPA {education.cgpa}
                    </span>
                    <p className="text-muted-foreground text-xs font-medium mt-1">
                        {education.period}
                    </p>
                </div>
            </div>
        </SectionWrapper>
    );
}
