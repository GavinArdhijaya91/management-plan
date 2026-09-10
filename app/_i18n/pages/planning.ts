import type { Locale } from '../dictionaries'

interface PlanningCopy {
  eyebrow: string
  title: string
  description: string
  demoNotice: string
  businessGoal: string
  evaluate: string
  nextAction: string
  plans: { title: string; status: string; progress: number }[]
}

export const planningCopy: Record<Locale, PlanningCopy> = {
  id: {
    eyebrow: 'Mode demo',
    title: 'Planning bisnis',
    description: 'Lihat bagaimana rencana, target, dan tindakan saling terhubung sebelum membuat workspace.',
    demoNotice: 'Perubahan pada halaman demo tidak masuk ke workspace privat.',
    businessGoal: 'Business goal',
    evaluate: 'Evaluasi hasil aktual',
    nextAction: 'Tindakan berikutnya',
    plans: [
      { title: 'Meningkatkan penjualan produk utama', status: 'Aktif', progress: 68 },
      { title: 'Menekan biaya operasional bulanan', status: 'Ditinjau', progress: 42 },
    ],
  },
  en: {
    eyebrow: 'Demo mode',
    title: 'Business planning',
    description: 'See how plans, targets and actions connect before creating a workspace.',
    demoNotice: 'Changes on demo pages do not affect your private workspace.',
    businessGoal: 'Business goal',
    evaluate: 'Evaluate actual results',
    nextAction: 'Next action',
    plans: [
      { title: 'Increase sales of the main product', status: 'Active', progress: 68 },
      { title: 'Reduce monthly operational costs', status: 'In review', progress: 42 },
    ],
  },
  ja: {
    eyebrow: 'デモモード',
    title: '事業計画',
    description: 'ワークスペースを作成する前に、計画・目標・アクションのつながりを確認しましょう。',
    demoNotice: 'デモページの変更はプライベートワークスペースに反映されません。',
    businessGoal: 'Business goal',
    evaluate: '実績を評価',
    nextAction: '次のアクション',
    plans: [
      { title: '主力商品の売上を伸ばす', status: '進行中', progress: 68 },
      { title: '月次の運営コストを削減', status: '確認中', progress: 42 },
    ],
  },
  es: {
    eyebrow: 'Modo demo',
    title: 'Planificación del negocio',
    description: 'Descubre cómo planes, objetivos y acciones se conectan antes de crear un espacio de trabajo.',
    demoNotice: 'Los cambios en la demo no afectan tu espacio privado.',
    businessGoal: 'Objetivo de negocio',
    evaluate: 'Evaluar resultados reales',
    nextAction: 'Siguiente acción',
    plans: [
      { title: 'Aumentar ventas del producto principal', status: 'Activo', progress: 68 },
      { title: 'Reducir costes operativos mensuales', status: 'En revisión', progress: 42 },
    ],
  },
  fr: {
    eyebrow: 'Mode démo',
    title: 'Planification business',
    description: 'Voyez comment plans, objectifs et actions se connectent avant de créer un espace de travail.',
    demoNotice: 'Les modifications en démo ne sont pas enregistrées dans votre espace privé.',
    businessGoal: 'Objectif business',
    evaluate: 'Évaluer les résultats réels',
    nextAction: 'Action suivante',
    plans: [
      { title: 'Augmenter les ventes du produit phare', status: 'Actif', progress: 68 },
      { title: 'Réduire les coûts opérationnels mensuels', status: 'En revue', progress: 42 },
    ],
  },
  de: {
    eyebrow: 'Demo-Modus',
    title: 'Business-Planung',
    description: 'Sehen Sie, wie Pläne, Ziele und Maßnahmen zusammenhängen, bevor Sie einen Workspace erstellen.',
    demoNotice: 'Änderungen in der Demo wirken sich nicht auf Ihren privaten Workspace aus.',
    businessGoal: 'Business-Ziel',
    evaluate: 'Tatsächliche Ergebnisse bewerten',
    nextAction: 'Nächste Aktion',
    plans: [
      { title: 'Umsatz des Hauptprodukts steigern', status: 'Aktiv', progress: 68 },
      { title: 'Monatliche Betriebskosten senken', status: 'In Prüfung', progress: 42 },
    ],
  },
}
