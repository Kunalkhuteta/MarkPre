import { useState } from "react";
import { FileText, Code, Palette, Download, Terminal, Sparkles, Presentation, Keyboard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Docs = () => {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction", icon: FileText },
    { id: "getting-started", title: "Getting Started", icon: Code },
    { id: "markdown", title: "Markdown Syntax", icon: Code },
    { id: "themes", title: "Themes & Styling", icon: Palette },
    { id: "ai-features", title: "AI Features", icon: Sparkles },
    { id: "presentation", title: "Presentation Mode", icon: Presentation },
    { id: "export", title: "Export Options", icon: Download },
    { id: "shortcuts", title: "Keyboard Shortcuts", icon: Keyboard },
    { id: "cli", title: "CLI Tool", icon: Terminal },
  ];

  const content = {
    introduction: (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Welcome to MarkPre</h1>
        <p className="text-lg text-muted-foreground">
          MarkPre is a modern, AI-powered Markdown presentation platform that helps you create
          stunning slide decks with minimal effort. Write in Markdown, apply beautiful themes,
          and present like a pro.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Markdown-Based Editor:</strong> Familiar syntax, powerful results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>AI-Powered Generation:</strong> Create presentations from topics instantly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Beautiful Themes:</strong> Pre-built themes + custom theme creator</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Live Preview:</strong> See changes in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Multi-Format Export:</strong> PDF, HTML with full styling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Presentation Mode:</strong> Full-screen presenting with navigation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Dark Mode:</strong> Complete dark mode support</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    ),

    "getting-started": (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Getting Started</h1>
        <p className="text-lg text-muted-foreground">
          Follow these steps to create your first presentation in MarkPre.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Step 1: Create an Account</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "Sign Up" on the homepage</li>
              <li>Enter your name, email, and password</li>
              <li>Verify your email with the 6-digit OTP sent to you</li>
              <li>You're ready to start creating!</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 2: Create Your First Presentation</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "New Presentation" from your dashboard</li>
              <li>Enter a title for your presentation</li>
              <li>Start writing in Markdown in the left panel</li>
              <li>Watch your slides appear in real-time on the right</li>
              <li>Click "Save" to save your work (or wait for auto-save)</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 3: Apply a Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Select a theme from the dropdown in the editor</li>
              <li>Or create your own in the "Themes" section</li>
              <li>See your slides update with the new styling instantly</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 4: Export & Present</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "Export" to download as PDF or HTML</li>
              <li>Or click "Present" to enter full-screen presentation mode</li>
              <li>Navigate with arrow keys or mouse clicks</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    ),

    markdown: (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Markdown Syntax</h1>
        <p className="text-lg text-muted-foreground">
          Learn the Markdown syntax supported in MarkPre.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Slide Separators</CardTitle>
            <CardDescription>Use three dashes to separate slides</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="block bg-muted p-4 rounded font-mono text-sm">
              # Slide 1<br/>
              Content here<br/>
              <br/>
              ---<br/>
              <br/>
              # Slide 2<br/>
              More content
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Headings</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="block bg-muted p-4 rounded font-mono text-sm">
              # Main Title (H1)<br/>
              ## Section Title (H2)<br/>
              ### Subsection (H3)
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Unordered List:</p>
                <code className="block bg-muted p-4 rounded font-mono text-sm">
                  - Item 1<br/>
                  - Item 2<br/>
                  - Item 3
                </code>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Ordered List:</p>
                <code className="block bg-muted p-4 rounded font-mono text-sm">
                  1. First item<br/>
                  2. Second item<br/>
                  3. Third item
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Code Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="block bg-muted p-4 rounded font-mono text-sm">
              ```python<br/>
              def hello_world():<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;print("Hello, MarkPre!")<br/>
              ```
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emphasis</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="block bg-muted p-4 rounded font-mono text-sm">
              *Italic text*<br/>
              **Bold text**<br/>
              `Inline code`<br/>
              ~~Strikethrough~~
            </code>
          </CardContent>
        </Card>
      </div>
    ),

    themes: (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Themes & Styling</h1>
        <p className="text-lg text-muted-foreground">
          Customize the appearance of your presentations with themes.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Using Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>In the editor, click the theme dropdown</li>
              <li>Select from available themes</li>
              <li>Your slides update instantly</li>
              <li>Save to apply the theme permanently</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Creating Custom Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to the "Themes" page</li>
              <li>Click "Add New Theme"</li>
              <li>Set your colors:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>Primary Color: Accent and headings</li>
                  <li>Background Color: Slide background</li>
                  <li>Text Color: Main content color</li>
                </ul>
              </li>
              <li>Choose a font family</li>
              <li>Save and start using your theme!</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dark Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">MarkPre supports both light and dark modes:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click the sun/moon icon in the header toolbar</li>
              <li>Your preference is saved automatically</li>
              <li>Dark mode works everywhere in the app</li>
              <li>Note: Presentation themes are independent of app dark mode</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    ),

    "ai-features": (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">AI Features</h1>
        <p className="text-lg text-muted-foreground">
          Leverage AI to create and improve your presentations instantly.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>AI Generate Slides</CardTitle>
            <CardDescription>Create a complete presentation from a topic</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "AI Generate" in the editor</li>
              <li>Enter your topic (e.g., "Introduction to Machine Learning")</li>
              <li>Choose the number of slides (3-20)</li>
              <li>Select a style:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li><strong>Professional:</strong> Business-focused, data-driven</li>
                  <li><strong>Casual:</strong> Conversational and engaging</li>
                  <li><strong>Academic:</strong> Scholarly tone with research focus</li>
                  <li><strong>Creative:</strong> Visual storytelling approach</li>
                </ul>
              </li>
              <li>Click "Generate" - slides appear instantly!</li>
              <li>Edit the generated content as needed</li>
            </ol>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm"><strong>Note:</strong> AI generation uses template-based generation. No API configuration needed!</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Improve Slides</CardTitle>
            <CardDescription>Enhance your existing content</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Write your initial content</li>
              <li>Click "AI Improve" in the toolbar</li>
              <li>AI will enhance clarity, engagement, and structure</li>
              <li>Review and refine the improvements</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    ),

    presentation: (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Presentation Mode</h1>
        <p className="text-lg text-muted-foreground">
          Present your slides in full-screen mode with professional controls.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Entering Presentation Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Save your presentation first</li>
              <li>Click the "Present" button in the editor</li>
              <li>Or press <kbd className="px-2 py-1 bg-muted rounded">F11</kbd></li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Keyboard:</p>
                <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                  <li><kbd className="px-2 py-1 bg-muted rounded text-xs">→</kbd> or <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd>: Next slide</li>
                  <li><kbd className="px-2 py-1 bg-muted rounded text-xs">←</kbd>: Previous slide</li>
                  <li><kbd className="px-2 py-1 bg-muted rounded text-xs">Home</kbd>: First slide</li>
                  <li><kbd className="px-2 py-1 bg-muted rounded text-xs">End</kbd>: Last slide</li>
                  <li><kbd className="px-2 py-1 bg-muted rounded text-xs">G</kbd>: Grid overview</li>
                  <li><kbd className="px-2 py-1 bg-muted rounded text-xs">F</kbd>: Toggle fullscreen</li>
                  <li><kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>: Exit</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Mouse/Touch:</p>
                <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                  <li>Click arrows to navigate</li>
                  <li>Click slide number to see current position</li>
                  <li>Move mouse to show controls</li>
                  <li>Controls hide after 3 seconds</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Progress Bar:</strong> Visual indicator of presentation progress</li>
              <li><strong>Slide Counter:</strong> Current slide / total slides</li>
              <li><strong>Grid Overview:</strong> See all slides at once (press G)</li>
              <li><strong>Auto-hide Controls:</strong> Clean presentation view</li>
              <li><strong>Theme Support:</strong> Your custom themes are applied</li>
              <li><strong>Dark Mode Toggle:</strong> Switch app theme during presentation</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    ),

    export: (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Export Options</h1>
        <p className="text-lg text-muted-foreground">
          Export your presentations in multiple formats with full theme styling.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>PDF Export</CardTitle>
            <CardDescription>High-quality PDF with complete styling</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Perfect for:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Sharing with others</li>
              <li>Printing physical copies</li>
              <li>Archiving presentations</li>
              <li>Email attachments</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong>Features:</strong> Full theme colors, custom fonts, syntax highlighting for code, proper slide breaks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HTML Export</CardTitle>
            <CardDescription>Interactive web presentation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Perfect for:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Hosting on websites</li>
              <li>Sharing via link</li>
              <li>Interactive presentations</li>
              <li>Full-screen presenting</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong>Features:</strong> Keyboard navigation, fullscreen mode, responsive design, self-contained file
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Export</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Save your presentation</li>
              <li>Click the "Export" button</li>
              <li>Choose PDF or HTML</li>
              <li>Wait for generation (may take a few seconds)</li>
              <li>File downloads automatically</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    ),

    shortcuts: (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Keyboard Shortcuts</h1>
        <p className="text-lg text-muted-foreground">
          Work faster with keyboard shortcuts.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Editor Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <span className="font-mono text-sm"><kbd className="px-2 py-1 bg-muted rounded">Ctrl + S</kbd></span>
              <span>Save presentation</span>
              
              <span className="font-mono text-sm"><kbd className="px-2 py-1 bg-muted rounded">Ctrl + P</kbd></span>
              <span>Toggle preview</span>
              
              <span className="font-mono text-sm"><kbd className="px-2 py-1 bg-muted rounded">F11</kbd></span>
              <span>Fullscreen mode</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Presentation Mode Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <span className="font-mono text-sm"><kbd className="px-2 py-1 bg-muted rounded">→</kbd> or <kbd className="px-2 py-1 bg-muted rounded">Space</kbd></span>
              <span>Next slide</span>
              
              <span className="font-mono text-sm"><kbd className="px-2 py-1 bg-muted rounded">←</kbd></span>
              <span>Previous slide</span>
              
              <span className="font-mono text-sm"><kbd className="px-2 py-1 bg-muted rounded">Home</kbd></span>
              <span>First slide</span>
              
              <span className="font-mono text-sm"><kbd className="px-2 py-1 bg-muted rounded">End</kbd></span>
              <span>Last slide</span>
              
              <span className="font-mono text-sm"><kbd className="px-2 py-1 bg-muted rounded">G</kbd></span>
              <span>Grid overview</span>
              
              <span className="font-mono text-sm"><kbd className="px-2 py-1 bg-muted rounded">F</kbd></span>
              <span>Toggle fullscreen</span>
              
              <span className="font-mono text-sm"><kbd className="px-2 py-1 bg-muted rounded">Esc</kbd></span>
              <span>Exit presentation</span>
            </div>
          </CardContent>
        </Card>
      </div>
    ),

    cli: (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">CLI Tool</h1>
        <p className="text-lg text-muted-foreground">
          Manage presentations from your terminal with the MarkPre CLI.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Installation</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="block bg-muted p-4 rounded font-mono text-sm">
              cd cli<br/>
              pip install -r requirements.txt<br/>
              chmod +x markpre.py
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="font-medium mb-2">Login:</p>
              <code className="block bg-muted p-4 rounded font-mono text-sm">
                python markpre.py login --email your-email@gmail.com --password your-password
              </code>
            </div>

            <div>
              <p className="font-medium mb-2">Upload Markdown File:</p>
              <code className="block bg-muted p-4 rounded font-mono text-sm">
                python markpre.py presentation add -t "My Presentation" -m ./slides.md
              </code>
              <p className="text-sm text-muted-foreground mt-2">
                This will upload your local Markdown file directly to MarkPre
              </p>
            </div>

            <div>
              <p className="font-medium mb-2">List Presentations:</p>
              <code className="block bg-muted p-4 rounded font-mono text-sm">
                python markpre.py presentation list
              </code>
              <p className="text-sm text-muted-foreground mt-2">
                Shows all your presentations with their IDs
              </p>
            </div>

            <div>
              <p className="font-medium mb-2">Export Presentation:</p>
              <code className="block bg-muted p-4 rounded font-mono text-sm">
                $dt = 'C:\Users\Welcome\Downloads' # Set your download path<br/>
                python markpre.py presentation export PRESENTATION_ID -f pdf -o "$dt\MarkPre.pdf"
              </code>
              <p className="text-sm text-muted-foreground mt-2">
                Replace PRESENTATION_ID with the ID from the list command
              </p>
            </div>

            <div>
              <p className="font-medium mb-2">Check Status:</p>
              <code className="block bg-muted p-4 rounded font-mono text-sm">
                python markpre.py status
              </code>
            </div>

            <div>
              <p className="font-medium mb-2">Logout:</p>
              <code className="block bg-muted p-4 rounded font-mono text-sm">
                python markpre.py logout
              </code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Colored terminal output with Rich library</li>
              <li>Progress indicators for long operations</li>
              <li>Comprehensive error handling</li>
              <li>Token-based authentication (stored in ~/.markpre_config.json)</li>
              <li>Batch operations support</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Your credentials are stored securely after login</li>
              <li>Use the list command to get presentation IDs for export</li>
              <li>Export paths can use environment variables</li>
              <li>The CLI uses the same API as the web interface</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <nav className="sticky top-24 space-y-1">
              {sections.map(({ id, title, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium text-left">{title}</span>
                </button>
              ))}
            </nav>
          </aside>
          
          <main className="md:col-span-3">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {content[activeSection as keyof typeof content]}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Docs;