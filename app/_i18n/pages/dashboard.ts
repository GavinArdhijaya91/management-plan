import type { Locale } from '../dictionaries'

interface DashboardCopy {
  eyebrow: string
  title: string
  description: string
  manage: string
  demo: string
  sales: string
  costAmount: string
  profit: string
  remainingPlans: string
  tasks: string
  chart: string
  insights: string
  marginTitle: string
  marginDescription: string
  expenseTitle: string
  expenseDescription: string
  action: string
  weekly: string
  remaining: string
  important: string
  taskLabels: Record<number, string>
}

export const dashboardCopy: Record<Locale, DashboardCopy> = {
  id: {
    eyebrow: 'Ringkasan ruang kerja',
    title: 'Selamat datang kembali.',
    description: 'Angka di halaman ini mengikuti data pada menu Manajemen.',
    manage: 'Kelola transaksi',
    demo: 'Mode demo aktif. Perubahan disimpan hanya di perangkat ini.',
    sales: 'Total penjualan',
    costAmount: 'Total biaya pokok',
    profit: 'Laba bersih',
    remainingPlans: 'Rencana tersisa',
    tasks: 'tugas',
    chart: 'Performa transaksi terbaru',
    insights: 'Wawasan otomatis',
    marginTitle: 'Perhatikan margin usaha',
    marginDescription: 'Gunakan perbandingan laba dan penjualan untuk menilai efisiensi bisnis.',
    expenseTitle: 'Pantau pengeluaran',
    expenseDescription: 'Tinjau pengeluaran secara berkala agar arus kas tetap sehat.',
    action: 'Rencana aksi',
    weekly: 'Prioritas minggu ini',
    remaining: 'tersisa',
    important: 'Penting',
    taskLabels: { 1: 'Cek stok barang', 2: 'Lapor penjualan harian', 3: 'Hubungi supplier', 4: 'Update inventaris' },
  },
  en: {
    eyebrow: 'Workspace overview',
    title: 'Welcome back.',
    description: 'The figures on this page follow your Management transaction data.',
    manage: 'Manage transactions',
    demo: 'Demo mode is active. Changes are stored only on this device.',
    sales: 'Total sales',
    costAmount: 'Total direct cost',
    profit: 'Net profit',
    remainingPlans: 'Remaining plans',
    tasks: 'tasks',
    chart: 'Recent transaction performance',
    insights: 'Automated insights',
    marginTitle: 'Review your business margin',
    marginDescription: 'Compare profit and sales to evaluate business efficiency.',
    expenseTitle: 'Monitor expenses',
    expenseDescription: 'Review expenses regularly to maintain healthy cash flow.',
    action: 'Action plan',
    weekly: 'This week’s priorities',
    remaining: 'remaining',
    important: 'Important',
    taskLabels: {
      1: 'Check product stock',
      2: 'Submit the daily sales report',
      3: 'Contact the supplier',
      4: 'Update inventory',
    },
  },
  ja: {
    eyebrow: 'ワークスペース概要',
    title: 'おかえりなさい。',
    description: 'このページの数値は管理画面の取引データに連動しています。',
    manage: '取引を管理',
    demo: 'デモモードです。変更はこの端末にのみ保存されます。',
    sales: '総売上',
    costAmount: '直接原価合計',
    profit: '純利益',
    remainingPlans: '残りの計画',
    tasks: '件',
    chart: '最近の取引実績',
    insights: '自動インサイト',
    marginTitle: '利益率を確認',
    marginDescription: '利益と売上を比較して事業効率を評価しましょう。',
    expenseTitle: '支出を監視',
    expenseDescription: '健全なキャッシュフローのため定期的に支出を確認しましょう。',
    action: '行動計画',
    weekly: '今週の優先事項',
    remaining: '残り',
    important: '重要',
    taskLabels: { 1: '商品在庫を確認', 2: '日次売上を報告', 3: '仕入先に連絡', 4: '在庫情報を更新' },
  },
  es: {
    eyebrow: 'Resumen del espacio de trabajo',
    title: 'Bienvenido de nuevo.',
    description: 'Las cifras de esta página se basan en los datos de transacciones de Gestión.',
    manage: 'Gestionar transacciones',
    demo: 'El modo de demostración está activo. Los cambios solo se guardan en este dispositivo.',
    sales: 'Ventas totales',
    costAmount: 'Total biaya langsung',
    profit: 'Beneficio neto',
    remainingPlans: 'Planes pendientes',
    tasks: 'tareas',
    chart: 'Rendimiento reciente',
    insights: 'Análisis automáticos',
    marginTitle: 'Revisa el margen del negocio',
    marginDescription: 'Compara beneficios y ventas para evaluar la eficiencia.',
    expenseTitle: 'Controla los gastos',
    expenseDescription: 'Revisa los gastos regularmente para mantener un flujo de caja saludable.',
    action: 'Plan de acción',
    weekly: 'Prioridades de esta semana',
    remaining: 'pendientes',
    important: 'Importante',
    taskLabels: {
      1: 'Revisar existencias',
      2: 'Enviar informe diario de ventas',
      3: 'Contactar al proveedor',
      4: 'Actualizar inventario',
    },
  },
  fr: {
    eyebrow: "Vue d'ensemble de l'espace",
    title: 'Heureux de vous revoir.',
    description: 'Les chiffres de cette page suivent les transactions de la section Gestion.',
    manage: 'Gérer les transactions',
    demo: 'Le mode démonstration est actif. Les modifications sont stockées uniquement sur cet appareil.',
    sales: 'Ventes totales',
    costAmount: 'Coût direct total',
    profit: 'Bénéfice net',
    remainingPlans: 'Plans restants',
    tasks: 'tâches',
    chart: 'Performance récente',
    insights: 'Analyses automatiques',
    marginTitle: "Vérifiez la marge de l'entreprise",
    marginDescription: "Comparez le bénéfice et les ventes pour évaluer l'efficacité.",
    expenseTitle: 'Surveillez les dépenses',
    expenseDescription: 'Examinez régulièrement les dépenses pour préserver la trésorerie.',
    action: "Plan d'action",
    weekly: 'Priorités de la semaine',
    remaining: 'restantes',
    important: 'Important',
    taskLabels: {
      1: 'Vérifier les stocks',
      2: 'Envoyer le rapport quotidien',
      3: 'Contacter le fournisseur',
      4: "Mettre à jour l'inventaire",
    },
  },
  de: {
    eyebrow: 'Arbeitsbereich im Überblick',
    title: 'Willkommen zurück.',
    description: 'Die Zahlen auf dieser Seite basieren auf den Transaktionsdaten der Verwaltung.',
    manage: 'Transaktionen verwalten',
    demo: 'Der Demomodus ist aktiv. Änderungen werden nur auf diesem Gerät gespeichert.',
    sales: 'Gesamtumsatz',
    costAmount: 'Gesamte direkte Kosten',
    profit: 'Nettogewinn',
    remainingPlans: 'Offene Pläne',
    tasks: 'Aufgaben',
    chart: 'Aktuelle Transaktionsleistung',
    insights: 'Automatische Einblicke',
    marginTitle: 'Geschäftsmarge prüfen',
    marginDescription: 'Vergleichen Sie Gewinn und Umsatz, um die Effizienz zu bewerten.',
    expenseTitle: 'Ausgaben überwachen',
    expenseDescription: 'Prüfen Sie Ausgaben regelmäßig für einen gesunden Cashflow.',
    action: 'Aktionsplan',
    weekly: 'Prioritäten dieser Woche',
    remaining: 'offen',
    important: 'Wichtig',
    taskLabels: {
      1: 'Warenbestand prüfen',
      2: 'Tagesumsatz melden',
      3: 'Lieferanten kontaktieren',
      4: 'Inventar aktualisieren',
    },
  },
}
