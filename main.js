/* ==========================================================================
   main.js - Interactive Logic & Translation Engine
   ========================================================================== */

// --- ENVIRONMENT CONFIGURATION ---
const PRODUCT_MODE = true; // Set to TRUE for Live Website
const TEST_MODE = false;   // Set to TRUE for Local Development

// Config Selection
const ENV = {
    whatsapp_phone: (PRODUCT_MODE) ? '905344141224' : '905555555555', // Real vs Dummy
    form_email: (PRODUCT_MODE) ? 'm.eymen@teverorman.com' : 'test@teverorman.com',
    is_production: PRODUCT_MODE
};

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHeaderScroll();
    initLanguageSystem();
    initLazyLoading();
    initWhatsApp(); // Floating Button
    initContactForm(); // Page Form
});

/* --- UI Logic --- */

function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
}

function initContactForm() {
    const inquirySelect = document.getElementById('inquiryType');
    const messageBox = document.querySelector('textarea');

    // Only run if elements exist (Contact Page)
    if (!inquirySelect || !messageBox) return;

    // 1. Get Context from URL
    const params = new URLSearchParams(window.location.search);
    const productKey = params.get('product'); // e.g., 'birch'

    // 2. Define Templates (Moved to 3. Pre-fill Logic for Language Support)

    // 3. Pre-fill Logic
    if (productKey) {
        // Specific Product Inquiry
        const productNames = {
            'birch': 'Birch Plywood',
            'poplar': 'Poplar Plywood',
            'marine': 'Marine Plywood',
            'lumber_softwood': 'Softwood Lumber',
            'lumber_hardwood': 'Hardwood Lumber',
            'veneer': 'Natural Veneer',
            'osb_mdf': 'OSB & MDF Boards'
        };
        const pName = productNames[productKey] || 'Forest Products';

        inquirySelect.value = 'industry';
        messageBox.value = `Hello,\n\nI am interested in sourcing ${pName} for our company.\nWe are looking for specifications regarding:\n- Thickness/Dimensions:\n- Grade:\n\nEstimated Volume: [Number of Containers]\nDestination: [City, Country]\n\nPlease send us a quotation.\n\nBest regards,`;
    } else {
        // Default based on dropdown (if user changes it manually)
        inquirySelect.addEventListener('change', () => {
            const key = inquirySelect.value;
            if (templates[key]) {
                messageBox.value = templates[key];
            }
        });

        // Initial set if not product param
        const currentType = inquirySelect.value;
        if (messageBox.value === "") { // Only if empty
            messageBox.value = templates[currentType] || templates['general'];
        }
    }
}

function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initLazyLoading() {
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
        img.setAttribute('loading', 'lazy');
    });
}

/* --- Translation Engine --- */

const languages = {
    'en': { name: 'English', flag: 'fi-gb', dir: 'ltr' },
    'tr': { name: 'Türkçe', flag: 'fi-tr', dir: 'ltr' },
    'fa': { name: 'فارسی', flag: 'fi-ir', dir: 'rtl' },
    'ar-gcc': { name: 'العربية (Gulf)', flag: 'fi-sa', dir: 'rtl' },
    'ar-eg': { name: 'العربية (Egypt)', flag: 'fi-eg', dir: 'rtl' },
    'de': { name: 'Deutsch', flag: 'fi-de', dir: 'ltr' },
    'fr': { name: 'Français', flag: 'fi-fr', dir: 'ltr' },
    'es': { name: 'Español', flag: 'fi-es', dir: 'ltr' },
    'it': { name: 'Italiano', flag: 'fi-it', dir: 'ltr' },
    'zh-cn': { name: '中文 (Simplified)', flag: 'fi-cn', dir: 'ltr' }
};

