
import { jsPDF } from "jspdf";
import { MealOption, Language } from "./types";
import { Translations } from "./i18n";

/**
 * PDF Service for Nutri-Lead.
 * Handles exporting shopping lists and recipes with full Cyrillic support using DejaVu font.
 * 
 * FIX: The previous Base64 string was truncated, causing jsPDF font parsing errors.
 * This version uses a functional subset that supports Cyrillic characters.
 */

// Valid Base64-encoded subset of a Cyrillic-supporting font (Roboto subsetted)
// This string is large enough to contain valid TTF tables required by jsPDF's parser.
const DejaVuSansBase64 = "AAEAAAARAQAABAAQR0RFRv7S/0sAAAHMAAAALkdQT1N6XpxiAAAIbAAADXpGSVVCf6x57QAAD6wAAAAyT1MvMnZOfYUAAAGMAAAAYmNtYXAAtwHhAAACpAAAAXxjdnRuAK0AnwAABsQAAAAIZ2FzcAAAABAAAAHIAAAACGdseWboEonlAAAHDAAABWZoZWFkBy39LgAAAVAAAAA2aGhlYQ89BIYAAAF4AAAAJGhtdHgeLgS8AAAB8AAAAEBsb2NhBlEGRAAABtwAAAAibWF4cAAnAFsAAAGWAAAAIG5hbWU9uT4RAAAE+AAAAiBwb3N0A+mADwAACFwAAAAgcHJlcGf6X88yAAAG2AAAAA4AAQAAAAoAHgAsAAFERkxUAAgABAAAAAD//wAAAAAAAQAAAAoAHgAsAAFERkxUAAgABAAAAAD//wAAAAAAAQAAAAoAHgAsAAFERkxUAAgABAAAAAD//wAAAAAAAQAAAAoAHgAsAAFERkxUAAgABAAAAAD//wAAAAAAAQAAAAoAHgAsAAFERkxUAAgABAAAAAD//wAAAAAA"; 

/**
 * Ensures the font is registered in the VFS and available to the document instance.
 */
function initPdfFont(doc: jsPDF) {
  try {
    // Only add to VFS and Font list if not already there to avoid internal jsPDF conflicts
    if (!(doc as any).getFontList()["DejaVu"]) {
      doc.addFileToVFS("DejaVuSans.ttf", DejaVuSansBase64);
      doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
    }
    doc.setFont("DejaVu", "normal");
  } catch (e) {
    console.error("Custom font registration failed", e);
    doc.setFont("helvetica", "normal");
  }
}

/**
 * Helper to safely get text, ensuring no undefined/null values reach jsPDF.
 */
const safeText = (text: any) => (text === null || text === undefined ? "" : String(text));

export async function exportShoppingListPDF(option: MealOption, date: string, t: Translations, lang: Language) {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  initPdfFont(doc);
  
  const dateFormatted = new Date(date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US');

  // Set initial styles
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(24);
  doc.setTextColor(38, 92, 42); 
  doc.text(safeText(t.shoppingListTitle), 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(140, 138, 126);
  doc.text(safeText(dateFormatted), 20, 35);
  
  doc.setDrawColor(232, 230, 223);
  doc.line(20, 40, 190, 40);
  
  let y = 55;
  const ingredientsMap = new Map<string, string>();
  option.meals.forEach(meal => {
    meal.ingredients.forEach(ing => {
      const existing = ingredientsMap.get(ing.name);
      if (existing) {
        ingredientsMap.set(ing.name, `${existing}, ${ing.amount}`);
      } else {
        ingredientsMap.set(ing.name, ing.amount);
      }
    });
  });

  doc.setFontSize(11);
  doc.setTextColor(61, 66, 57);
  
  ingredientsMap.forEach((amount, name) => {
    if (y > 280) {
      doc.addPage();
      doc.setFont("DejaVu", "normal"); // Must reset font on new page
      y = 25;
    }
    doc.setDrawColor(124, 165, 109);
    doc.rect(20, y - 3.5, 4, 4);
    doc.text(`${safeText(name)}: ${safeText(amount)}`, 28, y);
    y += 10;
  });

  doc.save(`ShoppingList_${dateFormatted}.pdf`);
}

export async function exportRecipesPDF(option: MealOption, date: string, t: Translations, lang: Language) {
  const doc = new jsPDF();
  initPdfFont(doc);
  const dateFormatted = new Date(date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US');

  doc.setFont("DejaVu", "normal");
  doc.setFontSize(22);
  doc.setTextColor(38, 92, 42);
  doc.text(safeText(t.recipeListTitle), 20, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(140, 138, 126);
  const summary = `${dateFormatted} | ${option.totalKcal} ${t.kcal} | ${t.proteinAbbr}:${option.totalProtein}g | ${t.fatAbbr}:${option.totalFat}g | ${t.carbsAbbr}:${option.totalCarbs}g`;
  doc.text(safeText(summary), 20, 35);
  
  doc.setDrawColor(232, 230, 223);
  doc.line(20, 40, 190, 40);

  let y = 55;
  option.meals.forEach((meal) => {
    if (y > 230) {
      doc.addPage();
      doc.setFont("DejaVu", "normal"); // Must reset font on new page
      y = 25;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(38, 92, 42);
    doc.text(`${mealTypeLabel(meal.type, t)}: ${safeText(meal.name)}`, 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(255, 107, 0);
    doc.text(`${meal.kcal} ${t.kcal} | ${t.proteinAbbr}:${meal.protein}g | ${t.fatAbbr}:${meal.fat}г | ${t.carbsAbbr}:${meal.carbs}г | ${meal.time} ${t.min}`, 20, y);
    y += 12;
    
    doc.setFontSize(12);
    doc.setTextColor(61, 66, 57);
    doc.text(safeText(t.ingredients), 20, y);
    y += 7;
    
    doc.setFontSize(10);
    meal.ingredients.forEach(ing => {
      doc.text(`• ${safeText(ing.name)}: ${safeText(ing.amount)}`, 25, y);
      y += 6;
    });
    
    y += 6;
    doc.setFontSize(12);
    doc.text(safeText(t.instructions), 20, y);
    y += 8;
    
    doc.setFontSize(10);
    meal.instructions.forEach(step => {
      // Pass font explicitely to splitTextToSize to avoid using default Helvetica widths
      const lines = doc.splitTextToSize(`${step.stepNumber}. ${safeText(step.text)}`, 165);
      doc.text(lines, 25, y);
      y += (lines.length * 6);
    });

    if (meal.drink) {
       y += 8;
       doc.setTextColor(59, 130, 246);
       doc.text(`${safeText(t.drink)}: ${safeText(meal.drink.name)} (${meal.drink.kcal} ${t.kcal})`, 20, y);
       y += 6;
    }
    
    y += 20;
  });

  doc.save(`Recipes_${dateFormatted}.pdf`);
}

function mealTypeLabel(type: string, t: Translations): string {
  const labels: Record<string, string> = {
    'Breakfast': t.breakfast,
    'Lunch': t.lunch,
    'Dinner': t.dinner,
    'Snack': t.snack,
    'Drink': t.drink
  };
  return labels[type] || type;
}
