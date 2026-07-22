export const localeCodes = ['id', 'ja', 'en', 'es', 'fr', 'de'] as const
export type Locale = (typeof localeCodes)[number]
export type Continent = 'Asia' | 'America' | 'Europe'

export interface LocaleOption {
  code: Locale
  continent: Continent
  country: string
  label: string
  shortLabel: string
}

export const localeOptions: LocaleOption[] = [
  { code: 'id', continent: 'Asia', country: 'Indonesia', label: 'Bahasa Indonesia', shortLabel: 'ID' },
  { code: 'ja', continent: 'Asia', country: 'Japan', label: '日本語', shortLabel: 'JA' },
  { code: 'en', continent: 'America', country: 'United States', label: 'English', shortLabel: 'EN' },
  { code: 'es', continent: 'America', country: 'Mexico', label: 'Español', shortLabel: 'ES' },
  { code: 'fr', continent: 'Europe', country: 'France', label: 'Français', shortLabel: 'FR' },
  { code: 'de', continent: 'Europe', country: 'Germany', label: 'Deutsch', shortLabel: 'DE' },
]

const id = {
  language: { change: 'Ubah bahasa', title: 'Bahasa', region: 'Wilayah' },
  nav: { dashboard: 'Dashboard', management: 'Manajemen', calendar: 'Kalender', market: 'Tren Pasar', contact: 'Hubungi Kami', profile: 'Profil' },
  header: { mainNavigation: 'Navigasi utama', mobileNavigation: 'Navigasi seluler', openNotifications: 'Buka notifikasi', openProfile: 'Buka profil', openMenu: 'Buka menu', closeMenu: 'Tutup menu', notifications: 'Notifikasi', stockAlert: 'Stok perlu diperiksa', stockDetail: 'Produk A dan C mendekati batas minimum.', viewAll: 'Lihat semua notifikasi', businessOwner: 'Pemilik usaha', profileSettings: 'Pengaturan profil', logout: 'Keluar', logoutTitle: 'Keluar dari ruang kerja?', logoutDescription: 'Anda akan kembali ke halaman utama. Data demo tetap tersimpan di perangkat ini.' },
} as const

export type Dictionary = {
  language: { change: string; title: string; region: string }
  nav: { dashboard: string; management: string; calendar: string; market: string; contact: string; profile: string }
  header: { mainNavigation: string; mobileNavigation: string; openNotifications: string; openProfile: string; openMenu: string; closeMenu: string; notifications: string; stockAlert: string; stockDetail: string; viewAll: string; businessOwner: string; profileSettings: string; logout: string; logoutTitle: string; logoutDescription: string }
}

