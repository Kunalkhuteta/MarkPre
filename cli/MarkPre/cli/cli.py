#!/usr/bin/env python3
"""
MarkPre CLI - Markdown Presentation Tool
"""

import os
import sys
import json
import click
import requests
from pathlib import Path
from typing import Optional
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.panel import Panel
from dotenv import load_dotenv

load_dotenv()

CONFIG_PATH = Path.home() / ".markpre_config.json"
API_BASE_URL = os.getenv("MARKPRE_API_URL", "https://markpre.onrender.com/api")

# ─────────────────────────────────────────────
# MARKPRE_EXPORT_DIR — dedicated output folder for all exports
# Set this env variable to always save exports to a specific folder.
# Example:
#   Mac/Linux:  export MARKPRE_EXPORT_DIR=~/Downloads
#   Windows:    $env:MARKPRE_EXPORT_DIR = "C:\Users\YourName\Downloads"
# ─────────────────────────────────────────────
EXPORT_DIR = os.getenv("MARKPRE_EXPORT_DIR", "")

console = Console()


# ─────────────────────────────────────────────
# CONFIG HELPERS
# ─────────────────────────────────────────────

def save_config(data: dict) -> None:
    with open(CONFIG_PATH, "w") as f:
        json.dump(data, f, indent=2)


def load_config() -> dict:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def get_headers() -> dict:
    token = load_config().get("accessToken")
    if not token:
        return {"Content-Type": "application/json"}
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def resolve_output_path(output: Optional[str], fmt: str, title: str = "presentation") -> Path:
    """
    Resolve the final file path for an export.

    Priority:
      1. Explicit -o / --output flag  →  use exactly as given
      2. MARKPRE_EXPORT_DIR env var   →  save <title>.<fmt> inside that folder
      3. Current working directory    →  save <title>.<fmt> in cwd
    """
    safe = "".join(c if c.isalnum() or c in " _-" else "_" for c in title).strip() or "presentation"
    filename = f"{safe}.{fmt}"

    if output:
        return Path(output).expanduser().resolve()

    if EXPORT_DIR:
        folder = Path(EXPORT_DIR).expanduser().resolve()
        folder.mkdir(parents=True, exist_ok=True)
        return folder / filename

    return Path(filename)


def handle_api_error(response: requests.Response, action: str = "perform action") -> None:
    try:
        message = response.json().get("message", str(response.status_code))
    except Exception:
        message = f"HTTP {response.status_code}"

    if response.status_code == 401:
        console.print("\n[red]Authentication failed. Please log in again:[/red]")
        console.print("[cyan]  markpre login --email EMAIL --password PASSWORD[/cyan]\n")
    elif response.status_code == 404:
        console.print(f"[red]Not found: {message}[/red]")
    elif response.status_code >= 500:
        console.print(f"[red]Server error: {message}[/red]")
    else:
        console.print(f"[red]Failed to {action}: {message}[/red]")


def do_login(email: str, password: str) -> Optional[str]:
    console.print("[cyan]Logging in...[/cyan]")
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            json={"email": email, "password": password},
            timeout=60,
        )
        if response.status_code != 200:
            handle_api_error(response, "log in")
            return None

        data = response.json()
        token = (
            data.get("data", {}).get("token")
            or data.get("token")
            or data.get("accessToken")
        )

        if not token:
            console.print("[red]No token received from server[/red]")
            return None

        save_config({"accessToken": token, "email": email})
        console.print(f"[green]Logged in as {email}[/green]")
        return token

    except requests.exceptions.ConnectionError:
        console.print(f"[red]Cannot connect to {API_BASE_URL}[/red]")
        console.print("[yellow]Check your internet or set MARKPRE_API_URL env var[/yellow]")
    except requests.exceptions.Timeout:
        console.print("[red]Request timed out — server may be waking up (Render free tier). Wait 30s and retry.[/red]")
    except Exception as e:
        console.print(f"[red]Login error: {e}[/red]")
    return None


# ─────────────────────────────────────────────
# CLI GROUP
# ─────────────────────────────────────────────

@click.group()
@click.version_option(version="1.0.0", prog_name="markpre")
def cli():
    """
    \b
    MarkPre CLI — Markdown Presentations from your terminal
    ─────────────────────────────────────────────────────
    markpre login --email EMAIL --password PASSWORD
    markpre presentation list
    markpre presentation add -t "My Talk" -m slides.md
    markpre presentation export ID -f pdf -o output.pdf
    """
    pass


# ─────────────────────────────────────────────
# AUTH COMMANDS
# ─────────────────────────────────────────────

@cli.command("login")
@click.option("--email",    required=True, prompt="Email",    help="Your MarkPre email")
@click.option("--password", required=True, prompt=True, hide_input=True, help="Your password")
def login_cmd(email: str, password: str):
    """Log in to your MarkPre account"""
    do_login(email, password)


