import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "system-design");
const CURRICULUM_PATH = path.join(CONTENT_DIR, "_curriculum.yaml");
const OUTPUT_PATH = path.join(CONTENT_DIR, "_coverage.md");

function generateCoverageReport() {
  if (!fs.existsSync(CURRICULUM_PATH)) {
    console.error("_curriculum.yaml not found");
    return;
  }

  const curriculum = yaml.load(fs.readFileSync(CURRICULUM_PATH, "utf8")) as any;

  // Scan all topic files and their covers mappings
  const itemToPageMap = new Map<string, { module: string; slug: string; title: string }[]>();

  const moduleDirs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"));

  for (const modDir of moduleDirs) {
    const modPath = path.join(CONTENT_DIR, modDir.name);
    const files = fs.readdirSync(modPath).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

    for (const file of files) {
      const fullPath = path.join(modPath, file);
      const fileSlug = file.replace(/\.mdx?$/, "");
      const { data } = matter(fs.readFileSync(fullPath, "utf8"));

      if (data && Array.isArray(data.covers)) {
        data.covers.forEach((itemTitle: string) => {
          const list = itemToPageMap.get(itemTitle) || [];
          list.push({ module: modDir.name, slug: fileSlug, title: data.title || fileSlug });
          itemToPageMap.set(itemTitle, list);
        });
      }
    }
  }

  let totalCurriculumItems = 0;
  let coveredCurriculumItems = 0;

  let report = "# System Design Hub: Curriculum Coverage Matrix\n\n";
  report += `*Generated automatically on ${new Date().toISOString().split("T")[0]}*\n\n`;
  report += "| Module | Total Items | Covered | Coverage % |\n";
  report += "| :--- | :--- | :--- | :--- |\n";

  const moduleBreakdown: string[] = [];

  curriculum.modules.forEach((mod: any) => {
    const items = mod.items || [];
    totalCurriculumItems += items.length;
    let modCovered = 0;

    let modSection = `\n### ${mod.title}\n\n`;
    modSection += "| Curriculum Item | Priority | Covered By Topic |\n";
    modSection += "| :--- | :--- | :--- |\n";

    items.forEach((item: any) => {
      const mapped = itemToPageMap.get(item.title) || [];
      const isDone = mapped.length > 0;
      if (isDone) {
        modCovered++;
        coveredCurriculumItems++;
      }

      const coverageCell = isDone
        ? mapped.map((m) => `[${m.title}](file:///${m.module}/${m.slug})`).join(", ")
        : "🔴 *Pending Release*";

      modSection += `| ${item.title} | \`${item.priority}\` | ${coverageCell} |\n`;
    });

    const percent = items.length > 0 ? Math.round((modCovered / items.length) * 100) : 0;
    report += `| **${mod.title}** | ${items.length} | ${modCovered} | ${percent}% |\n`;
    moduleBreakdown.push(modSection);
  });

  const totalPercent =
    totalCurriculumItems > 0
      ? Math.round((coveredCurriculumItems / totalCurriculumItems) * 100)
      : 0;

  report += `| **TOTAL** | **${totalCurriculumItems}** | **${coveredCurriculumItems}** | **${totalPercent}%** |\n\n`;
  report += "---\n\n## Module Item Breakdown\n";
  report += moduleBreakdown.join("\n");

  fs.writeFileSync(OUTPUT_PATH, report, "utf8");
  console.log(`✅ Coverage matrix generated at ${OUTPUT_PATH}`);
  console.log(`📊 Global Coverage: ${coveredCurriculumItems} / ${totalCurriculumItems} (${totalPercent}%)`);
}

generateCoverageReport();
