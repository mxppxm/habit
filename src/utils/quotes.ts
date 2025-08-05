import { v4 as uuidv4 } from "uuid";
import { getAllData, addData } from "../services/db";

// 励志名言数据和API
export interface Quote {
  text: string;
  author: string;
  category?: string;
  translation?: string; // 翻译内容
}

// 数据库存储的名言格式
export interface StoredQuote {
  id: string;
  text: string;
  author: string;
  category: string;
  translation?: string;
  fetchDate: string; // YYYY-MM-DD 格式
}

// 本地中文励志名言库
export const chineseQuotes: Quote[] = [
  {
    text: "今天的努力，是幸运的伏笔",
    author: "anonymous",
    category: "努力",
  },
  {
    text: "每一次的坚持，都是成功的积累",
    author: "anonymous",
    category: "坚持",
  },
  {
    text: "微小的进步，也是向前的力量",
    author: "anonymous",
    category: "进步",
  },
  {
    text: "习惯的力量，在于日复一日的坚持",
    author: "anonymous",
    category: "习惯",
  },
  {
    text: "不积跬步，无以至千里",
    author: "荀子",
    category: "坚持",
  },
  {
    text: "千里之行，始于足下",
    author: "老子",
    category: "开始",
  },
  {
    text: "宝剑锋从磨砺出，梅花香自苦寒来",
    author: "anonymous",
    category: "努力",
  },
  {
    text: "天行健，君子以自强不息",
    author: "《易经》",
    category: "自强",
  },
  {
    text: "路虽远，行则将至；事虽难，做则必成",
    author: "《荀子》",
    category: "行动",
  },
  {
    text: "业精于勤，荒于嬉；行成于思，毁于随",
    author: "韩愈",
    category: "勤奋",
  },
  {
    text: "莫等闲，白了少年头，空悲切",
    author: "岳飞",
    category: "时间",
  },
  {
    text: "山不厌高，水不厌深",
    author: "曹操",
    category: "追求",
  },
  {
    text: "今日的习惯，决定明天的你",
    author: "anonymous",
    category: "习惯",
  },
  {
    text: "专注当下，每一天都是新的开始",
    author: "anonymous",
    category: "专注",
  },
  {
    text: "成功不是偶然，而是习惯的必然",
    author: "anonymous",
    category: "成功",
  },
  {
    text: "小步快跑，胜过原地踏步",
    author: "anonymous",
    category: "行动",
  },
  {
    text: "越努力，越幸运",
    author: "anonymous",
    category: "努力",
  },
  {
    text: "改变，从今天开始",
    author: "anonymous",
    category: "改变",
  },
  {
    text: "每个优秀的人，都有一段沉默的时光",
    author: "anonymous",
    category: "成长",
  },
  {
    text: "你的坚持，终将美好",
    author: "anonymous",
    category: "坚持",
  },
];

// 获取随机中文名言
export const getRandomChineseQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * chineseQuotes.length);
  return chineseQuotes[randomIndex];
};

// 获取今天的日期字符串 (YYYY-MM-DD)
const getTodayDateString = (): string => {
  return new Date().toISOString().split("T")[0];
};

// 检查今天是否已经获取过API名言
const checkTodayQuoteFetched = async (): Promise<boolean> => {
  try {
    const storedQuotes = await getAllData<StoredQuote>("quotes");
    const today = getTodayDateString();
    return storedQuotes.some(
      (quote) => quote.fetchDate === today && quote.fetchDate !== "local"
    );
  } catch (error) {
    console.warn("Failed to check today quote:", error);
    return false;
  }
};

// 从数据库获取随机名言
const getRandomStoredQuote = async (): Promise<Quote | null> => {
  try {
    const storedQuotes = await getAllData<StoredQuote>("quotes");
    if (storedQuotes.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * storedQuotes.length);
    const selectedQuote = storedQuotes[randomIndex];
    return {
      text: selectedQuote.text,
      author: selectedQuote.author,
      category: selectedQuote.category,
      translation: selectedQuote.translation,
    };
  } catch (error) {
    console.warn("Failed to get stored quote:", error);
    return null;
  }
};

