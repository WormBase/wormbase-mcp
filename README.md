# WormBase MCP Server

MCP server for querying [WormBase](https://wormbase.org) - the *C. elegans* and nematode genomics database.

## Installation

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "wormbase": {
      "command": "npx",
      "args": ["-y", "@nuin/wormbase-mcp"]
    }
  }
}
```

### Claude Code (CLI)

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "wormbase": {
      "command": "npx",
      "args": ["-y", "@nuin/wormbase-mcp"]
    }
  }
}
```

### Cursor

Add to Cursor settings (Settings > MCP Servers):

```json
{
  "wormbase": {
    "command": "npx",
    "args": ["-y", "@nuin/wormbase-mcp"]
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "wormbase": {
      "command": "npx",
      "args": ["-y", "@nuin/wormbase-mcp"]
    }
  }
}
```

### From source

```bash
git clone https://github.com/WormBase/wormbase-mcp.git
cd wormbase-mcp
npm install && npm run build
```

Then use the local path in your config:

```json
{
  "mcpServers": {
    "wormbase": {
      "command": "node",
      "args": ["/path/to/wormbase-mcp/dist/index.js"]
    }
  }
}
```

## Usage

Just ask questions naturally:

- "What does daf-2 do?"
- "Search for genes involved in longevity"
- "Get phenotypes for unc-13"
- "Find interactions for lin-14"
- "What are the homologs of aap-1?"
- "Give me the sequence of protein CE29083"

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search genes, proteins, phenotypes, strains |
| `get_gene` | Gene details (accepts names like `daf-2` or IDs like `WBGene00000898`) |
| `get_protein` | Protein sequences and domains |
| `get_phenotype` | Phenotype info and associated genes |
| `get_disease` | Human disease models |
| `get_strain` | Laboratory strains |
| `get_variation` | Alleles and mutations |
| `get_interactions` | Genetic and physical interactions |
| `get_expression` | Expression patterns |
| `get_ontology` | GO annotations |
| `get_paper` | Publication details |

## Data Sources

- **Search & name resolution**: [WormMine](https://wormmine.alliancegenome.org/wormmine)
- **Detailed data**: [WormBase REST API](http://rest.wormbase.org)

## License

MIT
