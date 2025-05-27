"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DollarSign, TrendingDown, Package, Truck, Zap, AlertTriangle, Info, BrainCircuit } from "lucide-react"

// --- Interfaces ---
interface Product {
  id: string;
  name: string;
  unitCost: number;
  shipping: number;
  storage: number; // Storage cost per month
  carryingCost: number; // Annual carrying cost as a percentage of unit cost
  totalLanded: number;
  margin: number; // Original margin percentage
  turnover: number; // Inventory turnover rate
  daysInInventory: number; // Days item stays in inventory
  // Fields for tracking changes
  isChanged?: boolean;
  changeDetails?: { [key in keyof Partial<Product>]?: { oldValue: any; newValue: any; reasoning?: string } };
}

interface PerplexityChangeDetail {
  productId: string;
  field: keyof Product;
  newValue: number | string;
  reasoning?: string;
}

interface PerplexityOptimizationOption {
  id: string;
  title: string;
  description: string;
  estimatedSavings: number;
  impact: "High" | "Medium" | "Low" | "Very High"; // Ensure Perplexity provides this or map it
  detailedChanges: PerplexityChangeDetail[];
  category?: string;
  webFindings?: string;
}

// --- Initial Data & Helpers ---
const initialBaseProducts: Omit<Product, 'totalLanded' | 'isChanged' | 'changeDetails'>[] = [
    { id: "WDG-001", name: "Wireless Bluetooth Headphones", unitCost: 45.0, shipping: 3.5, storage: 0.8, carryingCost: 15, margin: 48.0, turnover: 4.2, daysInInventory: 87 },
    { id: "SMT-002", name: "Smartphone Case - Silicone", unitCost: 8.5, shipping: 1.2, storage: 0.15, carryingCost: 12, margin: 46.7, turnover: 6.8, daysInInventory: 54 },
    { id: "CHG-003", name: "USB-C Fast Charger 65W", unitCost: 22.0, shipping: 2.8, storage: 0.4, carryingCost: 18, margin: 45.8, turnover: 3.6, daysInInventory: 101 },
    { id: "SPK-004", name: "Portable Bluetooth Speaker", unitCost: 35.0, shipping: 4.2, storage: 0.6, carryingCost: 20, margin: 47.0, turnover: 2.4, daysInInventory: 152 },
    { id: "CAB-005", name: "Lightning to USB Cable", unitCost: 12.0, shipping: 1.5, storage: 0.2, carryingCost: 10, margin: 41.1, turnover: 5.4, daysInInventory: 68 },
];

const calculateTotalLandedCost = (product: Pick<Product, 'unitCost' | 'shipping' | 'storage' | 'carryingCost'>): number => {
    return (product.unitCost || 0) + (product.shipping || 0) + (product.storage || 0) + ((product.unitCost || 0) * (product.carryingCost || 0) / 100);
};

