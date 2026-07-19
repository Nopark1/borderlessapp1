/* ============================================================
   Borderless — seed data (ported from design_handoff/data.js)
   Phase 1: hard-coded. Phase 2 replaces this with Supabase reads.
   Today = 2026-06-10.
   ============================================================ */

import type {
  Event,
  CategoryMeta,
  Category,
  Tier,
  Reward,
  CoverKey,
  BlogCategory,
  BlogCatMeta,
  Article,
} from "./types";

// ---- cover palettes (placeholder imagery) ----
export const covers: Record<CoverKey, [string, string, string]> = {
  matsuri: ["#8A3233", "#C4583B", "#E8A04A"],
  night: ["#2C2540", "#5B3B6B", "#A8476B"],
  tea: ["#5B6B4A", "#8AA36B", "#C9C58B"],
  river: ["#2E5C6E", "#4E8FA6", "#9FC9CE"],
  food: ["#7A3B2E", "#C06A3C", "#E6B25A"],
  lantern: ["#3A2230", "#8A3233", "#D98C4A"],
  sakura: ["#7A3050", "#C2657F", "#F2C2CE"],
  zen: ["#4A463E", "#7E7869", "#BDB39B"],
};

// ---- events (mix past + upcoming). Today = 2026-06-10 ----
export const events: Event[] = [
  {
    id: "e10",
    slug: "midsummer-yukata",
    cover: "matsuri",
    category: "cultural",
    title: { en: "Midsummer Yukata Night", jp: "真夏の浴衣ナイト" },
    date: "2026-06-13",
    time: "18:30",
    endTime: "22:00",
    venue: { en: "Kamogawa Riverbank, Sanjo", jp: "鴨川河川敷・三条" },
    area: { en: "Pontocho", jp: "先斗町" },
    price: 2500,
    capacity: 24,
    cost: 40000,
    status: "published",
    blurb: {
      en: "Wear a yukata, stroll the Kamogawa at dusk, and join us for street food and sparklers.",
      jp: "浴衣を着て、夕暮れの鴨川を散歩。屋台グルメと線香花火を楽しみましょう。",
    },
    desc: {
      en: "Summer in Kyoto begins on the river. Borrow or bring a yukata (we have a few spares + a quick-dressing helper on site), and meet us where the Kamogawa meets Sanjo bridge. We'll walk down to a quiet stretch of bank, lay out mats, and share kakigōri, yakitori, and cold drinks while the lanterns of Pontocho light up across the water. As night falls we hand out senkō hanabi — the delicate Japanese sparklers — and see whose flame lasts longest. All nationalities, all language levels welcome.",
      jp: "京都の夏は川から始まります。浴衣を着て（予備とお着付けヘルパーも用意しています）、三条大橋のたもとに集合。静かな河原にマットを敷き、かき氷・焼き鳥・冷たい飲み物を囲みながら、対岸の先斗町の灯りを眺めます。夜が更けたら線香花火を配り、誰の火が一番長く続くか競争。国籍も語学レベルも問いません。",
    },
    invited: 31,
    rsvp: 19,
    gallery: 0,
    lat: 35.009,
    lng: 135.772,
  },
  {
    id: "e11",
    slug: "ramen-crawl-shijo",
    cover: "food",
    category: "food",
    title: { en: "Hidden Ramen Crawl", jp: "隠れ家ラーメン巡り" },
    date: "2026-06-20",
    time: "19:00",
    endTime: "22:30",
    venue: { en: "Start: Karasuma Station Exit 5", jp: "集合：烏丸駅5番出口" },
    area: { en: "Shijō–Karasuma", jp: "四条烏丸" },
    price: 3800,
    capacity: 14,
    cost: 28000,
    status: "published",
    blurb: {
      en: "Three counter-only ramen shops most tourists never find, one unforgettable night.",
      jp: "観光客が知らないカウンターだけのラーメン店を3軒巡る、忘れられない夜。",
    },
    desc: {
      en: "We've made friends with three tiny ramen masters tucked down Kyoto's back alleys — the kind of places with six seats, no English menu, and a line of locals. Tonight we go behind the noren. Small group (14 max) so we actually fit. Price covers a half-portion at each shop plus a first drink; come hungry and curious.",
      jp: "京都の路地裏にある小さなラーメン店3軒の店主と仲良くなりました。6席だけ、英語メニューなし、地元客が並ぶようなお店です。今夜は暖簾の奥へ。少人数（最大14名）でちょうど収まります。料金は各店ハーフサイズ＋最初の1杯込み。空腹と好奇心を持って来てください。",
    },
    invited: 22,
    rsvp: 14,
    gallery: 0,
    lat: 35.0036,
    lng: 135.759,
  },
  {
    id: "e12",
    slug: "tea-zazen-morning",
    cover: "tea",
    category: "workshop",
    title: { en: "Temple Zazen & Matcha", jp: "坐禅と抹茶の朝" },
    date: "2026-06-27",
    time: "08:00",
    endTime: "10:30",
    venue: { en: "Shōkoku-ji Sub-temple", jp: "相国寺塔頭" },
    area: { en: "Imadegawa", jp: "今出川" },
    price: 3200,
    capacity: 18,
    cost: 30000,
    status: "published",
    blurb: {
      en: "A guided morning zazen sitting followed by whisking your own bowl of matcha.",
      jp: "朝の坐禅体験のあと、自分でお抹茶を点てます。",
    },
    desc: {
      en: "Start the day in stillness. A monk guides a 40-minute zazen sitting (cushions and instruction provided, no experience needed), followed by a short talk and a tea session where you whisk your own bowl of matcha with seasonal wagashi. Quiet, grounding, and a beautiful way to see a working temple from the inside.",
      jp: "静けさから一日を始めましょう。僧侶の指導で40分の坐禅（座布団・説明あり、経験不要）、その後の法話と、季節の和菓子とともに自分でお抹茶を点てる茶席。静かで心が整う、生きたお寺を内側から見る素敵な体験です。",
    },
    invited: 26,
    rsvp: 11,
    gallery: 0,
    lat: 35.0297,
    lng: 135.761,
  },
  // ---- past events ----
  {
    id: "e09",
    slug: "language-exchange-may",
    cover: "lantern",
    category: "language",
    title: { en: "Language Exchange × Izakaya", jp: "言語交換×居酒屋" },
    date: "2026-06-06",
    time: "19:00",
    endTime: "22:00",
    venue: { en: "Izakaya Den, Kiyamachi", jp: "居酒屋 田、木屋町" },
    area: { en: "Kiyamachi", jp: "木屋町" },
    price: 2800,
    capacity: 30,
    cost: 50000,
    status: "completed",
    blurb: {
      en: "Rotating tables, five languages, endless small plates.",
      jp: "テーブルを回って5言語、小皿料理は無限。",
    },
    desc: {
      en: "Our flagship monthly mixer. Rotating tables every 20 minutes, language stickers, and a private izakaya floor.",
      jp: "毎月恒例の看板イベント。20分ごとにテーブル交代、言語ステッカー、貸切の居酒屋フロア。",
    },
    invited: 38,
    attended: 29,
    gallery: 14,
    lat: 35.004,
    lng: 135.77,
  },
  {
    id: "e08",
    slug: "arashiyama-hike",
    cover: "river",
    category: "outdoor",
    title: { en: "Arashiyama Bamboo Hike", jp: "嵐山・竹林ハイク" },
    date: "2026-05-30",
    time: "09:30",
    endTime: "15:00",
    venue: { en: "Saga-Arashiyama Station", jp: "嵯峨嵐山駅" },
    area: { en: "Arashiyama", jp: "嵐山" },
    price: 2000,
    capacity: 22,
    cost: 25000,
    status: "completed",
    blurb: {
      en: "Bamboo grove at opening hour, monkey park, riverside lunch.",
      jp: "開門直後の竹林、モンキーパーク、川辺のランチ。",
    },
    desc: {
      en: "Beat the crowds to the bamboo grove, climb to the monkey park, and picnic by the Hozugawa.",
      jp: "人混みを避けて竹林へ、モンキーパークに登り、保津川のほとりでピクニック。",
    },
    invited: 27,
    attended: 21,
    gallery: 22,
    lat: 35.0094,
    lng: 135.667,
  },
  {
    id: "e07",
    slug: "rooftop-djs",
    cover: "night",
    category: "nightlife",
    title: { en: "Rooftop Sundown Sessions", jp: "ルーフトップ・サンダウン" },
    date: "2026-05-23",
    time: "17:00",
    endTime: "23:00",
    venue: { en: "Bar Above, Kawaramachi", jp: "Bar Above、河原町" },
    area: { en: "Kawaramachi", jp: "河原町" },
    price: 3500,
    capacity: 40,
    cost: 98000,
    status: "completed",
    blurb: {
      en: "Local DJs, city skyline, one welcome cocktail.",
      jp: "地元DJ、街の夜景、ウェルカムカクテル付き。",
    },
    desc: {
      en: "Our biggest night yet — three local DJs, a rooftop over Kawaramachi, and the whole circle dancing.",
      jp: "過去最大の夜——地元DJ3組、河原町を見下ろすルーフトップ、サークル全員でダンス。",
    },
    invited: 52,
    attended: 44,
    gallery: 38,
    lat: 35.0048,
    lng: 135.768,
  },
  {
    id: "e06",
    slug: "pottery-workshop",
    cover: "zen",
    category: "workshop",
    title: { en: "Kiyomizu Pottery Workshop", jp: "清水焼の陶芸教室" },
    date: "2026-05-16",
    time: "13:00",
    endTime: "16:00",
    venue: { en: "Tōki Studio, Gojō-zaka", jp: "陶器スタジオ、五条坂" },
    area: { en: "Gojō-zaka", jp: "五条坂" },
    price: 4200,
    capacity: 12,
    cost: 35000,
    status: "completed",
    blurb: {
      en: "Throw your own cup on the wheel, fired and mailed to you.",
      jp: "ろくろで自分の器を作り、焼成後に郵送します。",
    },
    desc: {
      en: "Hands-on wheel-throwing with a Kiyomizu-ware potter. Your piece is glazed, fired, and shipped within a month.",
      jp: "清水焼の陶芸家とろくろ体験。作品は釉薬をかけて焼成し、1か月以内に郵送します。",
    },
    invited: 18,
    attended: 12,
    gallery: 16,
    lat: 34.996,
    lng: 135.781,
  },
  {
    id: "e05",
    slug: "sakura-hanami",
    cover: "sakura",
    category: "cultural",
    title: { en: "Late Sakura Hanami Picnic", jp: "遅咲き桜の花見" },
    date: "2026-05-09",
    time: "11:00",
    endTime: "16:00",
    venue: { en: "Kyoto Botanical Gardens", jp: "京都府立植物園" },
    area: { en: "Kitayama", jp: "北山" },
    price: 1800,
    capacity: 35,
    cost: 36000,
    status: "completed",
    blurb: {
      en: "Blankets, bentō, and the season's last blossoms.",
      jp: "レジャーシート、お弁当、今季最後の桜。",
    },
    desc: {
      en: "The botanical gardens hold late-blooming sakura long after the city's have fallen. Bring a blanket; we bring the bentō.",
      jp: "植物園では街中の桜が散った後も遅咲きの桜が楽しめます。シートをご持参ください。お弁当はこちらで用意します。",
    },
    invited: 44,
    attended: 33,
    gallery: 41,
    lat: 35.049,
    lng: 135.764,
  },
];

