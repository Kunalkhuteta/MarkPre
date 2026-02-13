import fs from "fs";
import path from "path";

export const createMarkdown = async (presentation:any) => {
  const content = `# ${presentation.title}\n\n${presentation.content}`;
  const filePath = path.join("temp", `${presentation._id}.md`);
  fs.writeFileSync(filePath, content);
  return filePath;
};
