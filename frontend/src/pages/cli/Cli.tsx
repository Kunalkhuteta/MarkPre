import { TerminalSquare, UploadCloud, ArrowUpRight } from "lucide-react";

const CLI = () => {
  return (
    <div className="container mx-auto py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-4 text-center">
          <TerminalSquare className="w-12 h-12 mx-auto text-primary" />
          <h1 className="text-4xl font-bold">CLI Guide</h1>
          <p className="text-lg text-muted-foreground">
            Automate your MakeBreak workflow right from your terminal.
          </p>
        </div>

        {/* Upload Markdown Command Card */}
        <div className="bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 space-y-4">
          <div className="flex items-center gap-3">
            <UploadCloud className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-xl">Upload Markdown</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload your Markdown presentation file directly to MakeBreak with one command.
          </p>

          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto border">
            <code>
              python makebreak.py --email your-email@gmail.com --password your-password <br />
              python makebreak.py presentation add -t "My Presentation" -m ./slides.md
            </code>
          </div>
        </div>

        {/* Export Command Card */}
        <div className="bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ArrowUpRight className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-xl">Export Presentation</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Export your presentation in the desired format directly to your local machine.
          </p>

          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto border">
            <code>
              $dt = 'C:\Users\Welcome\Downloads' # Add Your Path <br/><br/>
              python makebreak.py presentation export ID_given_at_the_terminal -f pdf -o "$dt\MarkPre.pdf"
            </code>
          </div>
        </div>

        {/* Tips Section */}
        <div className="border-l-4 border-primary bg-muted/40 p-4 rounded-md">
          <h4 className="font-semibold mb-1 text-primary">Tip</h4>
          <p className="text-sm text-muted-foreground">
            You can save your login credentials using a config file to skip entering email and password every time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CLI;
