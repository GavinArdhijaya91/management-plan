import type { Locale } from '../dictionaries'

interface CalendarCopy {
  title: string
  description: string
  resetLabel: string
  empty: string
  addEvent: string
  selectDate: string
  upcoming: string
  allDay: string
  edit: string
  typeLabels: Record<string, string>
  form: {
    agenda: string
    agendaPlaceholder: string
    category: string
    time: string
    cancel: string
    save: string
    addTitle: string
    editTitle: string
  }
  dialog: {
    deleteTitle: string
    deleteDescription: string
    deleteConfirm: string
    resetTitle: string
    resetDescription: string
    resetConfirm: string
  }
  toast: {
    added: string
    updated: string
    deleted: string
    reset: string
  }
  weekdays: string[]
  months: string[]
}

export const calendarCopy: Record<Locale, CalendarCopy> = {
  id: {
    title: 'Kalender & pengingat',
    description: 'Kelola jadwal penting dan pengingat bisnis Anda.',
    resetLabel: 'Reset Demo',
    empty: 'Tidak ada event',
    addEvent: 'Tambah Event',
    selectDate: 'Pilih tanggal',
    upcoming: 'Event Mendatang',
    allDay: 'Sepanjang hari',
    edit: 'Edit',
    typeLabels: { supplier: 'Supplier', gaji: 'Gaji', stok: 'Stok', lainnya: 'Lainnya' },
    form: {
      agenda: 'Agenda',
      agendaPlaceholder: 'Contoh: Bayar supplier',
      category: 'Kategori',
      time: 'Waktu',
      cancel: 'Batal',
      save: 'Simpan event',
      addTitle: 'Tambah event',
      editTitle: 'Edit event',
    },
    dialog: {
      deleteTitle: 'Hapus agenda?',
      deleteDescription: 'Agenda yang dihapus tidak dapat dikembalikan kecuali melalui Reset Demo.',
      deleteConfirm: 'Hapus agenda',
      resetTitle: 'Kembalikan data kalender?',
      resetDescription: 'Semua perubahan kalender lokal akan diganti dengan data awal demo.',
      resetConfirm: 'Reset Demo',
    },
    toast: {
      added: 'Agenda berhasil ditambahkan.',
      updated: 'Agenda berhasil diperbarui.',
      deleted: 'Agenda berhasil dihapus.',
      reset: 'Data kalender demo berhasil dikembalikan.',
    },
    weekdays: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
    months: [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ],
  },
  en: {
    title: 'Calendar & reminders',
    description: 'Manage important schedules and business reminders.',
    resetLabel: 'Reset Demo',
    empty: 'No events',
    addEvent: 'Add Event',
    selectDate: 'Select a date',
    upcoming: 'Upcoming Events',
    allDay: 'All day',
    edit: 'Edit',
    typeLabels: { supplier: 'Supplier', gaji: 'Payroll', stok: 'Stock', lainnya: 'Other' },
    form: {
      agenda: 'Agenda',
      agendaPlaceholder: 'E.g. Pay supplier',
      category: 'Category',
      time: 'Time',
      cancel: 'Cancel',
      save: 'Save event',
      addTitle: 'Add event',
      editTitle: 'Edit event',
    },
    dialog: {
      deleteTitle: 'Delete agenda?',
      deleteDescription: 'Deleted agendas can only be restored via Reset Demo.',
      deleteConfirm: 'Delete agenda',
      resetTitle: 'Restore calendar data?',
      resetDescription: 'All local calendar changes will be replaced with initial demo data.',
      resetConfirm: 'Reset Demo',
    },
    toast: {
      added: 'Agenda added successfully.',
      updated: 'Agenda updated successfully.',
      deleted: 'Agenda deleted.',
      reset: 'Demo calendar data restored.',
    },
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  },
  ja: {
    title: 'カレンダーとリマインダー',
    description: '重要な予定とリマインダーを管理しましょう。',
    resetLabel: 'デモをリセット',
    empty: '予定なし',
    addEvent: '予定を追加',
    selectDate: '日付を選択',
    upcoming: '今後の予定',
    allDay: '終日',
    edit: '編集',
    typeLabels: { supplier: '仕入先', gaji: '給与', stok: '在庫', lainnya: 'その他' },
    form: {
      agenda: '予定',
      agendaPlaceholder: '例：仕入先へ支払い',
      category: 'カテゴリ',
      time: '時間',
      cancel: 'キャンセル',
      save: '保存',
      addTitle: '予定を追加',
      editTitle: '予定を編集',
    },
    dialog: {
      deleteTitle: '予定を削除しますか？',
      deleteDescription: '削除した予定はデモのリセットでのみ復元できます。',
      deleteConfirm: '削除',
      resetTitle: 'カレンダーを復元しますか？',
      resetDescription: 'ローカルの変更は初期デモデータに置き換えられます。',
      resetConfirm: 'リセット',
    },
    toast: {
      added: '予定を追加しました。',
      updated: '予定を更新しました。',
      deleted: '予定を削除しました。',
      reset: 'デモカレンダーを復元しました。',
    },
    weekdays: ['日', '月', '火', '水', '木', '金', '土'],
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  },
  es: {
    title: 'Calendario y recordatorios',
    description: 'Gestiona horarios importantes y recordatorios del negocio.',
    resetLabel: 'Restablecer demo',
    empty: 'Sin eventos',
    addEvent: 'Añadir evento',
    selectDate: 'Selecciona una fecha',
    upcoming: 'Próximos eventos',
    allDay: 'Todo el día',
    edit: 'Editar',
    typeLabels: { supplier: 'Proveedor', gaji: 'Nómina', stok: 'Stock', lainnya: 'Otro' },
    form: {
      agenda: 'Agenda',
      agendaPlaceholder: 'Ej. Pagar proveedor',
      category: 'Categoría',
      time: 'Hora',
      cancel: 'Cancelar',
      save: 'Guardar evento',
      addTitle: 'Añadir evento',
      editTitle: 'Editar evento',
    },
    dialog: {
      deleteTitle: '¿Eliminar agenda?',
      deleteDescription: 'Solo se puede restaurar restableciendo la demo.',
      deleteConfirm: 'Eliminar agenda',
      resetTitle: '¿Restaurar calendario?',
      resetDescription: 'Los cambios locales se reemplazarán con datos iniciales.',
      resetConfirm: 'Restablecer demo',
    },
    toast: {
      added: 'Agenda añadida.',
      updated: 'Agenda actualizada.',
      deleted: 'Agenda eliminada.',
      reset: 'Calendario de demostración restablecido.',
    },
    weekdays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    months: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
  },
  fr: {
    title: 'Calendrier & rappels',
    description: 'Gérez les échéances importantes et les rappels business.',
    resetLabel: 'Réinitialiser la démo',
    empty: 'Aucun événement',
    addEvent: 'Ajouter un événement',
    selectDate: 'Choisissez une date',
    upcoming: 'Événements à venir',
    allDay: 'Toute la journée',
    edit: 'Modifier',
    typeLabels: { supplier: 'Fournisseur', gaji: 'Paie', stok: 'Stock', lainnya: 'Autre' },
    form: {
      agenda: 'Agenda',
      agendaPlaceholder: 'Ex. Payer le fournisseur',
      category: 'Catégorie',
      time: 'Heure',
      cancel: 'Annuler',
      save: 'Enregistrer',
      addTitle: 'Ajouter un événement',
      editTitle: 'Modifier l’événement',
    },
    dialog: {
      deleteTitle: 'Supprimer l’agenda ?',
      deleteDescription: 'Les agendas supprimés ne peuvent être restaurés que via la réinitialisation.',
      deleteConfirm: 'Supprimer',
      resetTitle: 'Restaurer le calendrier ?',
      resetDescription: 'Les modifications locales seront remplacées par les données initiales.',
      resetConfirm: 'Réinitialiser',
    },
    toast: {
      added: 'Agenda ajouté.',
      updated: 'Agenda mis à jour.',
      deleted: 'Agenda supprimé.',
      reset: 'Calendrier de démo restauré.',
    },
    weekdays: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    months: [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ],
  },
  de: {
    title: 'Kalender & Erinnerungen',
    description: 'Verwalten Sie wichtige Termine und Erinnerungen.',
    resetLabel: 'Demo zurücksetzen',
    empty: 'Keine Ereignisse',
    addEvent: 'Ereignis hinzufügen',
    selectDate: 'Datum wählen',
    upcoming: 'Kommende Ereignisse',
    allDay: 'Ganztägig',
    edit: 'Bearbeiten',
    typeLabels: { supplier: 'Lieferant', gaji: 'Gehalt', stok: 'Lager', lainnya: 'Sonstiges' },
    form: {
      agenda: 'Agenda',
      agendaPlaceholder: 'z. B. Lieferant bezahlen',
      category: 'Kategorie',
      time: 'Zeit',
      cancel: 'Abbrechen',
      save: 'Speichern',
      addTitle: 'Ereignis hinzufügen',
      editTitle: 'Ereignis bearbeiten',
    },
    dialog: {
      deleteTitle: 'Agenda löschen?',
      deleteDescription: 'Gelöschte Agenden nur via Demo-Reset wiederherstellbar.',
      deleteConfirm: 'Löschen',
      resetTitle: 'Kalender wiederherstellen?',
      resetDescription: 'Lokale Änderungen werden durch Demodaten ersetzt.',
      resetConfirm: 'Zurücksetzen',
    },
    toast: {
      added: 'Agenda hinzugefügt.',
      updated: 'Agenda aktualisiert.',
      deleted: 'Agenda gelöscht.',
      reset: 'Demo-Kalender wiederhergestellt.',
    },
    weekdays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    months: [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ],
  },
}
