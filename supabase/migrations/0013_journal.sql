-- ============================================================
-- Borderless — Journal (blog) articles
-- Public reading + admin authoring. Run once in the Supabase SQL Editor.
-- ============================================================

create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  cover       text not null default 'lantern',
  category    text not null default 'living',           -- living | jobs | industry
  author_id   uuid references public.members(id) on delete set null,
  author_name text not null default 'Borderless',       -- snapshot for public display
  author_role text,                                      -- optional byline role
  date        date not null default current_date,
  read_min    integer not null default 5,
  status      text not null default 'draft',             -- draft | published
  title_en    text, title_jp text,
  excerpt_en  text, excerpt_jp text,
  body_en     text, body_jp text,
  created_at  timestamptz not null default now()
);

create index if not exists articles_status_date_idx on public.articles (status, date desc);

-- ---- Row-Level Security ----
alter table public.articles enable row level security;

-- Public can read published articles; admins can read everything (incl. drafts).
drop policy if exists articles_public_read on public.articles;
create policy articles_public_read on public.articles
  for select
  using (status = 'published' or public.is_admin());

-- Only admins create/update/delete.
drop policy if exists articles_admin_write on public.articles;
create policy articles_admin_write on public.articles
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- seed articles (idempotent) ----
insert into public.articles (slug, cover, category, author_name, author_role, date, read_min, status, title_en, title_jp, excerpt_en, excerpt_jp, body_en, body_jp) values
('japanese-resume', 'lantern', 'jobs', 'Aoi Tanaka', 'Community Lead', '2026-07-14', 8, 'published',
  $$Cracking the Japanese résumé: writing a 履歴書 that gets callbacks$$,
  $$日本の履歴書攻略：返信をもらえる書き方$$,
  $$The 履歴書 has rules Western CVs don't — photo, hanko, handwriting norms. Here's the template that lands interviews.$$,
  $$履歴書には欧米のCVにはないルールがあります。写真、印鑑、手書きの慣習。面接につながるテンプレートを紹介します。$$,
  $$In Japan, the 履歴書 (rirekisho) is a standardized form — not a free-form CV. Recruiters expect specific fields in a specific order, a photo in the top corner, and, at many traditional companies, handwriting.

Start with the format. Buy a JIS-standard 履歴書 template or use a trusted online generator. Fill in your name with furigana, date of birth, and a recent, professional photo.

For the education and work history sections, list entries oldest-first. In the motivation box (志望動機), keep it specific to the company. And remember: in Japan, a second document, the 職務経歴書, is where you actually sell your achievements.$$,
  $$日本では、履歴書は自由形式のCVではなく、定型フォームです。採用担当者は決まった順序で決まった項目を期待し、右上に写真、伝統的な企業では手書きを求めることもあります。

まずフォーマットから。JIS規格の履歴書テンプレートを使い、ふりがな付きの氏名、生年月日、証明写真を記入します。

学歴・職歴欄は古い順に記載。志望動機欄は企業ごとに具体的に。そして実績をアピールするのは職務経歴書という別書類だと覚えておきましょう。$$),

('first-90-days-kyoto', 'river', 'living', 'Marco Rossi', 'Editor', '2026-07-09', 6, 'published',
  $$Your first 90 days in Kyoto: ward office, residence cards & hanko$$,
  $$京都での最初の90日：区役所・在留カード・印鑑$$,
  $$A week-by-week checklist for the paperwork nobody warns you about when you land.$$,
  $$到着時に誰も教えてくれない手続きを、週ごとのチェックリストで解説。$$,
  $$The first three months in Japan are a paperwork marathon. Do it in the right order and everything unlocks.

Week one: take your residence card (在留カード) to your local ward office (区役所) and register your address. This single step unlocks health insurance, a bank account, and your My Number.

Week two: enrol in National Health Insurance and get a hanko made. Week three: open a bank account, then set up a phone contract. Keep photocopies of your residence card and passport — you will be asked for them constantly.$$,
  $$日本での最初の3か月は手続きのマラソンです。正しい順序で行えばすべてが開けます。

1週目：在留カードを持って区役所へ行き、住民登録をします。この一歩が健康保険、銀行口座、マイナンバーへの鍵になります。

2週目：国民健康保険に加入し、印鑑を作ります。3週目：銀行口座を開設し、携帯電話を契約。在留カードとパスポートのコピーを常備しましょう。$$),

