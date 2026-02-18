# MarkPre CLI

Manage your MarkPre presentations from the terminal — create, list, export, and delete presentations without opening a browser.

---

## Installation

```bash
pip install markpre
```

**Requirements:** Python 3.8 or higher

---

## ⚠️ First Time? Read This

MarkPre's backend runs on **Render's free tier**, which means the server **sleeps after 15 minutes of inactivity**. When you run your first command of the day, the server may take **30–60 seconds to wake up**.

**If you see this error:**
```
❌ Request timed out — server may be waking up (Render free tier), try again
```

**Solution — wake the server first, then retry:**
```bash
# Option 1: Just wait 30 seconds and try again
markpre login --email your@email.com --password yourpassword

# Option 2: Ping the server to wake it up first (PowerShell)
Invoke-WebRequest -Uri "https://markpre.onrender.com/health" -UseBasicParsing
# Then run your command

# Option 3: Ping (Mac/Linux)
curl https://markpre.onrender.com/health
```

This only happens on the **first request** after inactivity. All subsequent commands will be fast.

---

## Quick Start

```bash
# 1. Login
markpre login --email your@email.com --password yourpassword

# 2. Check everything is working
markpre status

# 3. List your presentations
markpre presentation list

# 4. Create a presentation from a markdown file
markpre presentation add -t "My Talk" -m slides.md

# 5. Export to PDF
markpre presentation export <ID> -f pdf -o my-talk.pdf

# 6. Logout when done
markpre logout
```

---

## All Commands

### Authentication

#### `markpre login`
Log in to your MarkPre account. Saves your token locally so you stay logged in.

```bash
markpre login --email your@email.com --password yourpassword

# Or run without flags — it will prompt you
markpre login
```

---

#### `markpre logout`
Log out and delete your saved credentials from your machine.

```bash
markpre logout
```

---

#### `markpre status`
Check if you're logged in and if the server is reachable.

```bash
markpre status
```

Example output:
```
╭─────────────────── MarkPre Status ───────────────────╮
│ ✓ Logged in as: you@email.com                        │
│ ✓ Server online: https://markpre.onrender.com/api    │
╰──────────────────────────────────────────────────────╯
```

---

### Presentations

#### `markpre presentation list`
List all your presentations in a table with ID, title, slide count, word count, and last updated date.

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

#### `markpre presentation add`
Create a new presentation by uploading a markdown file. Slides are separated by `---`.

```bash
markpre presentation add -t "My Talk" -m ./slides.md

# With a theme ID
markpre presentation add -t "My Talk" -m ./slides.md --theme <THEME_ID>

# Or run without flags — it will prompt you
markpre presentation add
```

**Options:**
| Flag | Description |
|------|-------------|
| `-t`, `--title` | Presentation title (required) |
| `-m`, `--markdown` | Path to your `.md` file (required) |
| `--theme` | Theme ID to apply (optional) |

**Example markdown file format (`slides.md`):**
```markdown
# My Presentation Title
A subtitle or tagline

---

## Slide Two
- Point one
- Point two
- Point three

---

## Slide Three
More content here
```

---

#### `markpre presentation delete`
Delete a presentation by its ID. You can get the ID from `markpre presentation list`.

```bash
markpre presentation delete <ID>
```

You will be asked to confirm before deletion:
```
Delete this presentation? [y/N]: y
✅ Deleted
```

---

#### `markpre presentation export`
Export a presentation to PDF or HTML.

```bash
# Export as PDF (default)
markpre presentation export <ID> -f pdf -o my-talk.pdf

# Export as HTML
markpre presentation export <ID> -f html -o my-talk.html

# Without -o flag, saves as presentation.pdf / presentation.html
markpre presentation export <ID>
```

**Options:**
| Flag | Description |
|------|-------------|
| `-f`, `--format` | `pdf` or `html` (default: `pdf`) |
| `-o`, `--output` | Output filename (optional) |

---

## Markdown File Format

MarkPre uses `---` to separate slides. Each slide can use standard markdown:

```markdown
# Title Slide
Subtitle text here

---

## Section Header
- Bullet point one
- Bullet point two
- Bullet point three

---

## Slide with Image
![Alt text](https://example.com/image.png)

---

## Final Slide
Thank you!
```

**Supported formatting:**
- `#` — Title (large heading)
- `##` — Slide heading
- `###` — Subheading
- `- ` — Bullet points
- `![alt](url)` — Images
- Regular paragraph text

---

## Configuration

The CLI stores your login token at:
- **Windows:** `C:\Users\YOUR_NAME\.markpre_config.json`
- **Mac/Linux:** `~/.markpre_config.json`

This file is created automatically on login and deleted on logout. **Never commit this file to git.**

### Using a Custom Backend

If you're self-hosting MarkPre, set the `MARKPRE_API_URL` environment variable:

```bash
# Windows PowerShell
$env:MARKPRE_API_URL = "https://your-backend.onrender.com/api"

# Mac/Linux
export MARKPRE_API_URL=https://your-backend.onrender.com/api

# Or add to your shell profile permanently (~/.zshrc or ~/.bashrc)
echo 'export MARKPRE_API_URL=https://your-backend.onrender.com/api' >> ~/.zshrc
```

---

## Updating

```bash
pip install --upgrade markpre
```

## Uninstalling

```bash
pip uninstall markpre
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Request timed out` | Render server sleeping | Wait 30s and retry, or ping the health endpoint first |
| `Authentication failed` | Token expired or invalid | Run `markpre login` again |
| `Cannot connect to server` | No internet / wrong URL | Check connection or verify `MARKPRE_API_URL` |
| `No module named 'markpre'` | Old version installed | Run `pip install --upgrade markpre` |
| `ModuleNotFoundError` | Corrupt install | Run `pip uninstall markpre -y && pip install markpre` |

---

## Version

```bash
markpre --version
```

---

*Built with [Click](https://click.palletsprojects.com/), [Rich](https://github.com/Textualize/rich), and ❤️*