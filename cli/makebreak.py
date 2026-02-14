#!/usr/bin/env python3
"""
MakeBreak CLI - Markdown Presentation Tool
Upload and manage presentations from your terminal
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
from rich import print as rprint
from dotenv import load_dotenv

load_dotenv()

# Configuration
CONFIG_PATH = Path.home() / ".makebreak_config.json"
API_BASE_URL = os.getenv("NEXT_PUBLIC_API_BASE_URL")

# Rich console for colored output
console = Console()


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def save_config(data: dict) -> None:
    """Save configuration to file"""
    try:
        with open(CONFIG_PATH, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        console.print(f"[red]Error saving config: {e}[/red]")


def load_config() -> dict:
    """Load configuration from file"""
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r") as f:
                return json.load(f)
        except Exception as e:
            console.print(f"[yellow]Warning: Could not load config: {e}[/yellow]")
    return {}


def get_headers() -> dict:
    """Get authorization headers"""
    config = load_config()
    token = config.get("accessToken")
    
    if not token:
        return {"Content-Type": "application/json"}
    
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def handle_api_error(response: requests.Response, action: str = "perform action") -> None:
    """Handle API errors with user-friendly messages"""
    try:
        error_data = response.json()
        message = error_data.get("message", str(error_data))
    except:
        message = response.text or f"HTTP {response.status_code}"
    
    if response.status_code == 401:
        console.print(f"\n[red]❌ Authentication failed[/red]")
        console.print("[yellow]Please log in again using:[/yellow]")
        console.print("[cyan]makebreak login --email YOUR_EMAIL --password YOUR_PASSWORD[/cyan]\n")
    elif response.status_code == 404:
        console.print(f"[red]❌ Not found: {message}[/red]")
    elif response.status_code >= 500:
        console.print(f"[red]❌ Server error: {message}[/red]")
    else:
        console.print(f"[red]❌ Failed to {action}: {message}[/red]")


def login(email: str, password: str) -> Optional[str]:
    """Authenticate user and return access token"""
    console.print("[cyan]🔐 Logging in...[/cyan]")
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            json={"email": email, "password": password},
            timeout=10
        )
        
        if response.status_code != 200:
            handle_api_error(response, "log in")
            return None
        
        data = response.json()
        
        # Extract token from various possible response structures
        token = (
            data.get("data", {}).get("token")
            or data.get("token")
            or data.get("accessToken")
        )
        
        if not token:
            console.print("[red]❌ No token received from server[/red]")
            console.print(f"[dim]Response: {data}[/dim]")
            return None
        
        # Save token
        save_config({"accessToken": token, "email": email})
        console.print("[green]✅ Login successful![/green]")
        
        return token
    
    except requests.exceptions.ConnectionError:
        console.print(f"[red]❌ Could not connect to server at {API_BASE_URL}[/red]")
        console.print("[yellow]Is the backend server running?[/yellow]")
        return None
    except requests.exceptions.Timeout:
        console.print("[red]❌ Request timed out[/red]")
        return None
    except Exception as e:
        console.print(f"[red]❌ Login error: {e}[/red]")
        return None


# ============================================================================
# CLI COMMANDS
# ============================================================================

@click.group()
@click.option("--email", help="Your email address")
@click.option("--password", help="Your password")
@click.pass_context
def cli(ctx, email: Optional[str], password: Optional[str]):
    """
    MakeBreak CLI - Manage presentations from your terminal
    
    \b
    Examples:
      makebreak login --email user@example.com --password pass123
      makebreak presentation list
      makebreak presentation add -t "My Talk" -m ./slides.md
    """
    ctx.ensure_object(dict)
    
    # Auto-login if credentials provided
    if email and password:
        token = login(email, password)
        if not token:
            sys.exit(1)
        ctx.obj["token"] = token
    else:
        # Try to load existing token
        config = load_config()
        token = config.get("accessToken")
        
        if token:
            ctx.obj["token"] = token
        else:
            # Don't require auth for help commands
            if ctx.invoked_subcommand not in ["login", None]:
                console.print("\n[yellow]⚠️  You need to log in first[/yellow]")
                console.print("[cyan]Run: makebreak login --email YOUR_EMAIL --password YOUR_PASSWORD[/cyan]\n")
                sys.exit(1)


@cli.command()
@click.option("--email", required=True, help="Your email address")
@click.option("--password", required=True, help="Your password")
def login_cmd(email: str, password: str):
    """Log in to your MakeBreak account"""
    login(email, password)


@cli.command()
def logout():
    """Log out and clear saved credentials"""
    if CONFIG_PATH.exists():
        CONFIG_PATH.unlink()
        console.print("[green]✅ Logged out successfully[/green]")
    else:
        console.print("[yellow]You were not logged in[/yellow]")


@cli.command()
def status():
    """Check login status and server connection"""
    config = load_config()
    
    panel_content = []
    
    # Check login status
    if config.get("accessToken"):
        panel_content.append(f"[green]✓[/green] Logged in as: {config.get('email', 'Unknown')}")
    else:
        panel_content.append("[red]✗[/red] Not logged in")
    
    # Check server connection
    try:
        response = requests.get(f"{API_BASE_URL.replace('/api', '')}/health", timeout=5)
        if response.ok:
            panel_content.append(f"[green]✓[/green] Server online: {API_BASE_URL}")
        else:
            panel_content.append(f"[yellow]⚠[/yellow] Server responded with: {response.status_code}")
    except:
        panel_content.append(f"[red]✗[/red] Cannot reach server: {API_BASE_URL}")
    
    console.print(Panel("\n".join(panel_content), title="MakeBreak Status", border_style="cyan"))


# ============================================================================
# PRESENTATION COMMANDS
# ============================================================================

@cli.group()
def presentation():
    """Manage presentations"""
    pass


@presentation.command("list")
@click.pass_context
def list_presentations(ctx):
    """List all your presentations"""
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            progress.add_task(description="Fetching presentations...", total=None)
            
            response = requests.get(
                f"{API_BASE_URL}/presentations/get-all-presentations-for-user",
                headers=get_headers(),
                timeout=10
            )
        
        if response.status_code != 200:
            handle_api_error(response, "fetch presentations")
            return
        
        data = response.json()
        presentations = data.get("data", [])
        
        if not presentations:
            console.print("\n[yellow]No presentations found[/yellow]")
            console.print("[dim]Create one with: makebreak presentation add -t 'Title' -m slides.md[/dim]\n")
            return
        
        # Create table
        table = Table(title=f"\n📊 Your Presentations ({len(presentations)})", show_header=True, header_style="bold magenta")
        table.add_column("ID", style="dim")
        table.add_column("Title", style="cyan")
        table.add_column("Slides", justify="right")
        table.add_column("Words", justify="right")
        table.add_column("Updated", style="dim")
        
        for p in presentations:
            from datetime import datetime
            updated = datetime.fromisoformat(p["updatedAt"].replace("Z", "+00:00"))
            table.add_row(
                p["_id"][:8] + "...",
                p["title"][:40],
                str(p.get("slideCount", "N/A")),
                str(p.get("wordCount", "N/A")),
                updated.strftime("%Y-%m-%d %H:%M")
            )
        
        console.print(table)
        console.print()
    
    except requests.exceptions.ConnectionError:
        console.print(f"[red]❌ Could not connect to server at {API_BASE_URL}[/red]")
    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")


@presentation.command("add")
@click.option("-t", "--title", required=True, help="Presentation title")
@click.option("-m", "--markdown", "markdown_path", required=True, type=click.Path(exists=True), help="Path to markdown file")
@click.option("--theme", help="Theme ID (optional)")
@click.pass_context
def add_presentation(ctx, title: str, markdown_path: str, theme: Optional[str]):
    """Create a new presentation from a markdown file"""
    
    # Read markdown file
    try:
        with open(markdown_path, "r", encoding="utf-8") as f:
            markdown_content = f.read()
    except Exception as e:
        console.print(f"[red]❌ Could not read file {markdown_path}: {e}[/red]")
        return
    
    if not markdown_content.strip():
        console.print("[red]❌ Markdown file is empty[/red]")
        return
    
    # Create presentation
    payload = {
        "title": title,
        "content": markdown_content,
    }
    
    if theme:
        payload["theme"] = theme
    
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            progress.add_task(description="Creating presentation...", total=None)
            
            response = requests.post(
                f"{API_BASE_URL}/presentations/create-new-presentation",
                json=payload,
                headers=get_headers(),
                timeout=15
            )
        
        if response.status_code in [200, 201]:
            data = response.json()
            presentation = data.get("data", {})
            
            console.print(f"\n[green]✅ Presentation created successfully![/green]")
            console.print(f"[cyan]ID:[/cyan] {presentation.get('_id')}")
            console.print(f"[cyan]Title:[/cyan] {presentation.get('title')}")
            console.print(f"[cyan]Slides:[/cyan] {presentation.get('slideCount', 'N/A')}")
            console.print(f"[cyan]Words:[/cyan] {presentation.get('wordCount', 'N/A')}\n")
        else:
            handle_api_error(response, "create presentation")
    
    except requests.exceptions.ConnectionError:
        console.print(f"[red]❌ Could not connect to server at {API_BASE_URL}[/red]")
    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")


@presentation.command("delete")
@click.argument("presentation_id")
@click.confirmation_option(prompt="Are you sure you want to delete this presentation?")
@click.pass_context
def delete_presentation(ctx, presentation_id: str):
    """Delete a presentation"""
    try:
        response = requests.delete(
            f"{API_BASE_URL}/presentations/delete-presentation/{presentation_id}",
            headers=get_headers(),
            timeout=10
        )
        
        if response.status_code == 200:
            console.print("[green]✅ Presentation deleted successfully[/green]")
        else:
            handle_api_error(response, "delete presentation")
    
    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")


@presentation.command("export")
@click.argument("presentation_id")
@click.option("-f", "--format", type=click.Choice(["pdf", "html"]), default="pdf", help="Export format")
@click.option("-o", "--output", help="Output file path")
@click.pass_context
def export_presentation(ctx, presentation_id: str, format: str, output: Optional[str]):
    """Export a presentation to PDF or HTML"""
    
    if not output:
        output = f"presentation.{format}"
    
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            progress.add_task(description=f"Exporting as {format.upper()}...", total=None)
            
            response = requests.get(
                f"{API_BASE_URL}/presentations/export/{presentation_id}?format={format}",
                headers=get_headers(),
                timeout=30
            )
        
        if response.status_code == 200:
            with open(output, "wb") as f:
                f.write(response.content)
            
            console.print(f"[green]✅ Exported successfully to: {output}[/green]")
        else:
            handle_api_error(response, f"export as {format}")
    
    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    try:
        cli(obj={})
    except KeyboardInterrupt:
        console.print("\n[yellow]Cancelled by user[/yellow]")
        sys.exit(0)
    except Exception as e:
        console.print(f"\n[red]❌ Unexpected error: {e}[/red]")
        sys.exit(1)