('japan-tech-scene-2026', 'tea', 'industry', 'Yuki Nakamura', 'Finance Manager', '2026-07-02', 11, 'published',
  $$Inside Japan's tech scene: what foreign engineers should know in 2026$$,
  $$日本のテック業界の内側：2026年、外国人エンジニアが知るべきこと$$,
  $$Salaries, visa sponsorship, and which companies actually hire non-Japanese speakers.$$,
  $$給与、ビザサポート、そして実際に非日本語話者を採用する企業について。$$,
  $$Japan's tech sector has quietly become one of the most accessible in Asia for foreign engineers — but the map isn't obvious from the outside.

Three broad camps hire non-Japanese speakers: global product companies, well-funded English-first startups, and traditional enterprises that pay reliably but expect business-level Japanese.

On visas, the Engineer/Specialist in Humanities status is the standard route. Salaries have risen sharply since 2024 — but compare against Tokyo's cost of living. Kyoto, our home base, has a growing scene anchored by gaming, hardware, and university spin-outs.$$,
  $$日本のテック業界は、外国人エンジニアにとってアジアで最もアクセスしやすい市場の一つに静かになりつつあります。

非日本語話者を採用するのは大きく3つ：グローバル製品企業、資金力のある英語ファーストのスタートアップ、そして安定した給与だがビジネスレベルの日本語を求める伝統的企業です。

ビザは「技術・人文知識・国際業務」が標準ルート。2024年以降、給与は急上昇。私たちの拠点・京都も、ゲーム・ハードウェア・大学発スタートアップを軸に成長中です。$$),

('working-holiday-to-fulltime', 'sakura', 'jobs', 'Sofia Alvarez', 'Events & Careers', '2026-06-25', 9, 'published',
  $$From working holiday to full-time: visa pathways that actually work$$,
  $$ワーホリから正社員へ：本当に使えるビザの道筋$$,
  $$Guarantor companies, timing, and the conversion steps that keep you in Japan legally.$$,
  $$保証会社、タイミング、そして合法的に日本に残るための切り替え手順。$$,
  $$A working holiday visa is a golden year — but it ends, and converting to a work visa takes planning you should start in month three, not month eleven.

The cleanest path is to find an employer willing to sponsor a change of status before your working holiday expires. You do not need to leave Japan to do this.

Start applying early — Japanese hiring moves slowly, and immigration processing adds weeks. Keep your tax and pension records clean throughout; immigration checks them at renewal.$$,
  $$ワーキングホリデービザは黄金の一年です。しかし必ず終わりが来ます。切り替えには計画が必要で、3か月目に始めるべきです。

最もスムーズな道は、満了前に在留資格変更をスポンサーしてくれる雇用主を見つけること。このために出国する必要はありません。

早めに応募を。日本の採用はゆっくり進みます。税金と年金の記録は常にきれいに。更新時に入管が確認します。$$),

('renting-without-guarantor', 'night', 'living', 'Aoi Tanaka', 'Community Lead', '2026-06-18', 7, 'draft',
  $$Renting without a guarantor: a foreigner's guide to Kyoto apartments$$,
  $$保証人なしで借りる：外国人のための京都アパートガイド$$,
  $$Guarantor companies, key money, and the agencies that welcome foreign tenants.$$,
  $$保証会社、礼金、そして外国人入居者を歓迎する不動産会社について。$$,
  $$The single biggest hurdle to renting in Japan as a foreigner is the guarantor (保証人) — and the good news is you rarely need a human one anymore.

Most landlords now accept a guarantor company: you pay a fee and they stand behind your lease. Budget also for key money (礼金) and a refundable deposit (敷金).

Work with a foreigner-friendly agency — several in Kyoto advertise English support. Bring your residence card, proof of income, and a Japanese phone number.$$,
  $$外国人が日本で部屋を借りる最大のハードルは保証人です。良い知らせは、もう人間の保証人はほとんど必要ないこと。

今では多くの大家が保証会社を受け入れます。手数料を払えば契約を保証してくれます。さらに礼金と敷金も予算に入れましょう。

外国人に優しい不動産会社を利用しましょう。在留カード、収入の証明、日本の電話番号を持参すれば、評判よりずっとスムーズに進みます。$$)
on conflict (slug) do nothing;
