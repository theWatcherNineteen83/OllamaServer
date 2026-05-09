export const DEFAULT_TEMPLATE = `{{- range .Messages }}<|im_start|>{{ .Role }}
{{ .Content }}<|im_end|>
{{ end }}<|im_start|>assistant`
export const DEFAULT_SYSTEM_PROMPT = `You are a helpful assistant.`

// Templates for common model families
export const MODEL_TEMPLATES: Record<string, string> = {
    // Llama 3 / Mistral / Gemma
    llama: `<|begin_of_text|>{{- range .Messages }}
<|start_header_id|>{{ .Role }}<|end_header_id|>

{{ .Content }}<|eot_id|>
{{- end }}<|start_header_id|>assistant<|end_header_id|>`,

    // Qwen / DeepSeek / ChatML-compatible
    chatml: DEFAULT_TEMPLATE,

    // Mistral / Command R
    mistral: `{{- range .Messages }}[INST] {{ if eq .Role "system" }}<<SYS>>{{ .Content }}<</SYS>>

{{ else if eq .Role "user" }}{{ .Content }} [/INST]
{{ else if eq .Role "assistant" }}{{ .Content }}</s>
{{ end }}{{- end }}`,

    // Phi / Gemma
    gemma: `<bos>{{- range .Messages }}
<start_of_turn>{{ .Role }}
{{ .Content }}<end_of_turn>
{{- end }}<start_of_turn>assistant`,
}
