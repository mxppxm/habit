import { useState, useCallback } from "react";
import {
  generateHabitsForGoal,
  getExampleHabits,
  validateApiKey,
} from "../services/aiService";
import type { AIHabitsResponse } from "../types";

interface UseAIResult {
  isValidApiKey: boolean;
  isGenerating: boolean;
  error: string | null;
  generateHabits: (goalName: string) => Promise<AIHabitsResponse | null>;
  clearError: () => void;
}

export function useAI(apiKey: string): UseAIResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidApiKey = validateApiKey(apiKey);

  const generateHabits = useCallback(
    async (goalName: string): Promise<AIHabitsResponse | null> => {
      if (!goalName.trim()) {
        setError("请输入目标名称");
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        let result: AIHabitsResponse;

        if (isValidApiKey) {
          // 使用 AI 生成
          result = await generateHabitsForGoal(goalName, apiKey);
        } else {
          // 使用示例数据
          console.warn("使用示例数据，因为 API Key 无效或未设置");
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟 API 延迟
          result = getExampleHabits(goalName);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "AI 生成失败，请重试";
        setError(errorMessage);

        // 如果 AI 失败，返回示例数据作为备选
        console.warn("AI 生成失败，使用示例数据作为备选");
        return getExampleHabits(goalName);
      } finally {
        setIsGenerating(false);
      }
    },
    [apiKey, isValidApiKey]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isValidApiKey,
    isGenerating,
    error,
    generateHabits,
    clearError,
  };
}