// ---- categories ----
export const categories: Record<Category, CategoryMeta> = {
  cultural: { en: "Cultural", jp: "文化", color: "#8A3233" },
  food: { en: "Food", jp: "グルメ", color: "#C06A3C" },
  nightlife: { en: "Nightlife", jp: "ナイト", color: "#5B3B6B" },
  outdoor: { en: "Outdoor", jp: "アウトドア", color: "#4E8FA6" },
  workshop: { en: "Workshop", jp: "ワークショップ", color: "#5B6B4A" },
  language: { en: "Language", jp: "言語交換", color: "#B4893C" },
};

// ---- tiers ----
// Names/colors are fixed; the point thresholds (Regular & Insider) are
// admin-editable and stored in `settings`. Guest is always 0.
const TIER_TEMPLATE: Omit<Tier, "min">[] = [
  { key: "Guest", jp: "ゲスト", color: "#9A8B7D" },
  { key: "Regular", jp: "レギュラー", color: "#B4893C" },
  { key: "Insider", jp: "インサイダー", color: "#8A3233" },
];

export const DEFAULT_TIER_MINS = { regular: 5, insider: 15 } as const;

/** Build the tier ladder from editable thresholds, falling back to defaults
 *  and guaranteeing Guest(0) < Regular < Insider. */