const processedInitialInventory: Product[] = initialBaseProducts.map(p => ({
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

export default function CostRecommendationsPage() {
  const [baseInventory, setBaseInventory] = useState<Product[]>(processedInitialInventory);
  const [perplexityOptions, setPerplexityOptions] = useState<PerplexityOptimizationOption[]>([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isLoadingPerplexity, setIsLoadingPerplexity] = useState<boolean>(true);
  const [perplexityError, setPerplexityError] = useState<string | null>(null);

  const iconMap: { [key: string]: React.ElementType } = {
    supplier: Package, consolidation: Package, vendor: Package,
    eoq: TrendingDown, quantity: TrendingDown, optimization: TrendingDown,
    jit: Zap, "just-in-time": Zap,
    shipping: Truck, logistics: Truck, route: Truck,
    purchasing: DollarSign, bulk: DollarSign, negotiation: DollarSign,
    tariff: AlertTriangle, regulation: AlertTriangle,
    ai: BrainCircuit,
    default: Info,
  };

  const colorMap: { [key: string]: string } = {
    supplier: "from-green-500 to-emerald-600",
    eoq: "from-blue-500 to-cyan-600",
    jit: "from-purple-500 to-violet-600",
    shipping: "from-orange-500 to-red-600",
    purchasing: "from-indigo-500 to-blue-600",
    tariff: "from-red-400 to-pink-500",
    ai: "from-sky-500 to-indigo-600",
    default: "from-gray-500 to-slate-600",
  };

  const assignVisuals = (title: string = "", description: string = ""): { icon: React.ElementType; color: string } => {
    const combinedText = `${title.toLowerCase()} ${description.toLowerCase()}`;
    for (const key in iconMap) {
      if (combinedText.includes(key)) {
        return { icon: iconMap[key], color: colorMap[key] || colorMap.default };
      }
    }
    if (title.toLowerCase().includes("ai") || description.toLowerCase().includes("ai")) return { icon: iconMap.ai, color: colorMap.ai }
    return { icon: iconMap.default, color: colorMap.default };
  };

  useEffect(() => {
    if (baseInventory && baseInventory.length > 0) {
      const fetchOptions = async () => {
        setIsLoadingPerplexity(true);
        setPerplexityError(null);
        try {
          const systemPrompt = `You are an expert inventory cost optimization AI. Analyze the provided inventory data. Your goal is to identify 3 to 5 distinct and actionable cost-saving strategies. For each strategy, you MUST provide:
1.  A unique "id" string (e.g., "switch-supplier-wdg001", "consolidate-shipments-electronics").
2.  A "title" string (max 10 words, e.g., "Negotiate Bulk Discount for WDG-001").
3.  A "description" string (max 30 words, detailing the action).
4.  An "estimatedSavings" number (total monetary savings for implementing this single strategy across affected products).
5.  An "impact" string: "High", "Medium", or "Low".
6.  A "detailedChanges" array of objects. Each object MUST specify:
    a.  "productId": The ID of the product from the input inventory to change.
    b.  "field": The specific product field to change (e.g., "unitCost", "shipping", "storage", "daysInInventory", "carryingCost"). Values for "field" must be one of: "unitCost", "shipping", "storage", "carryingCost", "daysInInventory".
    c.  "newValue": The new numeric value for that field. (If changing 'daysInInventory', ensure it's a whole number).
    d.  "reasoning": A brief (max 15 words) justification for this specific change.
7.  (Optional) A "webFindings" string (max 50 words) summarizing any web research for cheaper options, tariffs, or regulations relevant to this strategy.

IMPORTANT: Your entire response MUST be a single, valid JSON array of these strategy objects. Do not include any introductory text, explanations, or markdown formatting outside the JSON array itself.
Example of one strategy object in the array:
{
  "id": "alt-supplier-wdg001",
  "title": "Alternate Supplier for WDG-001",
  "description": "Source Wireless Bluetooth Headphones from Supplier B for reduced unit cost.",
  "estimatedSavings": 225.00,
  "impact": "Medium",
  "detailedChanges": [
    {
      "productId": "WDG-001",
      "field": "unitCost",
      "newValue": 40.50,
      "reasoning": "Supplier B offers 10% lower price."
    }
  ],
  "webFindings": "Supplier B (supplierB.com) has positive reviews and lower rates for WDG-001."
}`;

          const userPrompt = `Here is the current inventory data:
${JSON.stringify(baseInventory.map(({ id, name, unitCost, shipping, storage, carryingCost, daysInInventory, turnover }) => ({ id, name, unitCost, shipping, storage, carryingCost, daysInInventory, turnover })), null, 2)}

Please provide 3-5 cost optimization strategies in the specified JSON format.`;

          // Log the request being sent to your /api/perplexity
          console.log("--- Sending to /api/perplexity --- Body:", JSON.stringify({
            model: "sonar-pro", // Make sure this is a valid model you have access to
            messages: [ { role: "system", content: systemPrompt }, { role: "user", content: userPrompt } ],
          }, null, 2));
          
          const response = await fetch("/api/perplexity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "sonar-pro", // Ensure this model name is correct and accessible
              messages: [ { role: "system", content: systemPrompt }, { role: "user", content: userPrompt } ],
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: "Failed to parse error response from /api/perplexity" } }));
            console.error("Error response from /api/perplexity:", errorData);
            const perplexityErrorMessage = errorData.error?.message || (errorData.details && errorData.details.error?.message) || `API request failed with status ${response.status}`;
            throw new Error(perplexityErrorMessage);
          }

          const result = await response.json(); // This is the full object from Perplexity via your /api/perplexity route
          let strategies: PerplexityOptimizationOption[] = [];

          // --- CORRECTED PARSING LOGIC ---
          if (result && result.choices && result.choices.length > 0 && result.choices[0].message && result.choices[0].message.content) {
            const contentString = result.choices[0].message.content;
            console.log("--- Content string from Perplexity (to be parsed) ---:", contentString);
            try {
              strategies = JSON.parse(contentString);
              if (!Array.isArray(strategies)) {
                console.error("Parsed content from Perplexity is not an array:", strategies);
                throw new Error("Perplexity AI provided data in an unexpected format (parsed content not an array).");
              }
            } catch (e: any) {
              console.error("Failed to parse Perplexity message content as JSON array:", e.message);
              console.error("Problematic content string from Perplexity was:", contentString);
              const jsonMatch = contentString.match(/```json\n([\s\S]*?)\n```/);
              if (jsonMatch && jsonMatch[1]) {
                  try {
                      strategies = JSON.parse(jsonMatch[1]);
                      if (!Array.isArray(strategies)) {
                          console.error("Parsed extracted content from Perplexity is not an array:", strategies);
                          throw new Error("Perplexity AI provided data in an unexpected format (extracted content not an array).");
                      }
                  } catch (e2: any) {
                      console.error("Failed to parse extracted JSON from Perplexity response:", e2.message);
                      throw new Error("Invalid JSON in Perplexity response even after code block extraction.");
                  }
              } else {
                  throw new Error(`Perplexity AI response content was not valid JSON: ${e.message}.`);
              }
            }
          } else {
            console.error("Unexpected Perplexity response structure, missing choices or content:", result);
            throw new Error("Received incomplete or malformed data structure from Perplexity AI.");
          }
          // --- END OF CORRECTED PARSING LOGIC ---
          
          const validatedStrategies = strategies.filter(s => s && s.id && s.title && Array.isArray(s.detailedChanges));
          if (validatedStrategies.length !== strategies.length) {
             console.warn("Some strategies from Perplexity were filtered out due to missing required fields (id, title, detailedChanges). Original count:", strategies.length, "Validated count:", validatedStrategies.length);
          }
          setPerplexityOptions(validatedStrategies.map(s => ({...s, detailedChanges: Array.isArray(s.detailedChanges) ? s.detailedChanges : [] })));

        } catch (err: any) {
          console.error("Error in fetchOptions (useEffect):", err);
          setPerplexityError(err.message || "An unknown error occurred while fetching suggestions.");
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
    if (selectedOptionIds.length === 0) {
      return baseInventory.map(p => ({ ...p, isChanged: false, changeDetails: {} }));
    }

    const tempOptimizedProducts: Product[] = JSON.parse(JSON.stringify(baseInventory));
    const productChangeTracker: { [productId: string]: NonNullable<Product['changeDetails']> } = {};

    selectedOptionIds.forEach((optionId) => {
      const selectedOption = perplexityOptions.find((opt) => opt.id === optionId);
      if (selectedOption?.detailedChanges) {
        selectedOption.detailedChanges.forEach((change) => {
          const productIndex = tempOptimizedProducts.findIndex((p) => p.id === change.productId);
          if (productIndex !== -1) {
            const productToUpdate = tempOptimizedProducts[productIndex];
            const fieldToChange = change.field as keyof Product;
            
            let newValue = change.newValue;
            if (typeof (productToUpdate as any)[fieldToChange] === 'number' && typeof newValue === 'string') {
                newValue = parseFloat(newValue);
            } else if (typeof (productToUpdate as any)[fieldToChange] === 'number' && typeof newValue !== 'number') {
                newValue = parseFloat(String(newValue)) || (productToUpdate as any)[fieldToChange]; 
            }

            if (!productChangeTracker[change.productId]) {
                productChangeTracker[change.productId] = {};
            }
            
            if (!productChangeTracker[change.productId]![fieldToChange]) {
                 productChangeTracker[change.productId]![fieldToChange] = {
                    oldValue: (productToUpdate as any)[fieldToChange], 
                    newValue: newValue,
                    reasoning: change.reasoning
                };
            } else {
                 productChangeTracker[change.productId]![fieldToChange]!.newValue = newValue;
                 if(change.reasoning) productChangeTracker[change.productId]![fieldToChange]!.reasoning += `; ${change.reasoning}`;
            }
            (productToUpdate as any)[fieldToChange] = newValue;

            if (["unitCost", "shipping", "storage", "carryingCost"].includes(fieldToChange as string)) {
                productToUpdate.totalLanded = calculateTotalLandedCost(productToUpdate);
            }
          }
        });
      }
    });
    
    return tempOptimizedProducts
        .map(p => {
            const originalProductData = baseInventory.find(op => op.id === p.id) || p;
            const changesForThisProduct = productChangeTracker[p.id] || {};
            let isProductChangedOverall = false;
            const displayChangeDetails: Product['changeDetails'] = {};

            for(const key in changesForThisProduct) {
                const field = key as keyof Product;
                if((p as any)[field] !== (originalProductData as any)[field]){
                    isProductChangedOverall = true;
                    displayChangeDetails[field] = {
                        oldValue: (originalProductData as any)[field],
                        newValue: (p as any)[field],
                        reasoning: changesForThisProduct[field]?.reasoning
                    };
                }
            }
            return { ...p, isChanged: isProductChangedOverall, changeDetails: displayChangeDetails };
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

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case "Very High": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoadingPerplexity && perplexityOptions.length === 0 && !perplexityError) {
    return (
      <div className="space-y-8 pr-20">
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

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Potential Optimization Strategies</h2>
          {selectedOptionIds.length > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg">
              <span className="text-sm font-medium">Total Selected Savings: </span>
              <span className="text-lg font-bold">${totalAppliedSavings.toLocaleString()}</span>
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
                <p className="text-sm">This could be due to the current inventory data or temporary issues. Please try refreshing or adjusting your inventory input.</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {perplexityOptions.map((option) => {
            const { icon: Icon, color: gradColor } = assignVisuals(option.title, option.description);
            const isSelected = selectedOptionIds.includes(option.id);
            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-300 flex flex-col h-full shadow-md hover:shadow-xl ${
                  isSelected ? "ring-2 ring-blue-600 shadow-xl bg-slate-50 scale-[1.02]" : "bg-white"
                }`}
                onClick={() => handleOptionToggle(option.id)}
              >
                <CardContent className="p-5 flex-grow flex flex-col">
                  <div className="flex items-start space-x-3 mb-3">
                    <Checkbox id={`checkbox-${option.id}`} checked={isSelected} className="mt-1 flex-shrink-0 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                     <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradColor} flex items-center justify-center flex-shrink-0`}> <Icon className="h-5 w-5 text-white" /> </div>
                    <h3 className="font-semibold text-md text-gray-800 leading-tight flex-grow" title={option.title}>{option.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 flex-grow min-h-[3em] line-clamp-3">{option.description}</p>
                  {option.webFindings && ( <p className="text-[11px] text-blue-700 italic mb-2 p-2 bg-blue-50 rounded-md line-clamp-2" title={option.webFindings}> <Info size={12} className="inline mr-1 align-middle"/>{option.webFindings} </p> )}
                  <div className="mt-auto pt-2 border-t border-gray-200/60 flex justify-between items-center">
                    <div className="text-xl font-bold text-green-600">${option.estimatedSavings.toLocaleString()}</div>
                    <Badge className={`${getImpactColor(option.impact)} px-2.5 py-1 text-xs`} variant="secondary"> {option.impact} Impact </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

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
                <tr className="border-b bg-gray-100 shadow-sm">
                  {["PRODUCT", "UNIT COST", "SHIPPING", "STORAGE/MONTH", "CARRYING COST %", "TOTAL LANDED", "MARGIN %", "TURNOVER", "DAYS IN INVENTORY"].map(header => (
                     <th key={header} className="text-left py-3.5 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {optimizedDisplayProducts.length === 0 && !isLoadingPerplexity && (
                    <tr><td colSpan={9} className="text-center py-10 text-gray-500">No inventory data to display.</td></tr>
                )}
                {optimizedDisplayProducts.map((product) => {
                  const originalForDiff = baseInventory.find(p => p.id === product.id) || product;
                  return (
                    <tr
                      key={product.id}
                      className={`border-b transition-colors duration-150 ${
                        product.isChanged ? "bg-yellow-50 hover:bg-yellow-100" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-800">{product.id}</div>
                        <div className="text-xs text-gray-500">{product.name}</div>
                      </td>
                      {(['unitCost', 'shipping', 'storage'] as const).map(field => (
                        <td key={field} className="py-3.5 px-4 whitespace-nowrap">
                          <div className={`font-medium ${product.changeDetails?.[field] ? 'text-gray-900' : 'text-gray-700'}`}>
                            ${(product[field] as number).toFixed(2)}
                            {product.changeDetails?.[field] && (product[field] as number) !== product.changeDetails[field]!.oldValue && (
                              <div className={`text-xs mt-0.5 ${ ((product[field] as number) < product.changeDetails[field]!.oldValue) ? 'text-green-600' : 'text-red-500' }`}>
                                { ((product[field] as number) < product.changeDetails[field]!.oldValue) ? '↓' : '↑' } 
                                ${(Math.abs(product.changeDetails[field]!.oldValue - (product[field] as number))).toFixed(2)}
                                {product.changeDetails[field]?.reasoning && <span className="italic text-gray-400 text-[10px] block max-w-[120px] truncate" title={product.changeDetails[field]?.reasoning}>({product.changeDetails[field]?.reasoning})</span>}
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`font-medium ${product.changeDetails?.carryingCost ? 'text-gray-900' : 'text-gray-700'}`}>
                            {(product.carryingCost as number).toFixed(0)}%
                            {product.changeDetails?.carryingCost && (product.carryingCost as number) !== product.changeDetails.carryingCost.oldValue && (
                                <div className={`text-xs mt-0.5 ${ ((product.carryingCost as number) < product.changeDetails.carryingCost.oldValue) ? 'text-green-600' : 'text-red-500' }`}>
                                    { ((product.carryingCost as number) < product.changeDetails.carryingCost.oldValue) ? '↓' : '↑' } 
                                    {Math.abs(product.changeDetails.carryingCost.oldValue - (product.carryingCost as number)).toFixed(0)}%
                                    {product.changeDetails.carryingCost.reasoning && <span className="italic text-gray-400 text-[10px] block max-w-[120px] truncate" title={product.changeDetails.carryingCost.reasoning}>({product.changeDetails.carryingCost.reasoning})</span>}
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`font-bold ${product.isChanged && product.totalLanded !== originalForDiff.totalLanded ? 'text-blue-700' : 'text-gray-800'}`}>
                            ${product.totalLanded.toFixed(2)}
                            {(product.isChanged && product.totalLanded !== originalForDiff.totalLanded) && (
                                <div className={`text-xs mt-0.5 font-semibold ${product.totalLanded < originalForDiff.totalLanded ? 'text-green-600' : 'text-red-500'}`}>
                                    {product.totalLanded < originalForDiff.totalLanded ? '↓ SAVED' : '↑ COST'}: ${(Math.abs(originalForDiff.totalLanded - product.totalLanded)).toFixed(2)}
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-emerald-600 whitespace-nowrap">{(product.margin as number).toFixed(1)}%</td>
                      <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">{(product.turnover as number).toFixed(1)}x</td>
                      <td className={`py-3.5 px-4 whitespace-nowrap`}>
                         <div className={`${(product.daysInInventory as number) > 100 ? "text-rose-600 font-medium" : "text-gray-700"} ${product.changeDetails?.daysInInventory ? 'font-semibold' : ''}`}>
                            {Math.round(product.daysInInventory as number)} days
                            {product.changeDetails?.daysInInventory && (product.daysInInventory as number) !== product.changeDetails.daysInInventory.oldValue && (
                                 <div className={`text-xs mt-0.5 ${ ((product.daysInInventory as number) < product.changeDetails.daysInInventory.oldValue) ? 'text-green-600' : 'text-red-500' }`}>
                                    { ((product.daysInInventory as number) < product.changeDetails.daysInInventory.oldValue) ? '↓' : '↑' } 
                                    {Math.round(Math.abs(product.changeDetails.daysInInventory.oldValue - (product.daysInInventory as number)))} days
                                    {product.changeDetails.daysInInventory.reasoning && <span className="italic text-gray-400 text-[10px] block max-w-[120px] truncate" title={product.changeDetails.daysInInventory.reasoning}>({product.changeDetails.daysInInventory.reasoning})</span>}
                                </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}