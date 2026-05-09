export type ModelRecommend = {
    modelName: string;
    description: string;
}

export const modelRecommendList: ModelRecommend[] = [
    {
        modelName: 'deepseek-r1:1.5b',
        description: '1.1GB'
    },
    {
        modelName: 'llama3.2:1b',
        description: '1.3GB'
    },
    {
        modelName: 'qwen2.5:0.5b',
        description: '398MB'
    },
    {
        modelName: 'qwen2.5-coder:0.5b',
        description: '531MB'
    },
    {
        modelName: 'llama3.2:3b',
        description: '2.0GB'
    },
    {
        modelName: 'qwen3:0.6b',
        description: '458MB'
    },
    {
        modelName: 'qwen3:1.7b',
        description: '1.1GB'
    },
    {
        modelName: 'gemma3:1b',
        description: '820MB'
    },
    {
        modelName: 'mistral:7b',
        description: '4.1GB'
    },
    {
        modelName: 'phi4-mini:3.8b',
        description: '2.2GB'
    },
]
