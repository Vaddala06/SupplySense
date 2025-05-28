"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGlobalStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";

export default function DemandForecastingPage() {
  const inventory = useGlobalStore((state) => state.inventory);
  const setDemandForecast = useGlobalStore((state) => state.setDemandForecast);
  const [forecast, setForecast] = useState<any[]>([]);
  const lastInventoryRef = useRef<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Helper to call Perplexity API
  const fetchForecast = async () => {
    setIsLoading(true);
    try {
      if (!inventory.length) return;
      const inventoryJson = JSON.stringify(inventory, null, 2);
      const systemPrompt = `You are a world-class demand forecasting and planning AI. For each product in the provided inventory, analyze real-world factors (tariffs, stock picker advice, macroeconomic trends, supply chain news, etc.) and provide a demand forecast. For each product, return: id, name, currentMonth (units), nextMonth (units), next3Months (units), trend (Increasing/Decreasing/Stable), confidence (0-100), and keyFactors (array of 2-4 real-world factors). Do not randomize; base your answer on the product and its context. Output a JSON array, no markdown or code block.`;
      const userPrompt = `Here is the inventory data as JSON:\n${inventoryJson}\n\nFor each product, provide a demand forecast as described above. Output a JSON array only.`;
      const response = await fetch("/api/perplexity", {
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
      if (!response.ok) throw new Error("Failed to fetch forecast");
      const result = await response.json();
      let forecastArr: any[] = [];
      if (result?.choices?.[0]?.message?.content) {
        const contentString = result.choices[0].message.content;
        try {
          forecastArr = JSON.parse(contentString);
          if (!Array.isArray(forecastArr)) throw new Error();
        } catch {
          // Try to extract first valid JSON array
          const jsonMatch = contentString.match(/\[.*?\]/);
          if (jsonMatch?.[0]) {
            forecastArr = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("Invalid forecast JSON");
          }
        }
      }
      // After parsing forecastArr, shuffle/sort to ensure trend diversity
      if (forecastArr.length > 1) {
        // Try to ensure at least one of each trend if possible
        const trends = ["Increasing", "Decreasing", "Stable"];
        let used = new Set();
        forecastArr.forEach((item) => {
          if (trends.includes(item.trend)) used.add(item.trend);
        });
        // If not all trends present, assign missing trends to some products
        if (used.size < trends.length) {
          let missing = trends.filter((t) => !used.has(t));
          for (let i = 0; i < forecastArr.length && missing.length > 0; i++) {
            forecastArr[i].trend = missing.pop();
          }
        }
      }
      setForecast(forecastArr);
      setDemandForecast(forecastArr);
      lastInventoryRef.current = JSON.stringify(inventory);
    } finally {
      setIsLoading(false);
    }
  };

  // Only re-fetch if inventory changes
  useEffect(() => {
    if (JSON.stringify(inventory) !== lastInventoryRef.current) {
      setForecast([]);
      setDemandForecast([]);
    }
    // eslint-disable-next-line
  }, [inventory]);

  const generateForecast = () => {
    if (!forecast.length && !isLoading) fetchForecast();
  };

  const products = inventory.map((item) => {
    const forecastItem = forecast.find((f) => f.id === item.id);
    return {
      id: item.id,
      name: item.name,
      currentMonth: forecastItem?.currentMonth ?? 0,
      nextMonth: forecastItem?.nextMonth ?? 0,
      next3Months: forecastItem?.next3Months ?? 0,
      trend: forecastItem?.trend ?? "Stable",
      confidence: forecastItem?.confidence ?? 0,
      keyFactors: forecastItem?.keyFactors ?? [],
    };
  });

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Increasing":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      case "Decreasing":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white";
      case "Stable":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConfidenceWidth = (confidence: number) => {
    return `${confidence}%`;
  };

  return (
    <div className="space-y-8 pr-20">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Demand Forecasting & Planning
        </h1>
        <p className="text-gray-600">
          Predict future demand and plan inventory accordingly
        </p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 flex items-center justify-center min-w-[160px]"
          onClick={generateForecast}
          disabled={isLoading || !!forecast.length}
        >
          {isLoading && (
            <LoaderCircle className="animate-spin mr-2" size={18} />
          )}
          {isLoading ? "Generating..." : "Generate Forecast"}
        </button>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-0">
          <div className="overflow-x-auto relative">
            {forecast.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-10">
                <span className="text-xl font-semibold text-gray-500">
                  (Click Generate)
                </span>
              </div>
            ) : null}
            <div
              className={
                forecast.length === 0
                  ? "blur-sm select-none pointer-events-none"
                  : ""
              }
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gradient-to-r from-gray-50 to-slate-50">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      PRODUCT
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      CURRENT MONTH
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      NEXT MONTH
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      NEXT 3 MONTHS
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      TREND
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">
                      KEY FACTORS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.id}
                          </div>
                          <div className="text-sm text-gray-600">
                            {product.name}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {product.currentMonth} units
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {product.nextMonth} units
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {product.next3Months} units
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getTrendColor(product.trend)}>
                          {product.trend}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600">
                          {product.keyFactors &&
                          product.keyFactors.length > 0 ? (
                            product.keyFactors.map((factor, index) => (
                              <div key={index}>• {factor}</div>
                            ))
                          ) : (
                            <div className="italic text-gray-400">
                              No key factors
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
