'use client'

import { Header } from '@/components/header'
import { StatusBadge } from '@/components/status-badge'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { useState } from 'react'
import { transactions } from '@/data/transactions'

export default function ManajemenPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTransactions = transactions.filter(
    (t) => t.type.toLowerCase().includes(searchTerm.toLowerCase()) || t.date.includes(searchTerm)
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="page-shell">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manajemen Modal & Penjualan</h1>
            <p className="text-gray-600 mt-1">Kelola transaksi, modal, dan proyeksi laba/rugi Anda</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer w-full md:w-auto flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Tambah Transaksi
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="siapin-card p-4 md:p-6">
            <p className="text-gray-600 text-sm font-medium">Total Modal Bulan Ini</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">Rp 445.000</p>
            <p className="text-xs text-gray-500 mt-2">Dari 8 transaksi</p>
          </div>
          <div className="siapin-card p-4 md:p-6">
            <p className="text-gray-600 text-sm font-medium">Total Penjualan</p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-600 mt-2">Rp 570.000</p>
            <p className="text-xs text-gray-500 mt-2">+28% dari target</p>
          </div>
          <div className="siapin-card p-4 md:p-6">
            <p className="text-gray-600 text-sm font-medium">Margin Keuntungan</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">28%</p>
            <p className="text-xs text-gray-500 mt-2">Rp 200.000 profit</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="siapin-card p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                aria-label="Cari transaksi"
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select aria-label="Filter tipe transaksi" className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Semua Tipe</option>
              <option>Penjualan</option>
              <option>Pengeluaran</option>
            </select>
            <select aria-label="Filter periode transaksi" className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Bulan Ini</option>
              <option>Bulan Lalu</option>
              <option>3 Bulan Lalu</option>
            </select>
          </div>
        </div>

        {/* Transactions Table - Responsive */}
        <div className="siapin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-900">Tanggal</th>
                  <th className="px-4 md:px-6 py-3 text-left font-semibold text-gray-900">Tipe</th>
                  <th className="px-4 md:px-6 py-3 text-right font-semibold text-gray-900">Jumlah</th>
                  <th className="hidden md:table-cell px-4 md:px-6 py-3 text-right font-semibold text-gray-900">Modal</th>
                  <th className="hidden md:table-cell px-4 md:px-6 py-3 text-right font-semibold text-gray-900">Profit/Rugi</th>
                  <th className="px-4 md:px-6 py-3 text-center font-semibold text-gray-900">Status</th>
                  <th className="px-4 md:px-6 py-3 text-center font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 text-gray-900">{transaction.date}</td>
                    <td className="px-4 md:px-6 py-4 text-gray-900">{transaction.type}</td>
                    <td className="px-4 md:px-6 py-4 text-right font-medium text-gray-900">
                      {transaction.amount > 0 ? '+' : ''}
                      Rp {Math.abs(transaction.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="hidden md:table-cell px-4 md:px-6 py-4 text-right text-gray-600">
                      Rp {transaction.modal.toLocaleString('id-ID')}
                    </td>
                    <td className="hidden md:table-cell px-4 md:px-6 py-4 text-right font-medium">
                      <span className={transaction.profit > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {transaction.profit > 0 ? '+' : ''}
                        Rp {Math.abs(transaction.profit).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                      <StatusBadge status={transaction.status} label={transaction.status === 'untung' ? 'Untung' : 'Rugi'} />
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button aria-label={`Edit transaksi ${transaction.date}`} className="p-2.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button aria-label={`Hapus transaksi ${transaction.date}`} className="p-2.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
