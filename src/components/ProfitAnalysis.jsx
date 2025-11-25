import React, { useState } from 'react';
import { TrendingUp, X } from 'lucide-react';

export default function ProfitAnalysisButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const products = [
    {
      name: 'Under Armour Compression Shirt',
      category: 'Training Apparel',
      costPrice: '₱1500.00',
      sellingPrice: '₱2500.00',
      marginPercent: '66.7%',
      stock: 30,
      totalProfit: '₱30000.00'
    },
    {
      name: 'Nike Dri-FIT Shorts',
      category: 'Training Apparel',
      costPrice: '₱1100.00',
      sellingPrice: '₱1800.00',
      marginPercent: '63.6%',
      stock: 45,
      totalProfit: '₱31500.00'
    },
    {
      name: 'Puma Football Cleats',
      category: 'Football Shoes',
      costPrice: '₱2800.00',
      sellingPrice: '₱4500.00',
      marginPercent: '60.7%',
      stock: 12,
      totalProfit: '₱20400.00'
    },
    {
      name: 'Lakers Jersey - LeBron James #6',
      category: 'Basketball Jersey',
      costPrice: '₱2000.00',
      sellingPrice: '₱3200.00',
      marginPercent: '60.0%',
      stock: 8,
      totalProfit: '₱9600.00'
    },
    {
      name: 'Converse Chuck Taylor All Star',
      category: 'Casual Shoes',
      costPrice: '₱2000.00',
      sellingPrice: '₱3200.00',
      marginPercent: '60.0%',
      stock: 22,
      totalProfit: '₱26400.00'
    },
    {
      name: 'Champion Hoodie',
      category: 'Casual Wear',
      costPrice: '₱2200.00',
      sellingPrice: '₱3500.00',
      marginPercent: '59.1%',
      stock: 18,
      totalProfit: '₱23400.00'
    },
    {
      name: 'Nike Air Force 1 Low White',
      category: 'Basketball Shoes',
      costPrice: '₱3500.00',
      sellingPrice: '₱5500.00',
      marginPercent: '57.1%',
      stock: 25,
      totalProfit: '₱50000.00'
    },
    {
      name: 'Adidas Track Suit',
      category: 'Training Apparel',
      costPrice: '₱3500.00',
      sellingPrice: '₱5500.00',
      marginPercent: '57.1%',
      stock: 14,
      totalProfit: '₱28000.00'
    },
    {
      name: 'Adidas Ultraboost 22',
      category: 'Running Shoes',
      costPrice: '₱5500.00',
      sellingPrice: '₱8500.00',
      marginPercent: '54.5%',
      stock: 15,
      totalProfit: '₱45000.00'
    },
    {
      name: 'Spalding NBA Basketball',
      category: 'Basketball Equipment',
      costPrice: '₱1200.00',
      sellingPrice: '₱1800.00',
      marginPercent: '50.0%',
      stock: 0,
      totalProfit: '₱0.00'
    },
    {
      name: 'Wilson Tennis Racket Pro Staff',
      category: 'Tennis Equipment',
      costPrice: '₱8000.00',
      sellingPrice: '₱12000.00',
      marginPercent: '50.0%',
      stock: 6,
      totalProfit: '₱24000.00'
    },
    {
      name: 'Yonex Badminton Racket',
      category: 'Badminton Equipment',
      costPrice: '₱3200.00',
      sellingPrice: '₱4800.00',
      marginPercent: '50.0%',
      stock: 9,
      totalProfit: '₱14400.00'
    }
  ];

  const getMarginColor = (margin) => {
    const value = parseFloat(margin);
    if (value >= 60) return 'text-blue-600';
    if (value >= 55) return 'text-blue-500';
    return 'text-blue-400';
  };

  const getProgressWidth = (margin) => {
    const value = parseFloat(margin);
    return `${value}%`;
  };

  return (
    <div className="p-8">
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg transition-all duration-200 "
      >
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <span className="font-medium text-slate-800">
          Profit Analysis
        </span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-blue-100 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">Profit Analysis</h2>
                  <p className="text-sm text-blue-100 mt-0.5">
                    View detailed profit margin calculations and product profitability rankings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[calc(90vh-180px)]">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Cost Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Selling Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Margin %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Total Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {products.map((product, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors border-b border-blue-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="text-sm text-blue-600">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{product.costPrice}</td>
                      <td className="px-6 py-4 text-blue-700 font-medium">{product.sellingPrice}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${getMarginColor(product.marginPercent)}`}>
                            {product.marginPercent}
                          </span>
                          <div className="flex-1 bg-blue-100 rounded-full h-2 w-20">
                            <div
                              className="bg-linear-to-r from-blue-600 to-blue-900 h-2 rounded-full transition-all duration-300"
                              style={{ width: getProgressWidth(product.marginPercent) }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-blue-600'}`}>
                          {product.totalProfit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-blue-100 bg-slate-50">
              <div className="text-sm text-slate-600">
                Showing {products.length} products
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}