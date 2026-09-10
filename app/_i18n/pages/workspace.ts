import type { Locale } from '../dictionaries'

export interface WorkspaceCopy {
  badge: string
  dashboard: {
    title: string
    description: string
    openPlanning: string
    alertPartial: string
    cards: { transactions: string; goals: string; actions: string; events: string; activeWorkspace: string }
    decision: { eyebrow: string; title: string; countSuffix: string }
    decisionRows: {
      attention: string
      attentionDetail: string
      attentionAction: string
      attentionActionView: string
      overdue: string
      overdueFallback: string
      overdueAction: string
      review: string
      reviewDetail: string
      reviewAction: string
      reviewActionView: string
      emptyTitle: string
      emptyDesc: string
    }
    cycle: { eyebrow: string; title: string; steps: string[]; done: string; next: string; action: string }
    recent: { title: string; description: string; viewAll: string; emptyTitle: string; emptyDesc: string; sale: string; expense: string }
  }
  management: {
    title: string
    description: string
    addTransaction: string
    form: { date: string; type: string; sale: string; expense: string; amount: string; cost: string; note: string; noteOptional: string; submit: string; openForm: string }
    table: { date: string; type: string; amount: string; cost: string; net: string }
    empty: { title: string; description: string }
    error: string
  }
  calendar: { error: string }
  planning: {
    title: string
    description: string
    measurements: string
    evaluation: string
    createPlan: string
    planForm: { name: string; description: string; start: string; end: string; visibility: string; visWorkspace: string; visRestricted: string; submit: string }
    empty: { title: string; description: string }
    status: Record<string, string>
    restricted: string
    targetCount: string
    initiativeCount: string
    addTarget: string
    targetForm: { name: string; targetDate: string; description: string; submit: string }
    addInitiative: string
    initiativeForm: { name: string; relatedGoal: string; noGoal: string; context: string; start: string; end: string; budget: string; description: string; submit: string }
    overdue: string
    overdueToday: string
    changeStatus: string
    chooseNext: string
    reasonPlaceholder: string
    replacementDate: string
    apply: string
    archive: string
    restore: string
    addAction: string
    actionForm: { name: string; assignee: string; priority: string; start: string; due: string; description: string; submit: string }
    p1: string; p2: string; p3: string; p4: string
    memberFallback: string
    duePrefix: string
  }
}

