# WormBase MCP Server

MCP server for querying [WormBase](https://wormbase.org) - the *C. elegans* and nematode genomics database.

## Installation

Add to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "wormbase": {
      "command": "npx",
      "args": ["-y", "@wormbase/mcp-server"]
    }
  }
}
```

Then just ask questions:

- "What does daf-2 do?"
- "Search for genes involved in longevity"
- "Get phenotypes for unc-13"
- "Find interactions for lin-14"

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

## Development

```bash
git clone https://github.com/WormBase/wormbase-mcp.git
cd wormbase-mcp
npm install
npm run build
npm run dev
```

## License

MIT
