import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, AnalysisResult, GeminiRecipeResponse, CuisineType } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeFlyerAndSuggestRecipes = async (
  flyerImage: File,
  preferences: UserPreferences
): Promise<AnalysisResult> => {
  const base64Image = await fileToBase64(flyerImage);
  const cuisine = preferences.cuisine === CuisineType.OTHER ? preferences.customCuisine : preferences.cuisine;

  const prompt = `
    あなたは「節約料理のエキスパート」兼「鋭いツッコミを持つお笑い芸人」です。
    提供されたファイル（画像またはPDF）が「スーパーのチラシ」かどうかを判定してください。

    【ケース1：スーパーのチラシの場合】
    isFlyer: true
    予算${preferences.budget}円前後、ジャンル「${cuisine}」で、チラシの特売品(isDiscounted=true)を活用したレシピを3つ提案してください。
    joke: null

    【ケース2：チラシではない場合】
    isFlyer: false
    画像の内容を認識し、それに対して全力で「ボケ」てください。
    例えば、猫の写真なら「食べちゃいたいくらい可愛いですが、今日の晩御飯にはできません！」、風景写真なら「壮大な景色ですね！でもここには特売のキャベツは生えてなさそうです。」など、画像の内容に即したユーモアたっぷりのコメントを joke フィールドに入れてください。
    detectedDeals, recipes: 空の配列

    出力はJSON形式です。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: flyerImage.type,
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isFlyer: { type: Type.BOOLEAN, description: "画像がスーパーのチラシであればtrue、そうでなければfalse" },
            joke: { type: Type.STRING, description: "チラシでなかった場合のボケ。チラシの場合はnullまたは空文字" },
            detectedDeals: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "チラシから検出された主な特売品や食材のリスト"
            },
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "レシピ名" },
                  description: { type: Type.STRING, description: "料理の簡単な説明" },
                  cookingTimeMinutes: { type: Type.INTEGER, description: "調理時間(分)" },
                  estimatedCost: { type: Type.INTEGER, description: "推定費用(円)" },
                  savingsNote: { type: Type.STRING, description: "このレシピがどのようにお得か、チラシのどの食材を使っているか" },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        quantity: { type: Type.STRING },
                        isDiscounted: { type: Type.BOOLEAN, description: "チラシの特売品ならtrue" }
                      },
                      required: ["name", "quantity", "isDiscounted"]
                    }
                  },
                  instructions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "調理手順のリスト"
                  }
                },
                required: ["title", "description", "cookingTimeMinutes", "estimatedCost", "ingredients", "instructions", "savingsNote"]
              }
            }
          },
          required: ["isFlyer", "joke", "detectedDeals", "recipes"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(resultText) as GeminiRecipeResponse;

    // Map to internal types and add IDs
    return {
      isFlyer: data.isFlyer,
      joke: data.joke,
      detectedDeals: data.detectedDeals || [],
      recipes: (data.recipes || []).map((r, index) => ({
        ...r,
        id: `recipe-${index}-${Date.now()}`
      }))
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("チラシの解析中にエラーが発生しました。もう一度お試しください。");
  }
};