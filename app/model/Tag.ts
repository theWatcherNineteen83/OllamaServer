interface ModelDetails {
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
    parent_model?: string;
}

interface OllamaModel {
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details: ModelDetails;
}

interface OllamaTagResponse {
    models: OllamaModel[];
}