export function buildTiers(regularMin?: number | null, insiderMin?: number | null): Tier[] {
  const reg =
    Number.isFinite(regularMin as number) && (regularMin as number) >= 1
      ? Math.round(regularMin as number)
      : DEFAULT_TIER_MINS.regular;
  const ins =
    Number.isFinite(insiderMin as number) && (insiderMin as number) > reg
      ? Math.round(insiderMin as number)
      : Math.max(reg + 1, DEFAULT_TIER_MINS.insider);
  const mins = [0, reg, ins];
  return TIER_TEMPLATE.map((t, i) => ({ ...t, min: mins[i] }));
}

export const tiers: Tier[] = buildTiers();

// ---- rewards ----
export const rewards: Reward[] = [
  { id: "r1", cost: 10, title: { en: "Free entry to any paid event", jp: "有料イベント1回無料" }, tag: "popular" },
  { id: "r2", cost: 6, title: { en: "Bring a friend for free", jp: "友達1名を無料招待" } },
  { id: "r3", cost: 8, title: { en: "Reserved seat + welcome drink", jp: "席予約＋ウェルカムドリンク" } },
  { id: "r4", cost: 20, title: { en: "Borderless yukata or tote", jp: "ボーダレス浴衣またはトート" }, tag: "limited" },
];

