"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, ArrowDown } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export default function DashboardPage() {
  const costBreakdown = [
    { category: "Product Costs", amount: 32450, percentage: 61.4, color: "#3B82F6" },
    { category: "Shipping & Logistics", amount: 8920, percentage: 16.9, color: "#10B981" },
    { category: "Storage & Warehousing", amount: 4680, percentage: 8.9, color: "#F59E0B" },
    { category: "Carrying Costs", amount: 4230, percentage: 8, color: "#EF4444" },
    { category: "Handling & Processing", amount: 2567, percentage: 4.8, color: "#8B5CF6" },
  ]

  const pieData = costBreakdown.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
    color: item.color,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            ${data.value.toLocaleString()} ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8 pr-20">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Cost Overview
        </h1>
        <p className="text-gray-600">Monitor your inventory costs and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inventory Cost</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  $52,847
                </p>
                <div className="flex items-center mt-1">
                  <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">3.2% from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-green-50 border-green-100 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Margin</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  45.7%
                </p>
                <div className="flex items-center mt-1">
                  <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-500 font-medium">1.1% from target</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
          <CardTitle className="text-xl text-gray-900">Cost Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Pie Chart */}
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown List */}
            <div className="space-y-4">
              {costBreakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-gray-900">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">${item.amount.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100 border-b border-orange-200">
            <CardTitle className="text-lg text-orange-800">Immediate Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="text-sm bg-white p-3 rounded-lg border border-orange-200">
              <span className="font-medium text-orange-800">• Reorder SPK-004</span>
              <span className="text-gray-600"> (below minimum stock)</span>
            </div>
            <div className="text-sm bg-white p-3 rounded-lg border border-orange-200">
              <span className="font-medium text-orange-800">• Review WDG-001</span>
              <span className="text-gray-600"> supplier pricing</span>
            </div>
            <div className="text-sm bg-white p-3 rounded-lg border border-orange-200">
              <span className="font-medium text-orange-800">• Liquidate slow-moving</span>
              <span className="text-gray-600"> CHG-003 units</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
            <CardTitle className="text-lg text-green-800">Cost Savings Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="text-sm bg-white p-3 rounded-lg border border-green-200">
              <span className="font-medium text-green-800">• Supplier consolidation:</span>
              <span className="text-gray-600"> $8.5K savings</span>
            </div>
            <div className="text-sm bg-white p-3 rounded-lg border border-green-200">
              <span className="font-medium text-green-800">• EOQ optimization:</span>
              <span className="text-gray-600"> $12.3K savings</span>
            </div>
            <div className="text-sm bg-white p-3 rounded-lg border border-green-200">
              <span className="font-medium text-green-800">• JIT implementation:</span>
              <span className="text-gray-600"> $15.6K savings</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
