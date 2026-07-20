export interface ModelConfig {
    baseURL: string
    apiKey: string
    protocol: "OpenAI" | "Google" | "Anthropic",
    serviceProvider?: string
    modelName: string
}