// ---- journal (blog) categories — fixed set ----
export const blogCats: Record<BlogCategory, BlogCatMeta> = {
  living: { en: "Living in Japan", jp: "日本での暮らし", short: { en: "Living", jp: "暮らし" }, color: "#3C5A78", soft: "#E5EBF0", emoji: "🗾" },
  jobs: { en: "Finding Work", jp: "仕事探し", short: { en: "Jobs", jp: "仕事" }, color: "#8A3233", soft: "#F3E1DC", emoji: "💼" },
  industry: { en: "Industry Insight", jp: "業界インサイト", short: { en: "Industry", jp: "業界" }, color: "#8A6D1F", soft: "#EFE9D2", emoji: "📊" },
};

// deterministic avatar colour for a byline (authors have no stored colour)
const AVATAR_COLORS = ["#8A3233", "#4E8FA6", "#5B6B4A", "#9B5B2E", "#3C5A78", "#8A6D1F"];
export function avatarColor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ---- journal seed articles (fallback until Supabase is connected) ----
export const seedArticles: Article[] = [
  {
    id: "b1", slug: "japanese-resume", cover: "lantern", category: "jobs",
    authorId: null, authorName: "Aoi Tanaka", authorRole: "Community Lead",
    date: "2026-07-14", readMin: 8, status: "published",
    title: { en: "Cracking the Japanese résumé: writing a 履歴書 that gets callbacks", jp: "日本の履歴書攻略：返信をもらえる書き方" },
    excerpt: { en: "The 履歴書 has rules Western CVs don't — photo, hanko, handwriting norms. Here's the template that lands interviews.", jp: "履歴書には欧米のCVにはないルールがあります。写真、印鑑、手書きの慣習。面接につながるテンプレートを紹介します。" },
    body: {
      en: "In Japan, the 履歴書 (rirekisho) is a standardized form — not a free-form CV. Recruiters expect specific fields in a specific order, a photo in the top corner, and, at many traditional companies, handwriting.\n\nStart with the format. Buy a JIS-standard 履歴書 template or use a trusted online generator. Fill in your name with furigana, date of birth, and a recent, professional photo.\n\nFor the education and work history sections, list entries oldest-first. In the motivation box (志望動機), keep it specific to the company. And remember: in Japan, a second document, the 職務経歴書, is where you actually sell your achievements.",
      jp: "日本では、履歴書は自由形式のCVではなく、定型フォームです。採用担当者は決まった順序で決まった項目を期待し、右上に写真、伝統的な企業では手書きを求めることもあります。\n\nまずフォーマットから。JIS規格の履歴書テンプレートを使い、ふりがな付きの氏名、生年月日、証明写真を記入します。\n\n学歴・職歴欄は古い順に記載。志望動機欄は企業ごとに具体的に。そして実績をアピールするのは職務経歴書という別書類だと覚えておきましょう。" },
  },
  {
    id: "b2", slug: "first-90-days-kyoto", cover: "river", category: "living",
    authorId: null, authorName: "Marco Rossi", authorRole: "Editor",
    date: "2026-07-09", readMin: 6, status: "published",
    title: { en: "Your first 90 days in Kyoto: ward office, residence cards & hanko", jp: "京都での最初の90日：区役所・在留カード・印鑑" },
    excerpt: { en: "A week-by-week checklist for the paperwork nobody warns you about when you land.", jp: "到着時に誰も教えてくれない手続きを、週ごとのチェックリストで解説。" },
    body: {
      en: "The first three months in Japan are a paperwork marathon. Do it in the right order and everything unlocks.\n\nWeek one: take your residence card (在留カード) to your local ward office (区役所) and register your address. This single step unlocks health insurance, a bank account, and your My Number.\n\nWeek two: enrol in National Health Insurance and get a hanko made. Week three: open a bank account, then set up a phone contract. Keep photocopies of your residence card and passport — you will be asked for them constantly.",
      jp: "日本での最初の3か月は手続きのマラソンです。正しい順序で行えばすべてが開けます。\n\n1週目：在留カードを持って区役所へ行き、住民登録をします。この一歩が健康保険、銀行口座、マイナンバーへの鍵になります。\n\n2週目：国民健康保険に加入し、印鑑を作ります。3週目：銀行口座を開設し、携帯電話を契約。在留カードとパスポートのコピーを常備しましょう。" },
  },
  {
    id: "b3", slug: "japan-tech-scene-2026", cover: "tea", category: "industry",
    authorId: null, authorName: "Yuki Nakamura", authorRole: "Finance Manager",
    date: "2026-07-02", readMin: 11, status: "published",
    title: { en: "Inside Japan's tech scene: what foreign engineers should know in 2026", jp: "日本のテック業界の内側：2026年、外国人エンジニアが知るべきこと" },
    excerpt: { en: "Salaries, visa sponsorship, and which companies actually hire non-Japanese speakers.", jp: "給与、ビザサポート、そして実際に非日本語話者を採用する企業について。" },
    body: {
      en: "Japan's tech sector has quietly become one of the most accessible in Asia for foreign engineers — but the map isn't obvious from the outside.\n\nThree broad camps hire non-Japanese speakers: global product companies, well-funded English-first startups, and traditional enterprises that pay reliably but expect business-level Japanese.\n\nOn visas, the Engineer/Specialist in Humanities status is the standard route. Salaries have risen sharply since 2024 — but compare against Tokyo's cost of living. Kyoto, our home base, has a growing scene anchored by gaming, hardware, and university spin-outs.",
      jp: "日本のテック業界は、外国人エンジニアにとってアジアで最もアクセスしやすい市場の一つに静かになりつつあります。\n\n非日本語話者を採用するのは大きく3つ：グローバル製品企業、資金力のある英語ファーストのスタートアップ、そして安定した給与だがビジネスレベルの日本語を求める伝統的企業です。\n\nビザは「技術・人文知識・国際業務」が標準ルート。2024年以降、給与は急上昇。私たちの拠点・京都も、ゲーム・ハードウェア・大学発スタートアップを軸に成長中です。" },
  },
  {
    id: "b4", slug: "working-holiday-to-fulltime", cover: "sakura", category: "jobs",
    authorId: null, authorName: "Sofia Alvarez", authorRole: "Events & Careers",
    date: "2026-06-25", readMin: 9, status: "published",
    title: { en: "From working holiday to full-time: visa pathways that actually work", jp: "ワーホリから正社員へ：本当に使えるビザの道筋" },
    excerpt: { en: "Guarantor companies, timing, and the conversion steps that keep you in Japan legally.", jp: "保証会社、タイミング、そして合法的に日本に残るための切り替え手順。" },
    body: {
      en: "A working holiday visa is a golden year — but it ends, and converting to a work visa takes planning you should start in month three, not month eleven.\n\nThe cleanest path is to find an employer willing to sponsor a change of status before your working holiday expires. You do not need to leave Japan to do this.\n\nStart applying early — Japanese hiring moves slowly, and immigration processing adds weeks. Keep your tax and pension records clean throughout; immigration checks them at renewal.",
      jp: "ワーキングホリデービザは黄金の一年です。しかし必ず終わりが来ます。切り替えには計画が必要で、3か月目に始めるべきです。\n\n最もスムーズな道は、満了前に在留資格変更をスポンサーしてくれる雇用主を見つけること。このために出国する必要はありません。\n\n早めに応募を。日本の採用はゆっくり進みます。税金と年金の記録は常にきれいに。更新時に入管が確認します。" },
  },
  {
    id: "b5", slug: "renting-without-guarantor", cover: "night", category: "living",
    authorId: null, authorName: "Aoi Tanaka", authorRole: "Community Lead",
    date: "2026-06-18", readMin: 7, status: "draft",
    title: { en: "Renting without a guarantor: a foreigner's guide to Kyoto apartments", jp: "保証人なしで借りる：外国人のための京都アパートガイド" },
    excerpt: { en: "Guarantor companies, key money, and the agencies that welcome foreign tenants.", jp: "保証会社、礼金、そして外国人入居者を歓迎する不動産会社について。" },
    body: {
      en: "The single biggest hurdle to renting in Japan as a foreigner is the guarantor (保証人) — and the good news is you rarely need a human one anymore.\n\nMost landlords now accept a guarantor company: you pay a fee and they stand behind your lease. Budget also for key money (礼金) and a refundable deposit (敷金).\n\nWork with a foreigner-friendly agency — several in Kyoto advertise English support. Bring your residence card, proof of income, and a Japanese phone number.",
      jp: "外国人が日本で部屋を借りる最大のハードルは保証人です。良い知らせは、もう人間の保証人はほとんど必要ないこと。\n\n今では多くの大家が保証会社を受け入れます。手数料を払えば契約を保証してくれます。さらに礼金と敷金も予算に入れましょう。\n\n外国人に優しい不動産会社を利用しましょう。在留カード、収入の証明、日本の電話番号を持参すれば、評判よりずっとスムーズに進みます。" },
  },
];
