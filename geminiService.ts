
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DailyRation, Meal, ActivityLevel, DietParameter } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function calculateTargetCalories(profile: UserProfile): number {
  const { gender, weight, height, age, activityLevel } = profile;
  let kfa = 1.1;
  if (activityLevel === ActivityLevel.LIGHT) kfa = 1.3;
  if (activityLevel === ActivityLevel.ATHLETE || activityLevel === ActivityLevel.HEAVY) kfa = 1.5;
  let bmr = gender === 'female' 
    ? 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age)
    : 66 + (13.7 * weight) + (5 * height) - (6.76 * age);
  return Math.round(bmr * kfa);
}

function calculateTargetProtein(profile: UserProfile): number {
  const { weight, activityLevel } = profile;
  let multiplier = 0.75;
  if (activityLevel === ActivityLevel.LIGHT) multiplier = 1.3;
  if (activityLevel === ActivityLevel.ATHLETE || activityLevel === ActivityLevel.HEAVY) multiplier = 1.6;
  return Math.round(weight * multiplier);
}

function getDietaryConstraints(diets: DietParameter[]): string {
  let constraints = "";
  if (diets.includes(DietParameter.DIABETES)) constraints += "\n- STRICT DIABETES: Low Glycemic Index, no added sugars.";
  if (diets.includes(DietParameter.GLUTEN_FREE)) constraints += "\n- STRICT GLUTEN-FREE: Exclude wheat, rye, barley.";
  if (diets.includes(DietParameter.LACTOSE_FREE)) constraints += "\n- STRICT LACTOSE-FREE: Exclude animal dairy.";
  return constraints;
}

export async function generateDailyRation(profile: UserProfile, date?: Date): Promise<DailyRation> {
  const lang = profile.language === 'en' ? 'English' : 'Russian';
  const dietRules = getDietaryConstraints(profile.dietParameters);
  const dateStr = date ? date.toLocaleDateString() : 'today';
  const targetKcal = calculateTargetCalories(profile);
  const targetProtein = calculateTargetProtein(profile);
  
  // Explicit instruction to find real images from the requested sites
  const prompt = `Generate TWO distinct healthy meal plan options for ${dateStr} for a user:
    Name: ${profile.name}, Age: ${profile.age}, Height: ${profile.height}cm, Weight: ${profile.weight}kg, Gender: ${profile.gender}, Activity: ${profile.activityLevel}
    STRICT Allergy/Restriction Exclusions: ${profile.dietParameters.join(', ')}
    ${dietRules}
    
    NUTRITION TARGETS:
    - Daily Calories: ~${targetKcal} kcal
    - Daily Protein: ~${targetProtein} g
    
    IMAGE SEARCH MODULE INSTRUCTION:
    Use the Google Search tool to find REAL, high-quality image URLs for each dish and drink. 
    Prioritize images from these sources if possible:
    - edimdoma.ru
    - russianfood.com
    - liquor.com
    - coffeeaffection.com
    - unsplash.com
    - pexels.com
    
    Response Language: ${lang}.
    
    CRITICAL: 
    1. Each option MUST have 1 Breakfast, 1 Lunch, 1 Dinner, and 1 Snack.
    2. Breakfast, Lunch, and Dinner MUST have an 'attached drink' in the 'drink' field.
    3. The 'imageUrl' field for every meal and drink MUST be a valid, real-world direct image URL found via search.
    4. Provide full recipes (ingredients/instructions) for all meals and drinks.
    
    Output JSON only.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            minItems: 2,
            items: {
              type: Type.OBJECT,
              properties: {
                totalKcal: { type: Type.NUMBER },
                totalProtein: { type: Type.NUMBER },
                totalFat: { type: Type.NUMBER },
                totalCarbs: { type: Type.NUMBER },
                meals: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink'] },
                      kcal: { type: Type.NUMBER },
                      protein: { type: Type.NUMBER },
                      fat: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      time: { type: Type.NUMBER },
                      imageUrl: { type: Type.STRING, description: 'REAL direct image URL found via search' },
                      drink: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          name: { type: Type.STRING },
                          type: { type: Type.STRING, enum: ['Drink'] },
                          kcal: { type: Type.NUMBER },
                          protein: { type: Type.NUMBER },
                          fat: { type: Type.NUMBER },
                          carbs: { type: Type.NUMBER },
                          time: { type: Type.NUMBER },
                          imageUrl: { type: Type.STRING, description: 'REAL direct image URL found via search' },
                          ingredients: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                name: { type: Type.STRING },
                                amount: { type: Type.STRING }
                              },
                              required: ['name', 'amount']
                            }
                          },
                          instructions: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                stepNumber: { type: Type.NUMBER },
                                text: { type: Type.STRING }
                              },
                              required: ['stepNumber', 'text']
                            }
                          }
                        },
                        required: ['id', 'name', 'type', 'kcal', 'protein', 'fat', 'carbs', 'time', 'ingredients', 'instructions', 'imageUrl']
                      },
                      ingredients: { 
                        type: Type.ARRAY, 
                        items: { 
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            amount: { type: Type.STRING }
                          },
                          required: ['name', 'amount']
                        } 
                      },
                      instructions: { 
                        type: Type.ARRAY, 
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            stepNumber: { type: Type.NUMBER },
                            text: { type: Type.STRING }
                          },
                          required: ['stepNumber', 'text']
                        }
                      }
                    },
                    required: ['id', 'name', 'type', 'kcal', 'protein', 'fat', 'carbs', 'time', 'ingredients', 'instructions', 'imageUrl']
                  }
                }
              },
              required: ['totalKcal', 'totalProtein', 'totalFat', 'totalCarbs', 'meals']
            }
          }
        },
        required: ['date', 'options']
      }
    }
  });

  const ration = JSON.parse(response.text?.trim() || "{}");
  if (date) ration.date = date.toISOString();
  return ration;
}

export async function generateRecipeFromPrompt(dishPrompt: string, profile: UserProfile): Promise<Meal> {
  const lang = profile.language === 'en' ? 'English' : 'Russian';
  const dietRules = getDietaryConstraints(profile.dietParameters);
  const prompt = `Create a structured healthy recipe for "${dishPrompt}" in ${lang}.
    Constraints: ${profile.dietParameters.join(', ')} ${dietRules}
    Use the Google Search tool to find a REAL high-quality image URL for this dish from sites like unsplash.com, pexels.com or russianfood.com.
    Output JSON only.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink'] },
          kcal: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          time: { type: Type.NUMBER },
          imageUrl: { type: Type.STRING },
          ingredients: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.STRING }
              },
              required: ['name', 'amount']
            } 
          },
          instructions: { 
            type: Type.ARRAY, 
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.NUMBER },
                text: { type: Type.STRING }
              },
              required: ['stepNumber', 'text']
            }
          }
        },
        required: ['id', 'name', 'type', 'kcal', 'protein', 'fat', 'carbs', 'time', 'ingredients', 'instructions', 'imageUrl']
      }
    }
  });

  return JSON.parse(response.text?.trim() || "{}");
}
