"use client"

import { useState, useRef } from "react"
import Papa from "papaparse"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload } from "lucide-react"

export default function InventorySetupPage() {
  const [products, setProducts] = useState([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const normalizeKey = (key: string) =>
    key.toLowerCase().replace(/[^a-z0-9]/g, "")

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const csvProducts = results.data.map((row: any, idx: number) => {
          const normalized: Record<string, any> = {}
          Object.keys(row).forEach((k) => {
            normalized[normalizeKey(k)] = row[k]
          })
          return {
            id: normalized.ingredient || normalized.product || normalized.id || `CSV-${idx}`,
            name: normalized.ingredient || normalized.name || "",
            category: normalized.category || "",
            supplier: normalized.supplier || "",
            unitCost: parseFloat(normalized.unitcost || 0),
            stockLevel: normalized.stocklevellbs || normalized.stocklevel || "",
            abcClass: normalized.abcclass || "",
          }
        })
        setProducts(csvProducts)
      },
    })
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-8 pr-20">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Inventory Setup
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
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" onClick={handleButtonClick}>
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
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getClassColor(product.abcClass)}>Class {product.abcClass}</Badge>
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