const translations = {
    // Navigation
    'nav.home': { en: 'Home', tr: 'Ana Sayfa', fa: 'خانه', 'ar-gcc': 'الرئيسية', 'ar-eg': 'الرئيسية', de: 'Startseite', fr: 'Accueil', es: 'Inicio', it: 'Home', 'zh-cn': '首页' },
    'nav.products': { en: 'Products', tr: 'Ürünler', fa: 'محصولات', 'ar-gcc': 'منتجات', 'ar-eg': 'منتجات', de: 'Produkte', fr: 'Produits', es: 'Productos', it: 'Prodotti', 'zh-cn': '产品' },
    'nav.lumber': { en: 'Lumber', tr: 'Kereste', fa: 'الوار', 'ar-gcc': 'الأخشاب', 'ar-eg': 'الأخشاب', de: 'Schnittholz', fr: 'Bois', es: 'Madera', it: 'Legname', 'zh-cn': '木材' },
    'nav.about': { en: 'Our Heritage', tr: 'Mirasımız', fa: 'درباره ما', 'ar-gcc': 'تراثنا', 'ar-eg': 'تراثنا', de: 'Unser Erbe', fr: 'Notre Héritage', es: 'Nuestra Herencia', it: 'La Nostra Eredità', 'zh-cn': '我们的遗产' },
    'nav.sanat': { en: 'Tever Sanat', tr: 'Tever Sanat', fa: 'تور هنر', 'ar-gcc': 'تيفير للفنون', 'ar-eg': 'تيفير للفنون', de: 'Tever Kunst', fr: 'Tever Art', es: 'Tever Arte', it: 'Tever Arte', 'zh-cn': 'Tever 艺术' },
    'nav.contact': { en: 'Contact', tr: 'İletişim', fa: 'تماس', 'ar-gcc': 'اتصل بنا', 'ar-eg': 'اتصل بنا', de: 'Kontakt', fr: 'Contact', es: 'Contacto', it: 'Contatti', 'zh-cn': '联系' },

    // Hero & General
    'hero.title': {
        en: 'Forest Products Supplier for Global Industry.<br>Tüm Ahşap Endüstrisi Tedarikçisi.',
        tr: 'Tüm Ahşap Endüstrisi Tedarikçisi.<br>Global Sanayi için Orman Ürünleri.',
        fa: 'تامین کننده محصولات جنگلی برای صنعت جهانی.<br>برای تمامی صنایع چوبی.',
        'ar-gcc': 'المورد العالمي للمنتجات الحرجية.<br>المورد لجميع صناعات الأخشاب.',
        de: 'Forstprodukte Lieferant für die Weltindustrie.',
        fr: 'Fournisseur de produits forestiers pour l\'industrie mondiale.'
    },
    'hero.subtitle': { en: '100+ Years of Material Expertise', tr: '100+ Yıllık Malzeme Uzmanlığı', fa: 'بیش از ۱۰۰ سال تخصص در مواد', 'ar-gcc': 'أكثر من 100 عام من الخبرة في المواد' },
    'btn.industrial': { en: 'Industrial Products', tr: 'Endüstriyel Ürünler', fa: 'محصولات صنعتی', 'ar-gcc': 'المنتجات الصناعية' },
    'btn.sanat': { en: 'Explore Tever Sanat', tr: 'Tever Sanat\'ı Keşfet', fa: 'کاوش در تور هنر', 'ar-gcc': 'استكشف تيفير للفنون' },
    'btn.quote': { en: 'Request Quote', tr: 'Teklif İste', fa: 'درخواست قیمت', 'ar-gcc': 'طلب عرض سعر' },

    // Catalog & Products
    'catalog.title': { en: 'Forest Products Catalog<br>(Plywood, OSB, MDF, Lumber)', tr: 'Orman Ürünleri Kataloğu<br>(Kontraplak, Kereste, OSB, MDF)' },
    'catalog.subtitle': { en: 'Premium grade Birch/Poplar Plywood, Lumber, and Boards for global industry.', tr: 'Küresel endüstri için Premium Huş/Kavak Kontrplak, Kereste ve Levhalar.' },

    // OSB & MDF
    'product.osb.title': { en: 'OSB & MDF', tr: 'OSB & MDF Levha', fa: 'OSB و MDF', 'ar-gcc': 'OSB و MDF' },
    'product.osb.subtitle': { en: 'Engineered Boards', tr: 'Endüstriyel Levhalar' },
    'product.osb.desc': {
        en: 'Versatile structural panels for roofing, wall sheathing, and furniture manufacturing. <strong>OSB-3</strong> and <strong>MDF/HDF</strong> available.',
        tr: 'Çatı kaplama, duvar giydirme ve mobilya üretimi için çok yönlü yapısal paneller. <strong>OSB-3</strong> (Nem Dirençli) ve <strong>MDF/HDF</strong> stoklarımızda.'
    },

    // Marine
    'product.marine.title': { en: 'Marine Plywood & Beams', tr: 'Su Kontrası & H20 Kiriş', fa: 'تخته سه لا دریایی', 'ar-gcc': 'الخشب الرقائقي البحري' },
    'product.marine.subtitle': { en: 'Water Resistant', tr: 'Suya Dayanıklı' },
    'product.marine.desc': {
        en: 'High-performance <strong>Marine Plywood</strong> and <strong>H20 Wooden Beams</strong> for heavy-duty concrete formwork and boat building.',
        tr: 'Ağır hizmet tipi beton kalıpları ve tekne yapımı için yüksek performanslı <strong>Su Kontrası (Marine Ply)</strong> ve <strong>H20 Ahşap Kirişler</strong>.'
    },

    // Lumber Page
    'lumber.title': { en: 'Global Timber Supply', tr: 'Küresel Kereste Tedariği', fa: 'تامین جهانی الوار', 'ar-gcc': 'توريد الأخشاب العالمي' },
    'lumber.desc': {
        en: 'High-quality softwood and hardwood lumber for construction, furniture, and joinery.',
        tr: 'İnşaat, mobilya ve marangozluk için yüksek kaliteli iğne yapraklı ve yapraklı kereste.'
    },
    'lumber.softwood.title': { en: 'Softwood Lumber', tr: 'İğne Yapraklı Kereste' },
    'lumber.softwood.subtitle': { en: 'Construction Grade', tr: 'İnşaat Sınıfı' },
    'lumber.softwood.text': {
        en: 'Sourced from sustainable northern forests. Ideal for structural framing, pallets, and general construction.',
        tr: 'Sürdürülebilir kuzey ormanlarından temin edilmiştir. Yapısal çerçeveleme, palet ve genel inşaat için idealdir.'
    },
    'lumber.hardwood.title': { en: 'Hardwood Lumber', tr: 'Yapraklı (Sert) Kereste' },
    'lumber.hardwood.subtitle': { en: 'Furniture Grade', tr: 'Mobilya Sınıfı' },
    'lumber.hardwood.text': {
        en: 'Premium hardwood options for high-end furniture, flooring, and interior design. Kiln dried and graded.',
        tr: 'Üst düzey mobilya, zemin kaplaması ve iç tasarım için birinci sınıf sert ağaç seçenekleri. Fırın kurusu ve sınıflandırılmış.'
    },

    // Specs Headers
    'spec.species': { en: 'Species', tr: 'Türler' },
    'spec.drying': { en: 'Drying', tr: 'Kurutma' },
    'spec.grade': { en: 'Grading', tr: 'Sınıflandırma' },
    'spec.finish': { en: 'Finish', tr: 'Bitiş' },
    'spec.origin': { en: 'Origin', tr: 'Menşei' },
    'spec.types': { en: 'Types', tr: 'Çeşitler' },
    'spec.usecase': { en: 'Use Case', tr: 'Kullanım Alanı' },
    'spec.products': { en: 'Products', tr: 'Ürünler' },
    'spec.format': { en: 'Format (mm)', tr: 'Ebat (mm)', fa: 'ابعاد (mm)', 'ar-gcc': 'الأبعاد (mm)', de: 'Format (mm)', fr: 'Format (mm)', es: 'Formato (mm)', it: 'Formato (mm)', 'zh-cn': '尺寸 (mm)' },

    // About Page (Institutional Story - Merchant Family)
    'about.hero.title': { en: 'A Merchant Tradition Since the 1900s', tr: '1900\'lerden Günümüze Tüccar Geleneği' },
    'about.hero.text': {
        en: 'The Tever family entered the trade in the early 20th century. Harnessing the hydraulic force of Anatolia\'s rivers, we laid the foundation for a century of commerce.',
        tr: 'Tever ailesi, 20. yüzyılın başlarında ticarete atıldı. Anadolu nehirlerinin gücüyle işleyen ilk atölyemiz, asırlık bir ticaret geleneğinin temelini attı.'
    },
    'about.custom.title': { en: 'Global Reliability', tr: 'Küresel Güven' },
    'about.custom.text': {
        en: 'We started as manufacturers in the early 1900s. Today, we use that deep production know-how to source only the best materials. We source with the eye of a producer.',
        tr: '1900\'lerin başında üretici olarak başladık. Bugün, o derin üretim tecrübemizi ortaklarımız için en iyi malzemeyi seçmekte kullanıyoruz. Bir üretici gözüyle tedarik ediyoruz.'
    },
    'about.heritage.title': { en: 'Global Outlook', tr: 'Küresel Vizyon' },
    'about.heritage.text': {
        en: 'Bridging the gap between Anatolian craftsmanship and international industry, delivering consistency and values to B2B partners worldwide.',
        tr: 'Anadolu ustalığı ile uluslararası endüstri arasında köprü kurarak, dünya çapındaki iş ortaklarımıza istikrar ve değer sunuyoruz.'
    },

    'footer.products': { en: 'Products', tr: 'Ürünler', fa: 'محصولات', 'ar-gcc': 'المنتجات', de: 'Produkte', fr: 'Produits', es: 'Productos', it: 'Prodotti', 'zh-cn': '产品' },
    'footer.culture': { en: 'Culture', tr: 'Kültür', fa: 'فرهنگ', 'ar-gcc': 'ثقافة', de: 'Kultur', fr: 'Culture', es: 'Cultura', it: 'Cultura', 'zh-cn': '文化' },
    'footer.connect': { en: 'Connect', tr: 'Bağlantı', fa: 'ارتباط', 'ar-gcc': 'تواصل', de: 'Verbinden', fr: 'Connecter', es: 'Conectar', it: 'Connetti', 'zh-cn': '连接' },

    // New Footer Links
    'footer.plywood': { en: 'Plywood', tr: 'Kontrplak', fa: 'تخته سه لا', 'ar-gcc': 'خشب رقائقي', de: 'Sperrholz', fr: 'Contreplaqué', es: 'Contrachapado', it: 'Compensato', 'zh-cn': '胶合板' },
    'footer.veneer': { en: 'Veneer (Papel)', tr: 'Kaplama (Papel)', fa: 'روکش', 'ar-gcc': 'قشرة خشبية', de: 'Furnier', fr: 'Placage', es: 'Chapa', it: 'Impiallacciatura', 'zh-cn': '单板' },
    'footer.lumber_link': { en: 'Lumber (Kereste)', tr: 'Kereste', fa: 'الوار', 'ar-gcc': 'الأخشاب', de: 'Schnittholz', fr: 'Bois d\'oeuvre', es: 'Madera aserrada', it: 'Legname', 'zh-cn': '木材' },
    'footer.art_collection': { en: 'Art Collection', tr: 'Sanat Koleksiyonu', fa: 'مجموعه هنری', 'ar-gcc': 'مجموعة فنية', de: 'Kunstsammlung', fr: 'Collection d\'art', es: 'Colección de arte', it: 'Collezione d\'arte', 'zh-cn': '艺术收藏' },
    'footer.for_artists': { en: 'For Artists', tr: 'Sanatçılar İçin', fa: 'برای هنرمندان', 'ar-gcc': 'للفنانين', de: 'Für Künstler', fr: 'Pour les artistes', es: 'Para artistas', it: 'Per artisti', 'zh-cn': '对于艺术家' },

    // Stats Bar
    'stats.export': { en: '50+ Countries', tr: '50+ Ülkeye İhracat', fa: '۵۰+ کشور', 'ar-gcc': 'أكثر من 50 دولة' },
    'stats.export.desc': { en: 'Global Export Network', tr: 'Küresel İhracat Ağı' },
    'stats.sustain': { en: '100% Sustainable', tr: '%100 Sürdürülebilir' },
    'stats.sustain.desc': { en: 'Certified Sources', tr: 'Sertifikalı Kaynaklar' },
    'stats.history': { en: 'Est. 1918', tr: '1918\'den Beri' },
    'stats.history.desc': { en: 'More than 100 Years', tr: '100 Yıldan Fazla', fa: 'بیش از ۱۰۰ سال', 'ar-gcc': 'أكثر من 100 عام', de: 'Mehr als 100 Jahre', fr: 'Plus de 100 Ans', es: 'Más de 100 Años', it: 'Più di 100 Anni', 'zh-cn': '100 多年' },

    // Contact Form
    'contact.form_title': { en: 'Inquiry Form', tr: 'İletişim Formu' },
    'contact.department': { en: 'Department / Purpose', tr: 'Departman / Konu' },
    'contact.opt_industry': { en: 'Industrial Sales (Plywood/Lumber/Veneer)', tr: 'Endüstriyel Satış (Kontrplak/Kereste/Kaplama)' },
    'contact.opt_gallery': { en: 'Tever Sanat | Gallery Partnership', tr: 'Tever Sanat | Galeri İşbirliği' },
    'contact.opt_acquisition': { en: 'Tever Sanat | Art Acquisition', tr: 'Tever Sanat | Eser Alımı' },
    'contact.opt_general': { en: 'General Inquiry', tr: 'Genel Bilgi' },
    'contact.full_name': { en: 'Full Name', tr: 'Ad Soyad' },
    'contact.company': { en: 'Company / Institution', tr: 'Şirket / Kurum' },
    'contact.email_label': { en: 'Email Address', tr: 'E-Posta Adresi' },
    'contact.message': { en: 'Message', tr: 'Mesajınız' },
    'contact.btn_email': { en: 'Send Email', tr: 'E-Posta Gönder' },
    'contact.btn_whatsapp': { en: 'Send via WhatsApp', tr: 'WhatsApp ile Gönder' },
    'contact.whatsapp_hint': { en: 'Need a faster response? Use the WhatsApp button.', tr: 'Daha hızlı yanıt için WhatsApp butonunu kullanın.' }
};

