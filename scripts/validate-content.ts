import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";
import matter from "gray-matter";
import { z } from "zod";

const CONTENT_DIR = path.join(process.cwd(), "content", "system-design");
const CURRICULUM_PATH = path.join(CONTENT_DIR, "_curriculum.yaml");

const FrontMatterSchema = z.object({
  title: z.string().min(3),
  module: z.string().min(2),
  moduleTitle: z.string().min(2),
  type: z.enum([
    "concept",
    "deep-dive",
    "comparison",
    "technology",
    "case-study",
    "lld",
    "paper",
    "cheatsheet",
    "playbook",
  ]),
  order: z.number().int().default(1),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  priority: z.enum(["P0", "P1", "P2"]).default("P0"),
  readingTime: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  relatedTopics: z.array(z.string()).default([]),
  covers: z.array(z.string()).min(1),
  glossaryTerms: z.array(z.string()).default([]),
  lastReviewed: z.string().default("2026-10-25"),
  summary: z.string().min(10),
  quiz: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()),
        answer: z.number().int(),
        explanation: z.string(),
      })
    )
    .optional(),
});

interface ValidationError {
  file: string;
  message: string;
}

function runValidation() {
  console.log("🔍 Running System Design Hub Content Validator...");
  const errors: ValidationError[] = [];

  if (!fs.existsSync(CURRICULUM_PATH)) {
    console.error("❌ Fatal: _curriculum.yaml not found at", CURRICULUM_PATH);
    process.exit(1);
  }

  const curriculum = yaml.load(fs.readFileSync(CURRICULUM_PATH, "utf8")) as any;
  const allCurriculumItems: { id: string; title: string; module: string }[] = [];

  curriculum.modules.forEach((mod: any) => {
    (mod.items || []).forEach((item: any) => {
      allCurriculumItems.push({ id: item.id, title: item.title, module: mod.slug });
    });
  });

  const validTitles = new Set(allCurriculumItems.map((i) => i.title));
  const claimedTitles = new Set<string>();
  const allSlugs = new Set<string>();

  // Scan all topic files
  const moduleDirs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"));

  for (const modDir of moduleDirs) {
    const modPath = path.join(CONTENT_DIR, modDir.name);
    const files = fs.readdirSync(modPath).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

    for (const file of files) {
      const fullPath = path.join(modPath, file);
      const fileSlug = file.replace(/\.mdx?$/, "");

      if (allSlugs.has(fileSlug)) {
        errors.push({ file: fullPath, message: `Duplicate topic slug: ${fileSlug}` });
      }
      allSlugs.add(fileSlug);

      const contentRaw = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(contentRaw);

      // 1. Validate front matter
      const parsed = FrontMatterSchema.safeParse(data);
      if (!parsed.success) {
        errors.push({
          file: fullPath,
          message: `Invalid front matter: ${JSON.stringify(parsed.error.format())}`,
        });
        continue;
      }

      const meta = parsed.data;

      // 2. Validate covers items exist in curriculum
      for (const itemTitle of meta.covers) {
        if (!validTitles.has(itemTitle)) {
          errors.push({
            file: fullPath,
            message: `Claims curriculum item not found in _curriculum.yaml: "${itemTitle}"`,
          });
        } else {
          claimedTitles.add(itemTitle);
        }
      }

      // 3. Template rules:
      // Case study must have Mermaid diagram
      if (meta.type === "case-study" || meta.type === "deep-dive" || meta.type === "lld") {
        if (!content.includes("```mermaid")) {
          errors.push({
            file: fullPath,
            message: `${meta.type} page must contain at least one Mermaid diagram`,
          });
        }
      }

      // Interview corner check
      if (meta.type === "concept" || meta.type === "deep-dive") {
        const interviewMatches = content.match(/###\s+.*\[(Basic|Intermediate|Advanced)\]/g) || [];
        if (interviewMatches.length < 5) {
          errors.push({
            file: fullPath,
            message: `Concept/deep-dive page must contain >= 5 interview Q&As (found ${interviewMatches.length})`,
          });
        }
      }

      if (meta.type === "case-study") {
        const interviewMatches = content.match(/###\s+.*\[(Basic|Intermediate|Advanced)\]/g) || [];
        if (interviewMatches.length < 8) {
          errors.push({
            file: fullPath,
            message: `Case study page must contain >= 8 interview Q&As (found ${interviewMatches.length})`,
          });
        }
      }
    }
  }

  // Report results
  if (errors.length > 0) {
    console.error(`\n❌ Validation Failed with ${errors.length} error(s):`);
    errors.forEach((e) => console.error(`  - [${path.basename(e.file)}] ${e.message}`));
    process.exit(1);
  } else {
    console.log(`\n✅ All verified topics passed front matter, structure, and schema validation!`);
    console.log(`📊 Claimed Curriculum Items: ${claimedTitles.size} / ${validTitles.size}`);
  }
}

runValidation();
