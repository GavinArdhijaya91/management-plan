import { Header } from '@/components/header'
import { SalesChart } from '@/components/sales-chart'
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb } from 'lucide-react'

export default function TrenPasarPage() {
  const trendData = [
    { name: 'Bulan 1', penjualan: 180000, modal: 120000, profit: 60000 },
    { name: 'Bulan 2', penjualan: 210000, modal: 140000, profit: 70000 },
    { name: 'Bulan 3', penjualan: 195000, modal: 130000, profit: 65000 },
    { name: 'Bulan 4', penjualan: 245000, modal: 160000, profit: 85000 },
    { name: 'Bulan 5', penjualan: 280000, modal: 185000, profit: 95000 },
    { name: 'Bulan 6', penjualan: 270000, modal: 175000, profit: 95000 },
  ]

  const products = [
    { name: 'Produk A', trend: 'up', change: 25, market: 'Sedang Naik', status: 'tertarik' },
    { name: 'Produk B', trend: 'up', change: 15, market: 'Stabil', status: 'normal' },
    { name: 'Produk C', trend: 'down', change: -10, market: 'Menurun', status: 'warning' },
    { name: 'Produk D', trend: 'up', change: 32, market: 'Naik Pesat', status: 'tertarik' },
  ]

  const insights = [
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      title: 'Tren Positif Keseluruhan',
      description: 'Bisnis menunjukkan pertumbuhan konsisten sebesar 8% per bulan',
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
      title: 'Produk C Perlu Perhatian',
      description: 'Penjualan menurun 10%. Pertimbangkan promosi atau inovasi produk.',
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-blue-600" />,
      title: 'Peluang Produk D',
      description: 'Produk D sedang trending naik 32%. Tingkatkan stok dan promosi.',
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analisis Tren Pasar</h1>
          <p className="text-gray-600 mt-1">Pelajari tren produk dan peluang pasar untuk bisnis Anda</p>
        </div>

        {/* Trend Chart */}
        <div className="mb-6 md:mb-8">
          <SalesChart data={trendData} type="line" title="Tren Penjualan - 6 Bulan Terakhir" />
        </div>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {insights.map((insight, idx) => (
            <div key={idx} className="siapin-card p-4 md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">{insight.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">{insight.title}</h3>
                  <p className="text-gray-600 text-xs md:text-sm mt-1">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Product Trends */}
        <div className="siapin-card p-4 md:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tren Produk</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-900">Produk</th>
                  <th className="px-4 md:px-6 py-3 text-center font-semibold text-gray-900">Tren</th>
                  <th className="px-4 md:px-6 py-3 text-center font-semibold text-gray-900">Perubahan</th>
                  <th className="px-4 md:px-6 py-3 text-center font-semibold text-gray-900">Kondisi Pasar</th>
                  <th className="px-4 md:px-6 py-3 text-center font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 md:px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {product.trend === 'up' ? (
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center font-medium ${product.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {product.change > 0 ? '+' : ''}
                      {product.change}%
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center text-gray-600">{product.market}</td>
                    <td className="px-4 md:px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.status === 'tertarik'
                            ? 'bg-emerald-100 text-emerald-700'
                            : product.status === 'warning'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {product.status === 'tertarik' ? 'Menarik' : product.status === 'warning' ? 'Warning' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="siapin-card p-4 md:p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Rekomendasi Strategi</h2>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Fokus pada Produk D</p>
                <p className="text-xs text-gray-600 mt-1">Sedang trending naik, tingkatkan inventory dan promosi digital untuk maksimalkan penjualan</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Strategi Rescue Produk C</p>
                <p className="text-xs text-gray-600 mt-1">Coba turunkan harga atau lakukan promosi bundling dengan produk populer</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Pertahankan Momentum</p>
                <p className="text-xs text-gray-600 mt-1">Bisnis Anda tumbuh stabil 8% per bulan. Konsistensi adalah kunci sukses jangka panjang</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
