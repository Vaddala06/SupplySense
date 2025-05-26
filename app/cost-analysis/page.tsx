"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DollarSign, TrendingDown, Package, Truck, Zap } from "lucide-react"

export default function CostRecommendationsPage() {
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])

  const recommendations = [
    {
      id: "supplier-consolidation",
      title: "Supplier Consolidation",
      description: "Reduce number of suppliers from 15 to 8 key partners",
      savings: 8500,
      impact: "High",
      icon: Package,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "eoq-optimization",
      title: "EOQ Optimization",
      description: "Optimize order quantities to reduce carrying costs",
      savings: 12300,
      impact: "High",
      icon: TrendingDown,
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: "jit-implementation",
      title: "Just-in-Time Implementation",
      description: "Implement JIT for fast-moving items",
      savings: 15600,
      impact: "Very High",
      icon: Zap,
      color: "from-purple-500 to-violet-600",
    },
    {
      id: "shipping-optimization",
      title: "Shipping Route Optimization",
      description: "Optimize delivery routes and consolidate shipments",
      savings: 6200,
      impact: "Medium",
      icon: Truck,
      color: "from-orange-500 to-red-600",
    },
    {
      id: "bulk-purchasing",
      title: "Strategic Bulk Purchasing",
      description: "Negotiate better rates through volume commitments",
      savings: 9800,
      impact: "High",
      icon: DollarSign,
      color: "from-indigo-500 to-blue-600",
    },
  ]

  const baseProducts = [
    {
      id: "WDG-001",
      name: "Wireless Bluetooth Headphones",
      unitCost: 45.0,
      shipping: 3.5,
      storage: 0.8,
      carryingCost: 15,
      totalLanded: 51.96,
      margin: 48.0,
      turnover: 4.2,
      daysInInventory: 87,
    },
    {
      id: "SMT-002",
      name: "Smartphone Case - Silicone",
      unitCost: 8.5,
      shipping: 1.2,
      storage: 0.15,
      carryingCost: 12,
      totalLanded: 10.65,
      margin: 46.7,
      turnover: 6.8,
      daysInInventory: 54,
    },
    {
      id: "CHG-003",
      name: "USB-C Fast Charger 65W",
      unitCost: 22.0,
      shipping: 2.8,
      storage: 0.4,
      carryingCost: 18,
      totalLanded: 27.12,
      margin: 45.8,
      turnover: 3.6,
      daysInInventory: 101,
    },
    {
      id: "SPK-004",
      name: "Portable Bluetooth Speaker",
      unitCost: 35.0,
      shipping: 4.2,
      storage: 0.6,
      carryingCost: 20,
      totalLanded: 42.42,
      margin: 47.0,
      turnover: 2.4,
      daysInInventory: 152,
    },
    {
      id: "CAB-005",
      name: "Lightning to USB Cable",
      unitCost: 12.0,
      shipping: 1.5,
      storage: 0.2,
      carryingCost: 10,
      totalLanded: 14.73,
      margin: 41.1,
      turnover: 5.4,
      daysInInventory: 68,
    },
  ]

  const handleRecommendationToggle = (id: string) => {
    setSelectedRecommendations((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const calculateOptimizedProducts = () => {
    return baseProducts.map((product) => {
      const optimizedProduct = { ...product }

      selectedRecommendations.forEach((recId) => {
        switch (recId) {
          case "supplier-consolidation":
            optimizedProduct.unitCost *= 0.95 // 5% reduction
            break
          case "eoq-optimization":
            optimizedProduct.storage *= 0.7 // 30% reduction
            optimizedProduct.carryingCost *= 0.85 // 15% reduction
            break
          case "jit-implementation":
            optimizedProduct.storage *= 0.5 // 50% reduction
            optimizedProduct.daysInInventory *= 0.6 // 40% reduction
            break
          case "shipping-optimization":
            optimizedProduct.shipping *= 0.8 // 20% reduction
            break
          case "bulk-purchasing":
            optimizedProduct.unitCost *= 0.92 // 8% reduction
            break
        }
      })

      // Recalculate total landed cost
      optimizedProduct.totalLanded =
        optimizedProduct.unitCost +
        optimizedProduct.shipping +
        optimizedProduct.storage +
        (optimizedProduct.unitCost * optimizedProduct.carryingCost) / 100

      return optimizedProduct
    })
  }

  const totalPotentialSavings = selectedRecommendations.reduce((total, id) => {
    const rec = recommendations.find((r) => r.id === id)
    return total + (rec?.savings || 0)
  }, 0)

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Very High":
        return "bg-red-100 text-red-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8 pr-20">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Cost Recommendations
        </h1>
        <p className="text-gray-600">Select optimization strategies to see potential cost savings</p>
      </div>

      {/* Potential Savings Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Potential Savings</h2>
          {selectedRecommendations.length > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg">
              <span className="text-sm font-medium">Total Potential Savings: </span>
              <span className="text-lg font-bold">${totalPotentialSavings.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {recommendations.map((rec) => {
            const Icon = rec.icon
            const isSelected = selectedRecommendations.includes(rec.id)

            return (
              <Card
                key={rec.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isSelected
                    ? "ring-2 ring-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleRecommendationToggle(rec.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleRecommendationToggle(rec.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${rec.color} flex items-center justify-center mb-3`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1">{rec.title}</h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{rec.description}</p>
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-green-600">${rec.savings.toLocaleString()}</div>
                        <Badge className={getImpactColor(rec.impact)} variant="secondary">
                          {rec.impact} Impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Detailed Cost Analysis */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
          <CardTitle className="text-xl text-gray-900">
            {selectedRecommendations.length > 0 ? "Optimized" : "Current"} Detailed Cost Analysis
          </CardTitle>
          {selectedRecommendations.length > 0 && (
            <p className="text-sm text-gray-600">Showing projected costs with selected optimizations applied</p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gradient-to-r from-gray-50 to-slate-50">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">PRODUCT</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">UNIT COST</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">SHIPPING</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">STORAGE/MONTH</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">CARRYING COST %</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">TOTAL LANDED</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">MARGIN %</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">TURNOVER</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">DAYS IN INVENTORY</th>
                </tr>
              </thead>
              <tbody>
                {calculateOptimizedProducts().map((product, index) => {
                  const originalProduct = baseProducts[index]
                  const hasChanges = selectedRecommendations.length > 0

                  return (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{product.id}</div>
                          <div className="text-sm text-gray-600">{product.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">
                          ${product.unitCost.toFixed(2)}
                          {hasChanges && product.unitCost !== originalProduct.unitCost && (
                            <div className="text-xs text-green-600">
                              ↓ ${(originalProduct.unitCost - product.unitCost).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          ${product.shipping.toFixed(2)}
                          {hasChanges && product.shipping !== originalProduct.shipping && (
                            <div className="text-xs text-green-600">
                              ↓ ${(originalProduct.shipping - product.shipping).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          ${product.storage.toFixed(2)}
                          {hasChanges && product.storage !== originalProduct.storage && (
                            <div className="text-xs text-green-600">
                              ↓ ${(originalProduct.storage - product.storage).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">{product.carryingCost.toFixed(0)}%</td>
                      <td className="py-4 px-4">
                        <div className="font-medium">
                          ${product.totalLanded.toFixed(2)}
                          {hasChanges && product.totalLanded !== originalProduct.totalLanded && (
                            <div className="text-xs text-green-600 font-semibold">
                              ↓ ${(originalProduct.totalLanded - product.totalLanded).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-green-600">{product.margin.toFixed(1)}%</td>
                      <td className="py-4 px-4">{product.turnover.toFixed(1)}x</td>
                      <td className={`py-4 px-4 ${product.daysInInventory > 100 ? "text-red-600" : "text-gray-900"}`}>
                        <div>
                          {Math.round(product.daysInInventory)} days
                          {hasChanges && product.daysInInventory !== originalProduct.daysInInventory && (
                            <div className="text-xs text-green-600">
                              ↓ {Math.round(originalProduct.daysInInventory - product.daysInInventory)} days
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
  )
}
