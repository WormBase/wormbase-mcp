// WormBase entity types
export const ENTITY_TYPES = [
  "gene",
  "protein",
  "transcript",
  "cds",
  "pseudogene",
  "phenotype",
  "disease",
  "strain",
  "variation",
  "transgene",
  "rnai",
  "anatomy_term",
  "life_stage",
  "go_term",
  "interaction",
  "expression_cluster",
  "expr_pattern",
  "paper",
  "person",
  "laboratory",
  "clone",
  "sequence",
  "feature",
  "operon",
  "gene_class",
  "molecule",
  "antibody",
  "construct",
  "motif",
  "homology_group",
  "rearrangement",
  "transposon",
  "transposon_family",
  "pcr_oligo",
  "position_matrix",
  "microarray_results",
  "structure_data",
  "analysis",
  "gene_cluster",
  "expr_profile",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

// Widget names available for each entity type
export const COMMON_WIDGETS = [
  "overview",
  "external_links",
  "references",
] as const;

export const GENE_WIDGETS = [
  ...COMMON_WIDGETS,
  "expression",
  "phenotype",
  "interactions",
  "homology",
  "sequences",
  "genetics",
  "ontology",
  "reagents",
  "mapping_data",
  "human_diseases",
  "history",
] as const;

export const PROTEIN_WIDGETS = [
  ...COMMON_WIDGETS,
  "sequences",
  "motif_details",
  "homology",
  "blast_details",
] as const;

export const PHENOTYPE_WIDGETS = [
  ...COMMON_WIDGETS,
  "rnai",
  "variation",
  "transgene",
  "go",
  "anatomy",
] as const;

// Search result types
export interface SearchResult {
  id: string;
  label: string;
  class: string;
  taxonomy?: string;
  description?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

// Entity response types
export interface EntityData {
  id: string;
  class: string;
  name?: {
    id: string;
    label: string;
    class: string;
  };
  [key: string]: unknown;
}

export interface WidgetData {
  name: string;
  fields: Record<string, unknown>;
}

// Gene-specific types
export interface GeneOverview {
  name: EntityData;
  description?: string;
  sequence_name?: string;
  concise_description?: string;
  legacy_information?: string;
  locus?: string;
  other_names?: string[];
  status?: string;
  taxonomy?: string;
  also_refers_to?: EntityData[];
  merged_into?: EntityData;
  classification?: {
    type?: string;
    is_defined_by_mutation?: boolean;
  };
}

export interface GeneExpression {
  expression_patterns?: EntityData[];
  expression_cluster?: EntityData[];
  anatomy_terms?: EntityData[];
  life_stages?: EntityData[];
  microarray?: EntityData[];
}

export interface GenePhenotype {
  phenotype?: EntityData[];
  phenotype_by_interaction?: EntityData[];
  phenotype_not_observed?: EntityData[];
}

// Interaction types
export interface Interaction {
  interactor: EntityData;
  type: string;
  direction?: string;
  phenotype?: EntityData;
  citations?: EntityData[];
}

export interface InteractionData {
  physical?: Interaction[];
  genetic?: Interaction[];
  regulatory?: Interaction[];
}