export const workspaceCopy: Record<Locale, WorkspaceCopy> = {
  id: {
    badge: 'Workspace',
    dashboard: {
      title: 'Dashboard usaha',
      description: 'Kondisi aktual, komitmen berjalan, dan aktivitas terbaru dalam satu tampilan.',
      openPlanning: 'Buka planning',
      alertPartial: 'Sebagian ringkasan belum dapat dimuat. Coba segarkan halaman.',
      cards: { transactions: 'Transaksi tercatat', goals: 'Goal aktif', actions: 'Tindakan berjalan', events: 'Agenda mendatang', activeWorkspace: 'Workspace aktif' },
      decision: { eyebrow: 'Perlu keputusan', title: 'Sinyal operasional', countSuffix: 'item' },
      decisionRows: {
        attention: 'target perlu diperiksa', attentionDetail: 'Sumber aktual belum tersedia atau berbeda melewati toleransi.',
        attentionAction: 'Perbarui actual', attentionActionView: 'Lihat pengukuran',
        overdue: 'pekerjaan melewati tenggat', overdueFallback: 'Tinjau prioritas dan penanggung jawab.', overdueAction: 'Buka planning',
        review: 'evaluasi masih draft', reviewDetail: 'Periksa readiness sebelum evidence dikunci.', reviewAction: 'Finalisasi evaluasi', reviewActionView: 'Lihat evaluasi',
        emptyTitle: 'Belum ada sinyal kritis', emptyDesc: 'Tambahkan target terukur agar dashboard dapat membandingkan rencana dan hasil aktual.',
      },
      cycle: { eyebrow: 'Siklus keputusan', title: 'Lanjutkan dari data', steps: ['Tetapkan target terukur','Catat atau hubungkan actual','Evaluasi dan kunci evidence'], done: 'Selesai', next: 'Berikutnya', action: 'Buka target dan actual' },
      recent: { title: 'Transaksi terbaru', description: 'Aktivitas finansial terakhir pada workspace.', viewAll: 'Lihat semua', emptyTitle: 'Belum ada transaksi', emptyDesc: 'Catat aktivitas finansial pertama agar ringkasan aktual mulai terbentuk.', sale: 'Penjualan', expense: 'Pengeluaran' },
    },
    management: {
      title: 'Manajemen transaksi', description: 'Ledger aktual dari database workspace privat.',
      addTransaction: 'Tambah transaksi',
      form: { date: 'Tanggal', type: 'Tipe', sale: 'Penjualan', expense: 'Pengeluaran', amount: 'Jumlah', cost: 'Biaya pokok', note: 'Catatan', noteOptional: '(opsional)', submit: 'Simpan transaksi', openForm: 'Buka formulir' },
      table: { date: 'Tanggal', type: 'Jenis', amount: 'Nominal', cost: 'Biaya pokok', net: 'Hasil bersih' },
      empty: { title: 'Belum ada transaksi privat', description: 'Workspace ini masih kosong. Data demo hanya tersedia melalui tombol Buka Demo pada halaman utama.' },
      error: 'Transaksi gagal dimuat. Periksa permission role atau coba kembali.',
    },
    calendar: { error: 'Agenda gagal dimuat. Periksa permission kalender Anda.' },
    planning: {
      title: 'Planning bisnis', description: 'Hubungkan arah bisnis menjadi target, initiative, dan tindakan yang dapat dievaluasi.',
      measurements: 'Pengukuran', evaluation: 'Evaluasi', createPlan: 'Buat rencana bisnis',
      planForm: { name: 'Nama rencana', description: 'Deskripsi', start: 'Mulai', end: 'Selesai', visibility: 'Visibilitas', visWorkspace: 'Seluruh anggota sesuai permission', visRestricted: 'Hanya owner dan penerima grant', submit: 'Simpan sebagai draft' },
      empty: { title: 'Belum ada rencana bisnis', description: 'Buat draft pertama, tambahkan target, lalu aktifkan saat strukturnya siap.' },
      status: { draft:'Draft', active:'Aktif', completed:'Selesai', archived:'Diarsipkan', cancelled:'Dibatalkan', achieved:'Tercapai', missed:'Terlewat', planned:'Direncanakan', paused:'Dijeda', todo:'Belum dimulai', in_progress:'Dikerjakan', blocked:'Terhambat' },
      restricted: 'Restricted', targetCount: 'target', initiativeCount: 'initiative',
      addTarget: 'Tambah target', targetForm: { name: 'Nama target', targetDate: 'Tanggal target', description: 'Deskripsi', submit: 'Tambahkan target' },
      addInitiative: 'Tambah initiative', initiativeForm: { name: 'Nama initiative', relatedGoal: 'Target terkait', noGoal: 'Tanpa target khusus', context: 'Konteks jika tanpa target', start: 'Mulai', end: 'Selesai', budget: 'Anggaran', description: 'Deskripsi', submit: 'Tambahkan initiative' },
      overdue: 'Overdue', overdueToday: 'Jatuh tempo hari ini', changeStatus: 'Ubah status', chooseNext: 'Pilih status berikutnya', reasonPlaceholder: 'Alasan, jika diperlukan', replacementDate: 'Tanggal pengganti saat membuka target terlewat', apply: 'Terapkan perubahan', archive: 'Arsipkan', restore: 'Pulihkan',
      addAction: 'Tambah tindakan', actionForm: { name: 'Nama tindakan', assignee: 'Assignee', priority: 'Prioritas', start: 'Mulai', due: 'Tenggat', description: 'Deskripsi', submit: 'Tambahkan tindakan' },
      p1:'P1 · Kritis', p2:'P2 · Tinggi', p3:'P3 · Normal', p4:'P4 · Rendah', memberFallback:'Anggota', duePrefix:'tenggat',
    },
  },
  en: {
    badge: 'Workspace',
    dashboard: {
      title: 'Business dashboard', description: 'Actual status, ongoing commitments and recent activity in one view.',
      openPlanning: 'Open planning', alertPartial: 'Some summaries failed to load. Try refreshing.',
      cards: { transactions: 'Recorded transactions', goals: 'Active goals', actions: 'Ongoing actions', events: 'Upcoming events', activeWorkspace: 'Active workspace' },
      decision: { eyebrow: 'Needs decision', title: 'Operational signals', countSuffix: 'items' },
      decisionRows: {
        attention: 'targets need review', attentionDetail: 'Actual source missing or outside tolerance.',
        attentionAction: 'Update actual', attentionActionView: 'View measurements',
        overdue: 'tasks overdue', overdueFallback: 'Review priority and owner.', overdueAction: 'Open planning',
        review: 'reviews in draft', reviewDetail: 'Check readiness before locking evidence.', reviewAction: 'Finalize review', reviewActionView: 'View reviews',
        emptyTitle: 'No critical signals', emptyDesc: 'Add measurable targets so the dashboard can compare plan vs actual.',
      },
      cycle: { eyebrow: 'Decision cycle', title: 'Continue from data', steps: ['Set measurable targets','Record or link actuals','Evaluate and lock evidence'], done: 'Done', next: 'Next', action: 'Open targets & actuals' },
      recent: { title: 'Recent transactions', description: 'Latest financial activity in workspace.', viewAll: 'View all', emptyTitle: 'No transactions yet', emptyDesc: 'Record the first financial activity to build the actual summary.', sale: 'Sale', expense: 'Expense' },
    },
    management: {
      title: 'Transaction management', description: 'Actual ledger from private workspace database.',
      addTransaction: 'Add transaction',
      form: { date: 'Date', type: 'Type', sale: 'Sale', expense: 'Expense', amount: 'Amount', cost: 'Direct cost', note: 'Note', noteOptional: '(optional)', submit: 'Save transaction', openForm: 'Open form' },
      table: { date: 'Date', type: 'Type', amount: 'Amount', cost: 'Direct cost', net: 'Net result' },
      empty: { title: 'No private transactions yet', description: 'This workspace is empty. Demo data is available via Open Demo on the home page.' },
      error: 'Failed to load transactions. Check role permissions or try again.',
    },
    calendar: { error: 'Failed to load agenda. Check your calendar permissions.' },
    planning: {
      title: 'Business planning', description: 'Connect direction into targets, initiatives and evaluable actions.',
      measurements: 'Measurements', evaluation: 'Reviews', createPlan: 'Create business plan',
      planForm: { name: 'Plan name', description: 'Description', start: 'Start', end: 'End', visibility: 'Visibility', visWorkspace: 'All members per permission', visRestricted: 'Owner and grantees only', submit: 'Save as draft' },
      empty: { title: 'No business plans yet', description: 'Create the first draft, add targets, then activate when ready.' },
      status: { draft:'Draft', active:'Active', completed:'Completed', archived:'Archived', cancelled:'Cancelled', achieved:'Achieved', missed:'Missed', planned:'Planned', paused:'Paused', todo:'To do', in_progress:'In progress', blocked:'Blocked' },
      restricted: 'Restricted', targetCount: 'targets', initiativeCount: 'initiatives',
      addTarget: 'Add target', targetForm: { name: 'Target name', targetDate: 'Target date', description: 'Description', submit: 'Add target' },
      addInitiative: 'Add initiative', initiativeForm: { name: 'Initiative name', relatedGoal: 'Related goal', noGoal: 'No specific goal', context: 'Context if unlinked', start: 'Start', end: 'End', budget: 'Budget', description: 'Description', submit: 'Add initiative' },
      overdue: 'Overdue', overdueToday: 'Due today', changeStatus: 'Change status', chooseNext: 'Choose next status', reasonPlaceholder: 'Reason if needed', replacementDate: 'Replacement date when reopening missed target', apply: 'Apply change', archive: 'Archive', restore: 'Restore',
      addAction: 'Add action', actionForm: { name: 'Action name', assignee: 'Assignee', priority: 'Priority', start: 'Start', due: 'Due', description: 'Description', submit: 'Add action' },
      p1:'P1 · Critical', p2:'P2 · High', p3:'P3 · Normal', p4:'P4 · Low', memberFallback:'Member', duePrefix:'due',
    },
  },
  ja: {
    badge: 'ワークスペース',
    dashboard: {
      title: '事業ダッシュボード', description: '現状・進行中のコミット・最近の活動を一画面で。',
      openPlanning: '計画を開く', alertPartial: '一部サマリーを読み込めませんでした。更新してください。',
      cards: { transactions: '登録取引', goals: 'アクティブ目標', actions: '進行中アクション', events: '今後の予定', activeWorkspace: 'アクティブワークスペース' },
      decision: { eyebrow: '要決定', title: '運用シグナル', countSuffix: '件' },
      decisionRows: {
        attention: '要確認の目標', attentionDetail: '実績ソースが未取得または許容差を超えています。',
        attentionAction: '実績を更新', attentionActionView: '測定を見る',
        overdue: '期限切れタスク', overdueFallback: '優先度と担当を確認。', overdueAction: '計画を開く',
        review: 'ドラフトの評価', reviewDetail: 'エビデンス確定前に準備を確認。', reviewAction: '評価を確定', reviewActionView: '評価を見る',
        emptyTitle: '重大なシグナルなし', emptyDesc: '測定可能な目標を追加すると計画と実績を比較できます。',
      },
      cycle: { eyebrow: '意思決定サイクル', title: 'データから続ける', steps: ['測定可能な目標を設定','実績を記録/紐付け','評価してエビデンスを確定'], done: '完了', next: '次', action: '目標と実績を開く' },
      recent: { title: '最近の取引', description: 'ワークスペースの最新財務活動。', viewAll: 'すべて見る', emptyTitle: '取引はまだありません', emptyDesc: '最初の財務活動を記録してサマリーを作成しましょう。', sale: '売上', expense: '支出' },
    },
    management: {
      title: '取引管理', description: 'プライベートワークスペースDBの実台帳。',
      addTransaction: '取引を追加',
      form: { date: '日付', type: 'タイプ', sale: '売上', expense: '支出', amount: '金額', cost: '原価', note: 'メモ', noteOptional: '（任意）', submit: '取引を保存', openForm: 'フォームを開く' },
      table: { date: '日付', type: '種別', amount: '金額', cost: '原価', net: '純結果' },
      empty: { title: 'プライベート取引はまだありません', description: 'このワークスペースは空です。デモデータはホームのデモから利用できます。' },
      error: '取引の読み込みに失敗しました。権限を確認してください。',
    },
    calendar: { error: '予定の読み込みに失敗しました。カレンダー権限を確認してください。' },
    planning: {
      title: '事業計画', description: '方向性を目標・イニシアチブ・評価可能なアクションに接続。',
      measurements: '測定', evaluation: '評価', createPlan: '事業計画を作成',
      planForm: { name: '計画名', description: '説明', start: '開始', end: '終了', visibility: '公開範囲', visWorkspace: '権限に応じた全メンバー', visRestricted: 'オーナーと付与者のみ', submit: 'ドラフト保存' },
      empty: { title: '事業計画はまだありません', description: '最初のドラフトを作成し目標を追加して準備ができたら有効化しましょう。' },
      status: { draft:'ドラフト', active:'アクティブ', completed:'完了', archived:'アーカイブ', cancelled:'キャンセル', achieved:'達成', missed:'未達', planned:'計画', paused:'一時停止', todo:'未着手', in_progress:'進行中', blocked:'ブロック' },
      restricted: '限定', targetCount: '目標', initiativeCount: 'イニシアチブ',
      addTarget: '目標を追加', targetForm: { name: '目標名', targetDate: '目標日', description: '説明', submit: '目標を追加' },
      addInitiative: 'イニシアチブを追加', initiativeForm: { name: 'イニシアチブ名', relatedGoal: '関連目標', noGoal: '特定目標なし', context: '未紐付け時のコンテキスト', start: '開始', end: '終了', budget: '予算', description: '説明', submit: 'イニシアチブを追加' },
      overdue: '期限切れ', overdueToday: '本日期限', changeStatus: 'ステータス変更', chooseNext: '次のステータスを選択', reasonPlaceholder: '理由（必要なら）', replacementDate: '未達再開時の代替日', apply: '変更を適用', archive: 'アーカイブ', restore: '復元',
      addAction: 'アクションを追加', actionForm: { name: 'アクション名', assignee: '担当者', priority: '優先度', start: '開始', due: '期限', description: '説明', submit: 'アクションを追加' },
      p1:'P1 · 緊急', p2:'P2 · 高', p3:'P3 · 通常', p4:'P4 · 低', memberFallback:'メンバー', duePrefix:'期限',
    },
  },
  es: {
    badge: 'Espacio',
    dashboard: {
      title: 'Panel del negocio', description: 'Estado actual, compromisos en curso y actividad reciente en una vista.',
      openPlanning: 'Abrir planificación', alertPartial: 'Parte del resumen no se pudo cargar. Intenta actualizar.',
      cards: { transactions: 'Transacciones registradas', goals: 'Objetivos activos', actions: 'Acciones en curso', events: 'Próximos eventos', activeWorkspace: 'Espacio activo' },
      decision: { eyebrow: 'Requiere decisión', title: 'Señales operativas', countSuffix: 'ítems' },
      decisionRows: {
        attention: 'objetivos por revisar', attentionDetail: 'Fuente actual faltante o fuera de tolerancia.',
        attentionAction: 'Actualizar actual', attentionActionView: 'Ver mediciones',
        overdue: 'tareas vencidas', overdueFallback: 'Revisa prioridad y responsable.', overdueAction: 'Abrir planificación',
        review: 'evaluaciones en borrador', reviewDetail: 'Verifica antes de bloquear evidencia.', reviewAction: 'Finalizar evaluación', reviewActionView: 'Ver evaluaciones',
        emptyTitle: 'Sin señales críticas', emptyDesc: 'Añade objetivos medibles para comparar plan vs real.',
      },
      cycle: { eyebrow: 'Ciclo de decisión', title: 'Continúa desde los datos', steps: ['Define objetivos medibles','Registra o vincula reales','Evalúa y bloquea evidencia'], done: 'Hecho', next: 'Siguiente', action: 'Abrir objetivos y reales' },
      recent: { title: 'Transacciones recientes', description: 'Última actividad financiera del espacio.', viewAll: 'Ver todo', emptyTitle: 'Aún no hay transacciones', emptyDesc: 'Registra la primera actividad financiera para generar el resumen.', sale: 'Venta', expense: 'Gasto' },
    },
    management: {
      title: 'Gestión de transacciones', description: 'Libro real de la base de datos privada.',
      addTransaction: 'Añadir transacción',
      form: { date: 'Fecha', type: 'Tipo', sale: 'Venta', expense: 'Gasto', amount: 'Importe', cost: 'Coste directo', note: 'Nota', noteOptional: '(opcional)', submit: 'Guardar transacción', openForm: 'Abrir formulario' },
      table: { date: 'Fecha', type: 'Tipo', amount: 'Importe', cost: 'Coste directo', net: 'Resultado neto' },
      empty: { title: 'Aún no hay transacciones privadas', description: 'Este espacio está vacío. Los datos demo están en Abrir demo de la página principal.' },
      error: 'No se pudieron cargar transacciones. Verifica permisos.',
    },
    calendar: { error: 'No se pudo cargar la agenda. Verifica permisos de calendario.' },
    planning: {
      title: 'Planificación del negocio', description: 'Conecta la dirección en objetivos, iniciativas y acciones evaluables.',
      measurements: 'Mediciones', evaluation: 'Evaluaciones', createPlan: 'Crear plan de negocio',
      planForm: { name: 'Nombre del plan', description: 'Descripción', start: 'Inicio', end: 'Fin', visibility: 'Visibilidad', visWorkspace: 'Todos según permiso', visRestricted: 'Solo propietario y beneficiarios', submit: 'Guardar borrador' },
      empty: { title: 'Aún no hay planes', description: 'Crea el primer borrador, añade objetivos y activa cuando esté listo.' },
      status: { draft:'Borrador', active:'Activo', completed:'Completado', archived:'Archivado', cancelled:'Cancelado', achieved:'Logrado', missed:'Fallado', planned:'Planificado', paused:'Pausado', todo:'Por hacer', in_progress:'En curso', blocked:'Bloqueado' },
      restricted: 'Restringido', targetCount: 'objetivos', initiativeCount: 'iniciativas',
      addTarget: 'Añadir objetivo', targetForm: { name: 'Nombre objetivo', targetDate: 'Fecha objetivo', description: 'Descripción', submit: 'Añadir objetivo' },
      addInitiative: 'Añadir iniciativa', initiativeForm: { name: 'Nombre iniciativa', relatedGoal: 'Objetivo relacionado', noGoal: 'Sin objetivo específico', context: 'Contexto si no vinculado', start: 'Inicio', end: 'Fin', budget: 'Presupuesto', description: 'Descripción', submit: 'Añadir iniciativa' },
      overdue: 'Vencido', overdueToday: 'Vence hoy', changeStatus: 'Cambiar estado', chooseNext: 'Elige siguiente estado', reasonPlaceholder: 'Motivo si necesario', replacementDate: 'Fecha reemplazo al reabrir objetivo fallado', apply: 'Aplicar cambio', archive: 'Archivar', restore: 'Restaurar',
      addAction: 'Añadir acción', actionForm: { name: 'Nombre acción', assignee: 'Asignado', priority: 'Prioridad', start: 'Inicio', due: 'Vencimiento', description: 'Descripción', submit: 'Añadir acción' },
      p1:'P1 · Crítico', p2:'P2 · Alto', p3:'P3 · Normal', p4:'P4 · Bajo', memberFallback:'Miembro', duePrefix:'vencimiento',
    },
  },
  fr: {
    badge: 'Espace',
    dashboard: {
      title: 'Tableau de bord', description: 'État actuel, engagements en cours et activité récente en une vue.',
      openPlanning: 'Ouvrir planning', alertPartial: 'Une partie du résumé n’a pu être chargée. Actualisez.',
      cards: { transactions: 'Transactions enregistrées', goals: 'Objectifs actifs', actions: 'Actions en cours', events: 'Événements à venir', activeWorkspace: 'Espace actif' },
      decision: { eyebrow: 'Décision requise', title: 'Signaux opérationnels', countSuffix: 'éléments' },
      decisionRows: {
        attention: 'cibles à examiner', attentionDetail: 'Source réelle manquante ou hors tolérance.',
        attentionAction: 'Mettre à jour le réel', attentionActionView: 'Voir mesures',
        overdue: 'tâches en retard', overdueFallback: 'Vérifiez priorité et responsable.', overdueAction: 'Ouvrir planning',
        review: 'évaluations en brouillon', reviewDetail: 'Vérifiez préparation avant verrouillage.', reviewAction: 'Finaliser', reviewActionView: 'Voir évaluations',
        emptyTitle: 'Aucun signal critique', emptyDesc: 'Ajoutez des cibles mesurables pour comparer plan vs réel.',
      },
      cycle: { eyebrow: 'Cycle de décision', title: 'Poursuivre depuis les données', steps: ['Définir cibles mesurables','Enregistrer ou lier le réel','Évaluer et verrouiller'], done: 'Terminé', next: 'Suivant', action: 'Ouvrir cibles & réels' },
      recent: { title: 'Transactions récentes', description: 'Dernière activité financière de l’espace.', viewAll: 'Voir tout', emptyTitle: 'Pas encore de transactions', emptyDesc: 'Enregistrez la première activité pour construire le résumé.', sale: 'Vente', expense: 'Dépense' },
    },
    management: {
      title: 'Gestion des transactions', description: 'Grand livre réel de la base privée.',
      addTransaction: 'Ajouter transaction',
      form: { date: 'Date', type: 'Type', sale: 'Vente', expense: 'Dépense', amount: 'Montant', cost: 'Coût direct', note: 'Note', noteOptional: '(optionnel)', submit: 'Enregistrer', openForm: 'Ouvrir le formulaire' },
      table: { date: 'Date', type: 'Type', amount: 'Montant', cost: 'Coût direct', net: 'Résultat net' },
      empty: { title: 'Pas encore de transactions privées', description: 'Cet espace est vide. Les données démo via Ouvrir la démo sur l’accueil.' },
      error: 'Échec chargement transactions. Vérifiez les permissions.',
    },
    calendar: { error: 'Échec chargement agenda. Vérifiez permissions calendrier.' },
    planning: {
      title: 'Planification business', description: 'Reliez la direction aux cibles, initiatives et actions évaluables.',
      measurements: 'Mesures', evaluation: 'Évaluations', createPlan: 'Créer un plan',
      planForm: { name: 'Nom du plan', description: 'Description', start: 'Début', end: 'Fin', visibility: 'Visibilité', visWorkspace: 'Tous selon permission', visRestricted: 'Propriétaire et bénéficiaires seulement', submit: 'Enregistrer brouillon' },
      empty: { title: 'Pas encore de plans', description: 'Créez le premier brouillon, ajoutez cibles puis activez.' },
      status: { draft:'Brouillon', active:'Actif', completed:'Terminé', archived:'Archivé', cancelled:'Annulé', achieved:'Atteint', missed:'Manqué', planned:'Planifié', paused:'En pause', todo:'À faire', in_progress:'En cours', blocked:'Bloqué' },
      restricted: 'Restreint', targetCount: 'cibles', initiativeCount: 'initiatives',
      addTarget: 'Ajouter cible', targetForm: { name: 'Nom cible', targetDate: 'Date cible', description: 'Description', submit: 'Ajouter cible' },
      addInitiative: 'Ajouter initiative', initiativeForm: { name: 'Nom initiative', relatedGoal: 'Cible liée', noGoal: 'Sans cible spécifique', context: 'Contexte si non lié', start: 'Début', end: 'Fin', budget: 'Budget', description: 'Description', submit: 'Ajouter initiative' },
      overdue: 'En retard', overdueToday: 'Échéance aujourd’hui', changeStatus: 'Changer statut', chooseNext: 'Choisir prochain statut', reasonPlaceholder: 'Raison si besoin', replacementDate: 'Date de remplacement à la réouverture', apply: 'Appliquer', archive: 'Archiver', restore: 'Restaurer',
      addAction: 'Ajouter action', actionForm: { name: 'Nom action', assignee: 'Assigné', priority: 'Priorité', start: 'Début', due: 'Échéance', description: 'Description', submit: 'Ajouter action' },
      p1:'P1 · Critique', p2:'P2 · Haute', p3:'P3 · Normale', p4:'P4 · Basse', memberFallback:'Membre', duePrefix:'échéance',
    },
  },
  de: {
    badge: 'Workspace',
    dashboard: {
      title: 'Business-Dashboard', description: 'Aktueller Status, laufende Verpflichtungen und letzte Aktivitäten in einer Ansicht.',
      openPlanning: 'Planung öffnen', alertPartial: 'Ein Teil der Übersicht konnte nicht geladen werden. Bitte aktualisieren.',
      cards: { transactions: 'Erfasste Transaktionen', goals: 'Aktive Ziele', actions: 'Laufende Maßnahmen', events: 'Anstehende Termine', activeWorkspace: 'Aktiver Workspace' },
      decision: { eyebrow: 'Entscheidung nötig', title: 'Betriebssignale', countSuffix: 'Einträge' },
      decisionRows: {
        attention: 'Ziele prüfen', attentionDetail: 'Ist-Quelle fehlt oder außerhalb Toleranz.',
        attentionAction: 'Ist aktualisieren', attentionActionView: 'Messungen ansehen',
        overdue: 'Aufgaben überfällig', overdueFallback: 'Priorität und Verantwortlichen prüfen.', overdueAction: 'Planung öffnen',
        review: 'Reviews im Entwurf', reviewDetail: 'Bereitschaft vor Sperrung prüfen.', reviewAction: 'Review finalisieren', reviewActionView: 'Reviews ansehen',
        emptyTitle: 'Keine kritischen Signale', emptyDesc: 'Messbare Ziele hinzufügen, um Plan vs Ist zu vergleichen.',
      },
      cycle: { eyebrow: 'Entscheidungszyklus', title: 'Von Daten aus fortfahren', steps: ['Messbare Ziele setzen','Ist erfassen/verknüpfen','Evaluieren und sperren'], done: 'Erledigt', next: 'Als Nächstes', action: 'Ziele & Ist öffnen' },
      recent: { title: 'Letzte Transaktionen', description: 'Neueste Finanzaktivität im Workspace.', viewAll: 'Alle ansehen', emptyTitle: 'Noch keine Transaktionen', emptyDesc: 'Erste Finanzaktivität erfassen, um Übersicht aufzubauen.', sale: 'Verkauf', expense: 'Ausgabe' },
    },
    management: {
      title: 'Transaktionsverwaltung', description: 'Reales Ledger aus privater Workspace-DB.',
      addTransaction: 'Transaktion hinzufügen',
      form: { date: 'Datum', type: 'Typ', sale: 'Verkauf', expense: 'Ausgabe', amount: 'Betrag', cost: 'Direkte Kosten', note: 'Notiz', noteOptional: '(optional)', submit: 'Transaktion speichern', openForm: 'Formular öffnen' },
      table: { date: 'Datum', type: 'Art', amount: 'Betrag', cost: 'Direkte Kosten', net: 'Nettoergebnis' },
      empty: { title: 'Noch keine privaten Transaktionen', description: 'Dieser Workspace ist leer. Demodaten über Demo öffnen auf der Startseite.' },
      error: 'Transaktionen konnten nicht geladen werden. Berechtigungen prüfen.',
    },
    calendar: { error: 'Agenda konnte nicht geladen werden. Kalenderberechtigungen prüfen.' },
    planning: {
      title: 'Business-Planung', description: 'Richtung in Ziele, Initiativen und bewertbare Aktionen verbinden.',
      measurements: 'Messungen', evaluation: 'Reviews', createPlan: 'Businessplan erstellen',
      planForm: { name: 'Planname', description: 'Beschreibung', start: 'Start', end: 'Ende', visibility: 'Sichtbarkeit', visWorkspace: 'Alle per Berechtigung', visRestricted: 'Nur Owner und Empfänger', submit: 'Als Entwurf speichern' },
      empty: { title: 'Noch keine Businesspläne', description: 'Ersten Entwurf erstellen, Ziele hinzufügen, dann aktivieren.' },
      status: { draft:'Entwurf', active:'Aktiv', completed:'Abgeschlossen', archived:'Archiviert', cancelled:'Abgebrochen', achieved:'Erreicht', missed:'Verfehlt', planned:'Geplant', paused:'Pausiert', todo:'Offen', in_progress:'In Bearbeitung', blocked:'Blockiert' },
      restricted: 'Eingeschränkt', targetCount: 'Ziele', initiativeCount: 'Initiativen',
      addTarget: 'Ziel hinzufügen', targetForm: { name: 'Zielname', targetDate: 'Zieldatum', description: 'Beschreibung', submit: 'Ziel hinzufügen' },
      addInitiative: 'Initiative hinzufügen', initiativeForm: { name: 'Initiativname', relatedGoal: 'Verknüpftes Ziel', noGoal: 'Kein spezifisches Ziel', context: 'Kontext wenn unverknüpft', start: 'Start', end: 'Ende', budget: 'Budget', description: 'Beschreibung', submit: 'Initiative hinzufügen' },
      overdue: 'Überfällig', overdueToday: 'Heute fällig', changeStatus: 'Status ändern', chooseNext: 'Nächsten Status wählen', reasonPlaceholder: 'Grund falls nötig', replacementDate: 'Ersatzdatum beim Wiederöffnen', apply: 'Änderung anwenden', archive: 'Archivieren', restore: 'Wiederherstellen',
      addAction: 'Aktion hinzufügen', actionForm: { name: 'Aktionsname', assignee: 'Zuständig', priority: 'Priorität', start: 'Start', due: 'Fällig', description: 'Beschreibung', submit: 'Aktion hinzufügen' },
      p1:'P1 · Kritisch', p2:'P2 · Hoch', p3:'P3 · Normal', p4:'P4 · Niedrig', memberFallback:'Mitglied', duePrefix:'fällig',
    },
  },
}