@cli.command("logout")
def logout():
    """Log out and clear saved credentials"""
    if CONFIG_PATH.exists():
        CONFIG_PATH.unlink()
        console.print("[green]Logged out[/green]")
    else:
        console.print("[yellow]You were not logged in[/yellow]")


@cli.command("status")
def status():
    """Check your login status and server connection"""
    config = load_config()
    lines = []

    if config.get("accessToken"):
        lines.append(f"[green]Logged in as:[/green] [cyan]{config.get('email', 'Unknown')}[/cyan]")
    else:
        lines.append("[red]Not logged in[/red]  ->  run [cyan]markpre login[/cyan]")

    try:
        health_url = API_BASE_URL.rstrip("/api").rstrip("/") + "/health"
        r = requests.get(health_url, timeout=60)
        if r.ok:
            lines.append(f"[green]Server online:[/green] {API_BASE_URL}")
        else:
            lines.append(f"[yellow]Server returned HTTP {r.status_code}[/yellow]")
    except Exception:
        lines.append(f"[red]Cannot reach server:[/red] {API_BASE_URL}")

    if EXPORT_DIR:
        lines.append(f"[dim]Export directory: {Path(EXPORT_DIR).resolve()}[/dim]")
    else:
        lines.append(f"[dim]Export directory: current working directory (set MARKPRE_EXPORT_DIR to change)[/dim]")

    console.print(Panel("\n".join(lines), title="[bold]MarkPre Status[/bold]", border_style="cyan"))


# ─────────────────────────────────────────────
# PRESENTATION COMMANDS
# ─────────────────────────────────────────────

@cli.group()
def presentation():
    """Manage your presentations"""
    pass


@presentation.command("list")
def list_presentations():
    """List all your presentations"""
    if not load_config().get("accessToken"):
        console.print("[yellow]Not logged in. Run: markpre login[/yellow]")
        return

    try:
        with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console) as p:
            p.add_task("Fetching presentations...", total=None)
            response = requests.get(
                f"{API_BASE_URL}/presentations/get-all-presentations-for-user",
                headers=get_headers(), timeout=60,
            )

        if response.status_code != 200:
            handle_api_error(response, "fetch presentations")
            return

        presentations = response.json().get("data", [])

        if not presentations:
            console.print("\n[yellow]No presentations yet.[/yellow]")
            console.print("[dim]Create one: markpre presentation add -t 'Title' -m slides.md[/dim]\n")
            return

        table = Table(
            title=f"\nYour Presentations ({len(presentations)})",
            header_style="bold blue", show_lines=True,
        )
        table.add_column("ID",     style="dim",  width=12)
        table.add_column("Title",  style="cyan", max_width=36)
        table.add_column("Slides", justify="center", width=7)
        table.add_column("Words",  justify="center", width=7)
        table.add_column("Updated", style="dim", width=17)

        from datetime import datetime
        for p in presentations:
            updated = datetime.fromisoformat(p["updatedAt"].replace("Z", "+00:00"))
            table.add_row(
                p["_id"][:10] + "…",
                p["title"][:36],
                str(p.get("slideCount", "-")),
                str(p.get("wordCount",  "-")),
                updated.strftime("%Y-%m-%d %H:%M"),
            )

        console.print(table)
        console.print()

    except requests.exceptions.ConnectionError:
        console.print(f"[red]Cannot connect to {API_BASE_URL}[/red]")
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


@presentation.command("add")
@click.option("-t", "--title",    required=True, prompt="Title", help="Presentation title")
@click.option("-m", "--markdown", "markdown_path", required=True,
              type=click.Path(exists=True), prompt="Markdown file path", help="Path to .md file")
@click.option("--theme", default=None, help="Theme ID to apply (optional)")
def add_presentation(title: str, markdown_path: str, theme: Optional[str]):
    """Create a new presentation from a markdown file"""
    if not load_config().get("accessToken"):
        console.print("[yellow]Not logged in. Run: markpre login[/yellow]")
        return

    try:
        content = Path(markdown_path).read_text(encoding="utf-8")
    except Exception as e:
        console.print(f"[red]Cannot read file: {e}[/red]")
        return

    if not content.strip():
        console.print("[red]Markdown file is empty[/red]")
        return

    payload: dict = {"title": title, "content": content}
    if theme:
        payload["theme"] = theme

    try:
        with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console) as p:
            p.add_task("Creating presentation...", total=None)
            response = requests.post(
                f"{API_BASE_URL}/presentations/create-new-presentation",
                json=payload, headers=get_headers(), timeout=60,
            )

        if response.status_code in [200, 201]:
            data = response.json().get("data", {})
            console.print(f"\n[green]Created successfully![/green]")
            console.print(f"  [cyan]ID:[/cyan]     {data.get('_id')}")
            console.print(f"  [cyan]Title:[/cyan]  {data.get('title')}")
            console.print(f"  [cyan]Slides:[/cyan] {data.get('slideCount', 'N/A')}\n")
        else:
            handle_api_error(response, "create presentation")

    except requests.exceptions.ConnectionError:
        console.print(f"[red]Cannot connect to {API_BASE_URL}[/red]")
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


