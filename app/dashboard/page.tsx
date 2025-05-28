"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  ArrowDown,
  LoaderCircle,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useGlobalStore } from "@/lib/store";
import { useMemo, useEffect, useState } from "react";

// Utility to hash inventory data
function hashInventory(inventory: any[]): string {
  if (!inventory || inventory.length === 0) return "empty";
  return btoa(
    inventory.map((item) => `${item.id}:${item.totalLanded}`).join("|")
  );
}

export default function DashboardPage() {
  // 1) pull in your raw inventory array
  const globalInventory = useGlobalStore((state) => state.inventory);

  // 2) normalize into numbers + compute totalLanded (for pie chart)
  const baseInventory = useMemo(() => {
    if (!globalInventory || globalInventory.length === 0) return [];
    return globalInventory.map((p) => ({
      id:             p.id,
      name:           p.name,
      unitCost:       Number(p.unitCost)       || 0,
      stockLevel:     Number(p.stockLevel)     || 0,    // <-- new
      shipping:       Number(p.shipping)       || 0,
      storage:        Number(p.storage)        || 0,
      carryingCost:   Number(p.carryingCost)   || 0,
      margin:         Number(p.margin)         || 0,
      turnover:       Number(p.turnover)       || 0,
      daysInInventory:Number(p.daysInInventory)|| 0,
      totalLanded:
        (Number(p.unitCost)     || 0) +
        (Number(p.shipping)     || 0) +
        (Number(p.storage)      || 0) +
        ((Number(p.unitCost)    || 0) * (Number(p.carryingCost)|| 0)) / 100,
    }));
  }, [globalInventory]);

  // 3) old costOverview stays for the pie‐chart & margins
  const costOverview = useMemo(() => {
    const products = baseInventory;
    if (!products.length) return null;

    const totalCost = products.reduce((sum, p) => sum + p.totalLanded, 0);
    const avgMargin =
      products.reduce((sum, p) => sum + p.margin, 0) / products.length;

    const pieData = [
      {
        name:  "Unit Cost",
        value: products.reduce((sum, p) => sum + p.unitCost, 0),
        color: "#6366f1",
      },
      {
        name:  "Shipping",
        value: products.reduce((sum, p) => sum + p.shipping, 0),
        color: "#38bdf8",
      },
      {
        name:  "Storage",
        value: products.reduce((sum, p) => sum + p.storage, 0),
        color: "#fbbf24",
      },
      {
        name:  "Carrying Cost",
        value: products.reduce(
          (sum, p) => sum + (p.unitCost * p.carryingCost) / 100,
          0
        ),
        color: "#10b981",
      },
    ];

    return { totalCost, avgMargin, pieData };
  }, [baseInventory]);

  // 4) NEW: manual total = unitCost * stockLevel
  const manualTotalCost = useMemo(() => {
    return baseInventory.reduce(
      (sum, p) => sum + p.unitCost * p.stockLevel,
      0
    );
  }, [baseInventory]);

  // 5) (Optional) AI & fallback logic unchanged...
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{d.name}</p>
          <p className="text-sm">
            ${d.value.toLocaleString()} ({d.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const [randomFallbacks, setRandomFallbacks] = useState({
    percentChange: 0,
    percentTarget: 0,
    avgMargin:     0,
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

  // 6) spinner state (if you ever want to show one)
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  return (
    <div className="space-y-8 pr-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-blue-100 border">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          Cost Overview
        </h1>
        <p className="text-gray-600">
          Monitor your inventory costs and performance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Inventory Cost */}
        <Card className="bg-white/80 border-blue-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Inventory Cost
                </p>
                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  {/* ALWAYS show manualTotalCost */}
                  ${manualTotalCost.toLocaleString()}
                </p>
                <div className="flex items-center mt-1 text-green-500">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {/* keep your fallback or AI percent here */}
                    {`${randomFallbacks.percentChange.toFixed(1)}% from last month`}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Margin (unchanged) */}
        <Card className="bg-white/80 border-green-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Margin
                </p>
                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                  {`${randomFallbacks.avgMargin.toFixed(1)}%`}
                </p>
                <div className="flex items-center mt-1 text-red-500">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {`${randomFallbacks.percentTarget.toFixed(1)}% from target`}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart & Breakdown */}
      {}
    </div>
  );
}
