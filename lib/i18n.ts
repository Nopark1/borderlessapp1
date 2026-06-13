/* ============================================================
   Borderless — i18n (ported from design_handoff/i18n.js)
   UI strings for the EN / JP toggle. Content strings (event copy)
   live in data.ts as { en, jp } pairs.
   Default language: English.
   ============================================================ */

import type { Lang, Bilingual } from "./types";

type Dict = Record<string, Bilingual>;

const S: Dict = {
  // shell
  public: { en: "Public Site", jp: "公開サイト" },
  member: { en: "Member", jp: "メンバー" },
  admin: { en: "Admin", jp: "管理" },
  tagline: { en: "Kyoto-Based Cultural Gathering", jp: "京都発・国際交流サークル" },

  // public — feed
  upcoming: { en: "Upcoming", jp: "今後の予定" },
  past: { en: "Past Events", jp: "過去のイベント" },
  allEvents: { en: "All", jp: "すべて" },
  heroTitle: { en: "Meet Kyoto.\nTogether.", jp: "そうだ、\n京都で集まろう。" },
  heroSub: {
    en: "An international circle hosting a new gathering every week — temples, ramen, rooftops and riverbanks. Come as you are.",
    jp: "毎週新しい集まりを開く国際サークル。お寺、ラーメン、ルーフトップ、川辺へ。気軽にどうぞ。",
  },
  joinFree: { en: "Join free", jp: "無料で参加" },
  browse: { en: "See events", jp: "イベントを見る" },
  thisWeek: { en: "This week", jp: "今週" },
  spotsLeft: { en: "spots left", jp: "残り" },
  full: { en: "Full", jp: "満員" },
  free: { en: "Free", jp: "無料" },
  members100: { en: "100 members", jp: "メンバー100名" },
  weekly: { en: "Weekly events", jp: "毎週開催" },

  // event detail
  imComing: { en: "I'm coming", jp: "参加する" },
  youreIn: { en: "You're in ✓", jp: "参加予定 ✓" },
  cantMake: { en: "Can't make it", jp: "不参加" },
  about: { en: "About this event", jp: "イベント詳細" },
  whereWhen: { en: "Where & when", jp: "日時・場所" },
  getThere: { en: "Getting there", jp: "アクセス" },
  whoscoming: { en: "Who's coming", jp: "参加メンバー" },
  recap: { en: "Recap", jp: "レポート" },
  photos: { en: "photos", jp: "枚の写真" },
  earnPt: { en: "Earn", jp: "獲得" },
  point: { en: "point", jp: "ポイント" },
  points: { en: "points", jp: "ポイント" },
  perPerson: { en: "per person", jp: "/ 人" },
  addCal: { en: "Add to calendar", jp: "カレンダーに追加" },
  share: { en: "Share", jp: "共有" },

  // auth
  welcome: { en: "Welcome back", jp: "おかえりなさい" },
  joinTitle: { en: "Join Borderless", jp: "ボーダレスに参加" },
  email: { en: "Email", jp: "メールアドレス" },
  password: { en: "Password", jp: "パスワード" },
  name: { en: "Your name", jp: "お名前" },
  signIn: { en: "Sign in", jp: "ログイン" },
  createAcc: { en: "Create account", jp: "アカウント作成" },
  noAccount: { en: "New here?", jp: "初めての方は" },
  haveAccount: { en: "Already a member?", jp: "登録済みの方は" },
  or: { en: "or", jp: "または" },
  continueG: { en: "Continue with Google", jp: "Googleで続行" },
  authPerk: {
    en: "Track your points, RSVP in one tap, and unlock rewards.",
    jp: "ポイントを貯めて、ワンタップで参加表明、特典をゲット。",
  },

  // member dashboard
  hi: { en: "Hi", jp: "こんにちは" },
  yourPoints: { en: "Your points", jp: "ポイント" },
  howPoints: { en: "How points work", jp: "ポイントの仕組み" },
  pointsRule: {
    en: "Attend an event and earn 1 point for every ¥100 of the entry fee.",
    jp: "イベントに参加すると、参加費¥100ごとに1ポイント獲得。",
  },
  inviteFriend: { en: "Invite a friend", jp: "友達を招待" },
  inviteRule1: { en: "when a brand-new friend joins", jp: "新規の友達が参加" },
  inviteRule2: { en: "for their 2nd or 3rd time", jp: "2〜3回目の参加" },
  yourCode: { en: "Your invite code", jp: "あなたの招待コード" },
  copyCode: { en: "Copy", jp: "コピー" },
  copied: { en: "Copied!", jp: "コピーしました！" },
  ptsPerHead: { en: "pts / attendee", jp: "pt / 人" },
  autoPoints: { en: "Points / attendee", jp: "付与ポイント / 人" },
  perYenHint: { en: "auto · ¥100 = 1 pt", jp: "自動 · ¥100 = 1pt" },
  earnAtDoor: { en: "You're in! Earn points at the door", jp: "参加予定！当日ポイント獲得" },
  tier: { en: "Tier", jp: "ランク" },
  streak: { en: "week streak", jp: "週連続" },
  toNext: { en: "to next tier", jp: "で次のランク" },
  nextUp: { en: "Your next events", jp: "次回の参加予定" },
  rewardsT: { en: "Rewards", jp: "特典" },
  redeem: { en: "Redeem", jp: "交換" },
  history: { en: "Attendance history", jp: "参加履歴" },
  attended: { en: "Attended", jp: "参加" },
  missed: { en: "Missed", jp: "欠席" },
  showRate: { en: "Your show-up rate", jp: "参加率" },
  eventsAtt: { en: "events attended", jp: "回参加" },
  profile: { en: "Profile", jp: "プロフィール" },
  home: { en: "Home", jp: "ホーム" },
  events: { en: "Events", jp: "イベント" },
  you: { en: "You", jp: "マイページ" },
  lockedPts: { en: "more points", jp: "ポイントで解除" },

  // admin
  overview: { en: "Overview", jp: "概要" },
  eventsAdm: { en: "Events", jp: "イベント" },
  membersAdm: { en: "Members", jp: "メンバー" },
  finance: { en: "Finance", jp: "収支" },
  revenue: { en: "Revenue", jp: "売上" },
  costs: { en: "Costs", jp: "支出" },
  netProfit: { en: "Net profit", jp: "純利益" },
  showupRate: { en: "Show-up rate", jp: "参加率" },
  invited: { en: "Invited", jp: "招待" },
  came: { en: "Came", jp: "参加" },
  activeMembers: { en: "Active members", jp: "アクティブ会員" },
  ptsIssued: { en: "Points issued", jp: "発行ポイント" },
  ptsRedeemed: { en: "Points redeemed", jp: "交換ポイント" },
  memberGrowth: { en: "Member growth", jp: "会員数の推移" },
  revVsCost: { en: "Revenue vs. costs", jp: "売上と支出" },
  perEvent: { en: "Per-event performance", jp: "イベント別の実績" },
  event: { en: "Event", jp: "イベント" },
  net: { en: "Net", jp: "純益" },
  rate: { en: "Rate", jp: "率" },
  thisMonth: { en: "this month", jp: "今月" },
  vsLast: { en: "vs last month", jp: "前月比" },
  allMembers: { en: "members", jp: "名の会員" },
  lifetimeSpend: { en: "Lifetime spend", jp: "累計支出" },
  lastSeen: { en: "Last event", jp: "最終参加" },
  status: { en: "Status", jp: "状態" },
  active: { en: "Active", jp: "アクティブ" },
  lapsing: { en: "Lapsing", jp: "離脱傾向" },
  retention: { en: "Repeat rate", jp: "リピート率" },
  newEvent: { en: "New event", jp: "イベント作成" },
  export: { en: "Export", jp: "エクスポート" },
  avgPerHead: { en: "Avg / attendee", jp: "1人あたり平均" },
  search: { en: "Search members…", jp: "会員を検索…" },

  // weekend strip
  thisWeekend: { en: "This weekend", jp: "今週末" },
  comingUp: { en: "Coming up", jp: "近日開催" },
  soonSub: { en: "Grab a spot before they fill up", jp: "参加枠残りわずか！なくなり次第終了" },
  today: { en: "Today", jp: "今日" },
  tomorrow: { en: "Tomorrow", jp: "明日" },
  going: { en: "going", jp: "参加" },

  // admin — create event
  createEvent: { en: "Create event", jp: "イベント作成" },
  saveDraft: { en: "Save draft", jp: "下書き保存" },
  publish: { en: "Publish", jp: "公開する" },
  cancel: { en: "Cancel", jp: "キャンセル" },
  coverStyle: { en: "Cover", jp: "カバー" },
  uploadPhoto: { en: "Upload photo", jp: "写真をアップロード" },
  eventTitle: { en: "Event title", jp: "イベント名" },
  titleEnL: { en: "Title (English)", jp: "タイトル（英語）" },
  titleJpL: { en: "Title (Japanese)", jp: "タイトル（日本語）" },
  category: { en: "Category", jp: "カテゴリー" },
  dateTime: { en: "Date & time", jp: "日時" },
  startT: { en: "Start", jp: "開始" },
  endT: { en: "End", jp: "終了" },
  location: { en: "Location", jp: "場所" },
  venueEnL: { en: "Venue", jp: "会場" },
  areaL: { en: "Area / neighborhood", jp: "エリア" },
  pricingCap: { en: "Pricing & capacity", jp: "料金・定員" },
  priceL: { en: "Entry fee (¥)", jp: "参加費（¥）" },
  capacityL: { en: "Capacity", jp: "定員" },
  pointsL: { en: "Points awarded", jp: "付与ポイント" },
  invitedL: { en: "People invited", jp: "招待人数" },
  descL: { en: "Description", jp: "説明" },
  descEnL: { en: "Write-up (English)", jp: "本文（英語）" },
  descJpL: { en: "Write-up (Japanese)", jp: "本文（日本語）" },
  livePreview: { en: "Live preview", jp: "プレビュー" },
  projRevenue: { en: "Projected revenue", jp: "見込売上" },
  ptsIfFull: { en: "Points if full", jp: "満席時のポイント" },
  atCapacity: { en: "at capacity", jp: "満席時" },
  untitled: { en: "Your event title", jp: "イベント名を入力" },

  // status + editing
  draft: { en: "Draft", jp: "下書き" },
  published: { en: "Published", jp: "公開中" },
  completed: { en: "Past", jp: "終了" },
  editEvent: { en: "Edit event", jp: "イベントを編集" },
  saveChanges: { en: "Save changes", jp: "変更を保存" },
  unpublish: { en: "Unpublish", jp: "非公開にする" },
  allStatus: { en: "All", jp: "すべて" },
  liveOnSite: { en: "Live on the public site", jp: "公開サイトに掲載中" },
  draftHidden: { en: "Hidden — only you can see this", jp: "非公開—管理者のみ閲覧可" },
  newBadge: { en: "Just added", jp: "新規" },

  // costs & break-even
  costsBreak: { en: "Costs & break-even", jp: "コスト・損益分岐" },
  totalCost: { en: "Total event cost (¥)", jp: "イベント総コスト（¥）" },
  costHint: { en: "Venue, food, supplies, staff — everything combined", jp: "会場・食事・備品・スタッフなどすべて" },
  breakEven: { en: "Break-even", jp: "損益分岐点" },
  breakEvenAtt: { en: "attendees to break even", jp: "人でトントン" },
  profitFull: { en: "Profit if full", jp: "満席時の利益" },
  perHead: { en: "Cost / attendee", jp: "1人あたりコスト" },
  ofCapacity: { en: "of capacity", jp: "定員のうち" },
  needMore: { en: "over capacity to break even", jp: "定員超過でようやく" },

  // actions + check-in
  checkIn: { en: "Check in", jp: "受付" },
  duplicate: { en: "Duplicate", jp: "複製" },
  deleteE: { en: "Delete", jp: "削除" },
  confirmDel: { en: "Confirm delete", jp: "削除を確定" },
  copySuffix: { en: " (copy)", jp: "（コピー）" },
  checkinTitle: { en: "Check-in", jp: "受付" },
  doorList: { en: "Guest list", jp: "参加者リスト" },
  searchGuest: { en: "Search guests…", jp: "参加者を検索…" },
  present: { en: "Present", jp: "参加" },
  markAll: { en: "All present", jp: "全員参加" },
  clearAll: { en: "Clear", jp: "クリア" },
  finishRecord: { en: "Finish & record", jp: "記録して完了" },
  checkedIn: { en: "checked in", jp: "受付済み" },
  ofInvited: { en: "of invited", jp: "招待のうち" },
  actualRev: { en: "Actual revenue", jp: "実売上" },
  actualNet: { en: "Net result", jp: "純損益" },
  ptsAwarded: { en: "Points to award", jp: "付与ポイント" },
  recordHint: { en: "Recording finalises numbers and moves this event to Past.", jp: "記録するとイベントは「終了」に移動します。" },
  alreadyRec: { en: "Recorded — editing will update your metrics", jp: "記録済み — 編集すると指標が更新されます" },

  // recurrence
  repeat: { en: "Repeat", jp: "繰り返し" },
  repeatNone: { en: "One-time", jp: "単発" },
  repeatWeekly: { en: "Weekly", jp: "毎週" },
  repeatBiweekly: { en: "Every 2 wks", jp: "隔週" },
  repeatMonthly: { en: "Monthly", jp: "毎月" },
  occurrences: { en: "Occurrences", jp: "回数" },
  willCreate: { en: "Creates", jp: "作成数" },
  eventsWord: { en: "events", jp: "件" },
  moreDates: { en: "more", jp: "他" },
  recurHint: { en: "Each repeat becomes its own event — edit or check in separately.", jp: "繰り返しは個別イベントとして作成され、別々に編集・受付できます。" },
};