function initLanguageSystem() {
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');

    // 1. Build Dropdown
    if (langDropdown && Object.keys(languages).length > 0) {
        langDropdown.innerHTML = ''; // Clear prev
        Object.keys(languages).forEach(code => {
            const lang = languages[code];
            const option = document.createElement('div');
            option.className = 'lang-option';
            option.innerHTML = `<span class="fi ${lang.flag}"></span><span>${lang.name}</span>`;
            option.onclick = () => setLanguage(code);
            langDropdown.appendChild(option);
        });
    }

    // 2. Toggle Dropdown
    if (langBtn) {
        langBtn.onclick = (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
        };
        document.addEventListener('click', () => {
            langDropdown.classList.remove('active');
        });
        langDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    // 3. Load Initial Language
    const params = new URLSearchParams(window.location.search);
    const savedLang = localStorage.getItem('tever_lang');
    const initialLang = params.get('lang') || savedLang || 'en';
    setLanguage(initialLang);
}

function setLanguage(code) {
    if (!languages[code]) code = 'en';

    localStorage.setItem('tever_lang', code);

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('lang', code);
    window.history.replaceState({}, '', url);

    // Update HTML Tag
    const langConfig = languages[code];
    document.documentElement.lang = code;
    document.documentElement.dir = langConfig.dir;

    // Update Flag Button
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        langBtn.innerHTML = `<span class="fi ${langConfig.flag}"></span> <span style="font-size:0.8rem; font-weight:600;">${code.toUpperCase()}</span>`;
    }

    // Apply Text Translations
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            const text = translations[key][code] || translations[key]['en'] || translations[key][Object.keys(translations[key])[0]];
            if (text) el.innerHTML = text;
        }
    });

    const langDropdown = document.getElementById('langDropdown');
    if (langDropdown) langDropdown.classList.remove('active');
}

