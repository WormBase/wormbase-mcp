import { EntityType, SearchResponse, EntityData, InteractionData } from "./types.js";

const BASE_URL = "http://rest.wormbase.org";
const WORMMINE_URL = "https://wormmine.alliancegenome.org/wormmine/service";

export class WormBaseClient {
  private baseUrl: string;
  private wormmineUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || BASE_URL;
    this.wormmineUrl = WORMMINE_URL;
  }

  private async fetch<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Search WormBase using WormMine
   */
  async search(
    query: string,
    type?: EntityType,
    limit: number = 10
  ): Promise<SearchResponse> {
    const url = `${this.wormmineUrl}/search?q=${encodeURIComponent(query)}&size=${limit}`;

    try {
      const response = await this.fetch<any>(url);
      const results = this.parseWormMineResults(response, type, limit);
      return {
        query,
        results,
        total: response.totalHits || results.length,
      };
    } catch (error) {
      return { query, results: [], total: 0 };
    }
  }

  /**
   * Resolve gene name to WBGene ID using WormMine
   */
  async resolveGeneId(name: string): Promise<string | null> {
    const url = `${this.wormmineUrl}/search?q=${encodeURIComponent(name)}&facet_Category=Gene&size=1`;

    try {
      const response = await this.fetch<any>(url);
      if (response.results?.[0]?.fields?.primaryIdentifier) {
        return response.results[0].fields.primaryIdentifier;
      }
    } catch {
      // Fall through
    }
    return null;
  }

  /**
   * Get detailed gene information
   */
  async getGene(
    id: string,
    widgets?: string[]
  ): Promise<Record<string, unknown>> {
    // Resolve gene name to WBGene ID if needed
    let geneId = id;
    if (!id.startsWith("WBGene")) {
      const resolved = await this.resolveGeneId(id);
      if (resolved) {
        geneId = resolved;
      }
    }

    const defaultWidgets = ["overview", "phenotype", "expression", "ontology"];
    const requestedWidgets = widgets || defaultWidgets;

    const result: Record<string, unknown> = { id: geneId, query: id };

    for (const widget of requestedWidgets) {
      try {
        const url = `${this.baseUrl}/rest/widget/gene/${encodeURIComponent(geneId)}/${widget}`;
        const data = await this.fetch<any>(url);
        result[widget] = this.cleanWidgetData(data);
      } catch (error) {
        result[widget] = { error: `Failed to fetch ${widget}` };
      }
    }

    return result;
  }

  /**
   * Get any entity by type and ID
   */
  async getEntity(
    type: EntityType,
    id: string,
    widgets?: string[]
  ): Promise<Record<string, unknown>> {
    const defaultWidgets = ["overview"];
    const requestedWidgets = widgets || defaultWidgets;

    const result: Record<string, unknown> = { id, type };

    for (const widget of requestedWidgets) {
      try {
        const url = `${this.baseUrl}/rest/widget/${type}/${encodeURIComponent(id)}/${widget}`;
        const data = await this.fetch<any>(url);
        result[widget] = this.cleanWidgetData(data);
      } catch (error) {
        result[widget] = { error: `Failed to fetch ${widget}` };
      }
    }

    return result;
  }

  /**
   * Get interactions for a gene
   */
  async getInteractions(
    id: string,
    interactionType: string = "all"
  ): Promise<InteractionData> {
    const url = `${this.baseUrl}/rest/widget/gene/${encodeURIComponent(id)}/interactions`;
    const data = await this.fetch<any>(url);

    const interactions = this.cleanWidgetData(data);

    if (interactionType === "all") {
      return interactions as InteractionData;
    }

    // Filter by interaction type
    const filtered: Record<string, unknown> = {};
    const interactionsObj = interactions as Record<string, unknown>;
    if (interactionType === "physical" && interactionsObj.physical) {
      filtered.physical = interactionsObj.physical;
    }
    if (interactionType === "genetic" && interactionsObj.genetic) {
      filtered.genetic = interactionsObj.genetic;
    }
    if (interactionType === "regulatory" && interactionsObj.regulatory) {
      filtered.regulatory = interactionsObj.regulatory;
    }

    return filtered as InteractionData;
  }

  /**
   * Get expression data for a gene
   */
  async getExpression(id: string): Promise<Record<string, unknown>> {
    const url = `${this.baseUrl}/rest/widget/gene/${encodeURIComponent(id)}/expression`;
    const data = await this.fetch<any>(url);
    return this.cleanWidgetData(data);
  }

  /**
   * Get ontology annotations for a gene
   */
  async getOntology(id: string): Promise<Record<string, unknown>> {
    const url = `${this.baseUrl}/rest/widget/gene/${encodeURIComponent(id)}/ontology`;
    const data = await this.fetch<any>(url);
    return this.cleanWidgetData(data);
  }

  /**
   * Get field data for an entity
   */
  async getField(
    type: EntityType,
    id: string,
    field: string
  ): Promise<unknown> {
    const url = `${this.baseUrl}/rest/field/${type}/${encodeURIComponent(id)}/${field}`;
    const data = await this.fetch<any>(url);
    return data[field] || data;
  }

  // Helper methods

  private parseWormMineResults(
    response: any,
    type: EntityType | undefined,
    limit: number
  ): Array<{
    id: string;
    label: string;
    class: string;
    taxonomy?: string;
    description?: string;
  }> {
    if (!response?.results) return [];

    let results = response.results;

    // Filter by type if specified
    if (type) {
      const typeMap: Record<string, string> = {
        gene: "Gene",
        protein: "Protein",
        strain: "Strain",
        variation: "Allele",
        rnai: "RNAi",
        phenotype: "Phenotype",
      };
      const mappedType = typeMap[type] || type;
      results = results.filter((r: any) => r.type === mappedType);
    }

    return results.slice(0, limit).map((hit: any) => ({
      id: hit.fields?.primaryIdentifier || hit.fields?.secondaryIdentifier || String(hit.id),
      label: hit.fields?.symbol || hit.fields?.name || hit.fields?.primaryIdentifier || "",
      class: hit.type?.toLowerCase() || "",
      taxonomy: hit.fields?.["organism.name"] || "",
      description: hit.fields?.briefDescription || "",
    }));
  }

  private cleanWidgetData(data: any): Record<string, unknown> {
    if (!data) return {};

    // The API typically wraps data in a "fields" object
    const fields = data.fields || data;

    // Clean and simplify the data structure
    const cleaned: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (value === null || value === undefined) continue;

      // Handle nested data structures
      if (typeof value === "object" && value !== null) {
        const obj = value as Record<string, unknown>;
        if ("data" in obj) {
          cleaned[key] = obj.data;
        } else if ("id" in obj && "label" in obj) {
          // Entity reference
          cleaned[key] = {
            id: obj.id,
            label: obj.label,
            class: obj.class || obj.taxonomy,
          };
        } else {
          cleaned[key] = this.simplifyValue(value);
        }
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }

  private simplifyValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map(v => this.simplifyValue(v));
    }

    if (typeof value === "object" && value !== null) {
      const obj = value as Record<string, unknown>;

      // Handle entity references
      if ("id" in obj && "label" in obj) {
        return {
          id: obj.id,
          label: obj.label,
          class: obj.class,
        };
      }

      // Handle data wrapper
      if ("data" in obj && Object.keys(obj).length <= 2) {
        return this.simplifyValue(obj.data);
      }

      // Recursively simplify nested objects
      const simplified: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (v !== null && v !== undefined) {
          simplified[k] = this.simplifyValue(v);
        }
      }
      return simplified;
    }

    return value;
  }

  private extractLabel(overview: any): string | null {
    if (typeof overview === "object" && overview !== null) {
      const obj = overview as Record<string, any>;
      return obj.name?.label || obj.name?.data?.label || obj.label || null;
    }
    return null;
  }

  private extractDescription(overview: any): string | undefined {
    if (typeof overview === "object" && overview !== null) {
      const obj = overview as Record<string, any>;
      return obj.description?.data || obj.concise_description?.data ||
             obj.description || obj.concise_description;
    }
    return undefined;
  }
}