// Countdowns are anchored to Kyoto time (JST) so server (UTC) and the visitor's
// browser agree — and computed per call so "today/tomorrow/in N days" stays live.
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
function jstMidnightOf(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1) - JST_OFFSET_MS;
}
function jstToday(): number {
  const j = new Date(Date.now() + JST_OFFSET_MS);
  return Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate()) - JST_OFFSET_MS;
}

export function t(key: string, lang: Lang): string {
  return S[key] ? S[key][lang] || S[key].en : key;
}

export function val(obj: Bilingual | null | undefined, lang: Lang): string {
  return obj ? obj[lang] || obj.en : "";
}

export function daysUntil(iso: string): number {
  return Math.round((jstMidnightOf(iso) - jstToday()) / 86400000);
}

export function relDay(iso: string, lang: Lang): string {
  const n = daysUntil(iso);
  if (n <= 0) return S.today[lang] || S.today.en;
  if (n === 1) return S.tomorrow[lang] || S.tomorrow.en;
  return lang === "jp" ? `${n}日後` : `in ${n} days`;
}

export function fmtDate(iso: string, lang: Lang): string {
  const d = new Date(iso + "T00:00:00");
  if (lang === "jp") {
    return `${d.getMonth() + 1}月${d.getDate()}日（${"日月火水木金土"[d.getDay()]}）`;
  }
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