export const dictionaries: Record<Locale, Dictionary> = {
  id,
  ja: {
    language: { change: '言語を変更', title: '言語', region: '地域' },
    nav: { dashboard: 'ダッシュボード', management: '管理', calendar: 'カレンダー', market: '市場動向', contact: 'お問い合わせ', profile: 'プロフィール' },
    header: { mainNavigation: 'メインナビゲーション', mobileNavigation: 'モバイルナビゲーション', openNotifications: '通知を開く', openProfile: 'プロフィールを開く', openMenu: 'メニューを開く', closeMenu: 'メニューを閉じる', notifications: '通知', stockAlert: '在庫を確認してください', stockDetail: '商品AとCが最低在庫に近づいています。', viewAll: 'すべての通知を見る', businessOwner: '事業主', profileSettings: 'プロフィール設定', logout: 'ログアウト', logoutTitle: 'ワークスペースからログアウトしますか？', logoutDescription: 'ホームページに戻ります。デモデータはこの端末に保存されます。' },
  },
  en: {
    language: { change: 'Change language', title: 'Language', region: 'Region' },
    nav: { dashboard: 'Dashboard', management: 'Management', calendar: 'Calendar', market: 'Market Trends', contact: 'Contact Us', profile: 'Profile' },
    header: { mainNavigation: 'Main navigation', mobileNavigation: 'Mobile navigation', openNotifications: 'Open notifications', openProfile: 'Open profile', openMenu: 'Open menu', closeMenu: 'Close menu', notifications: 'Notifications', stockAlert: 'Stock needs attention', stockDetail: 'Products A and C are approaching minimum stock.', viewAll: 'View all notifications', businessOwner: 'Business owner', profileSettings: 'Profile settings', logout: 'Sign out', logoutTitle: 'Sign out of the workspace?', logoutDescription: 'You will return to the home page. Demo data remains stored on this device.' },
  },
  es: {
    language: { change: 'Cambiar idioma', title: 'Idioma', region: 'Región' },
    nav: { dashboard: 'Panel', management: 'Gestión', calendar: 'Calendario', market: 'Tendencias', contact: 'Contacto', profile: 'Perfil' },
    header: { mainNavigation: 'Navegación principal', mobileNavigation: 'Navegación móvil', openNotifications: 'Abrir notificaciones', openProfile: 'Abrir perfil', openMenu: 'Abrir menú', closeMenu: 'Cerrar menú', notifications: 'Notificaciones', stockAlert: 'El inventario requiere atención', stockDetail: 'Los productos A y C se acercan al stock mínimo.', viewAll: 'Ver todas las notificaciones', businessOwner: 'Propietaria del negocio', profileSettings: 'Configuración del perfil', logout: 'Cerrar sesión', logoutTitle: '¿Cerrar sesión del espacio de trabajo?', logoutDescription: 'Volverás a la página principal. Los datos de demostración permanecerán en este dispositivo.' },
  },
  fr: {
    language: { change: 'Changer de langue', title: 'Langue', region: 'Région' },
    nav: { dashboard: 'Tableau de bord', management: 'Gestion', calendar: 'Calendrier', market: 'Tendances du marché', contact: 'Nous contacter', profile: 'Profil' },
    header: { mainNavigation: 'Navigation principale', mobileNavigation: 'Navigation mobile', openNotifications: 'Ouvrir les notifications', openProfile: 'Ouvrir le profil', openMenu: 'Ouvrir le menu', closeMenu: 'Fermer le menu', notifications: 'Notifications', stockAlert: 'Le stock nécessite une vérification', stockDetail: 'Les produits A et C approchent du stock minimum.', viewAll: 'Voir toutes les notifications', businessOwner: "Propriétaire de l'entreprise", profileSettings: 'Paramètres du profil', logout: 'Se déconnecter', logoutTitle: "Se déconnecter de l'espace de travail ?", logoutDescription: "Vous retournerez à la page d'accueil. Les données de démonstration resteront sur cet appareil." },
  },
  de: {
    language: { change: 'Sprache ändern', title: 'Sprache', region: 'Region' },
    nav: { dashboard: 'Übersicht', management: 'Verwaltung', calendar: 'Kalender', market: 'Markttrends', contact: 'Kontakt', profile: 'Profil' },
    header: { mainNavigation: 'Hauptnavigation', mobileNavigation: 'Mobile Navigation', openNotifications: 'Benachrichtigungen öffnen', openProfile: 'Profil öffnen', openMenu: 'Menü öffnen', closeMenu: 'Menü schließen', notifications: 'Benachrichtigungen', stockAlert: 'Bestand muss geprüft werden', stockDetail: 'Produkte A und C nähern sich dem Mindestbestand.', viewAll: 'Alle Benachrichtigungen anzeigen', businessOwner: 'Geschäftsinhaberin', profileSettings: 'Profileinstellungen', logout: 'Abmelden', logoutTitle: 'Vom Arbeitsbereich abmelden?', logoutDescription: 'Sie kehren zur Startseite zurück. Demodaten bleiben auf diesem Gerät gespeichert.' },
  },
}

export function isLocale(value: string | null): value is Locale {
  return localeCodes.includes(value as Locale)
}
