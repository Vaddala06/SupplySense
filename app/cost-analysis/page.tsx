"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
    DollarSign, 
    TrendingDown, 
    Package, 
    Truck, 
    Zap, 
    AlertTriangle, 
    Info, 
    BrainCircuit,
    Link as LinkIcon 
} from "lucide-react"

// --- TypeScript Interfaces ---
interface Product {
  id: string;
  name: string;
  unitCost: number;
  shipping: number;
  storage: number; 
  carryingCost: number; 
  totalLanded: number;
  margin: number; 
  turnover: number; 
  daysInInventory: number; 
  isChanged?: boolean;
  changeSummary?: { 
    [K in keyof Omit<Product, 'id' | 'name' | 'isChanged' | 'changeSummary' | 'margin' | 'turnover'>]?: { 
      originalValue: number | string; 
      newValue: number | string; 
      reasoning?: string; 
    } 
  };
}

interface PerplexityChangeDetail {
  productId: string;
  field: keyof Omit<Product, 'id' | 'name' | 'isChanged' | 'changeSummary' | 'totalLanded' | 'margin' | 'turnover'>;
  newValue: number | string; 
  reasoning?: string;
}

interface PerplexityOptimizationOption {
  id: string;
  title: string;
  description: string;
  estimatedSavings: number;
  impact: "High" | "Medium" | "Low" | "Very High";
  detailedChanges: PerplexityChangeDetail[];
  category?: string; 
  webFindings?: string; 
}

// --- Initial Data & Helper Functions ---
const initialBaseProductsData: Omit<Product, 'totalLanded' | 'isChanged' | 'changeSummary'>[] = [
    { id: "WDG-001", name: "Wireless Bluetooth Headphones", unitCost: 45.0, shipping: 3.5, storage: 0.8, carryingCost: 15, margin: 48.0, turnover: 4.2, daysInInventory: 87 },
    { id: "SMT-002", name: "Smartphone Case - Silicone", unitCost: 8.5, shipping: 1.2, storage: 0.15, carryingCost: 12, margin: 46.7, turnover: 6.8, daysInInventory: 54 },
    { id: "CHG-003", name: "USB-C Fast Charger 65W", unitCost: 22.0, shipping: 2.8, storage: 0.4, carryingCost: 18, margin: 45.8, turnover: 3.6, daysInInventory: 101 },
    { id: "SPK-004", name: "Portable Bluetooth Speaker", unitCost: 35.0, shipping: 4.2, storage: 0.6, carryingCost: 20, margin: 47.0, turnover: 2.4, daysInInventory: 152 },
    { id: "CAB-005", name: "Lightning to USB Cable", unitCost: 12.0, shipping: 1.5, storage: 0.2, carryingCost: 10, margin: 41.1, turnover: 5.4, daysInInventory: 68 },
];

const calculateTotalLandedCost = (product: Pick<Product, 'unitCost' | 'shipping' | 'storage' | 'carryingCost'>): number => {
    const unitCost = Number(product.unitCost) || 0;
    const shipping = Number(product.shipping) || 0;
    const storage = Number(product.storage) || 0;
    const carryingCostPercent = Number(product.carryingCost) || 0;
    return unitCost + shipping + storage + (unitCost * carryingCostPercent / 100);
};

const processedInitialInventory: Product[] = initialBaseProductsData.map(p => ({
    ...p,
    totalLanded: calculateTotalLandedCost(p)
}));

