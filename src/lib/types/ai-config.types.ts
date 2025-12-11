/**
 * Types pour la configuration des services IA
 * ZERO any types
 */

export type AIService = 'openai' | 'anthropic';

export interface AIServiceConfig {
  id?: string;
  service: AIService;
  label: string;
  enabled: boolean;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  isActive?: boolean;
  totalRequestsCount?: number;
  totalTokensUsed?: number;
}

export interface AIUsageStats {
  totalRequests: number;
  usedRequests: number;
  totalTokens: number;
  totalCostUsd: number;
}
