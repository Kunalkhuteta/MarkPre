# MarkPre CLI

Manage your MarkPre presentations from the terminal — create, list, export, and delete presentations without opening a browser.

---

## Installation

```bash
pip install markpre
```

Requirements: Python 3.8 or higher

To update to the latest version:

```bash
pip install --upgrade markpre
```

To uninstall:

```bash
pip uninstall markpre
```

---

## Important: First Request May Be Slow

MarkPre's backend runs on Render's free tier, which means the server sleeps after 15 minutes of inactivity. When you run your first command of the day, the server may take 30 to 60 seconds to wake up.

If you see this error:

```
Request timed out — server may be waking up (Render free tier), try again
```

Wake the server first, then retry your command:

```bash
# Mac / Linux — ping the health endpoint
curl https://markpre.onrender.com/health

# Windows PowerShell — ping the health endpoint
Invoke-WebRequest -Uri "https://markpre.onrender.com/health" -UseBasicParsing
```

Wait for a response, then run your original command. This only affects the first request after a period of inactivity. All subsequent commands will respond quickly.

---

## Quick Start

```bash
# 1. Log in
markpre login --email your@email.com --password yourpassword

# 2. Verify the connection
markpre status

# 3. List your presentations
markpre presentation list

# 4. Create a presentation from a Markdown file
markpre presentation add -t "My Talk" -m slides.md

# 5. Export to PDF
markpre presentation export <ID> -f pdf -o my-talk.pdf

# 6. Log out when done
markpre logout
```

---

## Commands

### `markpre login`

Log in to your MarkPre account. Your token is saved locally so you stay logged in across sessions.

```bash
markpre login --email your@email.com --password yourpassword

# Run without flags to be prompted interactively
markpre login
```

Credentials are saved to `~/.markpre_config.json` (see Configuration section).

---

### `markpre logout`

Log out and delete your saved credentials from your machine.

```bash
markpre logout
```

---

### `markpre status`

Check whether you are logged in and whether the server is reachable.

```bash
markpre status
```

Example output:

```
╭─────────────────── MarkPre Status ───────────────────╮
│  Logged in as: you@email.com                         │
│  Server online: https://markpre.onrender.com/api     │
╰──────────────────────────────────────────────────────╯
```

---

### `markpre presentation list`

List all your presentations in a table showing ID, title, slide count, word count, and last updated date.

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

Create a new presentation by uploading a Markdown file. Slides are separated by `---`.

```bash
markpre presentation add -t "My Talk" -m ./slides.md

# Optionally apply a theme by ID
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

### `markpre presentation delete`

Delete a presentation by its ID. Use `markpre presentation list` to find the ID.

```bash
markpre presentation delete <ID>
```

You will be asked to confirm before the deletion is executed:

```
Delete this presentation? [y/N]: y
Deleted
```

---

### `markpre presentation export`

Export a presentation to PDF or HTML. The file is saved to the path specified by `-o`.

```bash
# Export as PDF
markpre presentation export <ID> -f pdf -o my-talk.pdf

# Export as HTML
markpre presentation export <ID> -f html -o my-talk.html

# Without -o, saves as presentation.pdf or presentation.html in the current directory
markpre presentation export <ID>
```

| Flag | Long form | Description |
|---|---|---|
| `-f` | `--format` | `pdf` or `html` (default: `pdf`) |
| `-o` | `--output` | Output file path (optional) |

Windows — export directly to the Downloads folder:

```powershell
$dt = "$env:USERPROFILE\Downloads"
markpre presentation export <ID> -f pdf -o "$dt\MyTalk.pdf"
```

---

### `markpre --version`

Print the installed CLI version.

```bash
markpre --version
```

### `markpre --help`

List all available commands and options.

```bash
markpre --help
```

---

## All Commands Reference

| Command | Description |
|---|---|
| `markpre login` | Log in to your account |
| `markpre logout` | Log out and clear saved token |
| `markpre status` | Check login status and server reachability |
| `markpre presentation list` | List all presentations |
| `markpre presentation add` | Create from a Markdown file |
| `markpre presentation delete <ID>` | Delete a presentation |
| `markpre presentation export <ID>` | Export to PDF or HTML |
| `markpre --version` | Show CLI version |
| `markpre --help` | Show help |

---

## Markdown File Format

MarkPre separates slides using `---`. Each section becomes one slide. Standard Markdown syntax is supported within each slide.

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

Supported formatting within slides:

| Syntax | Result |
|---|---|
| `# Text` | Large title heading |
| `## Text` | Slide section heading |
| `### Text` | Subheading |
| `- Text` | Bullet point |
| `![alt](url)` | Inline image |
| Plain text | Paragraph |

---

## Configuration

The CLI stores your login token in a local config file:

| Platform | Path |
|---|---|
| Windows | `C:\Users\YOUR_NAME\.markpre_config.json` |
| Mac / Linux | `~/.markpre_config.json` |

This file is created automatically on login and deleted on logout. Do not commit this file to version control — add it to your `.gitignore` if needed.

---

## Custom Backend

If you are self-hosting MarkPre, point the CLI at your own backend by setting the `MARKPRE_API_URL` environment variable before running any command.

```bash
# Mac / Linux (current session)
export MARKPRE_API_URL=https://your-backend.onrender.com/api

# Mac / Linux (permanent — add to ~/.zshrc or ~/.bashrc)
echo 'export MARKPRE_API_URL=https://your-backend.onrender.com/api' >> ~/.zshrc

# Windows PowerShell (current session)
$env:MARKPRE_API_URL = "https://your-backend.onrender.com/api"
```

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Request timed out` | Render server sleeping | Ping the health endpoint, wait 30 seconds, then retry |
| `Authentication failed` | Token expired or invalid | Run `markpre login` again |
| `Cannot connect to server` | No internet or wrong URL | Check your connection or verify `MARKPRE_API_URL` |
| `No module named 'markpre'` | Not installed or wrong Python | Run `pip install markpre` |
| `ModuleNotFoundError` | Corrupt installation | Run `pip uninstall markpre -y` then `pip install markpre` |

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