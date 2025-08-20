import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { z } from "zod";
import type { AIHabitsResponse } from "../types";

// Zod schema for AI response validation
export const habitsSchema = z.object({
  habits: z.array(
    z.object({
      name: z.string().describe("习惯名称，简洁明了"),
      description: z.string().describe("习惯描述，为什么有助于达成目标"),
      difficulty: z.enum(["简单", "中等", "困难"]).describe("习惯难度"),
      frequency: z.string().describe("建议频率，如：每天、每周3次"),
      tips: z.string().describe("执行建议"),
    })
  ),
});

/**
 * 生成习惯建议的函数
 * @param goalName 目标名称
 * @param apiKey Google Gemini API Key
 * @returns Promise<AIHabitsResponse>
 */
export async function generateHabitsForGoal(
  goalName: string,
  apiKey: string
): Promise<AIHabitsResponse> {
  try {
    const google = createGoogleGenerativeAI({ apiKey });
    const result = await streamObject({
      model: google("gemini-2.0-flash-exp"),
      schema: habitsSchema,
      prompt: `
        作为一个习惯养成专家，请为目标"${goalName}"生成10个有效的习惯建议。

        要求：
        1. 习惯要具体可执行，不要太宽泛
        2. 从易到难排列，适合逐步建立
        3. 涵盖不同方面（行为、心态、技能等）
        4. 适合中国用户的生活场景
        5. 每个习惯都要说明它如何帮助达成目标
        6. 频率建议要实用（如：每天、每周3次、每月1次等）
        7. 执行建议要具体可操作

        目标："${goalName}"

        请确保习惯建议多样化，包括：
        - 日常行为习惯
        - 学习提升习惯  
        - 心态调整习惯
        - 健康相关习惯
        - 社交或沟通习惯
      `,
    });

    // 等待流完成并获取最终结果
    let finalObject = null;
    for await (const partialObject of result.partialObjectStream) {
      if (partialObject) {
        finalObject = partialObject;
      }
    }

    if (!finalObject || !finalObject.habits) {
      throw new Error("AI 生成失败，请重试");
    }

    return finalObject as AIHabitsResponse;
  } catch (error: unknown) {
    console.error("AI 习惯生成错误:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("API 密钥无效，请检查设置");
      } else if (error.message.includes("quota")) {
        throw new Error("API 使用配额已用完");
      } else if (error.message.includes("network")) {
        throw new Error("网络连接错误，请检查网络");
      }
      throw new Error(`AI 生成失败: ${error.message}`);
    }

    throw new Error("AI 生成失败，请重试");
  }
}

/**
 * 验证 API Key 格式
 * @param apiKey API Key
 * @returns boolean
 */
export function validateApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== "string") {
    return false;
  }

  // Google Gemini API key format: AIza...
  if (apiKey.startsWith("AIza") && apiKey.length === 39) {
    return true;
  }

  // Also accept other formats (for flexibility)
  if (apiKey.length > 20) {
    return true;
  }

  return false;
}

/**
 * 获取示例习惯（当 AI 不可用时的备选方案）
 * @param goalName 目标名称
 * @returns AIHabitsResponse
 */
export function getExampleHabits(goalName: string): AIHabitsResponse {
  const baseHabits = [
    {
      name: `每天为"${goalName}"制定小目标`,
      description: "将大目标分解为每日可执行的小任务，增加成就感",
      difficulty: "简单" as const,
      frequency: "每天",
      tips: "每天早上花5分钟计划今日要为目标做的一件具体事情",
    },
    {
      name: "记录每日进展",
      description: "跟踪自己的进步，保持动力和方向感",
      difficulty: "简单" as const,
      frequency: "每天",
      tips: "睡前花2-3分钟写下今天为目标做的努力",
    },
    {
      name: "每周复盘与调整",
      description: "定期评估策略效果，优化行动方案",
      difficulty: "中等" as const,
      frequency: "每周1次",
      tips: "周日晚上花15分钟回顾本周进展，调整下周计划",
    },
    {
      name: "寻找相关学习资源",
      description: "持续学习与目标相关的知识和技能",
      difficulty: "中等" as const,
      frequency: "每周2-3次",
      tips: "利用通勤时间听播客、看文章或视频",
    },
    {
      name: "与他人分享目标",
      description: "获得外部支持和督促，增加责任感",
      difficulty: "中等" as const,
      frequency: "每月1-2次",
      tips: "选择信任的朋友定期汇报进展，寻求建议",
    },
  ];

  return { habits: baseHabits };
}

/**
 * 轻量测试 API Key 的可用性（联通性）
 * 不产生实际业务消耗，仅请求一个极小的对象结构
 */
export async function testAIConnectivity(
  apiKey: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const google = createGoogleGenerativeAI({ apiKey });
    const schema = z.object({ pong: z.literal("pong") });

    const result = await streamObject({
      model: google("gemini-2.0-flash-exp"),
      schema,
      prompt: '请只返回一个 JSON 对象：{ "pong": "pong" }，不要包含多余文本。',
    });

    let finalObject: { pong?: string } | null = null;
    for await (const partialObject of result.partialObjectStream) {
      if (partialObject) {
        finalObject = partialObject as { pong?: string };
      }
    }

    const data = finalObject;
    if (data && data.pong === "pong") {
      return { ok: true, message: "联通性正常" };
    }
    return { ok: false, message: "返回结果异常，请稍后重试" };
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("API key")) {
        return { ok: false, message: "API 密钥无效或权限不足" };
      }
      if (err.message.includes("quota")) {
        return { ok: false, message: "API 配额不足或已用完" };
      }
      if (err.message.includes("network")) {
        return { ok: false, message: "网络连接错误，请检查网络" };
      }
      return { ok: false, message: `测试失败：${err.message}` };
    }
    return { ok: false, message: "测试失败，请稍后重试" };
  }
}
