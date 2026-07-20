import { Header } from '@/components/header'
import { KPICard } from '@/components/kpi-card'
import { SalesChart } from '@/components/sales-chart'
import { StatusBadge } from '@/components/status-badge'
import { DollarSign, ShoppingCart, TrendingUp, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { weeklySales, weeklyTasks } from '@/data/dashboard'

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="page-shell">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang kembali! Ini adalah ringkasan bisnis Anda.</p>
        </div>

        {/* KPI Cards - Grid responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <KPICard
            title="Total Penjualan"
            value="Rp 206.000"
            icon={<DollarSign className="w-6 h-6" />}
            trend={{ direction: 'up', percentage: 12 }}
            bgColor="bg-blue-50"
          />
          <KPICard
            title="Modal Bulan Ini"
            value="Rp 137.000"
            icon={<ShoppingCart className="w-6 h-6" />}
            trend={{ direction: 'down', percentage: 5 }}
            bgColor="bg-emerald-50"
          />
          <KPICard
            title="Laba Bersih"
            value="Rp 69.000"
            icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
            trend={{ direction: 'up', percentage: 18 }}
            bgColor="bg-emerald-50"
          />
          <KPICard
            title="Jadwal Terdekat"
            value="3 Hari"
            icon={<Calendar className="w-6 h-6 text-blue-600" />}
            bgColor="bg-blue-50"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="lg:col-span-2">
            <SalesChart data={weeklySales} type="bar" title="Penjualan vs Modal - 4 Minggu Terakhir" />
          </div>

          {/* Quick Insights */}
          <div className="siapin-card p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Wawasan Cepat</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Target Tercapai</p>
                  <p className="text-xs text-gray-600 mt-0.5">Penjualan sudah capai 95% target bulan ini</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Stok Menipis</p>
                  <p className="text-xs text-gray-600 mt-0.5">Produk A dan C perlu restock segera</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tren Positif</p>
                  <p className="text-xs text-gray-600 mt-0.5">Produk B naik 25% dibanding minggu lalu</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Rencana Aksi */}
          <div className="siapin-card p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Rencana Minggu Ini</h3>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">5 tugas</span>
            </div>
            <div className="space-y-2">
              {weeklyTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={task.completed} className="w-4 h-4 rounded text-blue-600" readOnly />
                  <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.title}
                  </span>
                  {task.priority === 'high' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">Urgent</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Summary Status */}
          <div className="siapin-card p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Modal Tersedia</span>
                <StatusBadge status="aman" label="Aman" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Penjualan Hari Ini</span>
                <StatusBadge status="untung" label="Untung" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Target Bulanan</span>
                <StatusBadge status="tercapai" label="Tercapai" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Inventaris Stok</span>
                <StatusBadge status="warning" label="Warning" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
