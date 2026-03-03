"use client";

import SectionWrapper from "./SectionWrapper";
import { education } from "@/lib/data";

export default function Education() {
    return (
        <SectionWrapper id="education" title="Education">
            <div>
                <h3 className="text-foreground font-medium">
                    {education.degree}
                </h3>
                <p className="text-foreground-secondary text-sm">
                    {education.institution}
                </p>
                <p className="text-foreground-secondary text-sm">
                    {education.period} · CGPA {education.cgpa}
                </p>
            </div>
        </SectionWrapper>
    );
}
