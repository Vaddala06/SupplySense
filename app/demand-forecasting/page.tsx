"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGlobalStore } from "@/lib/store";
import { useState } from "react";

export default function DemandForecastingPage() {
  const inventory = useGlobalStore((state) => state.inventory);
  const setDemandForecast = useGlobalStore((state) => state.setDemandForecast);
  const [forecast, setForecast] = useState<any[]>([]);

  // Dummy forecast generator for demo; replace with real API/logic as needed
  const generateForecast = () => {
    const result = inventory.map((item) => ({
      id: item.id,
      name: item.name,
      currentMonth: Math.floor(Math.random() * 100) + 10,
      nextMonth: Math.floor(Math.random() * 100) + 10,
      next3Months: Math.floor(Math.random() * 300) + 30,
      trend: ["Increasing", "Decreasing", "Stable"][
        Math.floor(Math.random() * 3)
      ],
      confidence: Math.floor(Math.random() * 30) + 70,
      keyFactors: ["Seasonality", "Market trend", "Promotion"],
    }));
    setForecast(result);
    setDemandForecast(result);
  };

  const products =
    forecast.length > 0
      ? forecast
      : inventory.map((item) => ({
          id: item.id,
          name: item.name,
          currentMonth: 0,
          nextMonth: 0,
          next3Months: 0,
          trend: "Stable",
          confidence: 0,
          keyFactors: [],
        }));

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
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          onClick={generateForecast}
        >
          Generate Forecast
        </button>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                          product.keyFactors.map(
                            (factor: string, index: number) => (
                              <div key={index}>• {factor}</div>
                            )
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
    </div>
  );
}
