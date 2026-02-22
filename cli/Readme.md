# MarkPre CLI

Manage your MarkPre presentations from the terminal — create, list, export, and delete presentations without opening a browser.

---

## Installation

```bash
pip install markpre
```

Requirements: Python 3.8 or higher

```bash
# Update to latest version
pip install --upgrade markpre

# Uninstall
pip uninstall markpre
```

---

## Important: First Request May Be Slow

MarkPre's backend runs on Render's free tier, which means the server sleeps after 15 minutes of inactivity. Your first command may take 30 to 60 seconds to respond.

If you see this error:

```
Request timed out — server may be waking up (Render free tier). Wait 30s and retry.
```

Wake the server first, then retry:

```bash
# Mac / Linux
curl https://markpre.onrender.com/health

# Windows PowerShell
Invoke-WebRequest -Uri "https://markpre.onrender.com/health" -UseBasicParsing
```

This only affects the first request after inactivity. All subsequent commands will be fast.

---

## Quick Start

```bash
# 1. Log in
markpre login --email your@email.com --password yourpassword

# 2. Check the connection and your export directory
markpre status

# 3. List your presentations
markpre presentation list

# 4. Create a presentation from a Markdown file
markpre presentation add -t "My Talk" -m slides.md

# 5. Export to PDF
markpre presentation export <ID> -f pdf -o my-talk.pdf

# 6. Log out
markpre logout
```

---

## Commands

### `markpre login`

Log in to your account. Your token is saved locally so you stay logged in across sessions.

```bash
markpre login --email your@email.com --password yourpassword

# Run without flags to be prompted interactively
markpre login
```

Token is saved to `~/.markpre_config.json`. Run `markpre logout` to delete it.

---

### `markpre logout`

Log out and delete your saved credentials.

```bash
markpre logout
```

---

### `markpre status`

Check whether you are logged in, whether the server is reachable, and which export directory is currently configured.

```bash
markpre status
```

Example output:

```
╭──────────────── MarkPre Status ─────────────────╮
│  Logged in as: you@email.com                    │
│  Server online: https://markpre.onrender.com/api│
│  Export directory: /Users/you/Downloads         │
╰─────────────────────────────────────────────────╯
```

---

### `markpre presentation list`

List all your presentations.

```bash
markpre presentation list
```

Example output:

```
┌────────────┬──────────────────────┬────────┬───────┬─────────────────┐
│ ID         │ Title                │ Slides │ Words │ Updated         │
├────────────┼──────────────────────┼────────┼───────┼─────────────────┤
│ 64abc123…  │ My First Talk        │ 8      │ 420   │ 2025-02-18 10:30│
│ 64def456…  │ Product Roadmap Q1   │ 12     │ 890   │ 2025-02-17 15:45│
└────────────┴──────────────────────┴────────┴───────┴─────────────────┘
```

---

### `markpre presentation add`

Create a presentation from a Markdown file. Slides are separated by `---`.

```bash
markpre presentation add -t "My Talk" -m ./slides.md

# With a theme ID
markpre presentation add -t "My Talk" -m ./slides.md --theme <THEME_ID>

# Run without flags to be prompted interactively
markpre presentation add
```

| Flag | Long form | Description |
|---|---|---|
| `-t` | `--title` | Presentation title (required) |
| `-m` | `--markdown` | Path to the `.md` file (required) |
| | `--theme` | Theme ID to apply (optional) |

---

### `markpre presentation export`

Export a presentation to PDF or HTML.

```bash
# Export as PDF with an explicit output path
markpre presentation export <ID> -f pdf -o my-talk.pdf

# Export as HTML
markpre presentation export <ID> -f html -o my-talk.html

# Omit -o to use MARKPRE_EXPORT_DIR (or current directory if not set)
markpre presentation export <ID> -f pdf
```

| Flag | Long form | Description |
|---|---|---|
| `-f` | `--format` | `pdf` or `html` (default: `pdf`) |
| `-o` | `--output` | Output file path (optional) |

When `-o` is omitted, the file is named after the presentation title and saved according to the priority rules described in the Default Export Directory section below.

PDF export uses headless Chrome on the server. Allow 10 to 30 seconds for generation.

---

### `markpre presentation delete`

Delete a presentation by ID.

```bash
markpre presentation delete <ID>
```

You will be asked to confirm:

```
Delete this presentation? [y/N]: y
Deleted
```

---

### `markpre --version`

Print the installed CLI version.

```bash
markpre --version
```

### `markpre --help`

Show all commands and options.

```bash
markpre --help
```

