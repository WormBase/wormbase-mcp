#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { WormBaseClient } from "./client.js";
import { ENTITY_TYPES, EntityType } from "./types.js";

const client = new WormBaseClient();

const server = new McpServer({
  name: "wormbase",
  version: "0.1.0",
});

// Tool: Search WormBase
server.tool(
  "search",
  "Search WormBase for genes, proteins, phenotypes, strains, and other biological entities. Supports natural language queries like 'genes involved in longevity' or specific IDs like 'WBGene00006763'.",
  {
    query: z.string().describe("Search query - can be a gene name (e.g., 'daf-2', 'unc-13'), WormBase ID (e.g., 'WBGene00006763'), or natural language description"),
    type: z.enum(ENTITY_TYPES).optional().describe("Entity type to search for. If not specified, searches all types."),
    limit: z.number().optional().default(10).describe("Maximum number of results to return"),
  },
  async ({ query, type, limit }) => {
    try {
      const results = await client.search(query, type, limit);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error searching WormBase: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get Gene Information
server.tool(
  "get_gene",
  "Get detailed information about a C. elegans gene including description, function, expression, phenotypes, and orthologs.",
  {
    id: z.string().describe("Gene identifier - WormBase ID (e.g., 'WBGene00006763') or gene name (e.g., 'daf-2', 'unc-13')"),
    widgets: z.array(z.string()).optional().describe("Specific widgets to fetch: overview, expression, phenotype, interactions, homology, sequences, genetics, external_links, references"),
  },
  async ({ id, widgets }) => {
    try {
      const data = await client.getGene(id, widgets);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching gene: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get Protein Information
server.tool(
  "get_protein",
  "Get detailed information about a protein including sequence, domains, motifs, and structure.",
  {
    id: z.string().describe("Protein identifier - WormBase protein ID"),
    widgets: z.array(z.string()).optional().describe("Specific widgets to fetch: overview, sequences, motif_details, external_links, references"),
  },
  async ({ id, widgets }) => {
    try {
      const data = await client.getEntity("protein", id, widgets);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching protein: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get Phenotype Information
server.tool(
  "get_phenotype",
  "Get detailed information about a phenotype including associated genes, RNAi experiments, and variations.",
  {
    id: z.string().describe("Phenotype identifier - WormBase phenotype ID (e.g., 'WBPhenotype:0000643')"),
    widgets: z.array(z.string()).optional().describe("Specific widgets to fetch: overview, rnai, variation, transgene, references"),
  },
  async ({ id, widgets }) => {
    try {
      const data = await client.getEntity("phenotype", id, widgets);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching phenotype: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get Disease Information
server.tool(
  "get_disease",
  "Get information about human diseases with C. elegans models, including associated genes and orthologs.",
  {
    id: z.string().describe("Disease identifier - DOID or WormBase disease ID"),
    widgets: z.array(z.string()).optional().describe("Specific widgets to fetch: overview, genes, references"),
  },
  async ({ id, widgets }) => {
    try {
      const data = await client.getEntity("disease", id, widgets);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching disease: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get Strain Information
server.tool(
  "get_strain",
  "Get information about a C. elegans strain including genotype, available from, and associated phenotypes.",
  {
    id: z.string().describe("Strain identifier - strain name (e.g., 'N2', 'CB1370')"),
    widgets: z.array(z.string()).optional().describe("Specific widgets to fetch: overview, phenotypes, references"),
  },
  async ({ id, widgets }) => {
    try {
      const data = await client.getEntity("strain", id, widgets);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching strain: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get Variation/Allele Information
server.tool(
  "get_variation",
  "Get information about a genetic variation/allele including molecular details, phenotypes, and strains.",
  {
    id: z.string().describe("Variation identifier - allele name (e.g., 'e1370') or WormBase variation ID"),
    widgets: z.array(z.string()).optional().describe("Specific widgets to fetch: overview, molecular_details, phenotypes, references"),
  },
  async ({ id, widgets }) => {
    try {
      const data = await client.getEntity("variation", id, widgets);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching variation: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get Interactions
server.tool(
  "get_interactions",
  "Get protein-protein, genetic, or regulatory interactions for a gene or protein.",
  {
    id: z.string().describe("Gene or protein identifier"),
    interaction_type: z.enum(["genetic", "physical", "regulatory", "all"]).optional().default("all").describe("Type of interactions to retrieve"),
  },
  async ({ id, interaction_type }) => {
    try {
      const data = await client.getInteractions(id, interaction_type);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching interactions: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get Expression Pattern
server.tool(
  "get_expression",
  "Get expression pattern information for a gene including tissue/cell expression, life stage expression, and expression images.",
  {
    id: z.string().describe("Gene identifier"),
  },
  async ({ id }) => {
    try {
      const data = await client.getExpression(id);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching expression: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get GO Terms
server.tool(
  "get_ontology",
  "Get Gene Ontology (GO) terms for a gene including molecular function, biological process, and cellular component annotations.",
  {
    id: z.string().describe("Gene identifier"),
  },
  async ({ id }) => {
    try {
      const data = await client.getOntology(id);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching ontology: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get Generic Entity
server.tool(
  "get_entity",
  "Get information about any WormBase entity type. Use this for entity types not covered by specific tools.",
  {
    type: z.enum(ENTITY_TYPES).describe("Entity type"),
    id: z.string().describe("Entity identifier"),
    widgets: z.array(z.string()).optional().describe("Specific widgets to fetch"),
  },
  async ({ type, id, widgets }) => {
    try {
      const data = await client.getEntity(type, id, widgets);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching entity: ${error}` }],
        isError: true,
      };
    }
  }
);

// Tool: Get Paper/Reference
server.tool(
  "get_paper",
  "Get information about a scientific paper/publication including authors, abstract, and associated genes.",
  {
    id: z.string().describe("Paper identifier - WormBase paper ID (e.g., 'WBPaper00000001') or PubMed ID"),
  },
  async ({ id }) => {
    try {
      const data = await client.getEntity("paper", id, ["overview", "referenced_genes"]);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching paper: ${error}` }],
        isError: true,
      };
    }
  }
);

// Resource: List available entity types
server.resource(
  "entity-types",
  "wormbase://entity-types",
  async () => ({
    contents: [{
      uri: "wormbase://entity-types",
      mimeType: "application/json",
      text: JSON.stringify({
        description: "Available WormBase entity types that can be queried",
        types: ENTITY_TYPES.map(t => ({
          name: t,
          description: getEntityDescription(t),
        })),
      }, null, 2),
    }],
  })
);

function getEntityDescription(type: string): string {
  const descriptions: Record<string, string> = {
    gene: "Genes in C. elegans and related nematodes",
    protein: "Protein sequences and annotations",
    phenotype: "Observable characteristics and traits",
    disease: "Human diseases with nematode models",
    strain: "Laboratory strains and genetic backgrounds",
    variation: "Genetic variants and alleles",
    transgene: "Transgenic constructs",
    rnai: "RNAi experiments and results",
    anatomy_term: "Anatomical structures and cell types",
    life_stage: "Developmental stages",
    go_term: "Gene Ontology terms",
    interaction: "Molecular and genetic interactions",
    expression_cluster: "Co-expression clusters",
    paper: "Scientific publications",
    person: "Researchers in the field",
    laboratory: "Research laboratories",
  };
  return descriptions[type] || `${type} entities in WormBase`;
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("WormBase MCP server running on stdio");
}

main().catch(console.error);
