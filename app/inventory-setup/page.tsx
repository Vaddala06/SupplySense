import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Edit, Trash2 } from "lucide-react"

export default function InventorySetupPage() {
  const products = [
    {
      id: "WDG-001",
      name: "Wireless Bluetooth Headphones",
      category: "Electronics",
      supplier: "TechSource Ltd",
      unitCost: 45.0,
      stockLevel: "150 units",
      reorderAt: 50,
      abcClass: "A",
    },
    {
      id: "SMT-002",
      name: "Smartphone Case - Silicone",
      category: "Accessories",
      supplier: "CaseMaker Inc",
      unitCost: 8.5,
      stockLevel: "450 units",
      reorderAt: 100,
      abcClass: "B",
    },
    {
      id: "CHG-003",
      name: "USB-C Fast Charger 65W",
      category: "Electronics",
      supplier: "PowerTech Co",
      unitCost: 22.0,
      stockLevel: "75 units",
      reorderAt: 30,
      abcClass: "A",
    },
    {
      id: "SPK-004",
      name: "Portable Bluetooth Speaker",
      category: "Electronics",
      supplier: "AudioMax Ltd",
      unitCost: 35.0,
      stockLevel: "25 units",
      reorderAt: 40,
      abcClass: "C",
    },
    {
      id: "CAB-005",
      name: "Lightning to USB Cable",
      category: "Accessories",
      supplier: "CablePro Inc",
      unitCost: 12.0,
      stockLevel: "200 units",
      reorderAt: 75,
      abcClass: "B",
    },
  ]

  const getClassColor = (abcClass: string) => {
    switch (abcClass) {
      case "A":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white"
      case "B":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
      case "C":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8 pr-20">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Inventory Setup & Data Import
        </h1>
        <p className="text-gray-600">Upload and manage your inventory data</p>
      </div>

      {/* Import Options */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <Card className="border-dashed border-2 border-blue-300 hover:border-blue-400 transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 shadow-lg hover:shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">CSV Upload</h3>
              <p className="text-sm text-gray-600 mb-6">Upload inventory data from spreadsheet</p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                Upload CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Products Table */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
          <CardTitle className="text-xl text-gray-900">Current Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gradient-to-r from-gray-50 to-slate-50">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">PRODUCT</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">CATEGORY</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">SUPPLIER</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">UNIT COST</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">STOCK LEVEL</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">ABC CLASS</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">ACTIONS</th>
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
                    <td className="py-4 px-4 text-sm text-gray-700">{product.category}</td>
                    <td className="py-4 px-4 text-sm text-gray-700">{product.supplier}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">${product.unitCost.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{product.stockLevel}</div>
                        <div className="text-gray-500">Reorder at {product.reorderAt}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getClassColor(product.abcClass)}>Class {product.abcClass}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-800 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
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
