// public/js/i18n.js
// Lightweight bilingual translation engine (EN ↔ JA)
// Zero dependencies. Works with any SPA or MPA architecture.

const i18n = (() => {
    'use strict';

    // ── Translation Dictionary ──
    // Keys match the data-i18n attributes in HTML.
    // Each key maps to { en: '...', ja: '...' }
    const translations = {

        // ═══════════════════════════════════════
        // NAVBAR
        // ═══════════════════════════════════════
        'nav.home': { en: 'Home', ja: 'ホーム' },
        'nav.menu': { en: 'Menu', ja: 'メニュー' },
        'nav.events': { en: 'Events', ja: 'イベント' },
        'nav.reservation': { en: 'Reservation', ja: '予約' },
        'nav.reviews': { en: 'Reviews', ja: 'レビュー' },
        'lang.label': { en: 'EN', ja: 'JA' },

        // ═══════════════════════════════════════
        // FOOTER
        // ═══════════════════════════════════════
        'footer.links.title': { en: 'LINKS', ja: 'リンク' },
        'footer.links.home': { en: 'Home', ja: 'ホーム' },
        'footer.links.menu': { en: 'Menu', ja: 'メニュー' },
        'footer.links.reservation': { en: 'Reservation', ja: '予約' },
        'footer.links.events': { en: 'Events', ja: 'イベント' },
        'footer.links.reviews': { en: 'Reviews', ja: 'レビュー' },
        'footer.contact.title': { en: 'CONTACT INFO', ja: 'お問い合わせ' },
        'footer.desc': {
            en: 'When the neon lights flicker to life across Japan, the real magic begins inside the bar.',
            ja: 'ネオンが日本中で灯る時、バーの中で本当の魔法が始まります。'
        },
        'footer.copyright': {
            en: 'Copyright © 2026 Lounge. Website. All Rights Reserved',
            ja: 'Copyright © 2026 ラウンジ ウェブサイト 全著作権所有'
        },
        'footer.terms': { en: 'User terms and Conditions', ja: '利用規約' },
        'footer.privacy': { en: 'Privacy Policy', ja: 'プライバシーポリシー' },

        // ═══════════════════════════════════════
        // HOME PAGE
        // ═══════════════════════════════════════

        // About Section
        'home.about.title': { en: 'About Us', ja: '私たちについて' },
        'home.about.desc1': {
            en: 'Amour et Grace is a simple yet sophisticated special space for everyone who wants to refresh their mind and body and regain their vitality.',
            ja: 'Amour et Graceは、心身をリフレッシュし、活力を取り戻したいすべての人のための、シンプルでありながら洗練された特別な空間です。'
        },
        'home.about.desc2': {
            en: 'Here, you can enjoy drinks, food, and even sing and dance. Our staff will assist you in providing warm hospitality with a friendly atmosphere.',
            ja: 'ここでは、ドリンク、フード、そして歌やダンスもお楽しみいただけます。フレンドリーな雰囲気の中、スタッフが温かいおもてなしをいたします。'
        },
        'home.about.desc3': {
            en: 'You can also enjoy our homemade dishes, a fusion of Filipino cuisine and simple Japanese food.',
            ja: 'フィリピン料理とシンプルな日本料理を融合させた自家製料理もお楽しみいただけます。'
        },
        'home.about.stat1': { en: 'Years of\nGrace', ja: '恵みの\n年月' },
        'home.about.stat2': { en: '"Sell the Sizzle,\nNot the Steak"', ja: '「シズルを売れ、\nステーキではなく」' },
        'home.about.stat3': { en: 'Dynamic\nMenu', ja: 'ダイナミック\nメニュー' },

        // Culture Cards
        'home.culture.usa': { en: 'Love and Blessing', ja: '愛と祝福' },
        'home.culture.ph': { en: 'Pag-ibig at Grasya', ja: 'パグイビグ アット グラシャ' },

        // Promotions
        'home.promo.drink.title': { en: '1 HOUR DRINK ALL\nYOU CAN', ja: '1時間\n飲み放題' },
        'home.promo.sing.title': { en: 'SING ALL YOU CAN', ja: '歌い放題' },
        'home.promo.sing.request': { en: 'REQUEST = ¥1000', ja: 'リクエスト = ¥1000' },
        'home.promo.car.title': { en: 'WE OFFER CAR SERVICE\nWITH CHARGE DEPEND PER\nKILOMETER', ja: '送迎サービスあり\nキロメートルごとの\n料金制' },

        // Featured Dishes
        'home.featured.title': { en: 'Featured Dishes', ja: 'おすすめ料理' },
        'home.featured.dish1.name': { en: 'TONKOTSU RAMEN', ja: 'とんこつラーメン' },
        'home.featured.dish1.desc': { en: 'Experience our signature rich, creamy pork bone broth simmered to perfection.', ja: '濃厚でクリーミーな豚骨ブロスを心ゆくまでお楽しみください。' },
        'home.featured.dish2.name': { en: 'SUSHI', ja: '寿司' },
        'home.featured.dish2.desc': { en: 'Fresh, handcrafted sushi rolls prepared with the finest ingredients.', ja: '厳選された食材で手作りした新鮮な寿司をお楽しみください。' },
        'home.featured.dish3.name': { en: 'KARE-KARE', ja: 'カレカレ' },
        'home.featured.dish3.desc': { en: 'A classic Filipino stew featuring our savory, thick peanut sauce.', ja: '濃厚なピーナッツソースが特徴のフィリピンの伝統シチュー。' },
        'home.featured.btn': { en: 'Check Menu', ja: 'メニューを見る' },

        // Featured Drinks
        'home.drinks.title': { en: 'Featured Drinks', ja: '注目のドリンク' },
        'home.drinks.gin.desc': { en: 'JAPANESE GIN IS WORLD-CLASS AND FAMOUS FOR ITS EXTREME SMOOTHNESS', ja: '日本のジンは世界最高峰で、極めて滑らかな口当たりで有名です' },
        'home.drinks.whisky.desc': { en: 'JAPANESE WHISKY IS WORLD-RENOWNED FOR ITS EXCEPTIONAL QUALITY', ja: '日本のウイスキーは卓越した品質で世界的に有名です' },
        'home.drinks.wine.desc': { en: 'JAPANESE WINE IS EXCELLENT AND RAPIDLY GROWING', ja: '日本のワインは優れており、急速に成長しています' },
        'home.drinks.seemore': { en: 'もっと見る', ja: 'もっと見る' },

        // Events Preview
        'home.events.title': { en: 'Featured Events', ja: '注目のイベント' },
        'home.events.desc.left': {
            en: 'Amour et Grace is an extraordinary, intimate dining experience in the heart of the city, beautifully blending Filipino-inspired cuisine with soulful Japanese hospitality.',
            ja: 'Amour et Graceは、街の中心にある特別で親密なダイニング体験です。フィリピン風の料理と心のこもった日本のおもてなしが美しく融合しています。'
        },
        'home.events.desc.right': {
            en: 'When the neon lights flicker to life across Japan, the real magic begins inside the bar. For those looking to experience Komaki City legendary nightlife at its absolute finest,',
            ja: 'ネオンが日本中で灯る時、バーの中で本当の魔法が始まります。小牧市の伝説的なナイトライフを最高に楽しみたい方に、'
        },

        // Gallery
        'home.gallery.title': { en: 'Gallery', ja: 'ギャラリー' },
        'home.gallery.subtitle': {
            en: 'Step inside our world — where refined interiors meet handcrafted\npours and every moment is worth savoring.',
            ja: '私たちの世界へ — 洗練されたインテリアと\n手作りのドリンクが出会い、すべての瞬間が味わう価値があります。'
        },

        // Reservation CTA
        'home.res.title': { en: 'Reservation', ja: '予約' },
        'home.res.desc': {
            en: 'Planning something special? We\'d love to be part of it. To reserve, provide your personal details, event type, celebrant\'s name, preferred date and time, number of guests, and food and beverage preferences. Our lounge is open daily from 10:00 AM to 5:00 PM, with a maximum capacity of 20 guests. You can experience the extra ordinary nights from Thursday to Sunday at 7 pm to 1:45 am even without reservations. Closing time at 2 am. Music and karaoke are available at no extra charge. For decoration inquiries, please contact our owner at +81 903 856 2854.',
            ja: '特別なことを計画していますか？ぜひお手伝いさせてください。ご予約には、個人情報、イベントの種類、主役の名前、希望の日時、ゲスト数、料理やドリンクのご希望をお知らせください。ラウンジは毎日10:00から17:00まで営業しており、最大収容人数は20名です。木曜日から日曜日の19:00から1:45まで、予約なしでも特別な夜をお楽しみいただけます。閉店時間は午前2時です。音楽とカラオケは無料でご利用いただけます。デコレーションのお問い合わせは、オーナーの+81 903 856 2854までご連絡ください。'
        },
        'home.res.btn': { en: '予約する', ja: '予約する' },

        // Testimonials
        'home.testimonials.title': { en: 'Testimonials', ja: 'お客様の声' },

        // Contact Section
        'home.contact.title': { en: 'Contacts', ja: 'お問い合わせ' },
        'home.contact.address': {
            en: '3F, K-BOX Building, 1-198 Chuo,\nKomaki City, Aichi Prefecture\n485-009',
            ja: '愛知県小牧市中央1-198\nK-BOXビル3F\n485-009'
        },
        'home.contact.hours': { en: 'OPEN DAILY 8:00 AM - 11:00 PM', ja: '毎日営業 8:00 - 23:00' },

        // ═══════════════════════════════════════
        // MENU PAGE
        // ═══════════════════════════════════════
        'menu.hero.title': { en: 'Our Menu', ja: '私たちのメニュー' },
        'menu.discover.title': { en: 'Discover Our Menu', ja: 'メニューをご覧ください' },
        'menu.discover.desc': {
            en: 'Experience a thoughtfully curated selection of authentic Japanese cuisine, premium wagyu, handcrafted beverages, and signature specialties. Every dish and drink is prepared to bring together tradition, quality, and unforgettable flavors.',
            ja: '本格的な日本料理、プレミアム和牛、手作りの飲料、シグネチャースペシャリティを厳選しました。すべての料理とドリンクは、伝統、品質、忘れられない味わいを一つにします。'
        },
        'menu.selection.title': { en: 'Menu Selection', ja: 'メニューセレクション' },
        'menu.japanese.title': { en: 'Japanese Food Section', ja: '日本食セクション' },
        'menu.japanese.desc': {
            en: 'Rooted in tradition. Bursting with flavor. Our Filipino dishes bring the heart of Filipino cuisine straight to your table.',
            ja: '伝統に根ざし、風味豊かに。フィリピン料理の心をそのまま食卓にお届けします。'
        },
        'menu.drinks.title': { en: 'Drinks Section', ja: 'ドリンクセクション' },
        'menu.drinks.desc': {
            en: 'Rooted in tradition. Bursting with flavor. Our Filipino dishes bring the heart of Filipino cuisine straight to your table.',
            ja: '伝統に根ざし、風味豊かに。フィリピン料理の心をそのまま食卓にお届けします。'
        },
        'menu.platters.title': { en: 'Party Platters', ja: 'パーティープラッター' },
        'menu.platters.desc': {
            en: 'Every great celebration deserves an equally great spread. Our party platters are a carefully curated selection of Japanese and Filipino favorites — generous, flavorful, and made to be shared.',
            ja: 'すべての素晴らしいお祝いには、同様に素晴らしい料理が必要です。パーティープラッターは、日本とフィリピンのお気に入りを厳選した、豊富で風味豊かなシェアメニューです。'
        },

        // Filter buttons
        'menu.filter.all': { en: 'All', ja: 'すべて' },
        'menu.filter.new': { en: 'New', ja: '新着' },
        'menu.filter.filipino': { en: 'Filipino Food', ja: 'フィリピン料理' },
        'menu.filter.sushi': { en: 'Sushi', ja: '寿司' },
        'menu.filter.ramen': { en: 'Ramen', ja: 'ラーメン' },

        // Menu items
        'menu.item.tonkotsu.name': { en: 'TONKOTSU RAMEN', ja: 'とんこつラーメン' },
        'menu.item.tonkotsu.desc': { en: 'Rich pork broth with chashu, egg, and spring onion.', ja: 'チャーシュー、卵、ネギ入りの濃厚な豚骨スープ。' },
        'menu.item.tonkotsu.desc2': { en: 'Rich pork broth with chashu, egg, and spring onions.', ja: 'チャーシュー、卵、ネギ入りの濃厚な豚骨スープ。' },
        'menu.item.chefs': { en: "Chef's Recommend Menu", ja: 'シェフのおすすめ' },
        'menu.item.chefs.rec': { en: "Chef's Recommendation", ja: 'シェフのおすすめ' },
        'menu.item.spicymiso.name': { en: 'SPICY MISO RAMEN', ja: '辛味噌ラーメン' },
        'menu.item.spicymiso.desc': { en: 'Spicy miso broth with minced pork, bean sprouts, and scallions.', ja: '辛味噌スープにひき肉、もやし、ネギ。' },
        'menu.item.dragon.name': { en: 'DRAGON ROLL', ja: 'ドラゴンロール' },
        'menu.item.dragon.desc': { en: 'Eel and cucumber topped with avocado and sweet eel sauce.', ja: 'うなぎときゅうりにアボカドと甘いうなぎのタレ。' },
        'menu.item.teriyaki.name': { en: 'CHICKEN TERIYAKI', ja: 'チキン照り焼き' },
        'menu.item.teriyaki.desc': { en: 'Grilled chicken glazed with sweet teriyaki sauce, served with rice.', ja: '甘い照り焼きソースで焼いた鶏肉、ライス付き。' },
        'menu.item.gyudon.name': { en: 'BEEF GYUDON', ja: '牛丼' },
        'menu.item.gyudon.desc': { en: 'Thinly sliced beef and onions simmered in a mildly sweet sauce over rice.', ja: '薄切り牛肉と玉ねぎを甘辛いタレでご飯にのせた一品。' },
        'menu.item.brandy.name': { en: 'BRANDY', ja: 'ブランデー' },
        'menu.item.brandy.desc': { en: 'Rich pork broth with chashu, egg, and spring onions.', ja: 'チャーシュー、卵、ネギ入りの濃厚な豚骨スープ。' },
        'menu.btn.loadmore': { en: 'Load More', ja: 'もっと見る' },
        'menu.btn.showless': { en: 'Show Less', ja: '表示を減らす' },
        'menu.btn.loading': { en: 'Loading...', ja: '読み込み中...' },

        // Sushi display
        'menu.sushi.nigiri.name': { en: 'SALMON NIGIRI SUSHI', ja: 'サーモンにぎり寿司' },
        'menu.sushi.nigiri.desc1': {
            en: 'Premium fresh salmon layered atop perfectly seasoned sushi rice and secured with a delicate nori wrap',
            ja: '新鮮なサーモンを完璧に味付けされた酢飯の上にのせ、繊細な海苔で巻きました'
        },
        'menu.sushi.nigiri.desc2': {
            en: 'Premium fresh salmon layered atop perfectly seasoned sushi rice and secured with a delicate nori wrap',
            ja: '新鮮なサーモンを完璧に味付けされた酢飯の上にのせ、繊細な海苔で巻きました'
        },
        'menu.sushi.roll.desc': {
            en: 'Fresh cucumber, savory crab stick, and a rich creamy filling are rolled in premium sushi rice and nori, then finished with delicate fish roe for a burst of flavor and texture.',
            ja: '新鮮なきゅうり、カニカマ、クリーミーなフィリングをプレミアム酢飯と海苔で巻き、魚卵で仕上げた一品。'
        },

        // Platter items
        'menu.platter.karekare.title': { en: 'KARE-KARE\nPLATTER', ja: 'カレカレ\nプラッター' },
        'menu.platter.karekare.desc': { en: 'a traditional Filipino stew known for its rich, savory-sweet peanut sauce', ja: '濃厚で甘辛いピーナッツソースで知られるフィリピンの伝統的なシチュー' },

        // ═══════════════════════════════════════
        // EVENTS PAGE
        // ═══════════════════════════════════════
        'events.hero.title': { en: 'Events', ja: 'イベント' },
        'events.marquee.seasonal': { en: 'Seasonal Events', ja: '季節のイベント' },
        'events.marquee.summer': { en: 'Summer', ja: '夏' },
        'events.marquee.winter': { en: 'Winter', ja: '冬' },
        'events.marquee.fall': { en: 'Fall', ja: '秋' },
        'events.marquee.spring': { en: 'Spring', ja: '春' },
        'events.marquee.karaoke': { en: 'Karaoke & DJ Nights', ja: 'カラオケ＆DJナイト' },
        'events.marquee.cocktail': { en: 'Cocktail Parties', ja: 'カクテルパーティー' },
        'events.marquee.livemusic': { en: 'Live Music', ja: 'ライブミュージック' },

        // Occasion section
        'events.occasion.title': { en: 'Making Every Occasion', ja: 'すべての機会を' },
        'events.occasion.special': { en: 'Special', ja: '特別に' },
        'events.occasion.subtitle': { en: 'Seasonal Events & Cocktail Nights', ja: '季節のイベント＆カクテルナイト' },
        'events.occasion.desc': {
            en: 'Celebrate the seasons with exclusive cocktails, live entertainment, and unforgettable nights at Amour et Grace.',
            ja: 'Amour et Graceで、限定カクテル、ライブエンターテイメント、忘れられない夜で季節を祝いましょう。'
        },
        'events.occasion.btn': { en: 'See Upcoming', ja: '今後のイベント' },
        'events.occasion.phone.label': { en: 'Phone Number', ja: '電話番号' },
        'events.card.spring': { en: 'Spring', ja: '春' },
        'events.card.winter': { en: 'Winter', ja: '冬' },
        'events.card.summer': { en: 'Summer', ja: '夏' },
        'events.card.livemusic': { en: 'Live Music', ja: 'ライブミュージック' },

        // Cinematic story
        'events.story.wehost': { en: 'We Host', ja: '私たちが開催' },
        'events.story.seasonal': { en: 'Seasonal Events,', ja: '季節のイベント、' },
        'events.story.including': { en: 'Including', ja: 'を含む' },
        'events.story.cocktail': { en: 'Cocktail Parties,', ja: 'カクテルパーティー、' },
        'events.story.livemusic': { en: 'Live Music,', ja: 'ライブミュージック、' },
        'events.story.karaoke': { en: 'Karaoke', ja: 'カラオケ' },
        'events.story.and': { en: 'And', ja: 'そして' },
        'events.story.djnights': { en: 'Dj Nights.', ja: 'DJナイト。' },

        // Timeline
        'events.upcoming.title': { en: 'Upcoming Events', ja: '今後のイベント' },
        'events.upcoming.desc': {
            en: 'Something exciting is always happening at our lounge. Check back regularly and be the first to know about our upcoming events, special nights, and exclusive celebrations.',
            ja: 'ラウンジではいつもエキサイティングなことが起こっています。定期的にチェックして、今後のイベント、スペシャルナイト、限定イベントをいち早く知りましょう。'
        },
        'events.timeline.sakura.desc': { en: 'Experience the beauty of spring with our cherry blossom themed cocktails and live DJ sets.', ja: '桜をテーマにしたカクテルとライブDJセットで春の美しさを体験してください。' },
        'events.timeline.tokyo.desc': { en: 'High energy, neon lights, and the best electronic beats in the city.', ja: '高エネルギー、ネオンライト、そして街で最高のエレクトロニックビート。' },
        'events.timeline.jazz.desc': { en: 'A sophisticated evening of smooth jazz, premium cigars, and classic cocktails.', ja: 'スムースジャズ、プレミアムシガー、クラシックカクテルの洗練された夜。' },
        'events.timeline.matsuri.desc': { en: 'A vibrant festival night featuring traditional performers and modern mixes.', ja: '伝統的なパフォーマーとモダンミックスが特徴の活気あるフェスティバルナイト。' },
        'events.timeline.reserve': { en: 'Reserve Now', ja: '今すぐ予約' },

        // Past Events
        'events.past.title': { en: 'PAST EVENTS', ja: '過去のイベント' },
        'events.past.featured.desc': {
            en: 'We host intimate evenings, live performances, and celebrations that linger in memory long after the night has ended. We host intimate evenings, live performances, and celebrations that linger in memory long after the night has ended.\n\nWe host intimate evenings, live performances, and celebrations that linger in memory long after the night has ended.\n\nWe host intimate evenings, live performances, and celebrations that linger in memory long after the night has ended.',
            ja: '私たちは親密な夜、ライブパフォーマンス、そして夜が終わった後も長く記憶に残るお祝いを開催しています。\n\n私たちは親密な夜、ライブパフォーマンス、そして夜が終わった後も長く記憶に残るお祝いを開催しています。\n\n私たちは親密な夜、ライブパフォーマンス、そして夜が終わった後も長く記憶に残るお祝いを開催しています。'
        },
        'events.past.item.desc': {
            en: 'WE HOST INTIMATE EVENINGS, LIVE PERFORMANCES, AND CELEBRATIONS THAT LINGER IN MEMORY LONG AFTER THE NIGHT HAS ENDED.',
            ja: '私たちは親密な夜、ライブパフォーマンス、そして夜が終わった後も長く記憶に残るお祝いを開催しています。'
        },

        // ═══════════════════════════════════════
        // RESERVATIONS PAGE
        // ═══════════════════════════════════════
        'res.hero.title': { en: 'Reservations', ja: '予約' },
        'res.card.capacity': { en: 'Maximum capacity of\n20 Guest', ja: '最大収容人数\n20名' },
        'res.card.open': { en: 'Open\nMonday - Sunday', ja: '営業\n月曜日～日曜日' },
        'res.card.lounge': { en: 'Lounge Reservation\n10:00 am - 5:00pm', ja: 'ラウンジ予約\n10:00 - 17:00' },
        'res.card.entertainment': { en: 'Entertainment\nKaraoke & Music\nFree of Charge', ja: 'エンターテイメント\nカラオケ＆音楽\n無料' },
        'res.card.decorations': { en: 'Simple decorations\navailable upon request.', ja: 'シンプルなデコレーション\nリクエストに応じてご用意。' },

        // Reservation form
        'res.form.header.jp': { en: 'テーブルを予約する', ja: 'テーブルを予約する' },
        'res.form.header.en': { en: 'DINE WITH US - 今すぐ予約する', ja: 'DINE WITH US - 今すぐ予約する' },
        'res.form.step1': { en: 'Fill out the reservation\nform', ja: '予約フォームに\nご記入ください' },
        'res.form.step2': { en: 'We review your request', ja: 'ご依頼を確認します' },
        'res.form.step3': { en: 'Reservation confirmation\nis sent via email or phone', ja: '予約確認が\nメールまたは電話で送信されます' },
        'res.form.step4': { en: 'Enjoy your event', ja: 'イベントをお楽しみください' },
        'res.form.fullname': { en: 'Full name', ja: 'お名前' },
        'res.form.email': { en: 'Email', ja: 'メールアドレス' },
        'res.form.phone': { en: 'Telephone Number', ja: '電話番号' },
        'res.form.guests': { en: 'Number of Guest', ja: 'ゲスト数' },
        'res.form.guests.select': { en: 'Select number of guests', ja: 'ゲスト数を選択' },
        'res.form.guests.1': { en: '1 Person', ja: '1名' },
        'res.form.guests.2': { en: '2 People', ja: '2名' },
        'res.form.guests.3': { en: '3 People', ja: '3名' },
        'res.form.guests.4': { en: '4 People', ja: '4名' },
        'res.form.guests.5': { en: '5 People', ja: '5名' },
        'res.form.guests.6': { en: '6 People', ja: '6名' },
        'res.form.guests.7': { en: '7 People', ja: '7名' },
        'res.form.guests.8': { en: '8 People', ja: '8名' },
        'res.form.guests.9': { en: '9 People', ja: '9名' },
        'res.form.guests.10': { en: '10 People', ja: '10名' },
        'res.form.guests.15': { en: '15 People', ja: '15名' },
        'res.form.guests.20': { en: '20 People', ja: '20名' },
        'res.form.date': { en: 'Date of Reservation', ja: '予約日' },
        'res.form.time': { en: 'Time of Reservation', ja: '予約時間' },
        'res.form.type': { en: 'Type of Reservation', ja: '予約の種類' },
        'res.form.type.select': { en: 'Select', ja: '選択' },
        'res.form.type.table': { en: 'Table Reservation', ja: 'テーブル予約' },
        'res.form.type.lounge': { en: 'Lounge', ja: 'ラウンジ' },
        'res.form.type.event': { en: 'Private Event', ja: 'プライベートイベント' },
        'res.form.special': { en: 'Special Request', ja: '特別なリクエスト' },
        'res.form.special.placeholder': { en: 'Request your favorite drinks or dish. You can request whatever decoration / design.........', ja: 'お好きなドリンクや料理をリクエストしてください。デコレーション/デザインもリクエスト可能です。' },
        'res.form.contact.text': { en: 'For decorations and custom arrangements, please contact:', ja: 'デコレーションやカスタムアレンジメントのお問い合わせ：' },
        'res.form.submit': { en: '今すぐ予約する', ja: '今すぐ予約する' },

        // Info card
        'res.info.address': { en: 'Address', ja: '住所' },
        'res.info.contact': { en: 'Contact', ja: '連絡先' },
        'res.info.opentime': { en: 'Open Time', ja: '営業時間' },
        'res.info.restobar': { en: 'Resto bar: 9:00 AM - 5:00 PM', ja: 'レストバー: 9:00 - 17:00' },
        'res.info.monday': { en: 'Monday - Sunday', ja: '月曜日～日曜日' },
        'res.info.lounge': { en: 'Lounge: 7:00 PM - 2:00 AM', ja: 'ラウンジ: 19:00 - 2:00' },
        'res.info.except': { en: 'Except Tuesday', ja: '火曜日を除く' },
        'res.info.social': { en: 'Stay Connected', ja: 'フォローする' },

        // FAQ
        'res.faq.title': { en: 'Frequently asked', ja: 'よくある' },
        'res.faq.title2': { en: 'questions', ja: 'ご質問' },
        'res.faq.desc': {
            en: 'Find quick answers regarding reservations, private events, food packages, and our lounge policies. For specific inquiries, feel free to reach out to our team directly.',
            ja: '予約、プライベートイベント、フードパッケージ、ラウンジポリシーに関するよくある質問をご覧ください。具体的なお問い合わせは、お気軽にチームまでご連絡ください。'
        },
        'res.faq.q1': { en: 'How do I reserve a table?', ja: 'テーブルの予約方法は？' },
        'res.faq.a1': { en: 'You can reserve a table by filling out our online reservation form above. Once submitted, our team will review your request and send a confirmation via email or phone.', ja: '上記のオンライン予約フォームに記入してテーブルを予約できます。送信後、チームがリクエストを確認し、メールまたは電話で確認を送信します。' },
        'res.faq.q2': { en: 'Can I book the lounge for private events?', ja: 'ラウンジをプライベートイベントに利用できますか？' },
        'res.faq.a2': { en: 'Yes, our lounge is available for private events. Please select "Private Event" on the reservation form or contact us directly to discuss capacity and packages.', ja: 'はい、ラウンジはプライベートイベントにご利用いただけます。予約フォームで「プライベートイベント」を選択するか、直接お問い合わせください。' },
        'res.faq.q3': { en: 'What is the maximum guest capacity?', ja: '最大収容人数は？' },
        'res.faq.a3': { en: 'Our standard tables can accommodate up to 20 guests. For larger parties or full venue buyouts, please contact our management team.', ja: '標準テーブルは最大20名まで収容可能です。大人数のパーティーや貸切については、マネジメントチームにお問い合わせください。' },
        'res.faq.q4': { en: 'Do you offer food and drink packages?', ja: 'フード＆ドリンクパッケージはありますか？' },
        'res.faq.a4': { en: 'Absolutely. We offer premium Japanese-Filipino fusion catering and customizable drink packages. You can specify your preferences in the Special Requests section.', ja: 'はい。プレミアムな日比フュージョンケータリングとカスタマイズ可能なドリンクパッケージを提供しています。特別リクエスト欄でご希望をお知らせください。' },
        'res.faq.q5': { en: 'Can I request custom decorations?', ja: 'カスタムデコレーションをリクエストできますか？' },
        'res.faq.a5': { en: 'Yes, we welcome custom decorations for birthdays and celebrations. Let us know in advance so we can assist with the setup.', ja: 'はい、誕生日やお祝いのカスタムデコレーションを歓迎します。事前にお知らせいただければ、セットアップをお手伝いします。' },
        'res.faq.q6': { en: 'How far in advance should I make a reservation?', ja: 'どのくらい前に予約すべきですか？' },
        'res.faq.a6': { en: 'We recommend booking at least a week in advance for regular tables, and at least 3-4 weeks in advance for large private events.', ja: '通常テーブルは少なくとも1週間前、大規模なプライベートイベントは少なくとも3〜4週間前のご予約をお勧めします。' },
        'res.faq.q7': { en: 'Will I receive a confirmation after booking?', ja: '予約後に確認は届きますか？' },
        'res.faq.a7': { en: 'Yes, our reservation team will review your submission and contact you within 24 hours to confirm your booking.', ja: 'はい、予約チームが送信内容を確認し、24時間以内にご連絡してご予約を確定します。' },
        'res.faq.q8': { en: 'Do you host seasonal events and cocktail parties?', ja: '季節のイベントやカクテルパーティーは開催していますか？' },
        'res.faq.a8': { en: 'Yes! We frequently host seasonal events, live music, and themed cocktail parties. Keep an eye on our social media for updates.', ja: 'はい！季節のイベント、ライブミュージック、テーマ別カクテルパーティーを頻繁に開催しています。最新情報はSNSをチェックしてください。' },

        // ═══════════════════════════════════════
        // REVIEWS PAGE
        // ═══════════════════════════════════════
        'reviews.hero.title': { en: 'Reviews', ja: 'レビュー' },
        'reviews.overall': { en: 'Overall Rating', ja: '総合評価' },
        'reviews.share': { en: 'Share Your Experience', ja: '体験を共有する' },
        'reviews.yourrating': { en: 'Your Rating', ja: 'あなたの評価' },
        'reviews.displayname': { en: 'Display Name', ja: '表示名' },
        'reviews.displayname.placeholder': { en: 'e.g. Yamada Tarō', ja: '例: 山田太郎' },
        'reviews.yourreview': { en: 'Your Review', ja: 'あなたのレビュー' },
        'reviews.yourreview.placeholder': { en: 'What do you think of the kare-kare? how was the service of our resto?', ja: 'カレカレの感想は？レストランのサービスはいかがでしたか？' },
        'reviews.submit': { en: 'Post Feedback', ja: 'フィードバックを送信' },
        'reviews.customer': { en: 'Customer Reviews', ja: 'お客様のレビュー' },
        'reviews.sort.newest': { en: 'Newest First', ja: '新しい順' },
        'reviews.sort.highest': { en: 'Highest Rating', ja: '高評価順' },
        'reviews.sort.lowest': { en: 'Lowest Rating', ja: '低評価順' },
        'reviews.showing': { en: 'Showing', ja: '表示中' },
        'reviews.results': { en: 'results', ja: '件' },
        'reviews.loadmore': { en: 'もっと見る', ja: 'もっと見る' },
        'reviews.showless': { en: 'Show Less', ja: '表示を減らす' },
    };

    // ── Private State ──
    let currentLang = 'en';

    // ── Language Detection ──
    function detectLanguage() {
        // 1. Check localStorage (user's explicit preference)
        const stored = localStorage.getItem('lang');
        if (stored === 'en' || stored === 'ja') return stored;

        // 2. Check browser language
        const browserLang = navigator.language || navigator.userLanguage || '';
        if (browserLang.startsWith('ja')) return 'ja';

        // 3. Default to English
        return 'en';
    }

    // ── Apply Translations ──
    // Walks all [data-i18n] elements and swaps their text content.
    // Also handles [data-i18n-placeholder] for form inputs.
    // Also handles [data-i18n-html] for innerHTML (elements with <br> etc.)
    function applyTranslations() {
        const lang = currentLang;

        // Text content translations
        const elements = document.querySelectorAll('[data-i18n]');
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const key = el.getAttribute('data-i18n');
            const entry = translations[key];
            if (entry && entry[lang] !== undefined) {
                el.textContent = entry[lang];
            }
        }

        // innerHTML translations (for elements containing <br>, <span>, etc.)
        const htmlElements = document.querySelectorAll('[data-i18n-html]');
        for (let i = 0; i < htmlElements.length; i++) {
            const el = htmlElements[i];
            const key = el.getAttribute('data-i18n-html');
            const entry = translations[key];
            if (entry && entry[lang] !== undefined) {
                el.innerHTML = entry[lang];
            }
        }

        // Placeholder translations
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        for (let i = 0; i < placeholders.length; i++) {
            const el = placeholders[i];
            const key = el.getAttribute('data-i18n-placeholder');
            const entry = translations[key];
            if (entry && entry[lang] !== undefined) {
                el.placeholder = entry[lang];
            }
        }

        // Update the toggle button label
        const toggleLabel = document.querySelector('[data-i18n="lang.label"]');
        if (toggleLabel) {
            toggleLabel.textContent = lang === 'en' ? 'EN' : 'JA';
        }

        // Update <html lang="..."> for accessibility / SEO
        document.documentElement.lang = lang;
    }

    // ── Toggle Language ──
    function toggleLanguage() {
        currentLang = currentLang === 'en' ? 'ja' : 'en';
        localStorage.setItem('lang', currentLang);
        applyTranslations();
    }

    // ── Get Current Language ──
    function getLang() {
        return currentLang;
    }

    // ── Initialize ──
    function init() {
        currentLang = detectLanguage();
        localStorage.setItem('lang', currentLang);
        applyTranslations();

        // Bind the toggle button
        const toggleBtn = document.getElementById('lang-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleLanguage);
        }
    }

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ── Public API ──
    return {
        applyTranslations,
        toggleLanguage,
        getLang,
        init,
        translations // exposed so other scripts can look up keys if needed
    };
})();
