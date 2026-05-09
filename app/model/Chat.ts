interface ToolFunction {
    name: string,
    arguments: object
}

interface ToolCall {
    id: string,
    type: "function",
    function: ToolFunction
}

interface ToolDefinition {
    type: "function",
    function: {
        name: string,
        description: string,
        parameters: {
            type: "object",
            properties: Record<string, any>,
            required?: string[],
        },
    },
}

interface Message {
    role: string,
    content: string,
    images?: string[],
    tool_calls?: ToolCall[],
}

interface ChatOptions {
    mirostat?: number,
    mirostat_eta?: number,
    mirostat_tau?: number,
    num_ctx?: number,
    repeat_last_n?: number,
    repeat_penalty?: number,
    temperature?: number,
    seed?: number,
    stop?: string[],
    tfs_z?: number,
    num_predict?: number,
    top_k?: number,
    top_p?: number,
    min_p?: number,
}

interface LoadResponse {
    model: string,
    created_at: string,
    message: Message,
    done_reason: string,
    done: boolean
}

interface ModelInfo {
    license?: string,
    modelfile?: string,
    parameters?: string,
    template?: string,
    system?: string,
    details?: ModelDetails,
}

interface ChatResponse {
    model: string,
    create_at: string,
    message: Message | null,
    done: boolean,
    total_duration: number | null,
    load_duration: number | null,
    prompt_eval_count: number | null,
    prompt_eval_duration: number | null,
    eval_count: number | null,
    eval_duration: number | null,
    error?: Error;
}

type ChatSessionType = {
    promise: Promise<void>;
    abort: () => void;
};
