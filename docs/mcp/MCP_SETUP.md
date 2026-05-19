# ClearRing MCP Server Setup

MCP (Model Context Protocol) servers extend Claude Code's capabilities for this project.
Install/configure the useful ones before starting a development session.

---

## Available MCP Servers for ClearRing

### 1. filesystem MCP
**Purpose**: Read/write project files safely.  
**Use for**: Creating code files, editing project structure, managing docs, inspecting generated output.

```bash
npx @modelcontextprotocol/server-filesystem --directory "C:\Users\Nikhil PC\ClearRing"
```

Or add to Claude Code settings:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\Users\\Nikhil PC\\ClearRing"]
    }
  }
}
```

---

### 2. git MCP
**Purpose**: Version control operations.  
**Use for**: Checking diffs, creating commits, reviewing modified files, managing branches.

```bash
npx @modelcontextprotocol/server-git --repository "C:\Users\Nikhil PC\ClearRing"
```

Settings:
```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "C:\\Users\\Nikhil PC\\ClearRing"]
    }
  }
}
```

---

### 3. Playwright MCP (Browser Automation)
**Purpose**: Browser automation and UI testing.  
**Use for**: Testing website, testing admin dashboard, screenshot review, form flow testing, responsive checks.

```bash
npx @playwright/mcp@latest
```

Settings:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

---

### 4. PostgreSQL MCP
**Purpose**: Inspect and query database.  
**Use for**: Confirming migrations, checking seed data, debugging lookup flows, verifying spam score updates.

```bash
npx @modelcontextprotocol/server-postgres postgresql://clearring:clearring_dev@localhost:5432/clearring_db
```

Settings:
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://clearring:clearring_dev@localhost:5432/clearring_db"
      ]
    }
  }
}
```

> **Note**: Requires Docker containers running first: `pnpm docker:up`

---

### 5. Memory MCP
**Purpose**: Maintain project decisions across sessions.  
**Use for**: Architecture decisions, product requirements, naming conventions, theme system decisions, known limitations.

Already configured via Claude Code's built-in memory system.  
For explicit MCP memory server:

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

---

### 6. Sequential Thinking MCP
**Purpose**: Structured planning and debugging.  
**Use for**: Breaking large tasks into phases, root cause analysis, architecture tradeoff decisions.

Already available via Claude Code's built-in sequential thinking.

---

### 7. fetch / web search MCP
**Purpose**: Market and technical research.  
**Use for**: Caller ID app research, Android CallScreeningService documentation, iOS CallKit limitations.

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

---

## Quick Setup (Recommended Minimum)

For active development, the most useful MCPs are:
1. **filesystem** — file access
2. **playwright** — browser testing
3. **postgres** — database inspection

```bash
# Install them globally for convenience
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-postgres
npx @playwright/mcp@latest --install
```

---

## Claude Code Settings Location

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Project-level**: `C:\Users\Nikhil PC\ClearRing\.claude\settings.json`

---

## MCP Server Status

| Server | Status | Notes |
|--------|--------|-------|
| filesystem | Available | Use Read/Write/Edit tools |
| playwright | Available | Use browser tools |
| git | Manual | Use Bash tool for git commands |
| postgres | Requires Docker | Run `pnpm docker:up` first |
| memory | Available | Claude built-in memory system |
| sequential-thinking | Available | Claude built-in |
| fetch/search | Available | Use WebFetch/WebSearch |

---

## Fallback When MCP Is Unavailable

If a specific MCP server is not available:

| MCP | Fallback |
|-----|---------|
| filesystem | Use Read/Write/Edit tools directly |
| git | Use Bash tool: `git status`, `git diff` |
| postgres | Use Bash: `docker exec clearring_postgres psql -U clearring clearring_db` |
| playwright | Use Bash: `npx playwright test` |
| fetch | Use WebFetch/WebSearch tools |

---

*Updated: 2026-05-06*
