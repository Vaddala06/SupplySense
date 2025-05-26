import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DemandForecastingPage() {
  const products = [
    {
      id: "WDG-001",
      name: "Wireless Bluetooth Headphones",
      currentMonth: 25,
      nextMonth: 28,
      next3Months: 82,
      trend: "Increasing",
      confidence: 87,
      keyFactors: ["Holiday season", "New model launch", "competitor"],
    },
    {
      id: "SMT-002",
      name: "Smartphone Case - Silicone",
      currentMonth: 85,
      nextMonth: 90,
      next3Months: 260,
      trend: "Stable",
      confidence: 92,
      keyFactors: ["Consistent demand", "New phone releases"],
    },
    {
      id: "CHG-003",
      name: "USB-C Fast Charger 65W",
      currentMonth: 18,
      nextMonth: 22,
      next3Months: 65,
      trend: "Increasing",
      confidence: 78,
      keyFactors: ["Remote work trend", "Fast charging adoption"],
    },
    {
      id: "SPK-004",
      name: "Portable Bluetooth Speaker",
      currentMonth: 12,
      nextMonth: 8,
      next3Months: 28,
      trend: "Decreasing",
      confidence: 65,
      keyFactors: ["Market saturation", "Newer models available"],
    },
    {
      id: "CAB-005",
      name: "Lightning to USB Cable",
      currentMonth: 45,
      nextMonth: 48,
      next3Months: 140,
      trend: "Stable",
      confidence: 89,
      keyFactors: ["Replacement demand", "Device compatibility"],
    },
  ]

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Increasing":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white"
      case "Decreasing":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white"
      case "Stable":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConfidenceWidth = (confidence: number) => {
    return `${confidence}%`
  }

  return (
    <div className="space-y-8 pr-20">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Demand Forecasting & Planning
        </h1>
        <p className="text-gray-600">Predict future demand and plan inventory accordingly</p>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gradient-to-r from-gray-50 to-slate-50">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">PRODUCT</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">CURRENT MONTH</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">NEXT MONTH</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">NEXT 3 MONTHS</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">TREND</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">CONFIDENCE</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">KEY FACTORS</th>
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
                        <div className="font-medium text-gray-900">{product.id}</div>
                        <div className="text-sm text-gray-600">{product.name}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">{product.currentMonth} units</td>
                    <td className="py-4 px-4 font-medium text-gray-900">{product.nextMonth} units</td>
                    <td className="py-4 px-4 font-medium text-gray-900">{product.next3Months} units</td>
                    <td className="py-4 px-4">
                      <Badge className={getTrendColor(product.trend)}>{product.trend}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: getConfidenceWidth(product.confidence) }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{product.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">
                        {product.keyFactors.map((factor, index) => (
                          <div key={index}>• {factor}</div>
                        ))}
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
  )
}
