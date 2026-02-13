import { Textarea } from "@/components/ui/textarea";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor = ({ value, onChange }: MarkdownEditorProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <Textarea
          value={value}
          onChange={(e:any) => onChange(e.target.value)}
          placeholder="# Your Presentation Title

---

## Slide 2
- Point 1
- Point 2
- Point 3

---

## Slide 3
Write your content here..."
          className="h-full resize-none font-mono text-sm leading-relaxed border-0 focus-visible:ring-0 bg-card"
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;