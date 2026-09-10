import type { Locale } from '../dictionaries'

interface ManagementCopy {
  title: string
  description: string
  exportLabel: string
  resetLabel: string
  addTransaction: string
  modalAddTitle: string
  modalEditTitle: string
  modalDescription: string
  deleteTitle: string
  deleteDescription: string
  deleteConfirm: string
  resetTitle: string
  resetDescription: string
  resetConfirm: string
  submitAdd: string
  submitEdit: string
}

export const managementCopy: Record<Locale, ManagementCopy> = {
  id: {
    title: 'Manajemen transaksi & penjualan',
    description: 'Kelola transaksi, biaya pokok, dan hasil bersih usaha Anda.',
    exportLabel: 'Ekspor',
    resetLabel: 'Reset Demo',
    addTransaction: 'Tambah Transaksi',
    modalAddTitle: 'Tambah transaksi',
    modalEditTitle: 'Edit transaksi',
    modalDescription: 'Data akan disimpan otomatis di perangkat ini.',
    deleteTitle: 'Hapus transaksi?',
    deleteDescription: 'Transaksi yang dihapus tidak dapat dikembalikan, kecuali dengan mereset seluruh data demo.',
    deleteConfirm: 'Hapus transaksi',
    resetTitle: 'Kembalikan data demo?',
    resetDescription: 'Semua transaksi buatan dan perubahan Anda akan diganti dengan data contoh awal.',
    resetConfirm: 'Reset data demo',
    submitAdd: 'Tambah transaksi',
    submitEdit: 'Simpan perubahan',
  },
  en: {
    title: 'Transaction & sales management',
    description: 'Manage transactions, direct costs and net results.',
    exportLabel: 'Export',
    resetLabel: 'Reset Demo',
    addTransaction: 'Add Transaction',
    modalAddTitle: 'Add transaction',
    modalEditTitle: 'Edit transaction',
    modalDescription: 'Data is saved automatically on this device.',
    deleteTitle: 'Delete transaction?',
    deleteDescription: 'Deleted transactions cannot be restored except by resetting all demo data.',
    deleteConfirm: 'Delete transaction',
    resetTitle: 'Restore demo data?',
    resetDescription: 'All custom transactions and changes will be replaced with the initial sample data.',
    resetConfirm: 'Reset demo data',
    submitAdd: 'Add transaction',
    submitEdit: 'Save changes',
  },
  ja: {
    title: '取引・売上管理',
    description: '取引、原価、純利益を管理しましょう。',
    exportLabel: 'エクスポート',
    resetLabel: 'デモをリセット',
    addTransaction: '取引を追加',
    modalAddTitle: '取引を追加',
    modalEditTitle: '取引を編集',
    modalDescription: 'データはこの端末に自動保存されます。',
    deleteTitle: '取引を削除しますか？',
    deleteDescription: '削除した取引はデモデータをリセットしない限り復元できません。',
    deleteConfirm: '取引を削除',
    resetTitle: 'デモデータを復元しますか？',
    resetDescription: '作成した取引や変更は初期サンプルデータに置き換えられます。',
    resetConfirm: 'デモをリセット',
    submitAdd: '取引を追加',
    submitEdit: '変更を保存',
  },
  es: {
    title: 'Gestión de transacciones y ventas',
    description: 'Gestiona transacciones, costes directos y resultado neto.',
    exportLabel: 'Exportar',
    resetLabel: 'Restablecer demo',
    addTransaction: 'Añadir transacción',
    modalAddTitle: 'Añadir transacción',
    modalEditTitle: 'Editar transacción',
    modalDescription: 'Los datos se guardan automáticamente en este dispositivo.',
    deleteTitle: '¿Eliminar transacción?',
    deleteDescription: 'Las transacciones eliminadas solo se pueden recuperar restableciendo los datos de la demo.',
    deleteConfirm: 'Eliminar transacción',
    resetTitle: '¿Restaurar datos de demostración?',
    resetDescription: 'Todas las transacciones personalizadas se reemplazarán con los datos de ejemplo iniciales.',
    resetConfirm: 'Restablecer demo',
    submitAdd: 'Añadir transacción',
    submitEdit: 'Guardar cambios',
  },
  fr: {
    title: 'Gestion des transactions & ventes',
    description: 'Gérez transactions, coûts directs et résultat net.',
    exportLabel: 'Exporter',
    resetLabel: 'Réinitialiser la démo',
    addTransaction: 'Ajouter une transaction',
    modalAddTitle: 'Ajouter une transaction',
    modalEditTitle: 'Modifier la transaction',
    modalDescription: 'Les données sont enregistrées automatiquement sur cet appareil.',
    deleteTitle: 'Supprimer la transaction ?',
    deleteDescription: 'Les transactions supprimées ne peuvent être restaurées qu’en réinitialisant la démo.',
    deleteConfirm: 'Supprimer la transaction',
    resetTitle: 'Restaurer les données de démo ?',
    resetDescription: 'Toutes vos transactions personnalisées seront remplacées par les données initiales.',
    resetConfirm: 'Réinitialiser la démo',
    submitAdd: 'Ajouter la transaction',
    submitEdit: 'Enregistrer',
  },
  de: {
    title: 'Transaktions- & Verkaufsverwaltung',
    description: 'Verwalten Sie Transaktionen, direkte Kosten und Nettoergebnis.',
    exportLabel: 'Exportieren',
    resetLabel: 'Demo zurücksetzen',
    addTransaction: 'Transaktion hinzufügen',
    modalAddTitle: 'Transaktion hinzufügen',
    modalEditTitle: 'Transaktion bearbeiten',
    modalDescription: 'Daten werden automatisch auf diesem Gerät gespeichert.',
    deleteTitle: 'Transaktion löschen?',
    deleteDescription: 'Gelöschte Transaktionen können nur durch Zurücksetzen der Demodaten wiederhergestellt werden.',
    deleteConfirm: 'Transaktion löschen',
    resetTitle: 'Demodaten wiederherstellen?',
    resetDescription: 'Alle eigenen Transaktionen werden durch die初始-Beispieldaten ersetzt.',
    resetConfirm: 'Demo zurücksetzen',
    submitAdd: 'Transaktion hinzufügen',
    submitEdit: 'Änderungen speichern',
  },
}
