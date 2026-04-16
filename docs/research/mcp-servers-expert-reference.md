# MCP Servers for Claude Code: Expert Reference

> Research compiled April 2026. For developers who use Claude Code daily and want to master MCP integration.

---

## 1. Mental Model

### What MCP Actually Is

MCP (Model Context Protocol) is a JSON-RPC 2.0 based protocol that standardizes how AI assistants connect to external tools and data sources. It is **not** an API -- it is a bidirectional protocol with capability negotiation, session state, and structured primitives.

**Wire format**: All messages are JSON-RPC 2.0. The transport layer converts MCP protocol messages to JSON-RPC for transmission and back again on receipt.

**Transport layers**:

| Transport | Use Case | Status |
|-----------|----------|--------|
| **stdio** | Local processes, CLI tools. Server reads JSON-RPC from stdin, writes to stdout. Messages delimited by newlines (no embedded newlines allowed). | Active, recommended for local |
| **Streamable HTTP** | Remote servers, cloud services. Single HTTP endpoint handling bidirectional messaging via POST/GET. Can optionally use SSE for streaming multiple server messages. | Active, recommended for remote |
| **SSE (Server-Sent Events)** | Legacy remote transport. | **Deprecated** as of 2025-06-18 spec. Still supported by many tools but avoid for new work. |

**Critical stdio constraint**: MCP servers using stdio transport must **only** write JSON-RPC messages to stdout. All logging, debug output, and error messages must go to stderr. Writing anything else to stdout corrupts the protocol stream and causes "Unexpected token" parsing errors.

### How Claude Code Discovers and Connects to MCP Servers

Claude Code discovers servers from multiple configuration sources, loaded in priority order:

1. **Local scope** (default) -- stored in `~/.claude.json` per-project path. Private to you, loads only in the project where added.
2. **Project scope** -- stored in `.mcp.json` at project root. Checked into version control, shared with team.
3. **User scope** -- stored in `~/.claude.json` globally. Available across all your projects.
4. **Plugin-provided servers** -- defined in plugin's `.mcp.json` or inline in `plugin.json`.
5. **Claude.ai connectors** -- servers configured at claude.ai/settings/connectors, automatically available.

When the same server appears in multiple scopes, Claude Code connects once using the highest-precedence definition. Scopes 1-3 match by name; plugins and connectors match by endpoint URL/command.

### The MCP Server Lifecycle

```
Session Start
  |
  v
[Load server configs from all scopes]
  |
  v
[Start each server as subprocess (stdio) or connect (HTTP)]
  |
  v
[Initialize handshake - 3 steps]:
  1. Client sends `initialize` request (protocol version + capabilities)
  2. Server responds with its capabilities (which primitives it supports)
  3. Client sends `initialized` notification (connection confirmed)
  |
  v
[Client calls tools/list -> server returns tool schemas]
  |
  v
[Session active: tool calls, resource reads, prompt execution]
  |
  v
[Session end: disconnect/shutdown]
```

**Lazy loading with Tool Search** (enabled by default): Only tool *names* load at session start. Full tool schemas are deferred and discovered on-demand when Claude needs them. This means adding more MCP servers has minimal impact on the context window. Claude uses a search tool internally to find relevant MCP tools when a task requires them.

**Dynamic updates**: Claude Code supports `list_changed` notifications. When an MCP server sends this notification, Claude Code automatically refreshes available capabilities without reconnecting.

**Startup timeout**: Configurable via `MCP_TIMEOUT` environment variable (e.g., `MCP_TIMEOUT=10000 claude` for 10 seconds).

### How MCP Tools Appear to Claude

MCP tools follow the naming convention: `mcp__<server-name>__<tool-name>`

Examples:
- `mcp__github__search_repositories`
- `mcp__filesystem__read_file`
- `mcp__datadog__get_logs`

Each tool has three components:
- **Name**: unique identifier (used in the `mcp__` namespaced format)
- **Description**: high-level explanation of what the tool does, its functionality and use cases
- **inputSchema**: JSON Schema defining parameters with types, required fields, and per-parameter descriptions

Claude Code truncates tool descriptions and server instructions at **2KB each**. Keep them concise and put critical details near the start.

**Tool selection**: Claude uses tool names and descriptions to decide which tool to call. Well-written descriptions drive correct tool selection; vague descriptions lead to misuse or non-use.

**Output limits**: Warning at 10,000 tokens. Default max is 25,000 tokens (configurable via `MAX_MCP_OUTPUT_TOKENS`). Server authors can set per-tool limits via `_meta["anthropic/maxResultSizeChars"]` up to 500,000 characters.

```json
{
  "name": "get_schema",
  "description": "Returns the full database schema",
  "_meta": {
    "anthropic/maxResultSizeChars": 200000
  }
}
```

### MCP's Three Primitives

| Primitive | Controller | Purpose | Claude Code Support |
|-----------|-----------|---------|-------------------|
| **Tools** | Model-controlled | Executable functions that perform actions. The LLM decides when to invoke them. | Full support. Appear as `mcp__server__tool`. |
| **Resources** | Application-controlled | Read-only data sources providing context. The host app decides when to include them. | Supported via `@` mentions: `@server:protocol://path` |
| **Prompts** | User-controlled | Reusable templates for interactions. The human explicitly triggers them. | Available as `/mcp__servername__promptname` commands |

**Resources** in Claude Code: Type `@` in your prompt to see available resources from connected MCP servers. Reference format: `@server:protocol://resource/path`. Multiple resources can be referenced in a single prompt.

**Prompts** in Claude Code: Type `/` to discover MCP prompts. Arguments are passed space-separated after the command: `/mcp__github__pr_review 456`.

### Security Model

**What MCP servers CAN access** (by default, with no sandboxing):
- Full file system (all user-accessible files)
- Environment variables (including credentials and API keys)
- Network (outbound connections)
- All resources accessible to the user running the process

**What MCP servers CANNOT do**:
- Bypass Claude Code's permission system (deny rules always win)
- Execute without user approval on first use (project-scoped servers require trust approval)
- Override managed policy restrictions

**Key security risks**:
- **No default sandboxing**: MCP servers run as local processes with full user permissions
- **Confused deputy problem**: Server might execute actions with its own elevated permissions on behalf of user requests
- **Over-provisioned permissions**: Developers often grant broader access than needed
- **Environment variable exposure**: Servers can read all env vars, which may contain secrets
- **Network exposure**: Some servers bind to 0.0.0.0, making them accessible to any device on the local network

**Enterprise controls**: Claude Code supports `managed-mcp.json` for exclusive control and `allowedMcpServers`/`deniedMcpServers` for policy-based restrictions (by server name, command, or URL pattern).

---

## 2. Playbook: Production MCP Patterns

### Building Custom MCP Servers: TypeScript SDK

**Prerequisites**: Node.js 18+, TypeScript with `moduleResolution: NodeNext` in tsconfig.json.

```typescript
// server.ts
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import type { CallToolResult } from "@modelcontextprotocol/server";

const server = new McpServer(
  { name: "my-server", version: "1.0.0" },
  {
    instructions: "Server for querying application metrics. Use when asked about performance data, error rates, or user analytics."
  }
);

// Register a tool with Zod schema validation
server.registerTool(
  "get-error-rate",
  {
    title: "Error Rate",
    description: "Get the error rate for a service over a time range",
    inputSchema: z.object({
      service: z.string().describe("Service name, e.g. 'api-gateway'"),
      hours: z.number().default(24).describe("Lookback window in hours")
    }),
    outputSchema: z.object({
      rate: z.number(),
      total_requests: z.number(),
      error_count: z.number()
    })
  },
  async ({ service, hours }): Promise<CallToolResult> => {
    // Your implementation here
    const data = await queryMetrics(service, hours);
    const output = {
      rate: data.errors / data.total,
      total_requests: data.total,
      error_count: data.errors
    };
    return {
      content: [{ type: "text", text: JSON.stringify(output) }],
      structuredContent: output
    };
  }
);

// Register a resource
server.registerResource(
  "service-list",
  "services://all",
  {
    title: "Available Services",
    description: "List of all monitored services",
    mimeType: "application/json"
  },
  async (uri) => ({
    contents: [{ uri: uri.href, text: JSON.stringify(await getServiceList()) }]
  })
);

// Register a prompt
server.registerPrompt(
  "incident-report",
  {
    title: "Incident Report",
    description: "Generate an incident report template for a service",
    argsSchema: z.object({
      service: z.string(),
      severity: z.enum(["p0", "p1", "p2", "p3"])
    })
  },
  ({ service, severity }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Generate an incident report for ${service} (${severity}). Include timeline, impact, root cause, and action items.`
        }
      }
    ]
  })
);

// Connect with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

**For Streamable HTTP transport** (remote deployment):

```typescript
import { randomUUID } from "node:crypto";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";

const transport = new NodeStreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID()
});
await server.connect(transport);
```

**Error handling pattern** -- use `isError: true` to communicate failures to the model:

```typescript
async ({ url }): Promise<CallToolResult> => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `HTTP ${res.status}: ${res.statusText}` }],
        isError: true
      };
    }
    return { content: [{ type: "text", text: await res.text() }] };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Failed: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}
```

### Building Custom MCP Servers: Python SDK (FastMCP)

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-analytics-server", json_response=True)

@mcp.tool()
def get_error_rate(service: str, hours: int = 24) -> dict:
    """Get the error rate for a service over a time range.
    
    Args:
        service: Service name, e.g. 'api-gateway'
        hours: Lookback window in hours (default 24)
    """
    data = query_metrics(service, hours)
    return {
        "rate": data["errors"] / data["total"],
        "total_requests": data["total"],
        "error_count": data["errors"]
    }

@mcp.resource("services://all")
def list_services() -> str:
    """List all monitored services."""
    return json.dumps(get_service_list())

@mcp.prompt()
def incident_report(service: str, severity: str) -> str:
    """Generate an incident report template."""
    return f"Generate an incident report for {service} ({severity})."

if __name__ == "__main__":
    mcp.run(transport="stdio")  # or "streamable-http" for remote
```

### Database Query Servers

**DBHub (Bytebase)** -- universal database bridge supporting PostgreSQL, MySQL, MariaDB, SQL Server, SQLite:

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

In read-only mode, only SELECT, SHOW, DESCRIBE, and similar read operations are permitted.

**Postgres MCP Pro** -- production-grade with configurable access control:

```bash
claude mcp add --transport stdio postgres-pro -- npx -y @crystaldba/postgres-mcp \
  --connection-string "postgresql://readonly:pass@prod.db.com:5432/analytics" \
  --read-only
```

Features: safe SQL parsing, execution time limits, connection pooling.

### API Integration Servers

**GraphQL -- auto-convert .graphql files to MCP tools**:

```bash
claude mcp add --transport stdio graphql -- npx -y graphql-mcp-server \
  --endpoint https://api.example.com/graphql \
  --queries ./queries/
```

**REST API wrapper** (YAML-configured):

```yaml
# api-config.yaml
apis:
  - name: get_users
    method: GET
    url: https://api.example.com/users
    description: "Fetch user list with optional filters"
    params:
      - name: status
        type: string
        required: false
  - name: create_ticket
    method: POST
    url: https://api.example.com/tickets
    description: "Create a support ticket"
    body:
      - name: title
        type: string
        required: true
      - name: priority
        type: string
        required: true
```

**Apollo MCP Server** for GraphQL APIs:

```bash
claude mcp add --transport http apollo https://mcp.apollographql.com
```

### Monitoring and Observability Servers

**Datadog MCP Server** (remote, official):

```bash
claude mcp add --transport http datadog https://mcp.datadoghq.com
```

Supports toolsets: core, alerting, APM, cases, LLM observability, product analytics, networks, security, software delivery, synthetics, and workflows. Provides live logs, metrics, and traces directly to Claude Code.

**Grafana MCP Server** (local):

```bash
claude mcp add --transport stdio grafana -- npx -y @grafana/mcp-grafana
```

Provides access to distributed tracing data, dashboard management, user management, and natural language prompts for exploring services.

### CI/CD Integration Servers

**GitHub MCP Server** (official):

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

Capabilities: read repositories, manage issues/PRs, monitor Actions workflow runs, analyze build failures, manage releases.

**Jenkins MCP Server**:

```bash
claude mcp add --transport stdio jenkins -- npx -y mcp-jenkins \
  --url https://jenkins.example.com \
  --user admin \
  --token $JENKINS_TOKEN
```

Provides 37 tools for job monitoring, build control, queue management, and pipeline configuration.

**Jenkins Native Plugin**: Acts as an MCP server directly from Jenkins, providing context and tools to MCP clients.

### Configuration Deep Dive

**`.mcp.json`** (project scope, version-controlled):

```json
{
  "mcpServers": {
    "db": {
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--dsn", "${DATABASE_URL}"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL:-postgresql://localhost:5432/dev}"
      }
    },
    "api": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    },
    "internal-api": {
      "type": "http",
      "url": "https://mcp.internal.example.com",
      "headersHelper": "/opt/bin/get-mcp-auth-headers.sh"
    }
  }
}
```

**Environment variable expansion** supports:
- `${VAR}` -- expands to value of VAR
- `${VAR:-default}` -- expands to VAR if set, otherwise uses default
- Expansion works in: `command`, `args`, `env`, `url`, `headers`

**Dynamic headers with `headersHelper`**: Runs a shell command that outputs a JSON object of headers to stdout. Runs fresh on each connection (no caching). 10-second timeout. Receives `CLAUDE_CODE_MCP_SERVER_NAME` and `CLAUDE_CODE_MCP_SERVER_URL` as environment variables.

**Windows quirk**: On native Windows (not WSL), local MCP servers using `npx` require the `cmd /c` wrapper:

```bash
claude mcp add --transport stdio my-server -- cmd /c npx -y @some/package
```

**OAuth authentication**:

```bash
# Dynamic client registration
claude mcp add --transport http my-server https://mcp.example.com/mcp

# Pre-configured credentials with fixed callback port
claude mcp add --transport http \
  --client-id your-client-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp

# CI/env var for non-interactive setup
MCP_CLIENT_SECRET=your-secret claude mcp add --transport http \
  --client-id your-client-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

---

## 3. Compositions

### MCP + Hooks

MCP tools appear as regular tools in hook events using the `mcp__<server>__<tool>` naming pattern. All PreToolUse, PermissionRequest, and PostToolUse logic applies equally to MCP and built-in tools.

**Validate all GitHub MCP calls**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__github__.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"GitHub tool called: $(jq -r '.tool_name')\" >&2"
          }
        ]
      }
    ]
  }
}
```

**Block dangerous database operations**:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__db__.*",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/validate-db-query.sh"
          }
        ]
      }
    ]
  }
}
```

Where `validate-db-query.sh` might be:

```bash
#!/bin/bash
INPUT=$(cat)
QUERY=$(echo "$INPUT" | jq -r '.tool_input.query // empty')

# Block destructive operations
if echo "$QUERY" | grep -iqE "(DROP|DELETE|TRUNCATE|ALTER|UPDATE|INSERT)"; then
  echo "Blocked: destructive SQL operation not allowed" >&2
  exit 2
fi

exit 0
```

**Audit all MCP tool usage to a log**:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "mcp__.*",
        "hooks": [
          {
            "type": "command",
            "command": "jq -c '{timestamp: now | todate, tool: .tool_name, input: .tool_input}' >> ~/.claude/mcp-audit.log"
          }
        ]
      }
    ]
  }
}
```

**Use the `if` field for granular filtering** (v2.1.85+):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(git push *)",
            "command": ".claude/hooks/require-ci-pass.sh"
          }
        ]
      }
    ]
  }
}
```

### MCP + Skills

Skills can reference MCP tools in their instructions. Since skills become part of Claude's context when invoked, they can guide Claude on when and how to use specific MCP tools.

Example skill that orchestrates MCP tool calls:

```markdown
---
name: investigate-incident
description: Investigate a production incident using monitoring data
---

# Incident Investigation Workflow

When investigating an incident:

1. Use `mcp__datadog__get_logs` to pull recent error logs for the affected service
2. Use `mcp__datadog__get_metrics` to check error rates and latency
3. Use `mcp__github__search_repositories` to find recent deployments
4. Use `mcp__github__list_commits` to identify what changed
5. Correlate the deployment timeline with the error spike
6. Summarize findings with root cause and recommended action
```

### MCP + Subagents

Subagents have two ways to access MCP tools:

**1. Inherit from parent** (default when `tools` field is omitted):

```yaml
---
name: data-analyst
description: Analyses data from connected databases
# tools omitted = inherits all, including MCP tools
---
```

**2. Explicit MCP server scoping via `mcpServers` field**:

```yaml
---
name: browser-tester
description: Tests features in a real browser using Playwright
mcpServers:
  # Inline definition: scoped to this subagent only
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  # Reference by name: reuses already-configured server
  - github
---

Use the Playwright tools to navigate, screenshot, and interact with pages.
```

**Key insight**: Define MCP servers inline in subagent `mcpServers` to keep their tool descriptions out of the main conversation's context window entirely. The subagent gets the tools; the parent does not.

**3. Restrict tools explicitly with `mcp:server:tool` syntax**:

```yaml
---
name: database-assistant
description: Queries and analyses the application database
tools:
  - mcp:shared-db:query
  - mcp:shared-db:list_tables
  - mcp:shared-db:describe_table
  - Read
---
```

**Limitation**: Plugin subagents do NOT support the `hooks`, `mcpServers`, or `permissionMode` frontmatter fields (these are silently ignored for security).

### MCP + CLAUDE.md

Document MCP tool usage guidance in your CLAUDE.md:

```markdown
## MCP Tools

### Database (mcp__db)
- Use `mcp__db__query` for read-only SQL queries against the analytics database
- Always use LIMIT clauses (max 1000 rows)
- Never run queries that take longer than 30 seconds
- Prefer aggregate queries over fetching raw data

### GitHub (mcp__github)
- Use for PR reviews, issue management, and deployment checks
- Always check CI status before approving PRs
- Use search to find related issues before creating new ones

### Datadog (mcp__datadog)
- Use for investigating production errors and performance issues
- Default to 1-hour lookback unless user specifies otherwise
- Correlate logs with metrics when investigating incidents
```

### MCP + Memory

**Built-in auto memory**: Claude saves notes about MCP tool patterns, useful queries, and workflow insights to `~/.claude/projects/<project>/memory/`. First 200 lines (or 25KB) load at every session start.

**Memory MCP servers** for cross-session persistence:

```bash
# Official Anthropic memory server (knowledge graph)
claude mcp add --transport stdio memory -- npx -y @anthropic/mcp-memory

# Mem0 for vector-based memory
claude mcp add --transport stdio mem0 -- npx -y mem0-mcp-server
```

These complement built-in memory by providing structured, searchable persistence for MCP-sourced information.

### Multiple MCP Servers: Coordination and Namespacing

**Namespace management**: Each tool is namespaced as `mcp__<server-name>__<tool-name>`, so two servers can expose tools with the same unqualified name without conflict.

**Tool name conflicts**: If two servers expose tools with identical fully-qualified names (unlikely due to server name prefix), the behavior is undefined. Some developers use a proxy that maintains a "symbol table" mapping `(server, function)` pairs to unique names.

**Configuration for multiple servers**:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "datadog": {
      "type": "http",
      "url": "https://mcp.datadoghq.com"
    },
    "db-analytics": {
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--dsn", "${ANALYTICS_DB_URL}"]
    },
    "db-users": {
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--dsn", "${USERS_DB_URL}"]
    }
  }
}
```

**Enterprise control**: Use `managed-mcp.json` to deploy a fixed set of servers organization-wide, or use allowlists/denylists for policy-based control:

```json
{
  "allowedMcpServers": [
    { "serverName": "github" },
    { "serverUrl": "https://mcp.company.com/*" },
    { "serverCommand": ["npx", "-y", "@company/approved-mcp"] }
  ],
  "deniedMcpServers": [
    { "serverUrl": "https://*.untrusted.com/*" }
  ]
}
```

---

## 4. Pitfalls

### Server Startup Failures

**Symptoms**: Server shows as "offline" in `/mcp`, connection timeouts during initialization.

**Common causes**:
- **Missing `cmd /c` on Windows**: `npx` cannot be executed directly on native Windows. Fix: `cmd /c npx -y @some/package`
- **Wrong module resolution**: TypeScript SDK requires `moduleResolution: NodeNext` in tsconfig.json
- **Port conflicts**: Another process using the same port. Check with `lsof -i :PORT`
- **Missing dependencies**: Server package not installed. Run `npm install` first
- **protocolVersion bug**: Claude Code has had issues sending proper `protocolVersion` field in initialize requests, causing handshake failures. Servers that work with MCP Inspector may still fail with Claude Code

**Diagnosis**:
```bash
# Check server status
/mcp

