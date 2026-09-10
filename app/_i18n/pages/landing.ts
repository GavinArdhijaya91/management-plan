import type { Locale } from '../dictionaries'

interface LandingCopy {
  nav: { features: string; howItWorks: string; help: string; login: string; signUp: string }
  hero: {
    eyebrow: string
    titleLine1: string
    typewriter: string[]
    description: string
    openDemo: string
    learnFeatures: string
    bullets: string[]
  }
  preview: {
    date: string
    greeting: string
    initials: string
    profitLabel: string
    todaySalesLabel: string
    todaySalesValue: string
    todaySalesNote: string
    capitalLabel: string
    capitalValue: string
    capitalNote: string
    agendaLabel: string
    agendaValue: string
    agendaNote: string
  }
  featuresSection: { title: string; description: string }
  features: { label: string; title: string; description: string; href: string }[]
  howItWorks: {
    title: string
    description: string
    steps: { verb: string; title: string; description: string }[]
  }
  cta: { title: string; description: string; signUp: string; login: string }
  footer: { tagline: string; account: string; information: string; demo: string; copyright: string; demoNote: string }
}

export const landingCopy: Record<Locale, LandingCopy> = {
  id: {
    nav: { features: 'Fitur', howItWorks: 'Cara kerja', help: 'Bantuan', login: 'Masuk', signUp: 'Buat akun' },
    hero: {
      eyebrow: 'Workspace manajemen untuk usaha yang bertumbuh',
      titleLine1: 'Rencana jelas.',
      typewriter: ['Keputusan terukur.', 'Prioritas terarah.', 'Pertumbuhan terbaca.'],
      description:
        'Satukan transaksi, agenda, target, dan insight bisnis dalam satu workspace yang mudah ditindaklanjuti.',
      openDemo: 'Buka demo',
      learnFeatures: 'Pelajari fiturnya',
      bullets: ['Data demo siap digunakan', 'Bisa diedit dan dilatih', 'Nyaman di desktop dan mobile'],
    },
    preview: {
      date: 'Rabu, 22 Juli',
      greeting: 'Selamat pagi, Bu Rina.',
      initials: 'BR',
      profitLabel: 'Laba bulan ini',
      todaySalesLabel: 'Penjualan hari ini',
      todaySalesValue: 'Rp 1,84 jt',
      todaySalesNote: '+18%',
      capitalLabel: 'Ketahanan modal',
      capitalValue: '24 hari',
      capitalNote: 'Aman',
      agendaLabel: 'Agenda terdekat',
      agendaValue: 'Bayar supplier',
      agendaNote: 'Besok',
    },
    featuresSection: {
      title: 'Mengubah catatan menjadi keputusan.',
      description: 'Setiap fitur dirancang untuk membantu pengguna memahami konteks, bukan hanya menyimpan data.',
    },
    features: [
      {
        label: 'Keuangan',
        title: 'Pahami uang yang masuk, keluar, dan bertumbuh.',
        description: 'Catat modal, omzet, serta laba tanpa laporan yang rumit.',
        href: '/demo/management',
      },
      {
        label: 'Perencanaan',
        title: 'Jadikan agenda bisnis sebagai langkah yang terukur.',
        description: 'Satukan jadwal supplier, stok, gaji, dan evaluasi.',
        href: '/demo/calendar',
      },
      {
        label: 'Analisis',
        title: 'Temukan pola sebelum menentukan arah berikutnya.',
        description: 'Pelajari perubahan performa produk dari waktu ke waktu.',
        href: '/demo/market-trends',
      },
      {
        label: 'Ringkasan',
        title: 'Lihat kondisi usaha tanpa membuka banyak laporan.',
        description: 'Angka, perhatian, dan pekerjaan penting berada di satu tempat.',
        href: '/demo/dashboard',
      },
    ],
    howItWorks: {
      title: 'Mulai dari data. Berakhir pada tindakan.',
      description:
        'Data contoh memberi ruang aman untuk bereksperimen sebelum pengguna mengelola rencana bisnisnya sendiri.',
      steps: [
        {
          verb: 'Catat',
          title: 'Catat kondisi nyata',
          description: 'Masukkan transaksi, target, tugas, dan agenda yang memengaruhi usaha.',
        },
        {
          verb: 'Pahami',
          title: 'Pahami hubungan data',
          description: 'Lihat bagaimana satu perubahan memengaruhi ringkasan, tren, serta prioritas.',
        },
        {
          verb: 'Tindak',
          title: 'Tentukan langkah berikutnya',
          description: 'Ubah insight menjadi pekerjaan dan jadwal yang dapat diselesaikan.',
        },
      ],
    },
    cta: {
      title: 'Siap mengelola rencana bisnis yang nyata?',
      description:
        'Buat akun untuk menyimpan data di workspace privat. Kami akan meminta verifikasi email sebelum Anda masuk.',
      signUp: 'Buat akun',
      login: 'Masuk',
    },
    footer: {
      tagline: 'Workspace untuk memahami kondisi usaha, menyusun rencana, dan menjalankannya bersama tim.',
      account: 'Akun',
      information: 'Informasi',
      demo: 'Coba demo',
      copyright: '© 2026 Siapin',
      demoNote: 'Data demo tersimpan hanya di perangkat Anda.',
    },
  },
  en: {
    nav: { features: 'Features', howItWorks: 'How it works', help: 'Help', login: 'Log in', signUp: 'Create account' },
    hero: {
      eyebrow: 'Management workspace for growing businesses',
      titleLine1: 'Clear plan.',
      typewriter: ['Measured decisions.', 'Focused priorities.', 'Visible growth.'],
      description: 'Unite transactions, schedules, targets and business insights in one actionable workspace.',
      openDemo: 'Open demo',
      learnFeatures: 'Explore features',
      bullets: ['Demo data ready to use', 'Editable and trainable', 'Optimized for desktop & mobile'],
    },
    preview: {
      date: 'Wednesday, July 22',
      greeting: 'Good morning, Ms. Rina.',
      initials: 'BR',
      profitLabel: 'Profit this month',
      todaySalesLabel: 'Sales today',
      todaySalesValue: 'Rp 1.84m',
      todaySalesNote: '+18%',
      capitalLabel: 'Capital runway',
      capitalValue: '24 days',
      capitalNote: 'Safe',
      agendaLabel: 'Next agenda',
      agendaValue: 'Pay supplier',
      agendaNote: 'Tomorrow',
    },
    featuresSection: {
      title: 'Turn notes into decisions.',
      description: 'Every feature helps you understand context, not just store data.',
    },
    features: [
      {
        label: 'Finance',
        title: 'Understand money in, out, and growing.',
        description: 'Track capital, revenue and profit without complex reports.',
        href: '/demo/management',
      },
      {
        label: 'Planning',
        title: 'Make business agendas measurable steps.',
        description: 'Unite supplier, stock, payroll and review schedules.',
        href: '/demo/calendar',
      },
      {
        label: 'Analysis',
        title: 'Find patterns before choosing direction.',
        description: 'Study product performance changes over time.',
        href: '/demo/market-trends',
      },
      {
        label: 'Overview',
        title: 'See business health without many reports.',
        description: 'Numbers, attention items and key work in one place.',
        href: '/demo/dashboard',
      },
    ],
    howItWorks: {
      title: 'Start with data. End with action.',
      description: 'Sample data gives a safe space to experiment before managing your own business plan.',
      steps: [
        {
          verb: 'Record',
          title: 'Record real conditions',
          description: 'Add transactions, targets, tasks and agendas affecting the business.',
        },
        {
          verb: 'Understand',
          title: 'Understand data relationships',
          description: 'See how one change affects summaries, trends and priorities.',
        },
        { verb: 'Act', title: 'Decide next steps', description: 'Turn insights into completable work and schedules.' },
      ],
    },
    cta: {
      title: 'Ready to manage a real business plan?',
      description:
        'Create an account to save data in a private workspace. We will ask for email verification before you sign in.',
      signUp: 'Create account',
      login: 'Log in',
    },
    footer: {
      tagline: 'Workspace to understand business health, plan, and execute together.',
      account: 'Account',
      information: 'Information',
      demo: 'Try demo',
      copyright: '© 2026 Siapin',
      demoNote: 'Demo data is stored only on your device.',
    },
  },
  ja: {
    nav: { features: '機能', howItWorks: '使い方', help: 'ヘルプ', login: 'ログイン', signUp: 'アカウント作成' },
    hero: {
      eyebrow: '成長する事業のための管理ワークスペース',
      titleLine1: '明確な計画。',
      typewriter: ['測定可能な意思決定。', '焦点を絞った優先順位。', '見える成長。'],
      description: '取引・予定・目標・インサイトを一つの実行可能なワークスペースにまとめましょう。',
      openDemo: 'デモを開く',
      learnFeatures: '機能を見る',
      bullets: ['デモデータすぐに利用可', '編集・学習可能', 'デスクトップとモバイルに最適化'],
    },
    preview: {
      date: '7月22日 水曜日',
      greeting: 'おはようございます、リナさん。',
      initials: 'BR',
      profitLabel: '今月の利益',
      todaySalesLabel: '本日の売上',
      todaySalesValue: 'Rp 1.84m',
      todaySalesNote: '+18%',
      capitalLabel: '資金持続',
      capitalValue: '24日',
      capitalNote: '安全',
      agendaLabel: '次の予定',
      agendaValue: '仕入先へ支払い',
      agendaNote: '明日',
    },
    featuresSection: {
      title: 'メモを意思決定に変える。',
      description: 'すべての機能がデータの保存だけでなく文脈の理解を助けます。',
    },
    features: [
      {
        label: '財務',
        title: '入出金と成長を把握。',
        description: '複雑なレポートなしで資本・売上・利益を記録。',
        href: '/demo/management',
      },
      {
        label: '計画',
        title: '予定を測定可能なステップに。',
        description: '仕入先・在庫・給与・評価のスケジュールを統合。',
        href: '/demo/calendar',
      },
      {
        label: '分析',
        title: '方向を決める前にパターンを発見。',
        description: '製品パフォーマンスの推移を学習。',
        href: '/demo/market-trends',
      },
      {
        label: '概要',
        title: '多くのレポートなしで事業状態を確認。',
        description: '数値・要注目・重要タスクを一箇所に。',
        href: '/demo/dashboard',
      },
    ],
    howItWorks: {
      title: 'データから始め、行動で終える。',
      description: 'サンプルデータで自身の計画を管理する前に安全に試せます。',
      steps: [
        { verb: '記録', title: '現状を記録', description: '事業に影響する取引・目標・タスク・予定を追加。' },
        {
          verb: '理解',
          title: 'データの関係を理解',
          description: '一つの変更が要約・トレンド・優先度に与える影響を確認。',
        },
        {
          verb: '実行',
          title: '次のステップを決める',
          description: 'インサイトを完了可能なタスクとスケジュールに変換。',
        },
      ],
    },
    cta: {
      title: '実際の事業計画を管理する準備はできましたか？',
      description:
        'プライベートワークスペースに保存するにはアカウントを作成してください。サインイン前にメール確認が必要です。',
      signUp: 'アカウント作成',
      login: 'ログイン',
    },
    footer: {
      tagline: '事業の状態を理解し、計画し、共に実行するワークスペース。',
      account: 'アカウント',
      information: '情報',
      demo: 'デモを試す',
      copyright: '© 2026 Siapin',
      demoNote: 'デモデータは端末にのみ保存されます。',
    },
  },
  es: {
    nav: {
      features: 'Funciones',
      howItWorks: 'Cómo funciona',
      help: 'Ayuda',
      login: 'Iniciar sesión',
      signUp: 'Crear cuenta',
    },
    hero: {
      eyebrow: 'Espacio de trabajo para negocios en crecimiento',
      titleLine1: 'Plan claro.',
      typewriter: ['Decisiones medidas.', 'Prioridades enfocadas.', 'Crecimiento visible.'],
      description: 'Une transacciones, agendas, objetivos e insights en un espacio accionable.',
      openDemo: 'Abrir demo',
      learnFeatures: 'Ver funciones',
      bullets: ['Datos demo listos', 'Editable y entrenable', 'Optimizado para móvil y escritorio'],
    },
    preview: {
      date: 'Miércoles, 22 de julio',
      greeting: 'Buenos días, Sra. Rina.',
      initials: 'BR',
      profitLabel: 'Beneficio del mes',
      todaySalesLabel: 'Ventas de hoy',
      todaySalesValue: 'Rp 1,84M',
      todaySalesNote: '+18%',
      capitalLabel: 'Autonomía de capital',
      capitalValue: '24 días',
      capitalNote: 'Seguro',
      agendaLabel: 'Próxima agenda',
      agendaValue: 'Pagar proveedor',
      agendaNote: 'Mañana',
    },
    featuresSection: {
      title: 'Convierte notas en decisiones.',
      description: 'Cada función ayuda a entender el contexto, no solo a guardar datos.',
    },
    features: [
      {
        label: 'Finanzas',
        title: 'Comprende el dinero que entra, sale y crece.',
        description: 'Registra capital, ingresos y beneficio sin informes complejos.',
        href: '/demo/management',
      },
      {
        label: 'Planificación',
        title: 'Convierte agendas en pasos medibles.',
        description: 'Une calendarios de proveedores, stock, nómina y evaluación.',
        href: '/demo/calendar',
      },
      {
        label: 'Análisis',
        title: 'Descubre patrones antes de decidir.',
        description: 'Estudia la evolución del rendimiento por producto.',
        href: '/demo/market-trends',
      },
      {
        label: 'Resumen',
        title: 'Ve la salud del negocio sin muchos informes.',
        description: 'Números, alertas y trabajo clave en un lugar.',
        href: '/demo/dashboard',
      },
    ],
    howItWorks: {
      title: 'Empieza con datos. Termina con acción.',
      description: 'Los datos de ejemplo permiten experimentar antes de gestionar tu propio plan.',
      steps: [
        {
          verb: 'Registrar',
          title: 'Registra condiciones reales',
          description: 'Añade transacciones, objetivos, tareas y agendas.',
        },
        {
          verb: 'Comprender',
          title: 'Comprende relaciones de datos',
          description: 'Ve cómo un cambio afecta resúmenes, tendencias y prioridades.',
        },
        {
          verb: 'Actuar',
          title: 'Decide los próximos pasos',
          description: 'Convierte insights en trabajo y calendario ejecutable.',
        },
      ],
    },
    cta: {
      title: '¿Listo para gestionar un plan real?',
      description: 'Crea una cuenta para guardar datos en un espacio privado. Pediremos verificación por correo.',
      signUp: 'Crear cuenta',
      login: 'Iniciar sesión',
    },
    footer: {
      tagline: 'Espacio para entender, planificar y ejecutar el negocio en equipo.',
      account: 'Cuenta',
      information: 'Información',
      demo: 'Probar demo',
      copyright: '© 2026 Siapin',
      demoNote: 'Datos demo solo en tu dispositivo.',
    },
  },
  fr: {
    nav: {
      features: 'Fonctionnalités',
      howItWorks: 'Comment ça marche',
      help: 'Aide',
      login: 'Connexion',
      signUp: 'Créer un compte',
    },
    hero: {
      eyebrow: 'Espace de gestion pour entreprises en croissance',
      titleLine1: 'Plan clair.',
      typewriter: ['Décisions mesurées.', 'Priorités ciblées.', 'Croissance visible.'],
      description: 'Rassemblez transactions, agendas, objectifs et insights en un espace actionnable.',
      openDemo: 'Ouvrir la démo',
      learnFeatures: 'Voir les fonctionnalités',
      bullets: ['Données démo prêtes', 'Éditable et entraînable', 'Optimisé mobile & desktop'],
    },
    preview: {
      date: 'Mercredi 22 juillet',
      greeting: 'Bonjour, Mme Rina.',
      initials: 'BR',
      profitLabel: 'Bénéfice du mois',
      todaySalesLabel: 'Ventes du jour',
      todaySalesValue: 'Rp 1,84M',
      todaySalesNote: '+18%',
      capitalLabel: 'Autonomie de capital',
      capitalValue: '24 jours',
      capitalNote: 'Sain',
      agendaLabel: 'Prochain agenda',
      agendaValue: 'Payer fournisseur',
      agendaNote: 'Demain',
    },
    featuresSection: {
      title: 'Transformez les notes en décisions.',
      description: 'Chaque fonctionnalité aide à comprendre le contexte, pas seulement stocker.',
    },
    features: [
      {
        label: 'Finance',
        title: "Comprenez l'argent qui entre, sort et croît.",
        description: 'Suivez capital, chiffre et bénéfice sans rapports complexes.',
        href: '/demo/management',
      },
      {
        label: 'Planification',
        title: 'Faites des agendas des étapes mesurables.',
        description: 'Unissez calendriers fournisseurs, stock, paie et évaluations.',
        href: '/demo/calendar',
      },
      {
        label: 'Analyse',
        title: 'Trouvez le motif avant de choisir.',
        description: 'Étudiez l’évolution des performances produit.',
        href: '/demo/market-trends',
      },
      {
        label: 'Synthèse',
        title: 'Voyez la santé sans multiplier les rapports.',
        description: 'Chiffres, alertes et travail clé au même endroit.',
        href: '/demo/dashboard',
      },
    ],
    howItWorks: {
      title: 'Commencez par les données. Finissez par l’action.',
      description: 'Les données d’exemple offrent un bac à sable avant votre propre plan.',
      steps: [
        { verb: 'Noter', title: 'Notez la réalité', description: 'Ajoutez transactions, cibles, tâches et agendas.' },
        {
          verb: 'Comprendre',
          title: 'Comprenez les liens',
          description: 'Voyez l’impact d’un changement sur synthèses, tendances et priorités.',
        },
        {
          verb: 'Agir',
          title: 'Décidez la suite',
          description: 'Transformez l’insight en travail et planning réalisable.',
        },
      ],
    },
    cta: {
      title: 'Prêt à gérer un vrai plan d’affaires ?',
      description: 'Créez un compte pour sauvegarder en espace privé. Vérification e-mail requise.',
      signUp: 'Créer un compte',
      login: 'Connexion',
    },
    footer: {
      tagline: 'Espace pour comprendre la santé, planifier et exécuter ensemble.',
      account: 'Compte',
      information: 'Information',
      demo: 'Essayer la démo',
      copyright: '© 2026 Siapin',
      demoNote: 'Données démo stockées uniquement sur votre appareil.',
    },
  },
  de: {
    nav: {
      features: 'Funktionen',
      howItWorks: 'So funktioniert’s',
      help: 'Hilfe',
      login: 'Anmelden',
      signUp: 'Konto erstellen',
    },
    hero: {
      eyebrow: 'Management-Workspace für wachsende Unternehmen',
      titleLine1: 'Klarer Plan.',
      typewriter: ['Abgewogene Entscheidungen.', 'Fokussierte Prioritäten.', 'Sichtbares Wachstum.'],
      description: 'Vereinen Sie Transaktionen, Termine, Ziele und Insights in einem umsetzbaren Workspace.',
      openDemo: 'Demo öffnen',
      learnFeatures: 'Funktionen ansehen',
      bullets: ['Demo-Daten sofort nutzbar', 'Editierbar & trainierbar', 'Für Desktop & Mobil optimiert'],
    },
    preview: {
      date: 'Mittwoch, 22. Juli',
      greeting: 'Guten Morgen, Frau Rina.',
      initials: 'BR',
      profitLabel: 'Gewinn diesen Monat',
      todaySalesLabel: 'Umsatz heute',
      todaySalesValue: 'Rp 1,84 Mio.',
      todaySalesNote: '+18%',
      capitalLabel: 'Kapital-Reichweite',
      capitalValue: '24 Tage',
      capitalNote: 'Sicher',
      agendaLabel: 'Nächste Agenda',
      agendaValue: 'Lieferant bezahlen',
      agendaNote: 'Morgen',
    },
    featuresSection: {
      title: 'Aus Notizen Entscheidungen machen.',
      description: 'Jede Funktion hilft Kontext zu verstehen, nicht nur Daten zu speichern.',
    },
    features: [
      {
        label: 'Finanzen',
        title: 'Verstehen Sie Geld, das kommt, geht und wächst.',
        description: 'Kapital, Umsatz und Gewinn ohne komplexe Berichte erfassen.',
        href: '/demo/management',
      },
      {
        label: 'Planung',
        title: 'Machen Sie Agenden zu messbaren Schritten.',
        description: 'Lieferanten-, Lager-, Gehalts- und Review-Termine vereinen.',
        href: '/demo/calendar',
      },
      {
        label: 'Analyse',
        title: 'Muster finden vor der Richtungsentscheidung.',
        description: 'Produkt-Performance über die Zeit studieren.',
        href: '/demo/market-trends',
      },
      {
        label: 'Überblick',
        title: 'Geschäftslage ohne viele Berichte sehen.',
        description: 'Zahlen, Hinweise und wichtige Arbeit an einem Ort.',
        href: '/demo/dashboard',
      },
    ],
    howItWorks: {
      title: 'Mit Daten starten. Mit Taten enden.',
      description: 'Beispieldaten bieten sicheren Raum zum Experimentieren vor dem eigenen Plan.',
      steps: [
        {
          verb: 'Erfassen',
          title: 'Realität erfassen',
          description: 'Transaktionen, Ziele, Aufgaben und Termine hinzufügen.',
        },
        {
          verb: 'Verstehen',
          title: 'Zusammenhänge verstehen',
          description: 'Sehen Sie, wie eine Änderung Übersichten, Trends und Prioritäten beeinflusst.',
        },
        {
          verb: 'Handeln',
          title: 'Nächste Schritte bestimmen',
          description: 'Insights in erledigbare Arbeit und Zeitpläne umwandeln.',
        },
      ],
    },
    cta: {
      title: 'Bereit, einen echten Businessplan zu steuern?',
      description: 'Konto erstellen, um Daten im privaten Workspace zu speichern. E-Mail-Bestätigung erforderlich.',
      signUp: 'Konto erstellen',
      login: 'Anmelden',
    },
    footer: {
      tagline: 'Workspace, um Geschäftslage zu verstehen, zu planen und gemeinsam umzusetzen.',
      account: 'Konto',
      information: 'Information',
      demo: 'Demo testen',
      copyright: '© 2026 Siapin',
      demoNote: 'Demo-Daten nur auf Ihrem Gerät gespeichert.',
    },
  },
}
