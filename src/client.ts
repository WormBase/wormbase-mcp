import { EntityType, SearchResponse, EntityData, InteractionData } from "./types.js";

const BASE_URL = "http://rest.wormbase.org";
const SEARCH_URL = "https://wormbase.org/search";

export class WormBaseClient {
  private baseUrl: string;
  private searchUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || BASE_URL;
    this.searchUrl = SEARCH_URL;
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
   * Search WormBase for entities
   */
  async search(
    query: string,
    type?: EntityType,
    limit: number = 10
  ): Promise<SearchResponse> {
    // Try direct ID lookup first if query looks like an ID
    if (this.looksLikeId(query)) {
      const directResult = await this.tryDirectLookup(query, type);
      if (directResult) {
        return {
          query,
          results: [directResult],
          total: 1,
        };
      }
    }

    // Use WormBase autocomplete/search API
    const searchType = type || "all";
    const url = `${this.searchUrl}/${searchType}/${encodeURIComponent(query)}?content-type=application/json`;

    try {
      const response = await this.fetch<any>(url);

      // Parse search results
      const results = this.parseSearchResults(response, limit);
      return {
        query,
        results,
        total: results.length,
      };
    } catch (error) {
      // If search fails, try direct lookup on common entity types
      const types: EntityType[] = type
        ? [type]
        : ["gene", "protein", "variation", "strain", "phenotype"];

      for (const t of types) {
        try {
          const data = await this.getEntity(t, query, ["overview"]);
          if (data && data.overview) {
            return {
              query,
              results: [{
                id: query,
                label: this.extractLabel(data.overview) || query,
                class: t,
                description: this.extractDescription(data.overview),
              }],
              total: 1,
            };
          }
        } catch {
          continue;
        }
      }

      return { query, results: [], total: 0 };
    }
  }

  /**
   * Get detailed gene information
   */
  async getGene(
    id: string,
    widgets?: string[]
  ): Promise<Record<string, unknown>> {
    const defaultWidgets = ["overview", "phenotype", "expression", "ontology"];
    const requestedWidgets = widgets || defaultWidgets;

    const result: Record<string, unknown> = { id };

    for (const widget of requestedWidgets) {
      try {
        const url = `${this.baseUrl}/rest/widget/gene/${encodeURIComponent(id)}/${widget}`;
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

  private looksLikeId(query: string): boolean {
    // WormBase IDs typically start with WB and have specific patterns
    const idPatterns = [
      /^WB[A-Z][a-z]+\d+$/,  // WBGene00006763, WBVar00143949
      /^WBPhenotype:\d+$/,   // WBPhenotype:0000643
      /^DOID:\d+$/,          // Disease ontology IDs
      /^GO:\d+$/,            // Gene ontology IDs
      /^[A-Z]+\d+$/,         // Simple alphanumeric IDs
    ];

    return idPatterns.some(pattern => pattern.test(query));
  }

  private async tryDirectLookup(
    id: string,
    type?: EntityType
  ): Promise<{ id: string; label: string; class: string; description?: string } | null> {
    // Infer type from ID pattern if not provided
    const inferredType = type || this.inferTypeFromId(id);
    if (!inferredType) return null;

    try {
      const data = await this.getEntity(inferredType, id, ["overview"]);
      if (data && data.overview) {
        return {
          id,
          label: this.extractLabel(data.overview) || id,
          class: inferredType,
          description: this.extractDescription(data.overview),
        };
      }
    } catch {
      return null;
    }

    return null;
  }

  private inferTypeFromId(id: string): EntityType | null {
    if (id.startsWith("WBGene")) return "gene";
    if (id.startsWith("WBProtein") || id.startsWith("CE")) return "protein";
    if (id.startsWith("WBVar")) return "variation";
    if (id.startsWith("WBStrain")) return "strain";
    if (id.startsWith("WBPhenotype")) return "phenotype";
    if (id.startsWith("WBTransgene")) return "transgene";
    if (id.startsWith("WBRNAi")) return "rnai";
    if (id.startsWith("WBPaper")) return "paper";
    if (id.startsWith("WBPerson")) return "person";
    if (id.startsWith("DOID:")) return "disease";
    if (id.startsWith("GO:")) return "go_term";
    return null;
  }

  private parseSearchResults(response: any, limit: number): Array<{
    id: string;
    label: string;
    class: string;
    taxonomy?: string;
    description?: string;
  }> {
    if (!response) return [];

    // Handle different response formats
    const hits = response.hits || response.results || response.matches || [];

    return hits.slice(0, limit).map((hit: any) => ({
      id: hit.id || hit.name?.id || hit.wbid || "",
      label: hit.label || hit.name?.label || hit.name || "",
      class: hit.class || hit.type || hit.category || "",
      taxonomy: hit.taxonomy || hit.species || "",
      description: hit.description || hit.summary || "",
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
