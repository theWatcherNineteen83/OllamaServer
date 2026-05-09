import {tags} from "../api/OllamaApi.ts";
import {modelRecommendList, ModelRecommend} from "./ModelRecommend.ts";

// Remote fallback URL for model recommendations (can be updated without app release)
const REMOTE_RECOMMEND_URL = 'https://raw.githubusercontent.com/theWatcherNineteen83/OllamaServer/refs/heads/master/app/settings/ModelRecommend.ts';

/**
 * Fetch model recommendations, merging remote list with locally installed models.
 * Falls back to built-in list if remote is unreachable.
 */
export const fetchModelRecommendations = async (): Promise<ModelRecommend[]> => {
    // Try remote list first
    try {
        const response = await fetch(REMOTE_RECOMMEND_URL, { cache: 'no-cache' });
        if (response.ok) {
            const text = await response.text();
            // Extract model list from the TypeScript source
            const match = text.match(/modelRecommendList[^=]*=\s*(\[[\s\S]*?\])/);
            if (match) {
                const parsed: ModelRecommend[] = eval(match[1]);
                return mergeWithLocal(parsed);
            }
        }
    } catch {
        // Fall back to built-in list
    }
    return mergeWithLocal(modelRecommendList);
};

/**
 * Get locally installed models as recommendations with size info.
 */
const mergeWithLocal = async (remote: ModelRecommend[]): Promise<ModelRecommend[]> => {
    const merged = [...remote];
    try {
        const local = await tags();
        for (const model of local.models) {
            const name = model.name;
            if (!merged.some(m => m.modelName === name)) {
                const sizeGB = (model.size / 1e9).toFixed(1) + 'GB';
                const sizeMB = (model.size / 1e6).toFixed(0) + 'MB';
                const description = model.size > 1e9 ? sizeGB : sizeMB;
                merged.unshift({
                    modelName: name,
                    description: `Installed · ${description}`,
                });
            }
        }
    } catch {
        // Server may not be running
    }
    return merged;
};
