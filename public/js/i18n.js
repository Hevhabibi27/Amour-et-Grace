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
        'nav.status.open.lounge': { en: 'Open Now — Lounge', ja: '営業中 — ラウンジ' },
        'nav.status.open.resto': { en: 'Open Now — Resto Bar', ja: '営業中 — レストバー' },
        'nav.status.closed.11am': { en: 'Closed — Resto Bar Opens 11:00 AM', ja: '準備中 — レストバー 11:00 AM開店' },
        'nav.status.closed.8pm': { en: 'Closed — Lounge Opens 8:00 PM', ja: '準備中 — ラウンジ 8:00 PM開店' },
        'nav.status.closed.7pm': { en: 'Closed — Lounge Opens 7:00 PM', ja: '準備中 — ラウンジ 7:00 PM開店' },
        'nav.status.closed.wed': { en: 'Closed — Opens Wednesday 8:00 PM', ja: '準備中 — 水曜日 8:00 PM開店' },

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

        // Promotions
        'home.promo.drink.title': { en: '1 HOUR DRINK ALL\nYOU CAN', ja: '1時間\n飲み放題' },
        'home.promo.sing.title': { en: 'SING ALL YOU CAN', ja: '歌い放題' },
        'home.promo.sing.request': { en: 'REQUEST = ¥1000', ja: 'リクエスト = ¥1000' },
        'home.promo.eat.title': { en: 'ALL YOU CAN EAT<br><span class="highlight-promo">PROMO</span>', ja: '食べ放題<br><span class="highlight-promo">プロモ</span>' },
        'home.promo.eat.time': { en: '11 am to 7 pm', ja: '午前11時〜午後7時' },
        'home.promo.eat.day': { en: 'Every Sunday', ja: '毎週日曜日' },
        'home.promo.car.title': { en: 'WE OFFER CAR SERVICE\nPICK UP AND\nDROP OFF', ja: '送迎サービス\nお迎え・お送り' },

        // Featured Dishes
        'home.featured.dish1.name': { en: 'BICOL EXPRESS', ja: 'ビコールエクスプレス' },
        'home.featured.dish1.desc': { en: 'Fiery, creamy, and absolutely addictive — tender pork cooked in rich coconut milk with generous amounts of chilies and shrimp paste.', ja: '濃厚なココナッツミルクとたっぷりの唐辛子、エビのペーストで豚肉を煮込んだ、辛くてクリーミーで絶対にクセになる一品。' },
        'home.featured.dish2.name': { en: 'YAKISOBA', ja: '焼きそば' },
        'home.featured.dish2.desc': { en: 'Classic Japanese street food — springy stir-fried noodles tossed with tender pork, fresh cabbage, and vegetables.', ja: '定番の日本のストリートフード — 弾力のある炒め麺に、柔らかい豚肉、新鮮なキャベツと野菜を絡めました。' },
        'home.featured.dish3.name': { en: 'KARE-KARE', ja: 'カレカレ' },
        'home.featured.dish3.desc': { en: 'A rich, golden peanut stew slow-cooked with tender meat and fresh vegetables — best paired with a touch of bagoong for that perfect savory kick.', ja: '柔らかいお肉と新鮮な野菜をじっくり煮込んだ、コクのある黄金色のピーナッツシチュー。旨味たっぷりのバゴーン（エビペースト）を添えて。' },
        'home.featured.btn': { en: 'Check Menu', ja: 'メニューを見る' },

        // Featured Drinks
        'home.drinks.gin.desc': { en: 'A true expression of Japanese harmony in a glass.', ja: 'グラスに込められた、日本の調和の真の表現。' },
        'home.drinks.whisky.desc': { en: 'The Philippines most beloved dessert', ja: 'フィリピンで最も愛されているデザート。' },
        'home.drinks.wine.desc': { en: 'Made with ripe mangoes for a rich, creamy, and refreshing tropical treat', ja: '完熟マンゴーを使用した、リッチでクリーミー、爽やかなトロピカルシェイク。' },
        'home.drinks.seemore': { en: 'もっと見る', ja: 'もっと見る' },

        // Events Preview
        'home.events.desc.left': {
            en: 'Amour et Grace is an extraordinary venue in the heart of the city, beautifully blending Filipino-inspired cuisine with lively karaoke, singing, dancing, and unforgettable event experiences.',
            ja: 'Amour et Graceは、街の中心にある特別な空間です。フィリピン風の料理と、活気あふれるカラオケ、歌、ダンス、そして忘れられないイベント体験が美しく融合しています。'
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
            en: 'Planning something special? We\'d love to be part of it. To reserve, provide your personal details, event type, celebrant\'s name, preferred date and time, number of guests, and food and beverage preferences. Our Resto Bar is open every Sunday from 11:00 AM to 12 Midnight. Lounge nights are Wednesday & Thursday from 8:00 PM to 12 Midnight, and Friday & Saturday from 7:00 PM to 2:00 AM. Closed on Monday and Tuesday. For party and event reservations, please book between 9:00 AM to 5:00 PM. Maximum capacity of 20 guests. Music and karaoke are available at no extra charge. For decoration inquiries, please contact our owner at 090 3856 2854.',
            ja: '特別なことを計画していますか？ぜひお手伝いさせてください。ご予約には、個人情報、イベントの種類、主役の名前、希望の日時、ゲスト数、料理やドリンクのご希望をお知らせください。レストバーは毎週日曜日11:00から24:00まで営業しています。ラウンジは水曜・木曜20:00〜24:00、金曜・土曜19:00〜翌2:00です。月曜・火曜は定休日です。パーティー・イベントのご予約は9:00〜17:00にお問い合わせください。最大収容人数は20名です。音楽とカラオケは無料でご利用いただけます。デコレーションのお問い合わせは、オーナーの090 3856 2854までご連絡ください。'
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
        'home.contact.hours': { en: 'Resto Bar: Sun 11AM-12MN | Lounge: Wed-Sat', ja: 'レストバー: 日曜 11:00-24:00 | ラウンジ: 水〜土' },

        // ═══════════════════════════════════════
        // MENU PAGE
        // ═══════════════════════════════════════
        'menu.discover.title': { en: 'Discover Our Menu', ja: 'メニューをご覧ください' },
        'menu.discover.desc': {
            en: 'Experience a thoughtfully homemade dishes, together with a variety of beverages and drinks that sparkle your mood for the unexpected night life.',
            ja: '手作りの料理と、予期せぬナイトライフの気分を盛り上げる多彩なドリンクをお楽しみください。'
        },
        'menu.selection.title': { en: 'Filipino Food Selection', ja: 'フィリピン料理セクション' },
        'menu.filipino.desc': {
            en: 'Rooted in tradition. Bursting with flavor. Our Filipino dishes bring the heart of Filipino cuisine straight to your table. ¥1000~2000 per serving',
            ja: '伝統に根ざし、風味豊かに。フィリピン料理の心をそのまま食卓にお届けします。1人前 ¥1,000〜¥2,000'
        },
        'menu.japanese.title': { en: 'Japanese Food Section', ja: '日本食セクション' },
        'menu.japanese.desc': {
            en: '"Comfort in its simplest form." Itadakimasu—let’s eat! ¥1000~2000 per serving',
            ja: 'シンプルな心地よさ。いただきます。さあ、召し上がれ！ 1人前 ¥1,000〜¥2,000'
        },
        'menu.drinks.title': { en: 'Drinks Section', ja: 'ドリンクセクション' },
        'menu.drinks.desc': {
            en: 'Sip, savor, and celebrate. From premium spirits to refreshing cocktails, find the perfect drink to elevate your dining experience.',
            ja: '味わい、楽しみ、そしてお祝いを。プレミアムなスピリッツから爽やかなカクテルまで、お食事をさらに引き立てる最高の一杯を見つけてください。'
        },
        'menu.platters.filipino.title': { en: 'Filipino Party Platters', ja: 'フィリピンのパーティープラッター' },
        'menu.platters.filipino.desc': {
            en: 'Every great celebration deserves an equally great spread. Our Filipino party platters are a carefully curated selection of our best traditional favorites — generous, flavorful, and made to be shared.',
            ja: 'すべてのお祝いには、それにふさわしい素晴らしい料理が必要です。フィリピンのパーティープラッターは、伝統的な人気メニューを厳選したもので、ボリューム満点、風味豊かで、シェアするのに最適です。'
        },
        'menu.platters.japanese.title': { en: 'Japanese Party Platters', ja: '日本のパーティープラッター' },
        'menu.platters.japanese.desc': {
            en: 'Elevate your gatherings with our premium Japanese party platters. Featuring fresh sushi rolls, savory noodles, and crispy karaage — beautifully presented and perfect for sharing.',
            ja: 'プレミアムな日本のパーティープラッターで集まりを華やかに。新鮮な巻き寿司、香ばしい麺類、サクサクの唐揚げなど、美しく盛り付けられており、シェアするのにぴったりです。'
        },

        // Filter buttons
        'menu.filter.all': { en: 'All', ja: 'すべて' },
        'menu.filter.meat': { en: 'Meat', ja: '肉料理' },
        'menu.filter.vegetables': { en: 'Vegetables', ja: '野菜料理' },
        'menu.filter.soup': { en: 'Soup', ja: 'スープ' },
        'menu.filter.noodles': { en: 'Noodles', ja: '麺類' },
        'menu.filter.snacks': { en: 'Snacks', ja: '軽食' },

        // Drink Filter buttons
        'menu.filter.sparkling': { en: 'Sparkling', ja: 'スパークリング' },
        'menu.filter.spirits': { en: 'Spirits', ja: 'スピリッツ' },
        'menu.filter.beer': { en: 'Beer', ja: 'ビール' },
        'menu.filter.wine': { en: 'Wine', ja: 'ワイン' },
        'menu.filter.cocktails': { en: 'Cocktails', ja: 'カクテル' },
        'menu.filter.non_alcoholic': { en: 'Non-Alcoholic', ja: 'ノンアルコール' },

        // Menu items
        'menu.item.tonkotsu.name': { en: 'TONKOTSU RAMEN', ja: 'とんこつラーメン' },
        'menu.item.tonkotsu.desc': { en: 'Rich pork broth with chashu, egg, and spring onion.', ja: 'チャーシュー、卵、ネギ入りの濃厚な豚骨スープ。' },
        'menu.item.tonkotsu.desc2': { en: 'Rich pork broth with chashu, egg, and spring onions.', ja: 'チャーシュー、卵、ネギ入りの濃厚な豚骨スープ。' },

        // Japanese Food Section
        'menu.jp.karaage.name': { en: 'KARAAGE', ja: '唐揚げ' },
        'menu.jp.karaage.desc': {
            en: 'Japanese-style fried chicken at its finest — bite-sized pieces marinated in soy sauce, ginger, and garlic, then fried to a perfect golden crisp outside while staying incredibly juicy inside. Light, flavorful, and dangerously moreish.',
            ja: '最高の日本風フライドチキン — 醤油、生姜、にんにくの特製ダレに漬け込んだ一口サイズの鶏肉を、外はカリッと黄金色に、中は驚くほどジューシーに揚げました。軽くて風味豊かで、やみつきになる美味しさです。'
        },
        'menu.jp.yakisoba.name': { en: 'YAKISOBA', ja: '焼きそば' },
        'menu.jp.yakisoba.desc': {
            en: 'Classic Japanese street food — springy stir-fried noodles tossed with tender pork, fresh cabbage, and vegetables in a rich, smoky yakisoba sauce, finished with a sprinkle of bonito flakes and pickled ginger. Simple, satisfying, and full of umami.',
            ja: '昔ながらの日本の屋台の味 — もちもちの炒め麺を、柔らかい豚肉、新鮮なキャベツ、野菜と一緒に、濃厚で香ばしい焼きそばソースで絡めました。仕上げにかつお節と紅しょうがをトッピング。シンプルで満足感のある、旨味たっぷりの一皿です。'
        },
        'menu.jp.yakitori.name': { en: 'YAKITORI', ja: '焼き鳥' },
        'menu.jp.yakitori.desc': {
            en: 'Tender, perfectly grilled chicken skewers brushed with a savory-sweet glaze or lightly seasoned with salt — smoky, juicy, and bursting with authentic Japanese flavor. A classic izakaya favorite that\'s simple, satisfying, and delicious with every bite.',
            ja: '香ばしい甘辛いタレ、または軽く塩を振って完璧に焼き上げた柔らかな鶏の串焼き。スモーキーでジューシー、そして本格的な日本の風味が口いっぱいに広がります。シンプルで満足感があり、一口ごとに美味しさが溢れる、定番の居酒屋メニューです。'
        },
        'menu.jp.nikuman.name': { en: 'NIKUMAN', ja: '肉まん' },
        'menu.jp.nikuman.desc': {
            en: 'Soft, pillowy steamed buns filled with a savory seasoned pork filling — warm, fluffy, and comforting. A beloved Japanese street snack that melts in your mouth with every bite.',
            ja: 'ふかふかの蒸しパンの中に、旨味たっぷりの味付け豚肉が詰まった一品 — 温かく、ふわふわで、ホッとする味わい。一口ごとに口の中でとろける、日本で愛される定番のスナックです。'
        },
        'menu.jp.yasai_itame.name': { en: 'YASAI ITAME', ja: '野菜炒め' },
        'menu.jp.yasai_itame.desc': {
            en: 'A light yet deeply flavorful Japanese stir-fry — a vibrant mix of fresh seasonal vegetables sautéed in a savory soy and sesame sauce. Clean, healthy, and bursting with natural goodness.',
            ja: '軽やかでありながら深い味わいの日本の炒め物 — 新鮮な季節の野菜を、香ばしい醤油とごま油のソースで色鮮やかに炒めました。さっぱりとして健康的で、素材の旨味が詰まっています。'
        },
        'menu.jp.tonjiru.name': { en: 'TONJIRU', ja: '豚汁' },
        'menu.jp.tonjiru.desc': {
            en: 'A deeply nourishing Japanese country-style soup — tender pork and hearty root vegetables like daikon, burdock, and carrots slow-simmered in a rich miso broth. Earthy, warming, and soul-satisfying in every bowl.',
            ja: '深い栄養が染み渡る、日本の田舎風スープ — 柔らかい豚肉と、大根、ごぼう、にんじんなどの根菜を、濃厚な味噌のスープでじっくり煮込みました。素朴で温かく、心を満たす一杯です。'
        },
        'menu.jp.misoshiro.name': { en: 'MISOSHIRO', ja: '味噌汁' },
        'menu.jp.misoshiro.desc': {
            en: "Japan's most beloved daily ritual — a delicate, umami-rich broth of fermented soybean paste with silken tofu, wakame seaweed, and green onions. Simple, clean, and quietly comforting with every warm sip.",
            ja: '日本で最も愛されている毎日の習慣 — 繊細で旨味豊かな発酵大豆ペースト（味噌）のスープに、絹ごし豆腐、わかめ、青ネギを合わせました。シンプルで澄んだ、温かい一口ごとに静かな安らぎを与えてくれます。'
        },
        'menu.jp.corn_soup.name': { en: 'CORN SOUP', ja: 'コーンスープ' },
        'menu.jp.corn_soup.desc': {
            en: 'Velvety smooth and naturally sweet — a creamy, golden corn bisque made from fresh sweet corn kernels blended to perfection. Light, silky, and gently comforting — a crowd-pleaser for every age.',
            ja: 'ベルベットのようになめらかで、自然な甘み — 新鮮なスイートコーンを完璧にブレンドして作られた、クリーミーで黄金色のコーンビスク。軽やかで絹のように滑らかで、優しくホッとする味わいは、あらゆる年齢層に人気です。'
        },
        'menu.jp.potato_soup.name': { en: 'POTATO SOUP', ja: 'ポテトスープ' },
        'menu.jp.potato_soup.desc': {
            en: 'Thick, creamy, and wonderfully comforting — tender Japanese potatoes slow-cooked and blended into a smooth, buttery soup with a subtle hint of seasoning. Rich, wholesome, and deeply satisfying.',
            ja: '濃厚でクリーミー、そして驚くほどホッとする味わい — 柔らかい日本のじゃがいもをじっくり煮込み、バターのような滑らかなスープにブレンドし、ほのかな味付けで仕上げました。コクがあり、健康的で、深い満足感が得られます。'
        },
        'menu.jp.wakame_soup.name': { en: 'WAKAME SOUP', ja: 'わかめスープ' },
        'menu.jp.wakame_soup.desc': {
            en: 'A light, delicate broth featuring tender ribbons of wakame seaweed in a clean, umami-kissed dashi base. Subtle, nourishing, and refreshingly simple — a gentle start or finish to any meal.',
            ja: '澄んだ旨味のある出汁をベースに、柔らかいわかめをたっぷり加えた、軽やかで繊細なスープ。控えめで栄養価が高く、さっぱりとシンプルな味わいは、食事の始まりや締めくくりにぴったりです。'
        },
        'menu.jp.tsukemono.name': { en: 'TSUKEMONO', ja: '漬物' },
        'menu.jp.tsukemono.desc': {
            en: 'A refreshing assortment of traditional Japanese pickled vegetables — crisp, tangy, and lightly seasoned. The perfect palate cleanser that adds a bright, zesty contrast to any dish on your table.',
            ja: '伝統的な日本の漬物の爽やかな盛り合わせ — シャキシャキとして酸味があり、軽めの味付け。食卓のどんな料理にも鮮やかなコントラストを与える、完璧な箸休めです。'
        },
        'menu.jp.chawanmushi.name': { en: 'CHAWANMUSHI', ja: '茶碗蒸し' },
        'menu.jp.chawanmushi.desc': {
            en: "A silky, savory Japanese steamed egg custard hiding treasures within — tender chicken, shrimp, and mushrooms gently set in a delicate dashi-infused egg. Smooth, elegant, and unlike anything you've ever tasted.",
            ja: '絹のようになめらかで風味豊かな日本の茶碗蒸し。その中には宝物が隠れています — 繊細な出汁が香る卵液に、柔らかい鶏肉、エビ、キノコを優しく閉じ込めました。滑らかで上品、他では味わえない一品です。'
        },

        // Bento Packs Section
        'menu.bento.desc1': {
            en: 'Bento packs for delivery only within the vicinity.',
            ja: '近隣への配達専用弁当パック。'
        },
        'menu.bento.desc2': {
            en: 'Includes fresh salad or vegetables.',
            ja: '新鮮なサラダまたは野菜付き。'
        },
        'menu.bento.desc3': {
            en: 'Available daily from 8:00 AM – 2:00 AM.',
            ja: '毎日午前8時から午前2時までご利用いただけます。'
        },
        'menu.bento.porksilog.name': { en: 'Porksilog', ja: 'ポークシログ' },
        'menu.bento.porksilog.desc': { en: 'Chahan, grilled pork chop, fried egg, fresh salad', ja: 'チャーハン、豚のグリル、目玉焼き、新鮮なサラダ' },
        'menu.bento.cornsilog.name': { en: 'Cornsilog', ja: 'コーンシログ' },
        'menu.bento.cornsilog.desc': { en: 'Chahan, corned beef, fried egg, fresh salad', ja: 'チャーハン、コンビーフ、目玉焼き、新鮮なサラダ' },
        'menu.bento.bangsilog.name': { en: 'Bangsilog', ja: 'バンシログ' },
        'menu.bento.bangsilog.desc': { en: 'Chahan, fried bangus, fried egg, fresh salad', ja: 'チャーハン、バンゴスのフライ、目玉焼き、新鮮なサラダ' },
        'menu.bento.tinsilog.name': { en: 'Tinsilog', ja: 'ティンシログ' },
        'menu.bento.tinsilog.desc': { en: 'Chahan, smoked fish, fried egg, fresh salad', ja: 'チャーハン、燻製魚、目玉焼き、新鮮なサラダ' },
        'menu.bento.longsilog.name': { en: 'Longsilog', ja: 'ロンシログ' },
        'menu.bento.longsilog.desc': { en: 'Chahan, longganisa, fried egg, fresh salad', ja: 'チャーハン、ロンガニーサ（ソーセージ）、目玉焼き、新鮮なサラダ' },
        'menu.bento.bursilog.name': { en: 'Bursilog', ja: 'バーシログ' },
        'menu.bento.bursilog.desc': { en: 'Chahan, pork burger, fried egg, fresh salad', ja: 'チャーハン、ポークバーガー、目玉焼き、新鮮なサラダ' },
        'menu.bento.lumpsilog.name': { en: 'Lumpsilog', ja: 'ルンプシログ' },
        'menu.bento.lumpsilog.desc': { en: 'Chahan, lumpia, fried egg, fresh salad', ja: 'チャーハン、ルンピア（春巻き）、目玉焼き、新鮮なサラダ' },
        'menu.bento.emsilog.name': { en: 'Emsilog', ja: 'エムシログ' },
        'menu.bento.emsilog.desc': { en: 'Chahan, embutido, fried egg, fresh salad', ja: 'チャーハン、エンブティード（ミートローフ）、目玉焼き、新鮮なサラダ' },


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

        // Filipino Food Section
        'menu.filipino.karekare.name': { en: 'KARE-KARE', ja: 'カレカレ' },
        'menu.filipino.karekare.desc': { en: 'A rich, golden peanut stew slow-cooked with tender meat and fresh vegetables — best paired with a touch of bagoong for that perfect savory kick.', ja: '柔らかいお肉と新鮮な野菜をじっくり煮込んだ、濃厚で黄金色のピーナッツシチュー。完璧な旨味を引き出すために、少量のバゴーン（エビの塩辛）と合わせるのが最適です。' },
        'menu.filipino.sinigang.name': { en: 'PORK SINIGANG', ja: 'ポークシニガン' },
        'menu.filipino.sinigang.desc': { en: 'Tender pork slow-simmered in a bold tamarind broth with fresh vegetables — a tangy, savory, and deeply comforting bowl that warms the soul from the inside out.', ja: '柔らかい豚肉と新鮮な野菜をタマリンドの酸味が効いたスープでじっくり煮込んだ、心から温まる酸っぱくて旨味のある一杯です。' },
        'menu.filipino.patatim.name': { en: 'PATATIM', ja: 'パタティム' },
        'menu.filipino.patatim.desc': { en: 'Fall-off-the-bone pork leg slow-braised in a sweet and savory soy sauce glaze with star anise — rich, tender, and melt-in-your-mouth good.', ja: '骨からポロリと取れるほど柔らかい豚足を、八角を効かせた甘辛い醤油ダレでじっくりと煮込みました。濃厚で口の中でとろける美味しさです。' },
        'menu.filipino.adobo.name': { en: 'SPICY PORK ADOBO', ja: 'スパイシーポークアドボ' },
        'menu.filipino.adobo.desc': { en: 'Your favorite Filipino adobo with a fiery twist — tender pork slow-cooked in vinegar, soy sauce, garlic, and a bold kick of chilies that lingers beautifully with every bite.', ja: 'おなじみのフィリピンのアドボにスパイシーなひねりを加えました。お酢、醤油、ニンニク、そして後引く辛さの唐辛子で豚肉を柔らかく煮込んでいます。' },
        'menu.filipino.bicol.name': { en: 'BICOL EXPRESS', ja: 'ビコルエクスプレス' },
        'menu.filipino.bicol.desc': { en: 'Fiery, creamy, and absolutely addictive — tender pork cooked in rich coconut milk with generous amounts of chilies and shrimp paste. Not for the faint-hearted.', ja: '辛くてクリーミーで、やみつきになる一品。柔らかい豚肉を濃厚なココナッツミルク、たっぷりの唐辛子、エビのペーストで煮込みました。辛いのが苦手な方はご注意を。' },
        'menu.filipino.igado.name': { en: 'IGADO', ja: 'イガド' },
        'menu.filipino.igado.desc': { en: 'A bold Ilocano classic — pork tenderloin and liver sautéed with vinegar, soy sauce, and bell peppers, delivering a tangy and savory punch in every bite', ja: 'イロカノ地方の定番料理。豚ヒレ肉とレバーをお酢、醤油、ピーマンで炒めた、酸味と旨味が一口ごとにガツンと来る一品です。' },
        'menu.filipino.lumpia.name': { en: 'PORK LUMPIA', ja: 'ポーク ルンピア' },
        'menu.filipino.lumpia.desc': { en: 'The most iconic and beloved type of Filipino lumpia. It is a smaller, tightly rolled deep-fried spring roll filled with ground pork, carrots, onions, and seasonings.', ja: '最も象徴的で愛されているフィリピンのルンピア（春巻き）。豚ひき肉、ニンジン、玉ねぎ、調味料を詰めた、小さくてきつく巻かれた揚げ春巻きです。' },
        'menu.filipino.empanada.name': { en: 'EMPANADA', ja: 'エンパナーダ' },
        'menu.filipino.empanada.desc': { en: 'Buttery, flaky pastry filled with tender shredded chicken, potatoes, and savory seasonings — a handheld delight that\'s crispy, hearty, and satisfying in every bite.', ja: '柔らかく裂いた鶏肉、ジャガイモ、香ばしい調味料を詰めた、サクサクのパイ生地。一口ごとに満足感のある、手軽で美味しい一品です。' },
        'menu.filipino.chopseuy.name': { en: 'CHOPSEUY', ja: 'チャプスイ' },
        'menu.filipino.chopseuy.desc': { en: 'A vibrant medley of fresh garden vegetables stir-fried to perfection with tender meat in a light, savory sauce — colorful, healthy, and delicious.', ja: '新鮮な野菜とお肉を軽くて香ばしいソースで完璧に炒めた、彩り豊かでヘルシーで美味しい一品です。' },
        'menu.filipino.pakbet.name': { en: 'PAKBET', ja: 'パクベット' },
        'menu.filipino.pakbet.desc': { en: 'A proud Filipino harvest dish — a hearty mix of bitter melon, eggplant, squash, and okra sautéed with shrimp paste for a deeply earthy, rustic flavor..', ja: 'フィリピンが誇る収穫の料理。ゴーヤ、ナス、カボチャ、オクラをエビのペーストで炒めた、素朴で深い味わいの一品です。' },
        'menu.filipino.laing.name': { en: 'LAING', ja: 'ライン' },
        'menu.filipino.laing.desc': { en: 'Tender dried taro leaves slow-simmered in creamy coconut milk with chilies and shrimp paste — smoky, spicy, and richly satisfying', ja: '乾燥したタロイモの葉をクリーミーなココナッツミルク、唐辛子、エビのペーストでじっくり煮込んだ、スモーキーでスパイシーで満足感のある一品です。' },
        'menu.filipino.menudo.name': { en: 'MENUDO', ja: 'メヌード' },
        'menu.filipino.menudo.desc': { en: 'A hearty tomato-based stew of diced pork, liver, potatoes, and carrots — savory, slightly sweet, and packed with comforting Filipino home-cooked goodness.', ja: '角切り豚肉、レバー、ジャガイモ、ニンジンを使ったトマトベースのシチュー。少し甘みがあり、フィリピンの家庭の味が詰まっています。' },
        'menu.filipino.nilaga.name': { en: 'PORK NILAGA', ja: 'ポーク ニラガ' },
        'menu.filipino.nilaga.desc': { en: 'A simple, soul-nourishing clear broth with tender boiled pork, potatoes, and cabbage — light, clean, and the ultimate Filipino comfort food.', ja: '柔らかく茹でた豚肉、ジャガイモ、キャベツが入ったシンプルで心温まるクリアスープ。軽くてすっきりとした究極のフィリピンのコンフォートフードです。' },
        'menu.filipino.kawali.name': { en: 'LETCHON KAWALI', ja: 'レチョン カワリ' },
        'menu.filipino.kawali.desc': { en: 'Crispy, crackling deep-fried pork belly with a golden crunch on the outside and juicy, tender meat on the inside — sinfully good and worth every bite.', ja: '外はカリッと黄金色、中はジューシーで柔らかい豚バラ肉のサクサク揚げ。一口食べる価値のある、罪深い美味しさです。' },
        'menu.filipino.bihon.name': { en: 'BIHON GUISADO', ja: 'ビーフン ギサド' },
        'menu.filipino.bihon.desc': { en: 'Silky rice noodles stir-fried with tender slices of pork, shrimp, and fresh vegetables in a savory soy-based sauce.', ja: '滑らかなライスヌードルを柔らかい豚肉、エビ、新鮮な野菜とともに、香ばしい醤油ベースのソースで炒めました。' },
        'menu.filipino.paksiw.name': { en: 'LETCHON PAKSIW', ja: 'レチョン パクシウ' },
        'menu.filipino.paksiw.desc': { en: 'Leftover lechon reimagined — slow-cooked in tangy vinegar, liver sauce, and spices until the pork is meltingly tender and packed with deep, complex flavor.', ja: '残ったレチョン（豚の丸焼き）を再構築。酸味のあるお酢、レバーソース、スパイスで豚肉がとろけるほど柔らかくなるまでじっくり煮込み、深く複雑な風味を詰め込みました。' },
        'menu.filipino.inasal.name': { en: 'CHICKEN INASAL', ja: 'チキン イナサル' },
        'menu.filipino.inasal.desc': { en: 'Juicy, smoky grilled chicken marinated in a fragrant blend of calamansi, lemongrass, and annatto — charred to perfection and bursting with Bacolod-style flavor.', ja: 'カラマンシー、レモングラス、アナトーの香り高いブレンドでマリネされた、ジューシーでスモーキーなグリルチキン。完璧に焦げ目がつき、バコロド風の風味が弾けます。' },
        'menu.filipino.sisig.name': { en: 'SIZZLING SISIG', ja: 'シズリング シシグ' },
        'menu.filipino.sisig.desc': { en: 'Arriving at your table with a dramatic sizzle — crispy chopped pork face and ears seasoned with calamansi, chilies, and onion, served on a scorching hot plate. Bold, tangy, and utterly addictive.', ja: 'ドラマチックな音とともにテーブルに。カリカリに刻んだ豚の顔と耳をカラマンシー、唐辛子、玉ねぎで味付けし、熱々の鉄板で提供。大胆で酸味が効いた、やみつきになる一品。' },
        'menu.filipino.sizchicken.name': { en: 'SIZZLING CHICKEN', ja: 'シズリング チキン' },
        'menu.filipino.sizchicken.desc': { en: 'Tender, juicy chicken pieces glazed in a savory garlic butter sauce, served sizzling hot on a cast iron plate — smoky, aromatic, and impossible to ignore.', ja: '柔らかくジューシーな鶏肉に香ばしいガーリックバターソースを絡め、熱々の鉄板で提供。スモーキーで香りが良く、無視できない美味しさです。' },
        'menu.filipino.sizsquid.name': { en: 'SIZZLING SQUID', ja: 'シズリング スクイッド' },
        'menu.filipino.sizsquid.desc': { en: 'Perfectly tender squid tossed in a rich, garlicky black bean sauce, arriving at your table in a blaze of sizzle and aroma — bold, briny, and irresistibly good.', ja: '完璧に柔らかいイカを濃厚なガーリックブラックビーンソースで和え、熱々と香りと共にテーブルに。大胆で磯の香りがたまらない一品です。' },
        'menu.filipino.sizbopis.name': { en: 'SIZZLING BOPIS', ja: 'シズリング ボピス' },
        'menu.filipino.sizbopis.desc': { en: 'a savory, spicy, and tangy Filipino dish made from finely minced pig lungs and heart. Served piping hot on a cast-iron plate, it is sautéed with garlic, onions, ginger, and chilies, then finished with a splash of vinegar and annatto oil for a vibrant, reddish-orange color.', ja: '細かく刻んだ豚の肺と心臓で作られた、香ばしくスパイシーで酸味のあるフィリピン料理。熱々の鉄板で提供され、ニンニク、玉ねぎ、生姜、唐辛子で炒め、最後にお酢とアナトーオイルで鮮やかな赤みがかったオレンジ色に仕上げます。' },
        'menu.filipino.sizdinuguan.name': { en: 'SIZZLING DINUGUAN', ja: 'シズリング ディヌグアン' },
        'menu.filipino.sizdinuguan.desc': { en: 'Rich, dark, and deeply savory — tender pork simmered in a bold pork blood, with vinegar and chilies, served sizzling hot for a truly authentic Filipino experience.', ja: '濃厚で深みのある香ばしさ。柔らかい豚肉を大胆な豚の血、お酢、唐辛子で煮込み、熱々で提供される真の本格的なフィリピン体験。' },
        'menu.filipino.sizchickenfeet.name': { en: 'SIZZLING CHICKEN FEET', ja: 'シズリング チキンフィート' },
        'menu.filipino.sizchickenfeet.desc': { en: 'Soft, gelatinous chicken feet slow-cooked until tender and tossed in a bold, spicy, and savory sauce — a daring Filipino delicacy that rewards the adventurous eater.', ja: '柔らかくなるまでじっくり煮込んだゼラチン質の鶏の足を、大胆でスパイシーで香ばしいソースで和えた一品。冒険好きな食べる人に報いる大胆なフィリピンの珍味。' },
        'menu.filipino.sizbbq.name': { en: 'SIZZLING BARBBECUE', ja: 'シズリング バーベキュー' },
        'menu.filipino.sizbbq.desc': { en: 'Juicy skewers of marinated pork or chicken grilled over open flames until perfectly charred — sweet, smoky, and glazed with our signature sauce that keeps you coming back for more.', ja: 'マリネした豚肉または鶏肉のジューシーな串焼きを、直火で完璧に焦げ目がつくまでグリルしました。甘くてスモーキーで、特製ソースが絡んで何度でも食べたくなる美味しさです。' },
        'menu.item.special': { en: 'Special Order', ja: '特別注文' },
        'menu.filter.sizzling': { en: 'Sizzling', ja: '鉄板料理' },


        // Sushi display

        'menu.bicol.express.desc1': {
            en: 'Fiery, creamy, and absolutely addictive — tender pork',
            ja: '辛くてクリーミー、そして絶対にクセになる — 柔らかい豚肉'
        },
        'menu.hibiki.harmony.desc2': {
            en: 'A true expression of Japanese harmony in a glass.',
            ja: 'グラスに込められた、日本の調和の真の表現。'
        },
        'menu.halo.halo.desc': {
            en: "The Philippines' most beloved dessert",
            ja: 'フィリピンで最も愛されているデザート'
        },

        // Platter items
        'menu.platter.kare_kare.name': { en: 'KARE-KARE PLATTER', ja: 'カレカレ プラッター' },
        'menu.platter.kare_kare.desc': { en: 'A showstopping centerpiece for the table — a generous pot of rich, golden peanut stew slow-cooked with tender oxtail and fresh vegetables, served with bagoong on the side. Creamy, nutty, and deeply satisfying, this classic Filipino favorite is best enjoyed together.', ja: '食卓を彩る主役 — 柔らかい牛テールと新鮮な野菜をじっくり煮込んだ、濃厚で黄金色のピーナッツシチューのたっぷり鍋。バゴーンを添えて。クリーミーでコクがあり、深く満足できるフィリピンの定番料理を皆様でお楽しみください。' },
        'menu.platter.pork_sinigang.name': { en: 'PORK SINIGANG PLATTER', ja: 'ポークシニガン プラッター' },
        'menu.platter.pork_sinigang.desc': { en: 'A big, steaming bowl of soul-warming tamarind broth packed with tender pork and an abundance of fresh vegetables — tangy, savory, and comforting. A timeless Filipino classic that brings everyone around the table.', ja: '心温まるタマリンドスープに、柔らかい豚肉とたっぷりの新鮮な野菜を詰め込んだ、湯気の立つ大きなどんぶり — 酸味が効いて風味豊かでホッとする味わい。皆様を食卓に集める、時代を超えたフィリピンの定番料理です。' },
        'menu.platter.spicy_adobo.name': { en: 'SPICY ADOBO PLATTER', ja: 'スパイシーアドボ プラッター' },
        'menu.platter.spicy_adobo.desc': { en: 'A generous sharing plate of the Philippines\' most iconic dish — succulent pork or chicken slow-simmered in vinegar, soy sauce, garlic, and bay leaf until deeply tender and irresistibly flavorful. A true taste of home, made to be shared.', ja: 'フィリピンを代表する料理のたっぷりシェアプレート — ジューシーな豚肉または鶏肉を、酢、醤油、にんにく、ローリエで、驚くほど柔らかく魅力的な風味になるまでじっくり煮込みました。みんなで分け合うための、本物の家庭の味。' },
        'menu.platter.pata_tim.name': { en: 'PATA TIM PLATTER', ja: 'パタティム プラッター' },
        'menu.platter.pata_tim.desc': { en: 'A feast-worthy whole pork leg slow-braised for hours in a sweet and savory soy sauce glaze with star anise and mushrooms until fall-off-the-bone tender. Rich, melt-in-your-mouth, and absolutely indulgent.', ja: 'ごちそうにふさわしい豚の骨付きもも肉丸ごとを、八角とマッシュルームを使った甘辛い醤油ダレで、骨からホロリと崩れるほど何時間もじっくり煮込みました。濃厚で口の中でとろける、絶対的に贅沢な一品です。' },
        'menu.platter.bicol_express.name': { en: 'BICOL EXPRESS PLATTER', ja: 'ビコルエクスプレス プラッター' },
        'menu.platter.bicol_express.desc': { en: 'Turn up the heat with this fiery, creamy crowd-pleaser — tender pork generously cooked in rich coconut milk with chilies and shrimp paste, served in a big, shareable portion that keeps everyone reaching for more. Spicy, creamy, and addictive.', ja: 'このスパイシーでクリーミーな人気料理で熱気を高めましょう — 柔らかい豚肉を濃厚なココナッツミルク、唐辛子、エビペーストでたっぷりと煮込み、誰もがもっと食べたくなるような大きなシェアサイズで提供します。スパイシーでクリーミー、そしてやみつきになります。' },
        'menu.platter.lumpia.name': { en: 'LUMPIA PLATTER', ja: 'ルンピア プラッター' },
        'menu.platter.lumpia.desc': { en: 'A towering platter of crispy, golden spring rolls packed with seasoned minced pork and vegetables — crunchy, savory, and impossible to stop at just one. The ultimate crowd-pleasing Filipino snack, served fresh and hot.', ja: '味付けした豚ひき肉と野菜が詰まった、カリカリで黄金色の春巻きの山盛りプラッター — サクサクで風味豊かで、一つでは止められません。出来立て熱々で提供される、究極に人気のフィリピンスナックです。' },
        'menu.platter.empanada.name': { en: 'EMPANADA PLATTER', ja: 'エンパナーダ プラッター' },
        'menu.platter.empanada.desc': { en: 'A beautiful spread of flaky, golden pastries stuffed with savory seasoned meat and vegetables — crispy on the outside, warm and hearty on the inside. A beloved Filipino comfort snack best enjoyed with good company.', ja: '香ばしく味付けしたお肉と野菜を詰めた、サクサクで黄金色のペストリーの美しい盛り合わせ — 外はカリッと、中は温かくてボリューム満点。仲間と一緒に楽しむのに最適な、愛されるフィリピンのコンフォートスナックです。' },
        'menu.platter.chopsuey.name': { en: 'CHOPSUEY PLATTER', ja: 'チャプスイ プラッター' },
        'menu.platter.chopsuey.desc': { en: 'A vibrant, colorful platter of fresh garden vegetables stir-fried to perfection with tender meat in a light, savory sauce — healthy, delicious, and beautifully presented for the whole table to enjoy.', ja: '新鮮なガーデン野菜を柔らかいお肉とともに軽くて風味豊かなソースで完璧に炒めた、鮮やかでカラフルなプラッター — ヘルシーで美味しく、テーブル全体で楽しめるように美しく盛り付けられています。' },
        'menu.platter.pakbet.name': { en: 'PAKBET PLATTER', ja: 'パクベット プラッター' },
        'menu.platter.pakbet.desc': { en: 'A towering platter of crispy, golden spring rolls packed with seasoned minced pork and vegetables — crunchy, savory, and impossible to stop at just one. The ultimate crowd-pleasing Filipino snack, served fresh and hot.', ja: '味付けした豚ひき肉と野菜が詰まった、カリカリで黄金色の春巻きの山盛りプラッター — サクサクで風味豊かで、一つでは止められません。出来立て熱々で提供される、究極に人気のフィリピンスナックです。' },
        'menu.platter.laing.name': { en: 'LAING PLATTER', ja: 'ライン プラッター' },
        'menu.platter.laing.desc': { en: 'A rich, creamy, and indulgent sharing dish — dried taro leaves slow-simmered in coconut milk with chilies and shrimp paste, served in a generous portion that keeps the whole table warm and satisfied. Smoky, spicy, and deeply comforting.', ja: '濃厚でクリーミー、そして贅沢なシェア料理 — 乾燥タロイモの葉をココナッツミルク、唐辛子、エビペーストでじっくり煮込み、テーブル全体を温かく満足させるたっぷりの量で提供します。スモーキーでスパイシーで、深くホッとする味わいです。' },
        'menu.platter.menudo.name': { en: 'MENUDO PLATTER', ja: 'メヌード プラッター' },
        'menu.platter.menudo.desc': { en: 'A hearty, tomato-based sharing feast — diced pork, liver, potatoes, and carrots slow-cooked in a savory, slightly sweet sauce and served in a generous platter that feels just like a home-cooked family meal.', ja: 'ボリューム満点のトマトベースのシェアのごちそう — 角切りの豚肉、レバー、ジャガイモ、ニンジンを、風味豊かな少し甘めのソースでじっくり煮込み、家庭で作る家族の食事のようなたっぷりのプラッターで提供します。' },
        'menu.platter.pork_nilaga.name': { en: 'PORK NILAGA PLATTER', ja: 'ポークニラガ プラッター' },
        'menu.platter.pork_nilaga.desc': { en: 'A big, comforting pot of clear pork broth with tender boiled pork, potatoes, and cabbage — light, clean, and nourishing. The ultimate Filipino comfort food, served in a generous portion meant to be shared and savored slowly', ja: '柔らかく煮た豚肉、ジャガイモ、キャベツが入った、透き通った豚骨スープの大きくてホッとする鍋 — 軽くてすっきりとして栄養満点。ゆっくりと味わい、シェアするためのたっぷりの量で提供される、究極のフィリピンのコンフォートフード。' },
        'menu.platter.lechon_kawali.name': { en: 'LECHON KAWALI PLATTER', ja: 'レチョンカワリ プラッター' },
        'menu.platter.lechon_kawali.desc': { en: 'A glorious sharing platter of crispy, crackling deep-fried pork belly — shatteringly crunchy on the outside, juicy and tender within. Served in generous portions with dipping sauce on the side. Sinfully good and worth every bite.', ja: 'カリカリに揚げた豚バラ肉の素晴らしいシェアプラッター — 外は驚くほどサクサク、中はジューシーで柔らか。たっぷりの量で、ディッピングソースを添えて提供されます。罪深いほど美味しく、一口一口に価値があります。' },
        'menu.platter.bihon.name': { en: 'BIHON PLATTER', ja: 'ビーフン プラッター' },
        'menu.platter.bihon.desc': { en: 'A generous sharing plate of silky rice noodles stir-fried with tender pork, shrimp, and fresh vegetables in a savory soy-based sauce — light yet satisfying, and a guaranteed crowd favorite at any table.', ja: '滑らかなライスヌードルを柔らかい豚肉、エビ、新鮮な野菜とともに香ばしい醤油ベースのソースで炒めた、たっぷりのシェアプレート — 軽いのに満足感があり、どんなテーブルでも確実に人気を集める一品です。' },
        'menu.platter.lechon_paksiw.name': { en: 'LECHON PAKSIW PLATTER', ja: 'レチョンパクシウ プラッター' },
        'menu.platter.lechon_paksiw.desc': { en: 'A rich, tangy, and deeply flavorful sharing dish — slow-cooked pork in vinegar, liver sauce, and spices until meltingly tender and packed with complex, bold flavor. A brilliant way to celebrate Filipino culinary creativity together.', ja: '濃厚で酸味が効き、深く風味豊かなシェア料理 — 豚肉を酢、レバーソース、スパイスでとろけるほど柔らかくなるまでじっくり煮込み、複雑で大胆な風味が詰まっています。フィリピンの料理の創造性を一緒に祝う素晴らしい一品です。' },
        'menu.platter.igado.name': { en: 'IGADO PLATTER', ja: 'イガド プラッター' },
        'menu.platter.igado.desc': { en: 'A bold and hearty Ilocano classic served platter-style — tender pork tenderloin and liver sautéed with vinegar, soy sauce, and bell peppers, delivering a tangy, savory punch in every bite. Best enjoyed with steaming white rice all around.', ja: '大胆でボリューム満点のイロカノの定番料理をプラッタースタイルで — 柔らかい豚ヒレ肉とレバーを酢、醤油、ピーマンで炒め、一口ごとに酸味と風味のパンチをお届けします。湯気の立つ白ご飯と一緒に楽しむのが最高です。' },
        'menu.platter.chicken_inasal.name': { en: 'CHICKEN INASAL PLATTER', ja: 'チキンイナサル プラッター' },
        'menu.platter.chicken_inasal.desc': { en: 'A juicy grilled chicken marinated in calamansi, lemongrass, and annatto — charred to perfection and bursting with Bacolod-style flavor. Generous portions made for sharing, dipping, and celebrating.', ja: 'カラマンシー、レモングラス、アナトーでマリネしたジューシーなグリルチキン — 完璧に焦げ目がつき、バコロドスタイルの風味が弾けます。シェアしたり、ディップしたり、お祝いしたりするためのたっぷりの量です。' },
        'menu.platter.yaki_udon.name': { en: 'YAKI UDON', ja: '焼きうどん' },
        'menu.platter.yaki_udon.desc': { en: 'Thick, chewy udon noodles stir-fried in a rich savory soy-based sauce with tender meat and crisp vegetables — bold, hearty, and satisfyingly filling with every silky, saucy bite.', ja: '太くてもちもちのうどんを、柔らかいお肉とシャキシャキの野菜とともに濃厚で香ばしい醤油ベースのソースで炒めました — 大胆でボリュームがあり、滑らかでソースたっぷりの一口ごとに大満足の食べ応えです。' },
        'menu.platter.yakisoba.name': { en: 'YAKISOBA', ja: '焼きそば' },
        'menu.platter.yakisoba.desc': { en: 'Japan\'s beloved street noodle — springy wheat noodles wok-tossed with pork, cabbage, and vegetables in a smoky, tangy yakisoba sauce, crowned with bonito flakes and pickled ginger for an authentic umami finish.', ja: '日本で愛される屋台の麺 — もちもちの小麦麺を豚肉、キャベツ、野菜とともにスモーキーで酸味のある焼きそばソースで炒め、かつお節と紅しょうがをのせて本格的な旨味に仕上げました。' },
        'menu.platter.maki_sushi.name': { en: 'MAKI SUSHI', ja: '巻き寿司' },
        'menu.platter.maki_sushi.desc': { en: 'Perfectly rolled sushi wrapped in a sheet of toasted nori — fresh, vibrant fillings of seasoned rice, vegetables, and your choice of protein, sliced into elegant bite-sized rounds. Clean, fresh, and beautiful on every plate.', ja: 'パリッとした海苔で巻かれた完璧な巻き寿司 — 酢飯、野菜、お好みの具材の新鮮で鮮やかなフィリングを、上品な一口サイズにスライス。どのお皿でもすっきりと新鮮で美しい一品です。' },
        'menu.platter.chicken_karaage.name': { en: 'CHICKEN KARAAGE', ja: '鶏のから揚げ' },
        'menu.platter.chicken_karaage.desc': { en: 'Irresistibly crispy Japanese fried chicken — bite-sized pieces marinated in a savory blend of soy sauce, ginger, and garlic, fried to a perfect golden crunch outside while staying tender and juicy inside. Light, bold, and addictive.', ja: 'たまらなくサクサクの日本のフライドチキン — 醤油、生姜、にんにくの風味豊かなブレンドでマリネした一口大の鶏肉を、外は完璧な黄金色のクランチに、中は柔らかくジューシーに揚げました。軽く、大胆で、やみつきになります。' },
        'menu.platter.pork_curry.name': { en: 'PORK CURRY', ja: 'ポークカレー' },
        'menu.platter.pork_curry.desc': { en: 'A deeply warming Japanese comfort dish — tender pork slow-simmered in a rich, mildly spiced curry sauce with potatoes and carrots, served over steamed rice. Thick, velvety, and packed with cozy, soul-warming flavor.', ja: '心から温まる日本のコンフォートディッシュ — 柔らかい豚肉をジャガイモやニンジンとともに、マイルドなスパイスの効いた濃厚なカレーソースでじっくり煮込み、ご飯にかけました。とろみがあり、滑らかで、心温まる風味が詰まっています。' },
        'menu.platter.inari_sushi.name': { en: 'INARI SUSHI', ja: 'いなり寿司' },
        'menu.platter.inari_sushi.desc': { en: 'Delicate, golden tofu pockets sweetly seasoned and generously stuffed with lightly seasoned sushi rice — soft, subtly sweet, and beautifully simple. A gentle, crowd-pleasing bite of Japanese tradition.', ja: '繊細で黄金色の豆腐のポケット（油揚げ）を甘く味付けし、薄味の酢飯をたっぷりと詰めました — 柔らかく、ほのかに甘く、美しくシンプル。日本の伝統の優しく、誰もが喜ぶ一口です。' },

        // ═══════════════════════════════════════
        // DRINKS SECTION
        // ═══════════════════════════════════════
        'menu.drinks.title': { en: 'Drinks Section', ja: 'ドリンクセクション' },
        'menu.drinks.moet.name': { en: 'MOËT & CHANDON IMPÉRIAL BRUT', ja: 'モエ・エ・シャンドン アンペリアル ブリュット' },
        'menu.drinks.moet.desc': { en: 'Crisp, fresh, and celebratory in every sip. Alcohol: 12% ABV. Perfect for toasts and special celebrations.', ja: '一口ごとに爽やかでフレッシュ、そしてお祝いの気分に。アルコール度数：12%。乾杯や特別なお祝いに最適です。' },

        'menu.drinks.hibiki.name': { en: 'HIBIKI JAPANESE HARMONY', ja: '響 ジャパニーズハーモニー' },
        'menu.drinks.hibiki.desc': { en: 'A true expression of Japanese harmony in a glass. Alcohol: 43% ABV. Best enjoyed neat or on the rocks.', ja: 'グラスの中の日本の調和の真の表現。アルコール度数：43%。ストレートまたはオンザロックで楽しむのが最高です。' },

        'menu.drinks.kirin.name': { en: 'KIRIN GREEN', ja: 'キリングリーン' },
        'menu.drinks.kirin.desc': { en: 'Perfect enjoyed straight, on the rocks, or mixed with your favorite juice or soda. Great for first-time spirit drinkers.', ja: 'ストレート、オンザロック、またはお好みのジュースやソーダと混ぜて楽しむのに最適です。初めてスピリッツを飲む方にもおすすめです。' },

        'menu.drinks.hennessy.name': { en: 'HENNESSY V.S.O.P COGNAC', ja: 'ヘネシー V.S.O.P コニャック' },
        'menu.drinks.hennessy.desc': { en: 'One of the world\'s most recognized and beloved cognacs, best savored neat, with ice, or in classic cocktails.', ja: '世界で最も認知され愛されているコニャックの一つ。ストレート、氷を入れて、またはクラシックなカクテルで味わうのが最高です。' },

        'menu.drinks.lereveil.name': { en: 'LE RÉVEIL CABERNET SAUVIGNON', ja: 'ル・レヴェイユ カベルネ・ソーヴィニヨン' },
        'menu.drinks.lereveil.desc': { en: 'Crisp, fresh, and celebratory in every sip. Alcohol: 12% ABV. Perfect for toasts and special celebrations.', ja: '一口ごとに爽やかでフレッシュ、そしてお祝いの気分に。アルコール度数：12%。乾杯や特別なお祝いに最適です。' },

        'menu.drinks.suntory_vsop.name': { en: 'V.S.O.P SUNTORY BRANDY', ja: 'V.S.O.P サントリー ブランデー' },
        'menu.drinks.suntory_vsop.desc': { en: 'Rich with notes of caramel, dried fruit, vanilla, and a gentle woody finish, it is approachable yet sophisticated.', ja: 'キャラメル、ドライフルーツ、バニラ、そして穏やかなウッディなフィニッシュの豊かな香り。親しみやすく、かつ洗練されています。' },

        'menu.drinks.kahlua.name': { en: 'KAHLÚA COFFEE LIQUEUR', ja: 'カルーア コーヒーリキュール' },
        'menu.drinks.kahlua.desc': { en: 'Perfect on its own over ice, mixed with milk, or as the star ingredient in classic cocktails like an Espresso Martini or White Russian.', ja: '氷を入れてそのままでも、ミルクと混ぜても、またはエスプレッソマティーニやホワイトルシアンなどのクラシックカクテルの主役としても最適です。' },

        'menu.drinks.pompador.name': { en: 'POMPA D\'OR MUSCAT SPARKLING WINE', ja: 'ポンパドール マスカット スパークリングワイン' },
        'menu.drinks.pompador.desc': { en: 'Refreshing, easy to drink, and a crowd favorite for those who love a sweeter sparkle.', ja: '爽やかで飲みやすく、甘めのスパークリングが好きな方に人気の定番です。' },

        'menu.drinks.pink_lady.name': { en: 'PINK LADY SPARKLING PEAR CIDER', ja: 'ピンクレディー スパークリング ペアシードル' },
        'menu.drinks.pink_lady.desc': { en: 'A perfect choice for those who prefer something lighter, sweeter, and wonderfully refreshing.', ja: '軽くて甘く、そして素晴らしく爽やかなものを好む方に最適な選択です。' },

        'menu.drinks.tokyo_highball.name': { en: 'TOKYO HIGHBALL', ja: '東京ハイボール' },
        'menu.drinks.tokyo_highball.desc': { en: 'Easy to drink, endlessly refreshing, and the perfect companion for good food and great company.', ja: '飲みやすく、どこまでも爽やかで、美味しい食事と素晴らしい仲間にぴったりの一杯です。' },

        'menu.drinks.asahi_syrup.name': { en: 'ASAHI SYRUP', ja: 'アサヒ シロップ' },
        'menu.drinks.asahi_syrup.desc': { en: 'Non-alcoholic. A great choice for those who prefer a lighter, customizable beverage.', ja: 'ノンアルコール。軽めでカスタマイズ可能な飲み物を好む方に最適な選択です。' },

        // ═══════════════════════════════════════
        // EVENTS PAGE
        // ═══════════════════════════════════════
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
        'events.card.livemusic': { en: 'Fall', ja: '秋' },

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
            en: 'We host intimate evenings, live performances, and celebrations that linger in memory long after the night has ended.',
            ja: '私たちは親密な夜、ライブパフォーマンス、そして夜が終わった後も長く記憶に残るお祝いを開催しています。\n\n私たちは親密な夜、ライブパフォーマンス、そして夜が終わった後も長く記憶に残るお祝いを開催しています。\n\n私たちは親密な夜、ライブパフォーマンス、そして夜が終わった後も長く記憶に残るお祝いを開催しています。'
        },
        'events.past.item.desc': {
            en: 'WE HOST INTIMATE EVENINGS, LIVE PERFORMANCES, AND CELEBRATIONS THAT LINGER IN MEMORY LONG AFTER THE NIGHT HAS ENDED.',
            ja: '私たちは親密な夜、ライブパフォーマンス、そして夜が終わった後も長く記憶に残るお祝いを開催しています。'
        },
        'events.past.featured.title': { en: 'LIVE MUSIC', ja: 'ライブミュージック' },
        'events.past.list.title': { en: 'KARAOKE', ja: 'カラオケ' },

        // ═══════════════════════════════════════
        // RESERVATIONS PAGE
        // ═══════════════════════════════════════
        'res.card.capacity': { en: 'Maximum capacity of\n20 Guest', ja: '最大収容人数\n20名' },
        'res.card.open': { en: 'Open\nWed - Sun', ja: '営業\n水曜日～日曜日' },
        'res.card.lounge': { en: 'Party & Event\nReservations 9AM-5PM', ja: 'パーティー＆イベント\n予約 9:00-17:00' },
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
        'res.info.address.text': { en: '3F, K-BOX Building, 1-198 Chuo,\nKomaki City, Aichi Prefecture\n485-009', ja: '〒485-009\n愛知県小牧市中央1-198\nK-BOXビル3階' },
        'res.info.contact': { en: 'Contact', ja: '連絡先' },
        'res.info.contact.phone': { en: 'Phone : 090 3856 2854', ja: 'Phone : 090 3856 2854' },
        'res.info.contact.email': { en: 'Email : amouretgrace2026@gmail.com', ja: 'Email : amouretgrace2026@gmail.com' },
        'res.info.opentime': { en: 'Open Time', ja: '営業時間' },
        'res.info.restobar': { en: 'Resto Bar: Sunday 11:00 AM - 12 Midnight', ja: 'レストバー: 日曜日 11:00 - 24:00' },
        'res.info.lounge': { en: 'Lounge: Wed & Thu 8:00 PM - 12 MN', ja: 'ラウンジ: 水・木 20:00 - 24:00' },
        'res.info.lounge2': { en: 'Fri & Sat 7:00 PM - 2:00 AM', ja: '金・土 19:00 - 翌2:00' },
        'res.info.except': { en: 'Closed on Monday & Tuesday', ja: '月曜・火曜定休' },
        'res.info.reservations': { en: 'Party & Event Reservations: 9 AM - 5 PM', ja: 'パーティー＆イベント予約: 9:00 - 17:00' },
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
        'res.faq.a6': { en: 'We recommend reserving regular tables at least one day before your visit. For private group events or party platters, we kindly ask that reservations be made 2–3 days in advance.', ja: '通常のお席はご利用日の1日前までのご予約をおすすめしております。団体での貸切やパーティープラッターをご希望の場合は、2～3日前までのご予約をお願いいたします。。' },
        'res.faq.q7': { en: 'Will I receive a confirmation after booking?', ja: '予約後に確認は届きますか？' },
        'res.faq.a7': { en: 'Yes, our reservation team will review your submission and contact you within 24 hours to confirm your booking.', ja: 'はい、予約チームが送信内容を確認し、24時間以内にご連絡してご予約を確定します。' },
        'res.faq.q8': { en: 'Do you host seasonal events and cocktail parties?', ja: '季節のイベントやカクテルパーティーは開催していますか？' },
        'res.faq.a8': { en: 'Yes! We frequently host seasonal events, live music, and themed cocktail parties. Keep an eye on our social media for updates.', ja: 'はい！季節のイベント、ライブミュージック、テーマ別カクテルパーティーを頻繁に開催しています。最新情報はSNSをチェックしてください。' },

        // ═══════════════════════════════════════
        // FRESH FRUIT SHAKES & JUICES
        // ═══════════════════════════════════════
        'menu.shakes.subtitle': { en: 'Real fruit. Real refreshment. Sip on our creamy, naturally sweet fruit shakes — Mango, Strawberry, Apple, or Banana — the perfect non-alcoholic treat for any time of day.', ja: '本物のフルーツ。本物のリフレッシュメント。マンゴー、ストロベリー、アップル、バナナのクリーミーで自然な甘さのフルーツシェイクをお楽しみください。どんな時間帯にもぴったりのノンアルコールデザートです。' },

        'menu.shake.mango.name': { en: 'MANGO SHAKE', ja: 'マンゴーシェイク' },
        'menu.shake.mango.desc': { en: 'Made with ripe mangoes for a rich, creamy, and refreshing tropical treat.', ja: '完熟マンゴーを使用した、リッチでクリーミー、そして爽やかなトロピカルシェイク。' },

        'menu.shake.banana.name': { en: 'BANANA SHAKE', ja: 'バナナシェイク' },
        'menu.shake.banana.desc': { en: 'Creamy, naturally sweet, and made with ripe bananas.', ja: '完熟バナナを使用した、クリーミーで自然の甘さが嬉しいシェイク。' },

        'menu.shake.strawberry.name': { en: 'STRAWBERRY SHAKE', ja: 'ストロベリーシェイク' },
        'menu.shake.strawberry.desc': { en: 'Sweet, creamy, and bursting with fresh strawberry flavor.', ja: '甘くてクリーミー、フレッシュなイチゴの風味が弾けるシェイク。' },

        'menu.shake.apple.name': { en: 'APPLE SHAKE', ja: 'アップルシェイク' },
        'menu.shake.apple.desc': { en: 'Crisp, light, and refreshingly sweet—made with real apples.', ja: '本物のリンゴを使用した、サクサクと軽く、爽やかな甘さのシェイク。' },

        'menu.juices.subtitle': { en: 'Pure & Refreshing — Made fresh from real fruit, our juices are naturally sweet, vibrant, and bursting with flavor in every sip.', ja: '絞りたてのフレッシュなフルーツを使用した、自然な甘さと爽やかさが広がるピュアなジュース。' },

        'menu.juice.mango.name': { en: 'MANGO JUICE', ja: 'マンゴージュース' },
        'menu.juice.mango.desc': { en: 'Freshly squeezed ripe mangoes for a rich, refreshing taste.', ja: '完熟マンゴーを絞った、リッチで爽快な味わい。' },

        'menu.juice.kalamansi.name': { en: 'KALAMANSI JUICE', ja: 'カラマンシージュース' },
        'menu.juice.kalamansi.desc': { en: 'A refreshing citrus drink bursting with fresh kalamansi flavor.', ja: '新鮮なカラマンシーの風味が弾ける、爽やかなシトラスドリンク。' },

        'menu.juice.pineapple.name': { en: 'PINEAPPLE JUICE', ja: 'パイナップルジュース' },
        'menu.juice.pineapple.desc': { en: 'Bright, tropical, and bursting with fresh pineapple flavor.', ja: '明るくトロピカル、フレッシュなパイナップルの風味が弾けるジュース。' },

        'menu.juice.guava.name': { en: 'GUAVA JUICE', ja: 'グアバジュース' },
        'menu.juice.guava.desc': { en: 'Naturally refreshing with the sweet taste of ripe guava.', ja: '完熟グアバの甘みが広がる、自然の爽やかさ。' },

        'menu.juice.guyabano.name': { en: 'GUYABANO JUICE', ja: 'グヤバノジュース' },
        'menu.juice.guyabano.desc': { en: 'A creamy soursop drink with a naturally sweet tropical flavor..', ja: 'クリーミーなサワーソップを使用。自然な甘さのトロピカルな風味。' },

        'menu.juice.halohalo.name': { en: 'HALO-HALO', ja: 'ハロハロ' },
        'menu.juice.halohalo.desc': { en: "The Philippines' most beloved dessert — a colorful, refreshing medley of shaved ice, sweet beans, jackfruit, banana, and other delicious mix-ins, topped with creamy leche flan, purple yam (ube), and a drizzle of evaporated milk.", ja: 'フィリピンで最も愛されるデザート。かき氷に甘い豆、ジャックフルーツ、バナナ、レチェフランやウベをトッピングした贅沢な一品。' },

        'menu.size.large': { en: 'LARGE', ja: '大 (L)' },
        'menu.size.medium': { en: 'MEDIUM', ja: '中 (M)' },

        // ═══════════════════════════════════════
        // COFFEE BASED DRINKS
        // ═══════════════════════════════════════
        'menu.coffee.subtitle': { en: 'From rich, aromatic hot brews to cool, refreshing iced classics — our coffee menu is made to keep you energized, comforted, and satisfied, any time of day.', ja: '豊かで香り高いホットコーヒーから、冷たくて爽快なアイスコーヒーまで。いつでもあなたに活力を与え、心を満たすコーヒーメニューをご用意しています。' },

        'menu.coffee.hot_americano.name': { en: 'HOT COFFEE<br>AMERICANO', ja: 'ホットコーヒー<br>アメリカーノ' },
        'menu.coffee.hot_americano.desc': { en: 'Bold and full-bodied — a classic blend of rich espresso and hot water, delivering a smooth, robust coffee experience with a clean, slightly bitter finish. Simple, strong, and perfect for those who love coffee in its purest form.', ja: 'リッチなエスプレッソとお湯のクラシックなブレンド。シンプルで力強く、すっきりとした苦味が特徴です。' },

        'menu.coffee.hot_cappuccino.name': { en: 'HOT COFFEE<br>CAPPUCCINO', ja: 'ホットコーヒー<br>カプチーノ' },
        'menu.coffee.hot_cappuccino.desc': { en: 'Creamy, smooth, and beautifully balanced — a perfect harmony of rich espresso, steamed milk, and a generous layer of velvety foam. Warm, comforting, and topped with a light dusting of flavor in every sip.', ja: 'リッチなエスプレッソ、スチームミルク、ベルベットのようなフォームの完璧なハーモニー。クリーミーで滑らかな一杯です。' },

        'menu.coffee.iced_americano.name': { en: 'ICED COFFEE<br>AMERICANO', ja: 'アイスコーヒー<br>アメリカーノ' },
        'menu.coffee.iced_americano.desc': { en: 'Bold and refreshing — rich espresso poured over ice, delivering a smooth, robust coffee flavor with a clean, crisp finish. Light, energizing, and perfect for cooling down without compromising on taste.', ja: 'リッチなエスプレッソを氷に注ぎ、スムーズで力強い味わいと爽やかな後味を楽しめる一杯です。' },

        'menu.coffee.iced_cappuccino.name': { en: 'ICED COFFEE<br>CAPPUCCINO', ja: 'アイスコーヒー<br>カプチーノ' },
        'menu.coffee.iced_cappuccino.desc': { en: 'Creamy and refreshing — a chilled blend of rich espresso, cold milk, and silky foam served over ice. Smooth, lightly sweet, and perfectly balanced for a cool, satisfying coffee fix any time of day.', ja: '冷たいミルクとリッチなエスプレッソのブレンド。クリーミーで爽快、どんな時間帯にもぴったりの一杯です。' },

        'menu.size.only_available': { en: 'ONLY AVAILABLE SIZE:', ja: '提供サイズ：' },

        // ═══════════════════════════════════════
        // REVIEWS PAGE
        // ═══════════════════════════════════════
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

        // Past Events
        'events.past.bday.title': { en: 'Birthday Party', ja: 'バースデーパーティー' },
        'events.past.bday.desc': {
            en: 'A vibrant birthday celebration filled with joy, great food, and unforgettable memories with friends and family.',
            ja: '美味しい料理と大切な家族や友人たちとの喜びに満ちた、活気あふれる誕生日のお祝い。'
        },
        'events.past.karaoke.title': { en: 'Karaoke Nights', ja: 'カラオケナイト' },
        'events.past.karaoke.desc': {
            en: 'An exciting night of singing, laughter, and great drinks where guests took center stage and sang their hearts out.',
            ja: '美味しいお酒を片手に、歌って笑って大盛り上がり。ゲストが主役となって思い切り歌い上げたエキサイティングな夜。'
        },
        'events.past.anniv.title': { en: 'Anniversary Celebration', ja: 'アニバーサリー（記念日）' },
        'events.past.anniv.desc': {
            en: 'A romantic and elegant anniversary dinner celebrating love and milestones with our signature dishes and cocktails.',
            ja: '当店のシグネチャー料理やカクテルとともに、愛と節目を祝うロマンチックでエレガントな記念日ディナー。'
        },
        'menu.btn.inquire': { en: 'Inquire Now', ja: 'お問い合わせ' }
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
            toggleLabel.innerHTML = lang === 'en'
                ? '<span class="active">EN</span><span class="divider">|</span><span>JA</span>'
                : '<span>EN</span><span class="divider">|</span><span class="active">JA</span>';
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
