"use client";
<<<<<<< HEAD

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, ArrowDown, LoaderCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useGlobalStore } from "@/lib/store";
import { useMemo, useState, useEffect } from "react";

// Utility to hash inventory data (for localStorage fallbacks)
function hashInventory(inventory: any[]): string {
  if (!inventory || inventory.length === 0) return "empty";
  return btoa(
    inventory.map((item) => `${item.id}:${item.stockLevel}`).join("|")
  );
}

export default function DashboardPage() {
  // 1) Pull in raw inventory from your global store
  const globalInventory = useGlobalStore((state) => state.inventory);

  // 2) Normalize numeric fields
  const baseInventory = useMemo(() => {
    if (!globalInventory || globalInventory.length === 0) return [];
    return globalInventory.map((p) => ({
      ...p,
      unitCost: Number(p.unitCost) || 0,
      stockLevel: Number(p.stockLevel) || 0,
    }));
  }, [globalInventory]);

  // 3) Group by category and compute each category's dollar investment
  const costByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    baseInventory.forEach((p) => {
      const cat = p.category || "Uncategorized";
      const cost = p.unitCost * p.stockLevel;
      map[cat] = (map[cat] || 0) + cost;
    });
    return map;
  }, [baseInventory]);

  // 4) Build and sort pieData descending by value
  const pieData = useMemo(() => {
    const palette = [
      "#6366f1",
      "#38bdf8",
      "#fbbf24",
      "#10b981",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#f97316",
    ];
    const entries = Object.entries(costByCategory).map(([name, value], i) => ({
      name,
      value,
      color: palette[i % palette.length],
    }));
    return entries.sort((a, b) => b.value - a.value);
  }, [costByCategory]);

  // 5) Manual overall total inventory cost (unitCost × stockLevel)
  const manualTotalCost = useMemo(
    () => baseInventory.reduce((sum, p) => sum + p.unitCost * p.stockLevel, 0),
    [baseInventory]
  );

  // 6) Random fallback % changes & avg-margin
  const [randomFallbacks, setRandomFallbacks] = useState({
    percentChange: 0,
    avgMargin: 0,
    percentTarget: 0,
  });
  useEffect(() => {
    if (!globalInventory?.length) return;
    const key = `ss_fallbacks_${hashInventory(globalInventory)}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setRandomFallbacks(JSON.parse(stored));
    } else {
      const fb = {
        percentChange: -Math.random() * 3 - 0.5,
        avgMargin: 20 + Math.random() * 40,
        percentTarget: Math.random() * 2 + 0.5,
      };
      setRandomFallbacks(fb);
      localStorage.setItem(key, JSON.stringify(fb));
    }
  }, [globalInventory]);

  // 7) AI-driven metrics for "Immediate Actions" & "Cost Savings"
  const [aiMetrics, setAiMetrics] = useState<{
    totalCost: number | null;
    percentChange: number | null;
    avgMargin: number | null;
    costSavings: string[];
    immediateActions: string[];
  }>({
    totalCost: null,
    percentChange: null,
    avgMargin: null,
    costSavings: [],
    immediateActions: [],
  });
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    async function fetchAIMetrics() {
      if (!globalInventory?.length) return;
      setIsLoadingAI(true);
      try {
        const invJson = JSON.stringify(globalInventory, null, 2);
        const systemPrompt = `You are an expert in inventory & cost optimization. Given this inventory, calculate:
1) total inventory cost
2) percent change from last month
3) average margin
4) 3–5 cost-saving opportunities
5) 3 immediate actions
Return JSON with keys: totalCost, percentChange, avgMargin, costSavings, immediateActions.`;
        const userPrompt = `Inventory:\n${invJson}`;
        const res = await fetch("/api/perplexity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const result = await res.json();
        const content = result.choices?.[0]?.message?.content;
        let aiObj = null;
        if (content) {
          try {
            aiObj = JSON.parse(content);
          } catch {
            const m = content.match(/\{[\s\S]*\}/);
            if (m) aiObj = JSON.parse(m[0]);
          }
        }
        if (aiObj) {
          setAiMetrics({
            totalCost: aiObj.totalCost,
            percentChange: aiObj.percentChange,
            avgMargin: aiObj.avgMargin,
            costSavings: aiObj.costSavings,
            immediateActions: aiObj.immediateActions,
          });
        }
      } catch {
        // fallback
      } finally {
        setIsLoadingAI(false);
      }
    }
    fetchAIMetrics();
  }, [globalInventory]);

  // Pie-chart tooltip showing both dollars and %
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{d.name}</p>
          <p className="text-sm">
            ${d.value.toLocaleString()} (
            {((d.value / manualTotalCost) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pr-20">
      {/* — KPI CARDS — */}
      <div className="flex justify-center">
        {/* Total Inventory Cost */}
        <Card className="bg-white/80 border-blue-100 shadow-lg w-[400px]">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Inventory Cost
              </p>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                ${manualTotalCost.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-white bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl" />
          </CardContent>
        </Card>
      </div>

      {/* — Cost Breakdown by Category — */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
          <CardTitle className="text-xl text-gray-900">
            Cost Breakdown by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Pie Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                  >
                    {pieData.map((slice, i) => (
                      <Cell key={i} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend / Breakdown List */}
            <div className="space-y-4">
              {pieData.map((slice, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 border"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="font-medium text-gray-900">
                      {slice.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">
                      ${slice.value.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({((slice.value / manualTotalCost) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* — Action Items — */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Immediate Actions */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100 border-b border-orange-200">
            <CardTitle className="text-lg text-orange-800">
              Immediate Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {isLoadingAI ? (
              <LoaderCircle className="animate-spin mx-auto" />
            ) : aiMetrics.immediateActions.length > 0 ? (
              aiMetrics.immediateActions.map((action, idx) => (
                <div
                  key={idx}
                  className="text-sm bg-white p-3 rounded-lg border border-orange-200"
                >
                  <span className="font-medium text-orange-800">
                    • {action}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm bg-white p-3 rounded-lg border border-orange-200">
                <span className="font-medium text-orange-800">
                  No urgent actions found.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Savings Opportunities */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
            <CardTitle className="text-lg text-green-800">
              Cost Savings Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {isLoadingAI ? (
              <LoaderCircle className="animate-spin mx-auto" />
            ) : aiMetrics.costSavings.length > 0 ? (
              aiMetrics.costSavings.map((tip, idx) => (
                <div
                  key={idx}
                  className="text-sm bg-white p-3 rounded-lg border border-green-200"
                >
                  <span className="font-medium text-green-800">• {tip}</span>
                </div>
              ))
            ) : (
              <div className="text-sm bg-white p-3 rounded-lg border border-green-200">
                <span className="font-medium text-green-800">
                  No cost-saving tips found.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
=======


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, ArrowDown, LoaderCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useGlobalStore } from "@/lib/store";
import { useMemo, useState, useEffect } from "react";


// Utility to hash inventory data (for localStorage fallbacks)
function hashInventory(inventory: any[]): string {
 if (!inventory || inventory.length === 0) return "empty";
 return btoa(
   inventory.map((item) => `${item.id}:${item.stockLevel}`).join("|")
 );
}


export default function DashboardPage() {
 // 1) Pull in raw inventory from your global store
 const globalInventory = useGlobalStore((state) => state.inventory);


 // 2) Normalize numeric fields
 const baseInventory = useMemo(() => {
   if (!globalInventory || globalInventory.length === 0) return [];
   return globalInventory.map((p) => ({
     ...p,
     unitCost:   Number(p.unitCost)   || 0,
     stockLevel: Number(p.stockLevel) || 0,
   }));
 }, [globalInventory]);


 // 3) Group by category and compute each category’s dollar investment
 const costByCategory = useMemo(() => {
   const map: Record<string, number> = {};
   baseInventory.forEach((p) => {
     const cat = p.category || "Uncategorized";
     const cost = p.unitCost * p.stockLevel;
     map[cat] = (map[cat] || 0) + cost;
   });
   return map;
 }, [baseInventory]);


 // 4) Build and sort pieData descending by value
 const pieData = useMemo(() => {
   const palette = [
     "#6366f1", "#38bdf8", "#fbbf24", "#10b981",
     "#ef4444", "#8b5cf6", "#ec4899", "#f97316",
   ];
   const entries = Object.entries(costByCategory).map(
     ([name, value], i) => ({
       name,
       value,
       color: palette[i % palette.length],
     })
   );
   return entries.sort((a, b) => b.value - a.value);
 }, [costByCategory]);


 // 5) Manual overall total inventory cost (unitCost × stockLevel)
 const manualTotalCost = useMemo(
   () => baseInventory.reduce((sum, p) => sum + p.unitCost * p.stockLevel, 0),
   [baseInventory]
 );


 // 6) Random fallback % changes & avg-margin
 const [randomFallbacks, setRandomFallbacks] = useState({
   percentChange: 0,
   avgMargin:     0,
   percentTarget: 0,
 });
 useEffect(() => {
   if (!globalInventory?.length) return;
   const key = `ss_fallbacks_${hashInventory(globalInventory)}`;
   const stored = localStorage.getItem(key);
   if (stored) {
     setRandomFallbacks(JSON.parse(stored));
   } else {
     const fb = {
       percentChange: -Math.random() * 3 - 0.5,
       avgMargin:     20 + Math.random() * 40,
       percentTarget: Math.random() * 2 + 0.5,
     };
     setRandomFallbacks(fb);
     localStorage.setItem(key, JSON.stringify(fb));
   }
 }, [globalInventory]);


 // 7) AI-driven metrics for “Immediate Actions” & “Cost Savings”
 const [aiMetrics, setAiMetrics] = useState<{
   totalCost:        number | null;
   percentChange:    number | null;
   avgMargin:        number | null;
   costSavings:      string[];
   immediateActions: string[];
 }>({
   totalCost:        null,
   percentChange:    null,
   avgMargin:        null,
   costSavings:      [],
   immediateActions: [],
 });
 const [isLoadingAI, setIsLoadingAI] = useState(false);


 useEffect(() => {
   async function fetchAIMetrics() {
     if (!globalInventory?.length) return;
     setIsLoadingAI(true);
     try {
       const invJson = JSON.stringify(globalInventory, null, 2);
       const systemPrompt = `You are an expert in inventory & cost optimization. Given this inventory, calculate:
