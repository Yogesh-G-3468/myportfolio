import { z } from "zod";

export const QuizItemSchema = z.object({
  question: z.string().min(5),
  options: z.array(z.string()).min(2),
  answer: z.number().int().min(0),
  explanation: z.string().min(5),
});

export const TopicTypeSchema = z.enum([
  "concept",
  "deep-dive",
  "comparison",
  "technology",
  "case-study",
  "lld",
  "paper",
  "cheatsheet",
  "playbook",
]);

export const TopicLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export const TopicPrioritySchema = z.enum(["P0", "P1", "P2"]);

export const FrontMatterSchema = z.object({
  title: z.string().min(3),
  module: z.string().min(2),
  moduleTitle: z.string().min(2),
  type: TopicTypeSchema,
  order: z.number().int().default(1),
  level: TopicLevelSchema.default("intermediate"),
  priority: TopicPrioritySchema.default("P0"),
  readingTime: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  relatedTopics: z.array(z.string()).default([]),
  covers: z.array(z.string()).min(1, "Each topic must list at least one curriculum item in covers"),
  glossaryTerms: z.array(z.string()).default([]),
  lastReviewed: z.string().default("2026-10-25"),
  summary: z.string().min(10),
  quiz: z.array(QuizItemSchema).optional(),
});

export type QuizItem = z.infer<typeof QuizItemSchema>;
export type TopicType = z.infer<typeof TopicTypeSchema>;
export type TopicLevel = z.infer<typeof TopicLevelSchema>;
export type TopicPriority = z.infer<typeof TopicPrioritySchema>;
export type FrontMatter = z.infer<typeof FrontMatterSchema>;

export interface TopicItem extends FrontMatter {
  slug: string;
  moduleSlug: string;
  rawContent: string;
  body: string;
  wordCount: number;
  readingTime: number;
  headings: { level: number; text: string; id: string }[];
  usedInCaseStudies: { title: string; href: string }[];
}

export interface CurriculumItemMeta {
  id: string;
  title: string;
  priority: string;
  status: string;
}

export interface ModuleItem {
  id: string;
  title: string;
  slug: string;
  priority: TopicPriority;
  summary: string;
  topics: TopicItem[];
  curriculumItems?: CurriculumItemMeta[];
}