// 存储名言到数据库
const storeQuoteToDb = async (quote: Quote, isLocal = false): Promise<void> => {
  try {
    const storedQuote: StoredQuote = {
      id: uuidv4(),
      text: quote.text,
      author: quote.author,
      category: quote.category || "励志",
      translation: quote.translation,
      fetchDate: isLocal ? "local" : getTodayDateString(),
    };
    await addData("quotes", storedQuote);
  } catch (error) {
    console.warn("Failed to store quote:", error);
  }
};

// 初始化本地名言到数据库
const initLocalQuotesToDb = async (): Promise<void> => {
  try {
    const storedQuotes = await getAllData<StoredQuote>("quotes");
    const hasLocalQuotes = storedQuotes.some(
      (quote) => quote.fetchDate === "local"
    );

    if (!hasLocalQuotes) {
      // 如果数据库中没有本地名言，则添加所有本地名言
      for (const quote of chineseQuotes) {
        await storeQuoteToDb(quote, true);
      }
    }
  } catch (error) {
    console.warn("Failed to init local quotes:", error);
  }
};

// 天行励志名言API
export const fetchTianApiQuote = async (): Promise<Quote | null> => {
  try {
    const response = await fetch(
      "https://apis.tianapi.com/lzmy/index?key=432c0b841243b3a3c64459d0fe9fcc4a"
    );
    if (!response.ok) {
      throw new Error("API request failed");
    }
    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(`API error: ${data.msg}`);
    }

    return {
      text: data.result.saying, // 显示原文
      author: data.result.source,
      category: "励志",
      translation: data.result.transl, // 保存翻译用于tooltip
    };
  } catch (error) {
    console.warn("Failed to fetch TianApi quote:", error);
    return null;
  }
};

// 获取名言 - 每天第一次调用API，所有名言统一从数据库随机取
export const getRandomQuote = async (): Promise<Quote> => {
  try {
    // 初始化本地名言到数据库
    await initLocalQuotesToDb();

    // 检查今天是否已经获取过API名言
    const todayFetched = await checkTodayQuoteFetched();

    if (!todayFetched) {
      // 今天第一次，尝试调用API获取并存储
      const apiQuote = await fetchTianApiQuote();
      if (apiQuote) {
        await storeQuoteToDb(apiQuote);
      }
    }

    // 从数据库随机获取名言（包含本地名言和API名言）
    const storedQuote = await getRandomStoredQuote();
    if (storedQuote) {
      return storedQuote;
    }
  } catch (error) {
    console.warn("Failed to get quote from database:", error);
  }

  // 兜底：返回本地名言
  return getRandomChineseQuote();
};

// 刷新名言 - 从数据库随机取（包含本地名言和API名言）
export const getRefreshQuote = async (): Promise<Quote> => {
  try {
    // 确保本地名言已初始化到数据库
    await initLocalQuotesToDb();

    const storedQuote = await getRandomStoredQuote();
    if (storedQuote) {
      return storedQuote;
    }
  } catch (error) {
    console.warn("Failed to get refresh quote:", error);
  }

  // 兜底：返回本地名言
  return getRandomChineseQuote();
};

// 按分类获取中文名言
export const getQuoteByCategory = (category: string): Quote => {
  const categoryQuotes = chineseQuotes.filter(
    (quote) => quote.category === category
  );
  if (categoryQuotes.length === 0) {
    return getRandomChineseQuote();
  }
  const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
  return categoryQuotes[randomIndex];
};

// 获取所有分类
export const getCategories = (): string[] => {
  const categories = new Set(
    chineseQuotes
      .map((quote) => quote.category)
      .filter((category): category is string => Boolean(category))
  );
  return Array.from(categories);
};