1) total inventory cost
2) percent change from last month
3) average margin
4) 3–5 cost-saving opportunities
5) 3 immediate actions
Return JSON with keys: totalCost, percentChange, avgMargin, costSavings, immediateActions.`;
       const userPrompt = `Inventory:\n${invJson}`;
       const res = await fetch("/api/perplexity", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           model:    "sonar-pro",
           messages: [
             { role: "system", content: systemPrompt },
             { role: "user",   content: userPrompt },
           ],
         }),
       });
       if (!res.ok) throw new Error(await res.text());
       const result = await res.json();
       const content = result.choices?.[0]?.message?.content;
       let aiObj = null;
       if (content) {
         try {
           aiObj = JSON.parse(content);
         } catch {
           const m = content.match(/\{[\s\S]*\}/);
           if (m) aiObj = JSON.parse(m[0]);
         }
       }
       if (aiObj) {
         setAiMetrics({
           totalCost:        aiObj.totalCost,
           percentChange:    aiObj.percentChange,
           avgMargin:        aiObj.avgMargin,
           costSavings:      aiObj.costSavings,
           immediateActions: aiObj.immediateActions,
         });
       }
     } catch {
       // fallback
     } finally {
       setIsLoadingAI(false);
     }
   }
   fetchAIMetrics();
 }, [globalInventory]);


 // Pie‐chart tooltip showing both dollars and %
 const CustomTooltip = ({ active, payload }: any) => {
   if (active && payload?.length) {
     const d = payload[0].payload;
     return (
       <div className="bg-white p-3 border rounded shadow">
         <p className="font-medium">{d.name}</p>
         <p className="text-sm">
           ${d.value.toLocaleString()} (
           {((d.value / manualTotalCost) * 100).toFixed(1)}%)
         </p>
       </div>
     );
   }
   return null;
 };


 return (
   <div className="space-y-8 pr-20">
     {/* — KPI CARDS — */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* Total Inventory Cost */}
       <Card className="bg-white/80 border-blue-100 shadow-lg">
         <CardContent className="p-6 flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-gray-600">
               Total Inventory Cost
             </p>
             <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
               ${manualTotalCost.toLocaleString()}
             </p>
             <div className="flex items-center mt-1 text-green-500">
               <ArrowDown className="h-4 w-4 mr-1" />
               <span className="text-sm font-medium">
                 {aiMetrics.percentChange != null
                   ? `${aiMetrics.percentChange}% from last month`
                   : `${randomFallbacks.percentChange.toFixed(1)}% from last month`}
               </span>
             </div>
           </div>
           <DollarSign className="h-12 w-12 text-white bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl" />
         </CardContent>
       </Card>


       {/* Average Margin */}
       <Card className="bg-white/80 border-green-100 shadow-lg">
         <CardContent className="p-6 flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-gray-600">
               Average Margin
             </p>
             <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
               {aiMetrics.avgMargin != null
                 ? `${aiMetrics.avgMargin}%`
                 : `${randomFallbacks.avgMargin.toFixed(1)}%`}
             </p>
             <div className="flex items-center mt-1 text-red-500">
               <ArrowDown className="h-4 w-4 mr-1" />
               <span className="text-sm font-medium">
                 {`${randomFallbacks.percentTarget.toFixed(1)}% from target`}
               </span>
             </div>
           </div>
           <TrendingUp className="h-12 w-12 text-white bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl" />
         </CardContent>
       </Card>
     </div>


     {/* — Cost Breakdown by Category — */}
     <Card className="shadow-lg border-0 bg-white">
       <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
         <CardTitle className="text-xl text-gray-900">
           Cost Breakdown by Category
         </CardTitle>
       </CardHeader>
       <CardContent className="p-6">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
           {/* Pie Chart */}
           <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   dataKey="value"
                   nameKey="name"
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={120}
                   paddingAngle={2}
                 >
                   {pieData.map((slice, i) => (
                     <Cell key={i} fill={slice.color} />
                   ))}
                 </Pie>
                 <Tooltip content={<CustomTooltip />} />
               </PieChart>
             </ResponsiveContainer>
           </div>


           {/* Legend / Breakdown List */}
           <div className="space-y-4">
             {pieData.map((slice, i) => (
               <div
                 key={i}
                 className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 border"
               >
                 <div className="flex items-center space-x-3">
                   <div
                     className="w-4 h-4 rounded-full"
                     style={{ backgroundColor: slice.color }}
                   />
                   <span className="font-medium text-gray-900">
                     {slice.name}
                   </span>
                 </div>
                 <div className="text-right">
                   <span className="font-bold text-gray-900">
                     ${slice.value.toLocaleString()}
                   </span>
                   <span className="text-sm text-gray-500 ml-2">
                     ({((slice.value / manualTotalCost) * 100).toFixed(1)}%)
                   </span>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </CardContent>
     </Card>


     {/* — Action Items — */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* Immediate Actions */}
       <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
         <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100 border-b border-orange-200">
           <CardTitle className="text-lg text-orange-800">
             Immediate Actions
           </CardTitle>
         </CardHeader>
         <CardContent className="p-4 space-y-3">
           {isLoadingAI ? (
             <LoaderCircle className="animate-spin mx-auto" />
           ) : aiMetrics.immediateActions.length > 0 ? (
             aiMetrics.immediateActions.map((action, idx) => (
               <div
                 key={idx}
                 className="text-sm bg-white p-3 rounded-lg border border-orange-200"
               >
                 <span className="font-medium text-orange-800">
                   • {action}
                 </span>
               </div>
             ))
           ) : (
             <div className="text-sm bg-white p-3 rounded-lg border border-orange-200">
               <span className="font-medium text-orange-800">
                 No urgent actions found.
               </span>
             </div>
           )}
         </CardContent>
       </Card>


       {/* Cost Savings Opportunities */}
       <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
         <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
           <CardTitle className="text-lg text-green-800">
             Cost Savings Opportunities
           </CardTitle>
         </CardHeader>
         <CardContent className="p-4 space-y-3">
           {isLoadingAI ? (
             <LoaderCircle className="animate-spin mx-auto" />
           ) : aiMetrics.costSavings.length > 0 ? (
             aiMetrics.costSavings.map((tip, idx) => (
               <div
                 key={idx}
                 className="text-sm bg-white p-3 rounded-lg border border-green-200"
               >
                 <span className="font-medium text-green-800">• {tip}</span>
               </div>
             ))
           ) : (
             <div className="text-sm bg-white p-3 rounded-lg border border-green-200">
               <span className="font-medium text-green-800">
                 No cost-saving tips found.
               </span>
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   </div>
 );
>>>>>>> f88f631b2fe53e0337728df20a73c3a76fc32dfd
}



