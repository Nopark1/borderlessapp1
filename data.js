/* ============================================================
   Borderless — mock data (window.BL_DATA)
   ~100 members, weekly events, money in/out, attendance.
   ============================================================ */
(function () {
  const yen = (n) => "¥" + n.toLocaleString("en-US");

  // ---- cover palettes (placeholder imagery) ----
  const covers = {
    matsuri:  ["#8A3233", "#C4583B", "#E8A04A"],
    night:    ["#2C2540", "#5B3B6B", "#A8476B"],
    tea:      ["#5B6B4A", "#8AA36B", "#C9C58B"],
    river:    ["#2E5C6E", "#4E8FA6", "#9FC9CE"],
    food:     ["#7A3B2E", "#C06A3C", "#E6B25A"],
    lantern:  ["#3A2230", "#8A3233", "#D98C4A"],
    sakura:   ["#7A3050", "#C2657F", "#F2C2CE"],
    zen:      ["#4A463E", "#7E7869", "#BDB39B"],
  };

  // ---- events (mix past + upcoming). Today = 2026-06-10 ----
  const events = [
    {
      id: "e10", slug: "midsummer-yukata", cover: "matsuri", category: "cultural",
      title: { en: "Midsummer Yukata Night", jp: "真夏の浴衣ナイト" },
      date: "2026-06-13", time: "18:30", endTime: "22:00",
      venue: { en: "Kamogawa Riverbank, Sanjo", jp: "鴨川河川敷・三条" },
      area: { en: "Pontocho", jp: "先斗町" },
      price: 2500, capacity: 24,
      blurb: { en: "Wear a yukata, stroll the Kamogawa at dusk, and join us for street food and sparklers.",
               jp: "浴衣を着て、夕暮れの鴨川を散歩。屋台グルメと線香花火を楽しみましょう。" },
      desc: {
        en: "Summer in Kyoto begins on the river. Borrow or bring a yukata (we have a few spares + a quick-dressing helper on site), and meet us where the Kamogawa meets Sanjo bridge. We'll walk down to a quiet stretch of bank, lay out mats, and share kakigōri, yakitori, and cold drinks while the lanterns of Pontocho light up across the water. As night falls we hand out senkō hanabi — the delicate Japanese sparklers — and see whose flame lasts longest. All nationalities, all language levels welcome.",
        jp: "京都の夏は川から始まります。浴衣を着て（予備とお着付けヘルパーも用意しています）、三条大橋のたもとに集合。静かな河原にマットを敷き、かき氷・焼き鳥・冷たい飲み物を囲みながら、対岸の先斗町の灯りを眺めます。夜が更けたら線香花火を配り、誰の火が一番長く続くか競争。国籍も語学レベルも問いません。" },
      invited: 31, rsvp: 19, gallery: 0, points: 1,
      lat: 35.0090, lng: 135.7720,
    },
    {
      id: "e11", slug: "ramen-crawl-shijo", cover: "food", category: "food",
      title: { en: "Hidden Ramen Crawl", jp: "隠れ家ラーメン巡り" },
      date: "2026-06-20", time: "19:00", endTime: "22:30",
      venue: { en: "Start: Karasuma Station Exit 5", jp: "集合：烏丸駅5番出口" },
      area: { en: "Shijō–Karasuma", jp: "四条烏丸" },
      price: 3800, capacity: 14,
      blurb: { en: "Three counter-only ramen shops most tourists never find, one unforgettable night.",
               jp: "観光客が知らないカウンターだけのラーメン店を3軒巡る、忘れられない夜。" },
      desc: {
        en: "We've made friends with three tiny ramen masters tucked down Kyoto's back alleys — the kind of places with six seats, no English menu, and a line of locals. Tonight we go behind the noren. Small group (14 max) so we actually fit. Price covers a half-portion at each shop plus a first drink; come hungry and curious.",
        jp: "京都の路地裏にある小さなラーメン店3軒の店主と仲良くなりました。6席だけ、英語メニューなし、地元客が並ぶようなお店です。今夜は暖簾の奥へ。少人数（最大14名）でちょうど収まります。料金は各店ハーフサイズ＋最初の1杯込み。空腹と好奇心を持って来てください。" },
      invited: 22, rsvp: 14, gallery: 0, points: 1,
      lat: 35.0036, lng: 135.7590,
    },
    {
      id: "e12", slug: "tea-zazen-morning", cover: "tea", category: "workshop",
      title: { en: "Temple Zazen & Matcha", jp: "坐禅と抹茶の朝" },
      date: "2026-06-27", time: "08:00", endTime: "10:30",
      venue: { en: "Shōkoku-ji Sub-temple", jp: "相国寺塔頭" },
      area: { en: "Imadegawa", jp: "今出川" },
      price: 3200, capacity: 18,
      blurb: { en: "A guided morning zazen sitting followed by whisking your own bowl of matcha.",
               jp: "朝の坐禅体験のあと、自分でお抹茶を点てます。" },
      desc: {
        en: "Start the day in stillness. A monk guides a 40-minute zazen sitting (cushions and instruction provided, no experience needed), followed by a short talk and a tea session where you whisk your own bowl of matcha with seasonal wagashi. Quiet, grounding, and a beautiful way to see a working temple from the inside.",
        jp: "静けさから一日を始めましょう。僧侶の指導で40分の坐禅（座布団・説明あり、経験不要）、その後の法話と、季節の和菓子とともに自分でお抹茶を点てる茶席。静かで心が整う、生きたお寺を内側から見る素敵な体験です。" },
      invited: 26, rsvp: 11, gallery: 0, points: 1,
      lat: 35.0297, lng: 135.7610,
    },
    // ---- past events ----
    {
      id: "e09", slug: "language-exchange-may", cover: "lantern", category: "language",
      title: { en: "Language Exchange × Izakaya", jp: "言語交換×居酒屋" },
      date: "2026-06-06", time: "19:00", endTime: "22:00",
      venue: { en: "Izakaya Den, Kiyamachi", jp: "居酒屋 田、木屋町" },
      area: { en: "Kiyamachi", jp: "木屋町" },
      price: 2800, capacity: 30,
      blurb: { en: "Rotating tables, five languages, endless small plates.",
               jp: "テーブルを回って5言語、小皿料理は無限。" },
      desc: { en: "Our flagship monthly mixer. Rotating tables every 20 minutes, language stickers, and a private izakaya floor.",
              jp: "毎月恒例の看板イベント。20分ごとにテーブル交代、言語ステッカー、貸切の居酒屋フロア。" },
      invited: 38, attended: 29, gallery: 14, points: 1,
      lat: 35.0040, lng: 135.7700,
    },
    {
      id: "e08", slug: "arashiyama-hike", cover: "river", category: "outdoor",
      title: { en: "Arashiyama Bamboo Hike", jp: "嵐山・竹林ハイク" },
      date: "2026-05-30", time: "09:30", endTime: "15:00",
      venue: { en: "Saga-Arashiyama Station", jp: "嵯峨嵐山駅" },
      area: { en: "Arashiyama", jp: "嵐山" },
      price: 2000, capacity: 22,
      blurb: { en: "Bamboo grove at opening hour, monkey park, riverside lunch.",
               jp: "開門直後の竹林、モンキーパーク、川辺のランチ。" },
      desc: { en: "Beat the crowds to the bamboo grove, climb to the monkey park, and picnic by the Hozugawa.",
              jp: "人混みを避けて竹林へ、モンキーパークに登り、保津川のほとりでピクニック。" },
      invited: 27, attended: 21, gallery: 22, points: 1,
      lat: 35.0094, lng: 135.6670,
    },
    {
      id: "e07", slug: "rooftop-djs", cover: "night", category: "nightlife",
      title: { en: "Rooftop Sundown Sessions", jp: "ルーフトップ・サンダウン" },
      date: "2026-05-23", time: "17:00", endTime: "23:00",
      venue: { en: "Bar Above, Kawaramachi", jp: "Bar Above、河原町" },
      area: { en: "Kawaramachi", jp: "河原町" },
      price: 3500, capacity: 40,
      blurb: { en: "Local DJs, city skyline, one welcome cocktail.",
               jp: "地元DJ、街の夜景、ウェルカムカクテル付き。" },
      desc: { en: "Our biggest night yet — three local DJs, a rooftop over Kawaramachi, and the whole circle dancing.",
              jp: "過去最大の夜——地元DJ3組、河原町を見下ろすルーフトップ、サークル全員でダンス。" },
      invited: 52, attended: 44, gallery: 38, points: 2,
      lat: 35.0048, lng: 135.7680,
    },
    {
      id: "e06", slug: "pottery-workshop", cover: "zen", category: "workshop",
      title: { en: "Kiyomizu Pottery Workshop", jp: "清水焼の陶芸教室" },
      date: "2026-05-16", time: "13:00", endTime: "16:00",
      venue: { en: "Tōki Studio, Gojō-zaka", jp: "陶器スタジオ、五条坂" },
      area: { en: "Gojō-zaka", jp: "五条坂" },
      price: 4200, capacity: 12,
      blurb: { en: "Throw your own cup on the wheel, fired and mailed to you.",
               jp: "ろくろで自分の器を作り、焼成後に郵送します。" },
      desc: { en: "Hands-on wheel-throwing with a Kiyomizu-ware potter. Your piece is glazed, fired, and shipped within a month.",
              jp: "清水焼の陶芸家とろくろ体験。作品は釉薬をかけて焼成し、1か月以内に郵送します。" },
      invited: 18, attended: 12, gallery: 16, points: 1,
      lat: 34.9960, lng: 135.7810,
    },
    {
      id: "e05", slug: "sakura-hanami", cover: "sakura", category: "cultural",
      title: { en: "Late Sakura Hanami Picnic", jp: "遅咲き桜の花見" },
      date: "2026-05-09", time: "11:00", endTime: "16:00",
      venue: { en: "Kyoto Botanical Gardens", jp: "京都府立植物園" },
      area: { en: "Kitayama", jp: "北山" },
      price: 1800, capacity: 35,
      blurb: { en: "Blankets, bentō, and the season's last blossoms.",
               jp: "レジャーシート、お弁当、今季最後の桜。" },
      desc: { en: "The botanical gardens hold late-blooming sakura long after the city's have fallen. Bring a blanket; we bring the bentō.",
              jp: "植物園では街中の桜が散った後も遅咲きの桜が楽しめます。シートをご持参ください。お弁当はこちらで用意します。" },
      invited: 44, attended: 33, gallery: 41, points: 1,
      lat: 35.0490, lng: 135.7640,
    },
  ];

  // ---- categories ----
  const categories = {
    cultural:  { en: "Cultural", jp: "文化", color: "#8A3233" },
    food:      { en: "Food", jp: "グルメ", color: "#C06A3C" },
    nightlife: { en: "Nightlife", jp: "ナイト", color: "#5B3B6B" },
    outdoor:   { en: "Outdoor", jp: "アウトドア", color: "#4E8FA6" },
    workshop:  { en: "Workshop", jp: "ワークショップ", color: "#5B6B4A" },
    language:  { en: "Language", jp: "言語交換", color: "#B4893C" },
  };

  // ---- the logged-in member (for member area) ----
  const me = {
    name: "Aoi Tanaka", handle: "@aoi",
    joined: "2025-09-12",
    points: 12, tier: "Insider", streak: 4,
    attended: 15, invited: 19,
    upcomingRsvp: ["e10", "e12"],
    history: [
      { id: "e09", went: true }, { id: "e08", went: true }, { id: "e07", went: true },
      { id: "e06", went: false }, { id: "e05", went: true },
    ],
  };

  // ---- tiers ----
  const tiers = [
    { key: "Guest",   min: 0,  jp: "ゲスト",     color: "#9A8B7D" },
    { key: "Regular", min: 5,  jp: "レギュラー", color: "#B4893C" },
    { key: "Insider", min: 15, jp: "インサイダー", color: "#8A3233" },
  ];

  // ---- rewards ----
  const rewards = [
    { id: "r1", cost: 10, title: { en: "Free entry to any paid event", jp: "有料イベント1回無料" }, tag: "popular" },
    { id: "r2", cost: 6,  title: { en: "Bring a friend for free", jp: "友達1名を無料招待" } },
    { id: "r3", cost: 8,  title: { en: "Reserved seat + welcome drink", jp: "席予約＋ウェルカムドリンク" } },
    { id: "r4", cost: 20, title: { en: "Borderless yukata or tote", jp: "ボーダレス浴衣またはトート" }, tag: "limited" },
  ];

  // ---- admin: per-event financials (money in / out) ----
  // revenue = attended * price ; costs = venue+food+supplies
  const finance = {
    e05: { revenue: 59400, venue: 12000, supplies: 18000, staff: 6000 },
    e06: { revenue: 50400, venue: 22000, supplies: 9000,  staff: 4000 },
    e07: { revenue: 154000, venue: 60000, supplies: 22000, staff: 16000 },
    e08: { revenue: 42000, venue: 8000,  supplies: 12000, staff: 5000 },
    e09: { revenue: 81200, venue: 30000, supplies: 14000, staff: 6000 },
  };
  Object.keys(finance).forEach((k) => {
    const f = finance[k];
    f.costs = f.venue + f.supplies + f.staff;
    f.net = f.revenue - f.costs;
  });

  // ---- admin: members table ----
  const firstN = ["Aoi","Liam","Mei","Sofia","Kenji","Emma","Hiro","Noah","Yuki","Olivia","Ren","Mia","Sora","Lucas","Hana","Ethan","Rin","Ava","Taro","Nina","Kai","Lena","Jun","Maya"];
  const lastN = ["Tanaka","Smith","Wang","Garcia","Sato","Müller","Kim","Brown","Ito","Rossi","Park","Dubois","Nakamura","Silva","Cohen","Yamada","Singh","Lee","Mori","Costa"];
  const countries = ["🇯🇵","🇺🇸","🇨🇳","🇪🇸","🇰🇷","🇩🇪","🇫🇷","🇮🇹","🇬🇧","🇧🇷","🇮🇳","🇨🇦","🇦🇺","🇹🇼","🇻🇳"];
  function seeded(i){ let x = Math.sin(i*99.13)*10000; return x - Math.floor(x); }
  const members = [];
  for (let i = 0; i < 100; i++) {
    const att = Math.max(0, Math.round(seeded(i)*16 - (i%5)));
    const pts = Math.max(0, att - Math.round(seeded(i+7)*2));
    const tier = pts >= 15 ? "Insider" : pts >= 5 ? "Regular" : "Guest";
    const spend = att * (1800 + Math.round(seeded(i+3)*2400));
    members.push({
      id: "m"+i,
      name: i === 0 ? "Aoi Tanaka" : firstN[i % firstN.length] + " " + lastN[(i*3) % lastN.length],
      country: countries[i % countries.length],
      joined: 2025 + (i%2) ? "2025" : "2026",
      attended: att, points: pts, tier,
      spend,
      last: ["e09","e08","e07","e05","e06"][i % 5],
      status: seeded(i+11) > 0.78 ? "lapsing" : "active",
    });
  }
  members.sort((a,b) => b.points - a.points);

  // ---- monthly series (members growth, revenue/cost) ----
  const months = [
    { m: "Jan", members: 58, revenue: 142000, costs: 96000 },
    { m: "Feb", members: 64, revenue: 168000, costs: 104000 },
    { m: "Mar", members: 71, revenue: 201000, costs: 121000 },
    { m: "Apr", members: 83, revenue: 246000, costs: 138000 },
    { m: "May", members: 94, revenue: 387000, costs: 188000 },
    { m: "Jun", members: 100, revenue: 132000, costs: 64000 },
  ];

  // totals
  const totRevenue = Object.values(finance).reduce((s,f)=>s+f.revenue,0);
  const totCosts = Object.values(finance).reduce((s,f)=>s+f.costs,0);
  const totInvited = events.filter(e=>e.attended!=null).reduce((s,e)=>s+e.invited,0);
  const totAttended = events.filter(e=>e.attended!=null).reduce((s,e)=>s+e.attended,0);

  window.BL_DATA = {
    yen, covers, events, categories, me, tiers, rewards, finance, members, months,
    totals: {
      revenue: totRevenue, costs: totCosts, net: totRevenue - totCosts,
      invited: totInvited, attended: totAttended,
      showRate: Math.round((totAttended / totInvited) * 100),
      pointsIssued: 312, pointsRedeemed: 86, activeMembers: 100,
    },
    eventById: (id) => events.find((e) => e.id === id),
    isPast: (e) => e.attended != null,
    breakEven: (e) => (Number(e.price) > 0 ? Math.ceil((Number(e.cost) || 0) / Number(e.price)) : 0),
    // points earned per attendee scale with the entry fee: ¥100 = 1 point
    YEN_PER_POINT: 100,
    pointsFor: (e) => Math.floor((Number(e && e.price) || 0) / 100),
    inviteBonus: { fresh: 10, returning: 5 }, // +10 for a brand-new guest, +5 for their 2nd/3rd time
    finOf: (e) => {
      const completed = e.attended != null;
      const revenue = completed ? (e.attended * e.price) : (Number(e.price) * Number(e.capacity));
      const costs = Number(e.cost) || 0;
      return { revenue, costs, net: revenue - costs, completed };
    },
  };
})();
