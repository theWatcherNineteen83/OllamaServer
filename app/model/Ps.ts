interface ModelDetails {
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
    parent_model?: string;
}

interface OllamaRunningModel {
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details: ModelDetails;
    expires_at: string,
    size_vram: string
}

interface OllamaPsResponse {
    models: OllamaRunningModel[]
}