function SpinnerIcon({ className = "h-8 w-8 text-blue-600" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

// --- Main Page Component ---
export default function CostRecommendationsPage() {
  const [baseInventory, setBaseInventory] = useState<Product[]>(processedInitialInventory);
  const [perplexityOptions, setPerplexityOptions] = useState<PerplexityOptimizationOption[]>([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isLoadingPerplexity, setIsLoadingPerplexity] = useState<boolean>(true);
  const [perplexityError, setPerplexityError] = useState<string | null>(null);
  const [apiCitations, setApiCitations] = useState<string[]>([]);

  const tagColors = [ // For numbered tags
    "bg-blue-600", "bg-emerald-600", "bg-indigo-600", "bg-rose-600", "bg-amber-600",
    "bg-sky-600", "bg-lime-600", "bg-fuchsia-600", "bg-red-600", "bg-teal-600"
  ];

  useEffect(() => {
    if (baseInventory && baseInventory.length > 0) {
      const fetchOptions = async () => {
        setIsLoadingPerplexity(true);
        setPerplexityError(null);
        setApiCitations([]); 
        try {
          const systemPrompt = `You are an expert inventory cost optimization AI. Analyze the provided inventory data. Your goal is to identify 3 to 5 distinct and actionable cost-saving strategies. For each strategy, you MUST provide:
1.  A unique "id" string (e.g., "switch-supplier-wdg001", "consolidate-shipments-electronics").
2.  A "title" string (max 10 words, e.g., "Negotiate Bulk Discount for WDG-001").
3.  A "description" string (max 30 words, detailing the action).
4.  An "estimatedSavings" number (total monetary savings for implementing this single strategy across affected products).
5.  An "impact" string: "High", "Medium", or "Low". (Please ensure you provide one of these exact strings).
6.  A "detailedChanges" array of objects. Each object MUST specify:
    a.  "productId": The ID of the product from the input inventory to change.
    b.  "field": The specific product field to change. Values for "field" must be one of: "unitCost", "shipping", "storage", "carryingCost", "daysInInventory".
    c.  "newValue": The new numeric value for that field. (If changing 'daysInInventory', ensure it's a whole number. For 'carryingCost', it's a percentage).
    d.  "reasoning": A brief (max 15 words) justification for this specific change.
7.  (Optional) A "webFindings" string (max 50 words) summarizing any web research for cheaper options, tariffs, or regulations relevant to this strategy.

IMPORTANT: Your entire response MUST be a single, valid JSON array of these strategy objects. Do not include any introductory text, explanations, or markdown formatting outside the JSON array itself.`;
          const userPrompt = `Here is the current inventory data:
${JSON.stringify(baseInventory.map(({ id, name, unitCost, shipping, storage, carryingCost, daysInInventory, turnover }) => ({ id, name, unitCost, shipping, storage, carryingCost, daysInInventory, turnover })), null, 2)}

Please provide 3-5 cost optimization strategies in the specified JSON format.`;
          
          console.log("--- Sending to /api/perplexity --- Model: sonar-pro");
          
          const response = await fetch("/api/perplexity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "sonar-pro", messages: [ { role: "system", content: systemPrompt }, { role: "user", content: userPrompt } ] }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: "Failed to parse error response" } }));
            throw new Error( errorData.error?.message || `API request failed: ${response.status}` );
          }

          const result = await response.json();
          let strategies: PerplexityOptimizationOption[] = [];

          if (result?.citations && Array.isArray(result.citations)) {
            setApiCitations(result.citations.filter((c: any) => typeof c === 'string'));
          }

          if (result?.choices?.[0]?.message?.content) {
            const contentString = result.choices[0].message.content;
            try {
              strategies = JSON.parse(contentString);
              if (!Array.isArray(strategies)) throw new Error("Parsed content not an array.");
            } catch (e: any) {
              const jsonMatch = contentString.match(/```json\n([\s\S]*?)\n```/);
              if (jsonMatch?.[1]) {
                  try { strategies = JSON.parse(jsonMatch[1]);
                      if (!Array.isArray(strategies)) throw new Error("Extracted content not an array.");
                  } catch (e2: any) { throw new Error(`Invalid JSON after code block extraction: ${e2.message}`); }
              } else { throw new Error(`Content not valid JSON: ${e.message}`); }
            }
          } else {
            throw new Error("Incomplete/malformed data from Perplexity AI.");
          }
          
          const validatedStrategies = strategies.filter(s => s && s.id && s.title && Array.isArray(s.detailedChanges) && s.impact);
          setPerplexityOptions(validatedStrategies.map(s => ({...s, impact: s.impact || "Medium", detailedChanges: Array.isArray(s.detailedChanges) ? s.detailedChanges : [] })));

        } catch (err: any) {
          console.error("Error fetching Perplexity options:", err);
          setPerplexityError(err.message || "Unknown error fetching suggestions.");
        } finally {
          setIsLoadingPerplexity(false);
        }
      };
      fetchOptions();
    } else {
        setIsLoadingPerplexity(false);
    }
  }, [baseInventory]);

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  const optimizedDisplayProducts = useMemo((): Product[] => {
    let workingInventory: Product[] = JSON.parse(JSON.stringify(baseInventory)); 
    if (selectedOptionIds.length === 0) {
      return baseInventory.map(p => ({ ...p, isChanged: false, changeSummary: {} }));
    }

    selectedOptionIds.forEach((optionId) => {
      const selectedOption = perplexityOptions.find((opt) => opt.id === optionId);
      if (selectedOption?.detailedChanges) {
        selectedOption.detailedChanges.forEach((change) => {
          const productIndex = workingInventory.findIndex((p) => p.id === change.productId);
          if (productIndex !== -1) {
            const productToUpdate = workingInventory[productIndex];
            const fieldToChange = change.field;
            let parsedNewValue = change.newValue;
            const originalProductFieldType = typeof (baseInventory.find(p=>p.id === change.productId) as any)?.[fieldToChange];

            if (originalProductFieldType === 'number') {
                parsedNewValue = parseFloat(String(change.newValue));
                if (isNaN(parsedNewValue)) parsedNewValue = (productToUpdate as any)[fieldToChange]; 
            }
            (productToUpdate as any)[fieldToChange] = parsedNewValue;

            if (["unitCost", "shipping", "storage", "carryingCost"].includes(fieldToChange as string)) {
                productToUpdate.totalLanded = calculateTotalLandedCost(productToUpdate);
            }
          }
        });
      }
    });
    
    return workingInventory
        .map(optimizedProduct => {
            const originalProduct = baseInventory.find(op => op.id === optimizedProduct.id);
            if (!originalProduct) return { ...optimizedProduct, isChanged: false, changeSummary: {} }; 
            let isProductChangedOverall = false;
            const displayChangeSummary: Product['changeSummary'] = {};
            const fieldsToCheck: (keyof Omit<Product, 'id' | 'name' | 'isChanged' | 'changeSummary'>)[] = ["unitCost", "shipping", "storage", "carryingCost", "daysInInventory", "totalLanded", "margin", "turnover"]; 
            
            fieldsToCheck.forEach(field => {
                const originalValue = (originalProduct as any)[field];
                const optimizedValue = (optimizedProduct as any)[field];
                const valuesDiffer = (typeof originalValue === 'number' && typeof optimizedValue === 'number')
                    ? Math.abs(originalValue - optimizedValue) > 1e-9 
                    : originalValue !== optimizedValue;

                if (valuesDiffer) {
                    isProductChangedOverall = true;
                    let reasoningFromOption: string | undefined;
                     for (const optionId of selectedOptionIds) {
                        const opt = perplexityOptions.find(o => o.id === optionId);
                        const relevantChange = opt?.detailedChanges.find(dc => dc.productId === optimizedProduct.id && dc.field === field);
                        if (relevantChange?.reasoning) { reasoningFromOption = relevantChange.reasoning; break; }
                    }
                    displayChangeSummary[field] = { originalValue, newValue: optimizedValue, reasoning: reasoningFromOption };
                }
            });
            return { ...optimizedProduct, isChanged: isProductChangedOverall, changeSummary: displayChangeSummary };
        })
        .sort((a, b) => {
            if (a.isChanged && !b.isChanged) return -1;
            if (!a.isChanged && b.isChanged) return 1;
            return a.id.localeCompare(b.id);
        });
  }, [baseInventory, selectedOptionIds, perplexityOptions]);

  const totalAppliedSavings = useMemo(() => {
    return selectedOptionIds.reduce((total, id) => {
      const opt = perplexityOptions.find((o) => o.id === id);
      return total + (opt?.estimatedSavings || 0);
    }, 0);
  }, [selectedOptionIds, perplexityOptions]);

  const getImpactColor = (impact?: string): string => {
    switch (impact) {
      case "Very High": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // --- RENDER SECTION ---
  if (isLoadingPerplexity && perplexityOptions.length === 0 && !perplexityError) {
    return (
      <div className="space-y-8 pr-20 pb-20">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI-Powered Cost Recommendations
          </h1>
          <p className="text-gray-600">Fetching intelligent optimization strategies for your inventory...</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <SpinnerIcon className="h-12 w-12 text-blue-600" />
          <p className="mt-6 text-xl text-gray-700">Perplexity AI is analyzing your inventory...</p>
          <p className="text-md text-gray-500">This may take a moment to generate tailored strategies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pr-20 pb-20">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          AI-Powered Cost Recommendations
        </h1>
        <p className="text-gray-600">Select AI-generated optimization strategies to see potential cost savings on your inventory.</p>
      </div>

      {/* Potential Optimization Strategies Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Potential Optimization Strategies</h2>
          {selectedOptionIds.length > 0 && (
             <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg">
              <span className="text-sm font-medium">Total Selected Savings: </span>
              <span className="text-lg font-bold">${totalAppliedSavings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          )}
        </div>
        
        {perplexityError && (
             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <div className="flex items-center"> <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0"/> <strong className="font-semibold">Error:</strong></div>
                <p className="text-sm ml-7">{perplexityError}</p>
            </div>
        )}

        {(!isLoadingPerplexity && perplexityOptions.length === 0 && !perplexityError) && (
            <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow border">
                <BrainCircuit className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold">No AI strategies available at this moment.</p>
                <p className="text-sm">This could be due to the current inventory data or temporary issues. Please try again or check your Perplexity API setup.</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {perplexityOptions.map((option, index) => {
            const tagBgColor = tagColors[index % tagColors.length];
            const isSelected = selectedOptionIds.includes(option.id);
            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-300 flex flex-col h-full shadow-md hover:shadow-lg ${
                  isSelected ? "ring-2 ring-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50" : "bg-white hover:shadow-md" 
                }`}
                onClick={() => handleOptionToggle(option.id)}
              >
                <CardContent className="p-4 flex-grow">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`checkbox-${option.id}`}
                      checked={isSelected}
                      aria-label={`Select option ${option.title}`}
                      className="mt-1 flex-shrink-0 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" // Ensure consistent checkbox style
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-md ${tagBgColor} flex items-center justify-center mb-3 text-white font-bold text-lg shadow-sm`}>
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1 truncate" title={option.title}>{option.title}</h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-3 min-h-[40px]">{option.description}</p>
                      <div className="space-y-1.5 mt-auto pt-2">
                        <div className="text-lg font-bold text-green-600">${option.estimatedSavings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <Badge className={`${getImpactColor(option.impact)} px-2 py-0.5 text-[10px]`} variant="secondary">
                          {option.impact} Impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* --- NEW: AI Insights Section --- */}
      {selectedOptionIds.length > 0 && (
        <Card className="shadow-lg border bg-white mb-8">
          <CardHeader className="bg-slate-100 border-b rounded-t-lg">
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <BrainCircuit size={22} className="mr-2.5 text-blue-600" />
              AI Insights for Selected Strategies
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Detailed rationale and findings from Perplexity AI for your chosen optimizations.</p>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {selectedOptionIds.map(optionId => {
              const option = perplexityOptions.find(opt => opt.id === optionId);
              if (!option) return null;
              const optionIndex = perplexityOptions.findIndex(o => o.id === optionId);
              const tagBgColor = tagColors[optionIndex % tagColors.length];
              return (
                <div key={`insight-${option.id}`} className="p-4 border border-gray-200 rounded-lg bg-slate-50/60 shadow-sm">
                   <div className={`mb-3 p-2 py-1.5 rounded-md inline-flex items-center text-white ${tagBgColor}`}>
                     <span className="font-semibold text-xs mr-2">STRATEGY {optionIndex + 1}:</span>
                     <h3 className="font-medium text-sm">{option.title}</h3>
                   </div>
                  {option.webFindings && (
                    <div className="mb-2.5">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1 tracking-wide">Key Web Findings:</h4>
                      <p className="text-sm text-gray-700 italic bg-blue-50 p-2.5 rounded border border-blue-100">{option.webFindings}</p>
                    </div>
                  )}
                  {option.detailedChanges.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5 tracking-wide">Rationale for Specific Changes:</h4>
                      <ul className="space-y-1.5">
                        {option.detailedChanges.map((change, idx) => (
                          <li key={`${option.id}-change-${idx}`} className="text-sm text-gray-700 bg-white p-2 border border-gray-200 rounded">
                            Product <Badge variant="secondary" className="font-mono text-xs px-1.5 py-0.5">{change.productId}</Badge>: 
                            Change <Badge variant="secondary" className="font-mono text-xs px-1.5 py-0.5">{change.field}</Badge> to <Badge className="font-mono text-xs px-1.5 py-0.5 bg-green-100 text-green-700 border-green-200">{String(change.newValue)}</Badge>.
                            {change.reasoning && <span className="italic text-gray-500 text-xs block mt-0.5">↳ Reasoning: "{change.reasoning}"</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                   {(!option.webFindings && option.detailedChanges.filter(c => c.reasoning).length === 0) && (
                     <p className="text-sm text-gray-500 italic">No specific web findings or detailed rationale provided by AI for this strategy's general description.</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Detailed Cost Analysis Table */}
      <Card className="shadow-xl border-0 bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b sticky top-0 z-10">
           <CardTitle className="text-xl text-gray-800">
            {selectedOptionIds.length > 0 ? "Optimized" : "Current"} Detailed Cost Analysis
          </CardTitle>
          {selectedOptionIds.length > 0 && ( <p className="text-sm text-gray-600">Showing projected costs with selected AI optimizations. Changed items are at the top and <span className="bg-yellow-100 px-1 rounded">highlighted</span>.</p> )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm">
              <thead className="sticky top-[calc(3.5rem+1px)] z-10">
                <tr className="border-b bg-gray-100 shadow-sm">{/* Ensure no whitespace here */}
                  {["PRODUCT", "UNIT COST", "SHIPPING", "STORAGE/MONTH", "CARRYING COST %", "TOTAL LANDED", "MARGIN %", "TURNOVER", "DAYS IN INVENTORY"].map(header => (
                     <th key={header} className="text-left py-3.5 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                  ))}
                </tr>{/* Ensure no whitespace here */}
              </thead>
              <tbody>
                {optimizedDisplayProducts.length === 0 && !isLoadingPerplexity && (
                    <tr><td colSpan={9} className="text-center py-10 text-gray-500">No inventory data to display.</td></tr>
                )}
                {optimizedDisplayProducts.map((product) => (
                    <tr key={product.id} className={`border-b transition-colors duration-150 ${ product.isChanged ? "bg-yellow-50 hover:bg-yellow-100/70" : "hover:bg-slate-50/70" }`} >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-800">{product.id}</div>
                        <div className="text-xs text-gray-500 max-w-[150px] truncate" title={product.name}>{product.name}</div>
                      </td>
                      {(["unitCost", "shipping", "storage"] as const).map(field => (
                        <td key={field} className="py-3.5 px-4 whitespace-nowrap">
                          <div className={`font-medium ${product.changeSummary?.[field] ? 'text-gray-900' : 'text-gray-700'}`}>
                            ${(product[field] as number).toFixed(2)}
                            {product.changeSummary?.[field] && (
                              <div className={`text-xs mt-0.5 ${ ((product[field] as number) < (product.changeSummary[field]!.originalValue as number)) ? 'text-green-600' : 'text-red-500' }`}>
                                { ((product[field] as number) < (product.changeSummary[field]!.originalValue as number)) ? '↓' : '↑' } 
                                ${(Math.abs((product.changeSummary[field]!.originalValue as number) - (product[field] as number))).toFixed(2)}
                                {product.changeSummary[field]?.reasoning && <span className="italic text-gray-400 text-[10px] block max-w-[120px] truncate" title={product.changeSummary[field]?.reasoning}>({product.changeSummary[field]?.reasoning})</span>}
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`font-medium ${product.changeSummary?.carryingCost ? 'text-gray-900' : 'text-gray-700'}`}>
                            {(product.carryingCost as number).toFixed(0)}%
                            {product.changeSummary?.carryingCost && (
                                <div className={`text-xs mt-0.5 ${ ((product.carryingCost as number) < (product.changeSummary.carryingCost.originalValue as number)) ? 'text-green-600' : 'text-red-500' }`}>
                                    { ((product.carryingCost as number) < (product.changeSummary.carryingCost.originalValue as number)) ? '↓' : '↑' } 
                                    {Math.abs((product.changeSummary.carryingCost.originalValue as number) - (product.carryingCost as number)).toFixed(0)}%
                                    {product.changeSummary.carryingCost.reasoning && <span className="italic text-gray-400 text-[10px] block max-w-[120px] truncate" title={product.changeSummary.carryingCost.reasoning}>({product.changeSummary.carryingCost.reasoning})</span>}
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`font-bold ${product.changeSummary?.totalLanded ? 'text-blue-700' : 'text-gray-800'}`}>
                            ${product.totalLanded.toFixed(2)}
                            {product.changeSummary?.totalLanded && (
                                <div className={`text-xs mt-0.5 font-semibold ${product.totalLanded < (product.changeSummary.totalLanded.originalValue as number) ? 'text-green-600' : 'text-red-500'}`}>
                                    {product.totalLanded < (product.changeSummary.totalLanded.originalValue as number) ? '↓ SAVED' : '↑ COST'}: ${(Math.abs((product.changeSummary.totalLanded.originalValue as number) - product.totalLanded)).toFixed(2)}
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-emerald-600 whitespace-nowrap">{(product.margin as number).toFixed(1)}%</td>
                      <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">{(product.turnover as number).toFixed(1)}x</td>
                      <td className={`py-3.5 px-4 whitespace-nowrap`}>
                         <div className={`${(product.daysInInventory as number) > 100 ? "text-rose-600 font-medium" : "text-gray-700"} ${product.changeSummary?.daysInInventory ? 'font-semibold' : ''}`}>
                            {Math.round(product.daysInInventory as number)} days
                            {product.changeSummary?.daysInInventory && (
                                 <div className={`text-xs mt-0.5 ${ ((product.daysInInventory as number) < (product.changeSummary.daysInInventory.originalValue as number)) ? 'text-green-600' : 'text-red-500' }`}>
                                    { ((product.daysInInventory as number) < (product.changeSummary.daysInInventory.originalValue as number)) ? '↓' : '↑' } 
                                    {Math.round(Math.abs((product.changeSummary.daysInInventory.originalValue as number) - (product.daysInInventory as number)))} days
                                    {product.changeSummary.daysInInventory.reasoning && <span className="italic text-gray-400 text-[10px] block max-w-[120px] truncate" title={product.changeSummary.daysInInventory.reasoning}>({product.changeSummary.daysInInventory.reasoning})</span>}
                                </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* --- NEW: Sources Section --- */}
      {apiCitations.length > 0 && (
        <Card className="shadow-lg border-0 bg-slate-50/70 mt-10">
          <CardHeader>
            <CardTitle className="text-lg text-slate-700 flex items-center">
              <LinkIcon size={18} className="mr-2 text-slate-500"/> Data Sources & Citations
            </CardTitle>
             <p className="text-xs text-slate-500">Sources provided by Perplexity AI that may have informed its analysis and findings.</p>
          </CardHeader>
          <CardContent className="p-4 text-xs">
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              {apiCitations.map((url, index) => (
                <li key={`citation-${index}`}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-500 italic">Note: These sources are provided by the AI and may have been used to form its general knowledge or specific findings related to the suggestions.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}