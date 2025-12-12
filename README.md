# WormBase MCP Server

A Model Context Protocol (MCP) server for accessing [WormBase](https://wormbase.org) - the central repository for *C. elegans* and related nematode biological data.

This MCP server enables LLMs like Claude to query WormBase's comprehensive database of genes, proteins, phenotypes, strains, and other biological entities using natural language.

## Features

- **Natural Language Search**: Query WormBase using natural language (e.g., "genes involved in longevity", "daf-2 pathway")
- **Gene Information**: Get detailed gene data including expression, phenotypes, interactions, and ontology annotations
- **Protein Data**: Access protein sequences, domains, and structural information
- **Phenotype Queries**: Find phenotypes and associated genes, RNAi experiments, and variations
- **Disease Models**: Explore human diseases with *C. elegans* models
- **Strain Information**: Access laboratory strain data and genetic backgrounds
- **Genetic Variations**: Query alleles, mutations, and their molecular effects
- **Interactions**: Get protein-protein, genetic, and regulatory interactions
- **Expression Patterns**: View tissue/cell expression and life stage data

## Installation

### For Claude Code

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

### For Claude Desktop

Add to your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

### From Source

```bash
git clone https://github.com/WormBase/wormbase-mcp.git
cd wormbase-mcp
npm install
npm run build
```

Then add to your MCP settings:

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

## Available Tools

### `search`
Search WormBase for genes, proteins, phenotypes, and other entities.

```
Arguments:
- query (required): Search term - gene name, WormBase ID, or natural language description
- type (optional): Entity type filter (gene, protein, phenotype, strain, etc.)
- limit (optional): Maximum results (default: 10)
```

**Examples:**
- "daf-2" - Find the daf-2 gene
- "WBGene00006763" - Look up by WormBase ID
- "longevity genes" - Natural language search

### `get_gene`
Get detailed information about a gene.

```
Arguments:
- id (required): Gene name or WormBase ID
- widgets (optional): Specific data sections to fetch
```

**Available widgets:** overview, expression, phenotype, interactions, homology, sequences, genetics, ontology, external_links, references

### `get_protein`
Get protein information including sequences and domains.

```
Arguments:
- id (required): Protein identifier
- widgets (optional): Data sections to fetch
```

### `get_phenotype`
Get phenotype information and associated genes.

```
Arguments:
- id (required): Phenotype ID (e.g., "WBPhenotype:0000643")
- widgets (optional): Data sections to fetch
```

### `get_disease`
Get human disease information with *C. elegans* models.

```
Arguments:
- id (required): Disease ID (DOID)
- widgets (optional): Data sections to fetch
```

### `get_strain`
Get laboratory strain information.

```
Arguments:
- id (required): Strain name (e.g., "N2", "CB1370")
- widgets (optional): Data sections to fetch
```

### `get_variation`
Get genetic variation/allele information.

```
Arguments:
- id (required): Allele name or variation ID
- widgets (optional): Data sections to fetch
```

### `get_interactions`
Get molecular and genetic interactions.

```
Arguments:
- id (required): Gene or protein identifier
- interaction_type (optional): "genetic", "physical", "regulatory", or "all"
```

### `get_expression`
Get gene expression patterns.

```
Arguments:
- id (required): Gene identifier
```

### `get_ontology`
Get Gene Ontology annotations.

```
Arguments:
- id (required): Gene identifier
```

### `get_entity`
Get any WormBase entity by type.

```
Arguments:
- type (required): Entity type
- id (required): Entity identifier
- widgets (optional): Data sections to fetch
```

### `get_paper`
Get scientific publication information.

```
Arguments:
- id (required): WormBase paper ID or PubMed ID
```

## Entity Types

The server supports querying the following entity types:

| Type | Description |
|------|-------------|
| gene | Genes in *C. elegans* and related nematodes |
| protein | Protein sequences and annotations |
| phenotype | Observable characteristics and traits |
| disease | Human diseases with nematode models |
| strain | Laboratory strains and genetic backgrounds |
| variation | Genetic variants and alleles |
| transgene | Transgenic constructs |
| rnai | RNAi experiments and results |
| anatomy_term | Anatomical structures and cell types |
| life_stage | Developmental stages |
| go_term | Gene Ontology terms |
| interaction | Molecular and genetic interactions |
| expression_cluster | Co-expression clusters |
| paper | Scientific publications |
| person | Researchers in the field |
| laboratory | Research laboratories |

## Example Conversations

**User:** What does the daf-2 gene do?

**Claude:** Let me look up daf-2 in WormBase...
[Uses get_gene tool]
daf-2 encodes an insulin/IGF-1 receptor ortholog that regulates metabolism, development, and lifespan in C. elegans...

**User:** What phenotypes are associated with daf-2 mutations?

**Claude:** [Uses get_gene with phenotype widget]
daf-2 mutations cause extended lifespan, dauer formation, fat accumulation...

**User:** Find genes involved in the aging pathway

**Claude:** [Uses search tool]
Here are genes associated with aging in C. elegans: daf-2, daf-16, age-1, sir-2.1...

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev

# Test locally
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

## API Reference

This MCP server uses the [WormBase REST API](https://rest.wormbase.org). For detailed API documentation, see:
- [WormBase REST API Guide](https://wormbase.org/about/userguide/for_developers/api-rest)
- [OpenAPI Specification](https://rest.wormbase.org/swagger.json)

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/WormBase/wormbase-mcp).

## Support

For questions about WormBase data, contact [help@wormbase.org](mailto:help@wormbase.org).

For issues with this MCP server, please [open an issue](https://github.com/WormBase/wormbase-mcp/issues) on GitHub.