@presentation.command("delete")
@click.argument("presentation_id")
@click.confirmation_option(prompt="Delete this presentation?")
def delete_presentation(presentation_id: str):
    """Delete a presentation by ID"""
    if not load_config().get("accessToken"):
        console.print("[yellow]Not logged in. Run: markpre login[/yellow]")
        return

    try:
        response = requests.delete(
            f"{API_BASE_URL}/presentations/delete-presentation/{presentation_id}",
            headers=get_headers(), timeout=60,
        )
        if response.status_code == 200:
            console.print("[green]Deleted[/green]")
        else:
            handle_api_error(response, "delete presentation")
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


@presentation.command("export")
@click.argument("presentation_id")
@click.option(
    "-f", "--format", "fmt",
    type=click.Choice(["pdf", "html"], case_sensitive=False),
    default="pdf", show_default=True,
    help="Export format: pdf or html",
)
@click.option(
    "-o", "--output", default=None,
    help=(
        "Output file path. If omitted, falls back to MARKPRE_EXPORT_DIR env var "
        "(if set) or the current working directory."
    ),
)
def export_presentation(presentation_id: str, fmt: str, output: Optional[str]):
    """
    Export a presentation to PDF or HTML.

    \b
    Examples:
      markpre presentation export ID -f pdf -o ./report.pdf
      markpre presentation export ID -f html -o ./slides.html
      markpre presentation export ID -f pdf                    # uses MARKPRE_EXPORT_DIR or cwd

    \b
    Set a default output folder (saves typing -o every time):
      Mac/Linux:  export MARKPRE_EXPORT_DIR=~/Downloads
      Windows PS: $env:MARKPRE_EXPORT_DIR = "$env:USERPROFILE\\Downloads"
    """
    if not load_config().get("accessToken"):
        console.print("[yellow]Not logged in. Run: markpre login[/yellow]")
        return

    # Fetch presentation title for a meaningful filename
    title = "presentation"
    try:
        r = requests.get(
            f"{API_BASE_URL}/presentations/get-all-presentations-for-user",
            headers=get_headers(), timeout=60,
        )
        if r.status_code == 200:
            matched = next((p for p in r.json().get("data", []) if p["_id"] == presentation_id), None)
            if matched:
                title = matched.get("title", "presentation")
    except Exception:
        pass  # non-fatal — we'll just use the default filename

    out_path = resolve_output_path(output, fmt, title)

    # Show where the file will land before we start
    console.print(f"[dim]Saving to: {out_path.resolve()}[/dim]")

    try:
        with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console) as prog:
            prog.add_task(f"Exporting as {fmt.upper()} (Puppeteer may take 10–30s)...", total=None)
            response = requests.get(
                f"{API_BASE_URL}/presentations/export/{presentation_id}?format={fmt}",
                headers=get_headers(),
                timeout=120,   # PDF generation via Puppeteer can take a while
                stream=True,
            )

        if response.status_code != 200:
            # Try to parse error JSON from the response body
            try:
                err_msg = response.json().get("message", f"HTTP {response.status_code}")
            except Exception:
                err_msg = f"HTTP {response.status_code}"
            console.print(f"[red]Export failed: {err_msg}[/red]")
            return

        # Ensure parent directories exist
        out_path.parent.mkdir(parents=True, exist_ok=True)

        # Stream response content to disk
        with open(out_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        size = out_path.stat().st_size
        if size == 0:
            console.print("[red]Export failed — received empty file. Try again.[/red]")
            out_path.unlink(missing_ok=True)
            return

        console.print(f"\n[green]Saved:[/green] {out_path.resolve()}")
        console.print(f"[dim]Size: {size / 1024:.1f} KB[/dim]\n")

    except requests.exceptions.Timeout:
        console.print(
            "[red]Request timed out.[/red] PDF generation can take 30–60s on the free tier. "
            "Try again in a moment."
        )
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────

def main():
    try:
        cli()
    except KeyboardInterrupt:
        console.print("\n[yellow]Cancelled[/yellow]")
        sys.exit(0)
    except Exception as e:
        console.print(f"\n[red]Unexpected error: {e}[/red]")
        sys.exit(1)


if __name__ == "__main__":
    main()