---

## All Commands Reference

| Command | Description |
|---|---|
| `markpre login` | Log in to your account |
| `markpre logout` | Log out and clear saved token |
| `markpre status` | Check login, server, and export directory |
| `markpre presentation list` | List all presentations |
| `markpre presentation add` | Create from a Markdown file |
| `markpre presentation delete <ID>` | Delete a presentation |
| `markpre presentation export <ID>` | Export to PDF or HTML |
| `markpre --version` | Show CLI version |
| `markpre --help` | Show help |

---

## Default Export Directory (MARKPRE_EXPORT_DIR)

By default, exports are saved to the current working directory with the presentation title as the filename. Set the `MARKPRE_EXPORT_DIR` environment variable to always save exports to a specific folder, so you never need to type `-o` each time.

**Output path priority:**

1. Explicit `-o` / `--output` flag — used exactly as given
2. `MARKPRE_EXPORT_DIR` env variable — file named `<title>.<format>` saved inside that folder
3. Current working directory — file named `<title>.<format>` saved in cwd

### Setting the variable

```bash
# Mac / Linux — current terminal session
export MARKPRE_EXPORT_DIR=~/Downloads

# Mac / Linux — permanent (add to ~/.zshrc or ~/.bashrc)
echo 'export MARKPRE_EXPORT_DIR=~/Downloads' >> ~/.zshrc

# Windows PowerShell — current session
$env:MARKPRE_EXPORT_DIR = "$env:USERPROFILE\Downloads"

# Windows PowerShell — verify it is set
echo $env:MARKPRE_EXPORT_DIR
```

Once set, exporting without `-o` automatically saves to that folder:

```bash
# Saves to ~/Downloads/My Talk.pdf
markpre presentation export <ID> -f pdf
```

Run `markpre status` to confirm which directory is active.

### Windows one-liner (no env var needed)

```powershell
$dt = "$env:USERPROFILE\Downloads"
markpre presentation export <ID> -f pdf -o "$dt\MyTalk.pdf"
```

---

## Markdown File Format

Use `---` on its own line to separate slides.

```markdown
# Title Slide
Subtitle text here

---

## Slide Two
- Bullet point one
- Bullet point two
- Bullet point three

---

## Slide with Image
![Alt text](https://example.com/image.png)

---

## Final Slide
Closing content here
```

Supported formatting:

| Syntax | Result |
|---|---|
| `# Text` | Large title heading |
| `## Text` | Slide section heading |
| `### Text` | Subheading |
| `- Text` | Bullet point |
| `1. Text` | Numbered list item |
| `**text**` | Bold |
| `*text*` | Italic |
| `` `text` `` | Inline code |
| `![alt](url)` | Image |
| Plain text | Paragraph |

---

## Configuration File

The CLI stores your token at:

| Platform | Path |
|---|---|
| Mac / Linux | `~/.markpre_config.json` |
| Windows | `C:\Users\YOUR_NAME\.markpre_config.json` |

Created automatically on login, deleted on logout. Do not commit this file to version control.

---

## Custom Backend

If you are self-hosting MarkPre, set `MARKPRE_API_URL` before running any command:

```bash
# Mac / Linux — current session
export MARKPRE_API_URL=https://your-backend.onrender.com/api

# Mac / Linux — permanent
echo 'export MARKPRE_API_URL=https://your-backend.onrender.com/api' >> ~/.zshrc

# Windows PowerShell — current session
$env:MARKPRE_API_URL = "https://your-backend.onrender.com/api"
```

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Request timed out` | Render server sleeping | Ping the health endpoint, wait 30 seconds, then retry |
| `Authentication failed` | Token expired or invalid | Run `markpre login` again |
| `Cannot connect to server` | No internet or wrong URL | Check connection or verify `MARKPRE_API_URL` |
| `Export failed: PDF generation failed` | Puppeteer crash on server | Try again — usually resolves on second attempt |
| `Received empty file` | Export streamed 0 bytes | Re-save the presentation in the editor, then retry |
| `No module named 'markpre'` | Not installed | Run `pip install markpre` |
| `ModuleNotFoundError` | Corrupt install | Run `pip uninstall markpre -y` then `pip install markpre` |

---

## Built With

- [Click](https://click.palletsprojects.com/) — CLI framework
- [Rich](https://github.com/Textualize/rich) — Terminal formatting and tables

---

## Related

- [Frontend README](./README-frontend.md) — React + Vite web application
- [Backend README](./README-backend.md) — Express + TypeScript API server

---

## License

MIT — Kunal Khuteta