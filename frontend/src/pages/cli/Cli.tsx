import { useState } from "react";
import {
  TerminalSquare, UploadCloud, ArrowUpRight, Download,
  LogIn, List, Trash2, CheckCircle2, AlertTriangle, Package,
} from "lucide-react";

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-zinc-950 dark:bg-zinc-900 rounded-lg p-4 font-mono text-sm overflow-x-auto border border-zinc-800">
    <code className="text-green-400 whitespace-pre-wrap">{children}</code>
  </div>
);

const CLI = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copy(text, id)}
      className="text-xs px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors shrink-0"
    >
      {copied === id ? "✓ Copied" : "Copy"}
    </button>
  );

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <TerminalSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">MarkPre CLI</h1>
          <p className="text-lg text-muted-foreground">
            Manage your presentations directly from the terminal — no browser needed.
          </p>
        </div>

        {/* Server Warning */}
        <div className="flex gap-3 border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm">First Request May Be Slow</p>
            <p className="text-sm text-amber-700 dark:text-amber-500">
              The MarkPre server runs on Render's free tier and sleeps after 15 minutes of inactivity.
              Your first command may time out or take <strong>30–60 seconds</strong>. Just wait and try again — all subsequent commands will be fast.
            </p>
          </div>
        </div>

        {/* Installation */}
        <div className="bg-card border rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-xl">Installation</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Install the CLI globally via pip. Requires Python 3.8+.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-zinc-950 dark:bg-zinc-900 rounded-lg p-4 font-mono text-sm border border-zinc-800">
              <code className="text-green-400">pip install markpre</code>
            </div>
            <CopyButton text="pip install markpre" id="install" />
          </div>
          <p className="text-xs text-muted-foreground">
            After installation, the <code className="bg-muted px-1 py-0.5 rounded">markpre</code> command is available anywhere in your terminal.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-zinc-950 dark:bg-zinc-900 rounded-lg p-4 font-mono text-sm border border-zinc-800">
              <code className="text-green-400">pip install --upgrade markpre</code>
            </div>
            <CopyButton text="pip install --upgrade markpre" id="upgrade" />
          </div>
          <p className="text-xs text-muted-foreground">Run the above to update to the latest version.</p>
        </div>

        {/* Login */}
        <div className="bg-card border rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <LogIn className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-xl">Login</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Log in once — your token is saved locally so you stay logged in across sessions.
          </p>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <CodeBlock>markpre login --email your@email.com --password yourpassword</CodeBlock>
            </div>
            <CopyButton text="markpre login --email your@email.com --password yourpassword" id="login" />
          </div>
          <p className="text-xs text-muted-foreground">
            Credentials are saved to <code className="bg-muted px-1 py-0.5 rounded">~/.markpre_config.json</code>. Run <code className="bg-muted px-1 py-0.5 rounded">markpre logout</code> to clear them.
          </p>
        </div>

        {/* Check Status */}
        <div className="bg-card border rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-xl">Check Status</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Verify you're logged in and the server is reachable.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <CodeBlock>markpre status</CodeBlock>
            </div>
            <CopyButton text="markpre status" id="status" />
          </div>
        </div>

        {/* List */}
        <div className="bg-card border rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-xl">List Presentations</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            View all your presentations with IDs, slide counts and last updated dates.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <CodeBlock>markpre presentation list</CodeBlock>
            </div>
            <CopyButton text="markpre presentation list" id="list" />
          </div>
          <div className="bg-muted/60 rounded-lg p-3 text-xs font-mono text-muted-foreground">
            📊 Your Presentations (2)<br/>
            ┌────────────┬──────────────────────┬────────┬───────┐<br/>
            │ ID         │ Title                │ Slides │ Words │<br/>
            ├────────────┼──────────────────────┼────────┼───────┤<br/>
            │ 64abc123…  │ My First Talk        │ 8      │ 420   │<br/>
            │ 64def456…  │ Product Roadmap      │ 12     │ 890   │<br/>
            └────────────┴──────────────────────┴────────┴───────┘
          </div>
        </div>

        {/* Upload */}
        <div className="bg-card border rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <UploadCloud className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-xl">Upload Markdown File</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Create a new presentation by uploading a <code className="bg-muted px-1 py-0.5 rounded">.md</code> file.
            Slides are separated by <code className="bg-muted px-1 py-0.5 rounded">---</code>.
          </p>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <CodeBlock>markpre presentation add -t "My Talk" -m ./slides.md</CodeBlock>
            </div>
            <CopyButton text={'markpre presentation add -t "My Talk" -m ./slides.md'} id="add" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Example slides.md format:</p>
            <CodeBlock>{`# My Presentation\nSubtitle here\n\n---\n\n## Slide Two\n- Point one\n- Point two\n\n---\n\n## Slide Three\nMore content here`}</CodeBlock>
          </div>
        </div>

        {/* Export */}
        <div className="bg-card border rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-xl">Export Presentation</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Export any presentation to PDF or HTML. Get the ID from <code className="bg-muted px-1 py-0.5 rounded">markpre presentation list</code>.
          </p>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Export as PDF:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <CodeBlock>markpre presentation export PRESENTATION_ID -f pdf -o my-talk.pdf</CodeBlock>
                </div>
                <CopyButton text="markpre presentation export PRESENTATION_ID -f pdf -o my-talk.pdf" id="exportpdf" />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Export as HTML:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <CodeBlock>markpre presentation export PRESENTATION_ID -f html -o my-talk.html</CodeBlock>
                </div>
                <CopyButton text="markpre presentation export PRESENTATION_ID -f html -o my-talk.html" id="exporthtml" />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Windows — export to Downloads folder:</p>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <CodeBlock>{`$dt = "$env:USERPROFILE\\Downloads"\nmarkpre presentation export PRESENTATION_ID -f pdf -o "$dt\\MyTalk.pdf"`}</CodeBlock>
                </div>
                <CopyButton text={`$dt = "$env:USERPROFILE\\Downloads"\nmarkpre presentation export PRESENTATION_ID -f pdf -o "$dt\\MyTalk.pdf"`} id="exportwin" />
              </div>
            </div>
          </div>
        </div>

        {/* Delete */}
        <div className="bg-card border rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-xl">Delete Presentation</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Delete a presentation by ID. You'll be asked to confirm before deletion.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <CodeBlock>markpre presentation delete PRESENTATION_ID</CodeBlock>
            </div>
            <CopyButton text="markpre presentation delete PRESENTATION_ID" id="delete" />
          </div>
        </div>

        {/* All Commands Reference */}
        <div className="bg-card border rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ArrowUpRight className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-xl">All Commands</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Command</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["markpre login", "Log in to your account"],
                  ["markpre logout", "Log out and clear saved token"],
                  ["markpre status", "Check login + server status"],
                  ["markpre presentation list", "List all presentations"],
                  ["markpre presentation add", "Create from markdown file"],
                  ["markpre presentation delete ID", "Delete a presentation"],
                  ["markpre presentation export ID", "Export to PDF or HTML"],
                  ["markpre --version", "Show CLI version"],
                  ["markpre --help", "Show help"],
                ].map(([cmd, desc]) => (
                  <tr key={cmd}>
                    <td className="py-2 pr-4">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{cmd}</code>
                    </td>
                    <td className="py-2 text-muted-foreground">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "Stay Logged In",
              body: "Your token is saved after login — you don't need to log in again unless you run markpre logout.",
            },
            {
              title: "Get Presentation IDs",
              body: "Run markpre presentation list to see all your IDs before exporting or deleting.",
            },
            {
              title: "Server Sleeping?",
              body: "If a command times out, wait 30 seconds and try again. The server wakes up on the next request.",
            },
            {
              title: "Custom Backend",
              body: "Set MARKPRE_API_URL environment variable to point the CLI at your own hosted instance.",
            },
          ].map(({ title, body }) => (
            <div key={title} className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-lg">
              <p className="font-semibold text-sm text-primary mb-1">{title}</p>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CLI;

// Also update Docs.tsx CLI section — replace the cli content block with this: