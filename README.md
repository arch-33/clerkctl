# clerkctl

A CLI for managing [Clerk](https://clerk.com) projects, apps, and developer tokens. Built with interactive prompts powered by [clack](https://bomb.sh/docs/clack).

## Installation

```sh
npm install -g clerkctl
# or
pnpm add -g clerkctl
```

Requires Node.js >= 22.

## Usage

Run without arguments for a fully interactive menu:

```sh
clerkctl
```

Or invoke subcommands directly for scripting:

```sh
clerkctl <command> [subcommand] [args] [options]
```

---

## Concepts

**Projects** are top-level groupings (e.g. one per Clerk account or team). Each project holds one or more **apps**, each of which stores Clerk API credentials (secret key, publishable key, webhook secret).

Config is stored at `~/.clerkctl/config.yml`. Print the path with:

```sh
clerkctl config
```

---

## Commands

### `project`

Manage Clerk projects.

| Subcommand | Description |
|---|---|
| `project add <name>` | Create a new project |
| `project list` | List all projects (current marked with `*`) |
| `project use <name>` | Set the active project |
| `project remove <name>` | Delete a project |

```sh
clerkctl project add my-project
clerkctl project list
clerkctl project use my-project
clerkctl project remove my-project
```

---

### `app`

Manage Clerk apps within a project.

| Subcommand | Description |
|---|---|
| `app add <name>` | Add an app to the current project |
| `app list` | List apps in the current project |
| `app use <name>` | Set the active app |
| `app show` | Show credentials for the active app |
| `app default <name>` | Set the fallback app (used when no current app is set) |
| `app remove <name>` | Remove an app |

All app subcommands accept an optional `--project <name>` flag to target a specific project instead of the current one. `app show` also accepts `--app <name>`.

```sh
# Add an app with credentials
clerkctl app add production \
  --secret-key sk_live_... \
  --publishable-key pk_live_... \
  --webhook-secret whsec_...

# Add a minimal app (keys can be added later)
clerkctl app add staging

# List apps in a specific project
clerkctl app list --project my-other-project

# Show credentials for the active app
clerkctl app show

# Show credentials for a specific app/project
clerkctl app show --project my-project --app staging

# Switch active app
clerkctl app use staging

# Set default app (fallback when no current app is set)
clerkctl app default production
```

#### App flags

| Flag | Description |
|---|---|
| `--project <name>` | Target project (defaults to current project) |
| `--app <name>` | Target app (defaults to current app) — `show` only |
| `--secret-key <key>` | Clerk secret key (`sk_...`) — `add` only |
| `--publishable-key <key>` | Clerk publishable key (`pk_...`) — `add` only |
| `--webhook-secret <secret>` | Clerk webhook secret (`whsec_...`) — `add` only |

---

### `extend-session`

Generate a new session token with an 8-hour expiration from an existing JWT.

Requires the active app to have a `secret_key` configured.

```sh
clerkctl extend-session <token>

# Target a specific project/app
clerkctl extend-session <token> --project my-project --app staging
```

The new JWT is printed to stdout prefixed with `>`:

```
> eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How it works:** The token is decoded to extract the session ID (`sid` claim), then a new token is created via the Clerk API using the app's secret key.

---

### `switch-org`

Switch the active organization in a session and return a new token.

In interactive mode, your organization memberships are fetched from the Clerk API and presented as a list to select from. In non-interactive mode, pass the org ID directly.

```sh
# Non-interactive
clerkctl switch-org <token> <org-id>

# With specific project/app
clerkctl switch-org <token> <org-id> --project my-project --app staging
```

**How it works:** The token is decoded to extract the user ID (`sub` claim). A new session is created with the specified organization as active, and a new 8-hour token is issued.

---

### `config`

Print the path to the config file.

```sh
clerkctl config
# /Users/you/.clerkctl/config.yml
```

---

## Config file

Stored at `~/.clerkctl/config.yml`. Example:

```yaml
current_project: my-project
projects:
  my-project:
    current_app: production
    apps:
      production:
        secret_key: sk_live_...
        publishable_key: pk_live_...
        webhook_secret: whsec_...
      staging:
        secret_key: sk_test_...
        publishable_key: pk_test_...
  another-project:
    apps: {}
```

---

## Development

```sh
pnpm install
pnpm build       # tsc typecheck + tsup bundle
```
