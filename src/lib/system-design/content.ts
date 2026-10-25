import fs from "fs";
import path from "path";
import matter from "gray-matter";
import * as yaml from "js-yaml";
import { FrontMatterSchema, ModuleItem, TopicItem } from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content", "system-design");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractHeadings(content: string): { level: number; text: string; id: string }[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim().replace(/\*\*|__/g, "");
    const id = slugify(text);
    headings.push({ level, text, id });
  }
  return headings;
}

export function calculateWordCount(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export function getAllModules(): ModuleItem[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  // Read curriculum metadata if available
  let curriculumModules: any[] = [];
  const curriculumPath = path.join(CONTENT_DIR, "_curriculum.yaml");
  if (fs.existsSync(curriculumPath)) {
    try {
      const parsed = ((yaml as any).load ? (yaml as any).load(fs.readFileSync(curriculumPath, "utf8")) : (yaml as any).default?.load(fs.readFileSync(curriculumPath, "utf8"))) as any;
      if (parsed && Array.isArray(parsed.modules)) {
        curriculumModules = parsed.modules;
      }
    } catch (err) {
      console.error("Error reading _curriculum.yaml", err);
    }
  }

  const allTopics = getAllTopics();

  // If curriculum.yaml exists, return all 24 curriculum modules in canonical order
  if (curriculumModules.length > 0) {
    return curriculumModules.map((currMeta: any, idx: number) => {
      const moduleSlug = currMeta.slug || currMeta.id;
      const moduleTopics = allTopics.filter((t) => t.moduleSlug === moduleSlug);
      moduleTopics.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

      return {
        id: moduleSlug,
        slug: moduleSlug,
        title: currMeta.title || `Module ${idx + 1}: ${moduleSlug.replace(/-/g, " ")}`,
        priority: currMeta.priority || "P0",
        summary: currMeta.summary || "",
        topics: moduleTopics,
        curriculumItems: currMeta.items || [],
      };
    });
  }

  // Fallback to directory scanning only if _curriculum.yaml is missing
  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const moduleDirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith("_"));

  return moduleDirs.map((dir) => {
    const moduleSlug = dir.name;
    const moduleTopics = allTopics.filter((t) => t.moduleSlug === moduleSlug);
    moduleTopics.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    return {
      id: moduleSlug,
      slug: moduleSlug,
      title: moduleTopics[0]?.moduleTitle || moduleSlug.replace(/-/g, " "),
      priority: "P0",
      summary: moduleTopics[0]?.summary || "",
      topics: moduleTopics,
      curriculumItems: [],
    };
  });
}

export function getAllTopics(): TopicItem[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const moduleDirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith("_"));

  const rawTopics: { topic: TopicItem; filePath: string }[] = [];

  for (const modDir of moduleDirs) {
    const modPath = path.join(CONTENT_DIR, modDir.name);
    const files = fs.readdirSync(modPath);

    for (const file of files) {
      if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;
      const topicSlug = file.replace(/\.mdx?$/, "");
      const fullPath = path.join(modPath, file);
      const fileContent = fs.readFileSync(fullPath, "utf8");

      const { data, content } = matter(fileContent);
      const parsedMeta = FrontMatterSchema.safeParse(data);

      if (!parsedMeta.success) {
        console.error(`Invalid front matter in ${fullPath}:`, parsedMeta.error.format());
        continue;
      }

      const words = calculateWordCount(content);
      const readingTime = parsedMeta.data.readingTime || Math.max(1, Math.ceil(words / 220));
      const headings = extractHeadings(content);

      const topicItem: TopicItem = {
        ...parsedMeta.data,
        slug: topicSlug,
        moduleSlug: modDir.name,
        rawContent: fileContent,
        body: content,
        wordCount: words,
        readingTime,
        headings,
        usedInCaseStudies: [],
      };

      rawTopics.push({ topic: topicItem, filePath: fullPath });
    }
  }

  // Cross-link backlinks: which case studies use which concepts
  const caseStudies = rawTopics.filter(
    (t) => t.topic.type === "case-study" || t.topic.moduleSlug === "case-studies"
  );

  for (const { topic } of rawTopics) {
    if (topic.type !== "case-study" && topic.moduleSlug !== "case-studies") {
      const referringCases = caseStudies.filter((cs) => {
        const mentionsSlug = cs.topic.body.toLowerCase().includes(topic.slug.toLowerCase());
        const mentionsTitle = cs.topic.body.toLowerCase().includes(topic.title.toLowerCase());
        const inCovers = topic.covers.some((c) =>
          cs.topic.body.toLowerCase().includes(c.toLowerCase())
        );
        return mentionsSlug || mentionsTitle || inCovers;
      });

      topic.usedInCaseStudies = referringCases.map((cs) => ({
        title: cs.topic.title,
        href: `/system-design/${cs.topic.moduleSlug}/${cs.topic.slug}`,
      }));
    }
  }

  return rawTopics.map((r) => r.topic);
}

export function getTopicBySlug(moduleSlug: string, topicSlug: string): TopicItem | null {
  const all = getAllTopics();
  return all.find((t) => t.moduleSlug === moduleSlug && t.slug === topicSlug) || null;
}

export function getAdjacentTopics(moduleSlug: string, topicSlug: string): {
  prev: { title: string; href: string } | null;
  next: { title: string; href: string } | null;
} {
  const allModules = getAllModules();
  // Flatten ordered list of all topics
  const flattened: TopicItem[] = [];
  for (const m of allModules) {
    flattened.push(...m.topics);
  }

  const currentIndex = flattened.findIndex(
    (t) => t.moduleSlug === moduleSlug && t.slug === topicSlug
  );

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prevTopic = currentIndex > 0 ? flattened[currentIndex - 1] : null;
  const nextTopic = currentIndex < flattened.length - 1 ? flattened[currentIndex + 1] : null;

  return {
    prev: prevTopic
      ? { title: prevTopic.title, href: `/system-design/${prevTopic.moduleSlug}/${prevTopic.slug}` }
      : null,
    next: nextTopic
      ? { title: nextTopic.title, href: `/system-design/${nextTopic.moduleSlug}/${nextTopic.slug}` }
      : null,
  };
}