# Test server standalone
npx -y @some/mcp-server  # Should start without errors

# Start Claude with debug logging
claude --debug-file /tmp/claude.log
# Then in another terminal:
tail -f /tmp/claude.log
```

### Timeout Issues

**The 16-hour hang**: A documented case where Claude Code hung silently for 16+ hours with no warnings, creating 70+ zombie processes. There is no built-in watchdog for unresponsive MCP servers.

**Timeout configuration ignored**: Claude Code has known issues where `MCP_TIMEOUT` settings are not respected for HTTP/SSE servers, causing premature disconnections using default values.

**Mitigation**: Implement timeouts in your own tool code:

```typescript
server.registerTool("slow-query", {
  description: "Query that might be slow",
  inputSchema: z.object({ query: z.string() })
}, async ({ query }): Promise<CallToolResult> => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Query timed out after 30s")), 30000)
  );
  try {
    const result = await Promise.race([executeQuery(query), timeout]);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Timeout: ${error.message}` }],
      isError: true
    };
  }
});
```

### Transport Layer Issues

**stdio buffering**: stdout output can be buffered by the OS, delaying message delivery. Ensure your server flushes stdout after each message.

**stdout pollution**: Any non-JSON-RPC output to stdout (print statements, debug logs, library warnings) corrupts the protocol. Always redirect to stderr:
```python
# Python: use logging to stderr
import sys
logging.basicConfig(stream=sys.stderr)
```
```typescript
// TypeScript: use console.error, never console.log
console.error("Debug info here");  // Goes to stderr
// console.log("Never do this");   // Corrupts protocol
```

**SSE connection drops**: SSE connections can time out or be dropped by proxies/load balancers. Streamable HTTP is more resilient. If stuck on SSE, implement reconnection logic.

**"Connection closed" on Windows**: Missing `cmd /c` wrapper for npx. See startup failures above.

### Tool Schema Problems

**Poor descriptions lead to misuse**: Claude selects tools based on names and descriptions. Vague descriptions like "do stuff" will result in tools never being selected or being selected for wrong tasks.

**Fix**: Write descriptions as if briefing a new engineer:
```typescript
// BAD
server.registerTool("query", {
  description: "Run a query"
  // ...
});

// GOOD
server.registerTool("query-analytics", {
  description: "Execute a read-only SQL query against the analytics database. Returns up to 1000 rows. Use for aggregate metrics, user behavior analysis, and funnel data. Do NOT use for user PII lookups (use query-users instead)."
  // ...
});
```

**Truncation**: Claude Code truncates descriptions at 2KB. Put the most important information first.

### Security Risks

**Overly permissive servers**: A database server with write access when only reads are needed. Always use read-only connections for production data.

**Environment variable leakage**: Servers can access all env vars. Don't put secrets in env vars that MCP servers don't need. Use dedicated service accounts.

**Credential management anti-patterns**:
- Never hardcode API keys in server code
- Never commit `.mcp.json` files containing secrets
- Don't rely on `.env` files for production MCP servers (client may spawn server from a different directory)
- Use `${VAR}` syntax in `.mcp.json` and set vars externally
- Consider runtime injection via secrets managers (Doppler, 1Password, HashiCorp Vault)

**Credential rotation**: Set up 30-90 day rotation schedules. Avoid reusing credentials across multiple MCP servers.

### Performance

**Slow MCP tools block agent progress**: Claude waits for tool results before proceeding. A tool that takes 60 seconds blocks the entire conversation.

**Mitigation strategies**:
- Implement timeouts in every tool (30 second max recommended)
- Return partial results with a "truncated" flag rather than processing everything
- Paginate large responses
- Use `anthropic/maxResultSizeChars` annotation for tools that legitimately return large outputs
- Consider breaking slow operations into "start" and "poll" tool pairs

### MCP Server Crashes and Recovery

Claude Code does not automatically restart crashed MCP servers. A crashed server simply becomes unavailable until the session is restarted.

**Recommendations**:
- Implement proper error handling in all tool handlers (catch all exceptions)
- Return `isError: true` results instead of throwing
- Use process supervisors for critical stdio servers
- Monitor server health via PostToolUseFailure hooks

### Debugging MCP Communication

**MCP Inspector** -- the official debugging tool:

```bash
# Test your server with the Inspector UI
npx @modelcontextprotocol/inspector node build/index.js

# Opens browser UI at http://localhost:6274
# Shows: tool listing, resource browsing, prompt testing, live message log
```

**Claude Code debug log**:

```bash
# Start with debug logging
claude --debug-file /tmp/claude.log

# Or enable mid-session
/debug
```

**In-session checks**:
- `/mcp` -- view all server statuses, authenticate, reconnect
- Check tool availability by asking Claude to list MCP tools

### Version Compatibility

**MCP specification versions**: The spec has had breaking changes on ~3-month cycles:
- 2025-03-26: Added JSON-RPC batching
- 2025-06-18: Removed JSON-RPC batching, added structured tool outputs, added elicitation, enhanced OAuth security

**Python SDK**: V1 to V2 migration is breaking. FastMcp was replaced with McpServer in V2.

**TypeScript SDK**: Minor versions maintain backwards compatibility. Only major versions may break.

**Recommendation**: Pin your SDK versions explicitly. Test against the MCP Inspector before deploying server updates. Monitor the [MCP specification changelog](https://modelcontextprotocol.io/specification) for breaking changes.

---

## Sources

- [MCP Transports Specification](https://modelcontextprotocol.io/legacy/concepts/transports)
- [Claude Code MCP Documentation](https://code.claude.com/docs/en/mcp)
- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code Subagents Documentation](https://code.claude.com/docs/en/sub-agents)
- [TypeScript SDK Server Documentation](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [MCP Security Best Practices](https://modelcontextprotocol.io/specification/draft/basic/security_best_practices)
- [Datadog MCP Server](https://docs.datadoghq.com/bits_ai/mcp_server/)
- [Grafana MCP Server](https://github.com/grafana/mcp-grafana)
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [DBHub (Bytebase)](https://www.deployhq.com/blog/how-to-generate-sql-queries-with-ai-step-by-step-guide-using-claude-code-and-dbhub)
- [Postgres MCP Pro](https://github.com/crystaldba/postgres-mcp)
- [Jenkins MCP Server](https://github.com/kud/mcp-jenkins)
- [MCP Security Risks (Datadog)](https://www.datadoghq.com/blog/monitor-mcp-servers/)
- [MCP Security (Red Hat)](https://www.redhat.com/en/blog/model-context-protocol-mcp-understanding-security-risks-and-controls)
- [MCP Credential Security (Doppler)](https://www.doppler.com/blog/mcp-server-credential-security-best-practices)
- [Managing Secrets in MCP Servers (Infisical)](https://infisical.com/blog/managing-secrets-mcp-servers)
- [MCP Version Migration](https://medium.com/the-ai-language/mcp-is-migrating-from-version-1-to-version-2-07f4cc7624fb)
- [Claude Code Troubleshooting](https://code.claude.com/docs/en/troubleshooting)
- [MCP Server 16-Hour Hang Issue](https://github.com/anthropics/claude-code/issues/15945)
- [MCP Timeout Configuration Issue](https://github.com/anthropics/claude-code/issues/20335)
- [Subagent MCP Access Feature Request](https://github.com/anthropics/claude-code/issues/34935)
- [Claude Code Full Stack Architecture](https://alexop.dev/posts/understanding-claude-code-full-stack/)
- [Skills vs MCP vs Subagents](https://colinmcnamara.com/blog/understanding-skills-agents-and-mcp-in-claude-code)
- [MCP Memory and Persistence](https://www.mintlify.com/blog/how-claudes-memory-and-mcp-work)
- [Mem0 Claude Code Memory](https://mem0.ai/blog/claude-code-memory)
- [Using CLAUDE.md Files](https://claude.com/blog/using-claude-md-files)
- [MCP Three Primitives Explained](https://devcenter.upsun.com/posts/mcp-interaction-types-article/)
- [GraphQL MCP Server](https://github.com/Chakit22/graphql-mcp-server)
- [Configuring MCP in Claude Code (Scott Spence)](https://scottspence.com/posts/configuring-mcp-tools-in-claude-code)
- [Tool Search and Lazy Loading](https://github.com/anthropics/claude-code/issues/16826)