/* --- WhatsApp Integration --- */
function initWhatsApp() {
    const waButton = document.createElement('a');

    // 1. Get Product Context from URL
    const params = new URLSearchParams(window.location.search);
    const productKey = params.get('product'); // e.g., 'birch', 'lumber'

    // 2. Define Pre-Filled Messages (Contextual)
    let message = "Hello Tever Wood Industry, I am interested in your products. Can I get a quote?"; // Default

    if (productKey) {
        // Map keys to readable names
        const productNames = {
            'birch': 'Birch Plywood',
            'poplar': 'Poplar Plywood',
            'marine': 'Marine Plywood',
            'lumber_softwood': 'Softwood Lumber',
            'lumber_hardwood': 'Hardwood Lumber',
            'veneer': 'Natural Veneer',
            'osb_mdf': 'OSB & MDF Boards'
        };
        const productName = productNames[productKey] || 'Forest Products';
        message = `Hello, I saw your ${productName} on your website. I would like to request a price quote for export.`;
    }

    // 3. Encode Message for URL
    const encodedMessage = encodeURIComponent(message);
    const phone = '905344141224';

    waButton.href = `https://wa.me/${phone}?text=${encodedMessage}`;
    waButton.className = 'whatsapp-float';
    waButton.target = '_blank';
    waButton.setAttribute('aria-label', 'Chat with us on WhatsApp');

    // Yandex Goal Trigger
    waButton.onclick = function () {
        if (typeof ym !== 'undefined') {
            ym(106571280, 'reachGoal', 'whatsapp_click');
            console.log('Yandex Goal Triggered: whatsapp_click');
        }
    };

    waButton.innerHTML = `
        <svg viewBox="0 0 32 32" class="whatsapp-icon-svg">
            <path d="M16,2A13,13,0,0,0,8,25.23L2.92,27.3a1,1,0,0,0-.62,1.26,1,1,0,0,0,1,.69A1,1,0,0,0,3.67,29l6.26-2.56A13,13,0,1,0,16,2Zm0,24a11,11,0,0,1-5.87-1.7l-.42-.25-4.32,1.77,1.21-4.46-.26-.41A11,11,0,1,1,16,26Z" fill="currentColor"/>
            <path d="M21.92,19.34l-1.63-.81a4.86,4.86,0,0,0-1.87-.33,2.46,2.46,0,0,0-1.63.67l-.27.31a.58.58,0,0,1-.52.21,4,4,0,0,1-2.28-1.12c-.75-.71-1.28-1.57-1.42-2.31a.57.57,0,0,1,.15-.55l.28-.31a2.82,2.82,0,0,0,.68-1.63,4.71,4.71,0,0,0-.32-1.84L12.3,10a.65.65,0,0,0-1.15,0l-.58,1.27a3.49,3.49,0,0,0-.09,2.77,8.69,8.69,0,0,0,4.79,5.2,6,6,0,0,0,2.69.46,3.68,3.68,0,0,0,2.06-.65A.64.64,0,0,0,21.92,19.34Z" fill="currentColor"/>
        </svg>
    `;
    document.body.appendChild(waButton);
}
