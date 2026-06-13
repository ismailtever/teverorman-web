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
    const runSafe = (name, fn) => {
        try {
            fn();
        } catch (e) {
            console.error(`Error in ${name}:`, e);
        }
    };

    runSafe('MobileMenu', initMobileMenu);
    runSafe('HeaderScroll', initHeaderScroll);
    runSafe('LanguageSystem', initLanguageSystem);
    runSafe('LazyLoading', initLazyLoading);
    runSafe('WhatsApp', initWhatsApp);
    runSafe('ContactForm', initContactForm);
    runSafe('ScrollReveal', initScrollReveal);
});

/* --- UI Logic --- */

function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            mobileMenuToggle.setAttribute('aria-expanded', isActive);
            
            // Lock body scroll when overlay is active
            if (isActive) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking nav links (important for mobile page jumps)
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            // Ignore click if target was detached from DOM during option updates
            if (!document.body.contains(e.target)) return;

            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }
}

function initContactForm() {
    const inquirySelect = document.getElementById('inquiryType');
    const messageBox = document.getElementById('formMessage');

    // Only run if elements exist (Contact Page)
    if (!inquirySelect || !messageBox) return;

    // 1. Get Context from URL
    const params = new URLSearchParams(window.location.search);
    const productKey = params.get('product'); // e.g., 'birch'

    // 2. Define Templates
    const templates = {
        industry: "Hello,\n\nI am interested in sourcing wood products for our company.\nWe are looking for specifications regarding:\n- Product:\n- Thickness/Dimensions:\n- Grade:\n\nEstimated Volume:\nDestination:\n\nPlease send us a quotation.\n\nBest regards,",
        gallery: "Hello Tever Sanat,\n\nI am interested in a gallery partnership / exhibition opportunity. Here are some details about my work / institution:\n\nBest regards,",
        art_acquisition: "Hello Tever Sanat,\n\nI am interested in acquiring an artwork from your curated collection. Here are the details of the work I am interested in:\n\nBest regards,",
        general: "Hello Tever Orman,\n\nI would like to inquire about:\n\nBest regards,"
    };

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

    // Validation helper
    const validateForm = () => {
        const nameEl = document.getElementById('formName');
        const emailEl = document.getElementById('formEmail');
        const messageEl = messageBox;

        if (nameEl && nameEl.value.trim() === '') {
            nameEl.focus();
            alert('Lütfen adınızı girin. / Please enter your name.');
            return false;
        }
        if (emailEl && (emailEl.value.trim() === '' || !emailEl.validity.valid)) {
            emailEl.focus();
            alert('Lütfen geçerli bir e-posta adresi girin. / Please enter a valid email address.');
            return false;
        }
        if (messageEl && messageEl.value.trim() === '') {
            messageEl.focus();
            alert('Lütfen mesajınızı yazın. / Please enter your message.');
            return false;
        }
        return true;
    };

    // 4. Form Submit Listener (Formatted Email)
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!validateForm()) return;
            
            const dept = inquirySelect.selectedIndex >= 0 ? inquirySelect.options[inquirySelect.selectedIndex].text : 'General';
            const name = document.getElementById('formName') ? document.getElementById('formName').value : '';
            const company = document.getElementById('formCompany') ? document.getElementById('formCompany').value : '';
            const email = document.getElementById('formEmail') ? document.getElementById('formEmail').value : '';
            const message = messageBox.value;
            
            const subject = `Tever Orman Inquiry: ${dept}`;
            const body = `Full Name: ${name}\nCompany/Institution: ${company}\nEmail Address: ${email}\n\nMessage:\n${message}`;
            
            const mailtoUrl = `mailto:m.eymen@teverorman.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            // Safe redirection using a temporary click anchor
            const tempLink = document.createElement('a');
            tempLink.href = mailtoUrl;
            tempLink.style.display = 'none';
            document.body.appendChild(tempLink);
            tempLink.click();
            setTimeout(() => {
                document.body.removeChild(tempLink);
            }, 100);
        });
    }

    // 5. WhatsApp Form Button click listener
    const btnSendWaForm = document.getElementById('btnSendWaForm');
    if (btnSendWaForm) {
        btnSendWaForm.addEventListener('click', () => {
            if (!validateForm()) return;
            
            const dept = inquirySelect.selectedIndex >= 0 ? inquirySelect.options[inquirySelect.selectedIndex].text : 'General';
            const name = document.getElementById('formName') ? document.getElementById('formName').value : '';
            const company = document.getElementById('formCompany') ? document.getElementById('formCompany').value : '';
            const email = document.getElementById('formEmail') ? document.getElementById('formEmail').value : '';
            const message = messageBox.value;
            
            const text = `*Tever Orman Web Form Inquiry*\n\n` +
                         `*Department:* ${dept}\n` +
                         `*Full Name:* ${name}\n` +
                         `*Company:* ${company}\n` +
                         `*Email:* ${email}\n\n` +
                         `*Message:*\n${message}`;
            
            const waUrl = `https://wa.me/905344141224?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
        });
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
    // SEO Meta Translations (D    'meta.title.index': {
        en: 'Tever Orman | Birch Plywood, Veneer & Lumber Supplier',
        tr: 'Tever Orman | Plywood, Veneer, Kontraplak ve Kereste Tedarikçisi',
        de: 'Tever Orman | Sperrholz, Birkenplywood & Schnittholz Lieferant',
        fr: 'Tever Orman | Contreplaqué Bouleau, Bois d\'oeuvre & Produits Forestiers',
        'ar-gcc': 'تيفر أورمان | مورد خشب رقائقي (بليوود) وأخشاب عالمي',
        fa: 'تور اورمان | تامین کننده تخته سه لا، الوار و محصولات جنگلی'
    },
    'meta.desc.index': {
        en: '100+ years of timber heritage. Global supplier of premium Birch Plywood, Natural Wood Veneer, Kontraplak, Softwood & Hardwood Lumber, OSB, and MDF.',
        tr: '100 yılı aşkın orman ürünleri tecrübesi. Toptan Huş Plywood, doğal Veneer (kaplama), inşaatlık Kontraplak, yerli ve ithal kereste, OSB ve MDF.',
        de: 'Über 100 Jahre Erfahrung in der Holzindustrie. Globaler Lieferant für Birkensperrholz, Bauholz, OSB, MDF und Furniere.',
        fr: 'Plus de 100 ans d\'histoire. Fournisseur mondial de contreplaqué bouleau, bois de construction, OSB, MDF et placage naturel.',
        'ar-gcc': 'أكثر من 100 عام من الخبرة. مورد عالمي لخشب البليوود الروسي، الأخشاب الإنشائية، ألواح OSB والميلامين.',
        fa: 'بیش از ۱۰۰ سال سابقه در صنعت چوب. تامین‌کننده پلی‌وود توس، چوب نراد، تخته چندلایی و روکش‌های طبیعی.'
    },
    'meta.title.products': {
        en: 'Forest Products Catalog | Plywood, Veneer, Lumber & Kontraplak',
        tr: 'Orman Ürünleri Kataloğu | Plywood, Veneer ve Kontraplak Çeşitleri',
        de: 'Forstprodukte-Katalog | Sperrholz, Bauholz & Platten',
        fr: 'Catalogue de Produits Forestiers | Variétés de Contreplaqué, Bois & Panneaux',
        'ar-gcc': 'كتالوج المنتجات الحرجية | أنواع البليوود والأخشاب والألواح',
        fa: 'کاتالوگ محصولات جنگلی | انواع تخته سه لا، الوار و صفحات'
    },
    'meta.desc.products': {
        en: 'Browse our B2B catalog: premium Birch/Poplar Plywood, natural Veneer, marine Kontraplak, construction timber, OSB, MDF, and structural lumber.',
        tr: 'Tever Orman ürün kataloğu: Huş Plywood, doğal Veneer, marin ve inşaatlık Kontraplak, kereste, OSB ve MDF levha çeşitleri.',
        de: 'Durchsuchen Sie unseren B2B-Holzkatalog: Premium-Birken-/Pappelsperrholz, Bauholz, wasserbeständiges Sperrholz, OSB und MDF.',
        fr: 'Parcourez notre catalogue bois B2B: contreplaqué de bouleau/peuplier de qualité supérieure, bois de construction, contreplaqué marine, OSB, MDF et bois de structure.',
        'ar-gcc': 'تصفح كتالوج الأخشاب B2B الخاص بنا: خشب رقائقي ممتاز من خشب الحور والبتولا، أخشاب البناء، بليوود بحري، OSB، وMDF.',
        fa: 'کاتالوگ چوب B2B ما را مرور کنید: تخته سه لا توس/صنوبر ممتاز، چوب ساختمانی، تخته سه لا دریایی، OSB و MDF.'
    },
    'meta.title.prices': {
        en: 'Plywood, Veneer & Kontraplak Price List 2026 | Tever Orman',
        tr: 'Plywood, Veneer ve Kontraplak Fiyat Listesi 2026 | Tever Orman',
        de: 'Sperrholz & Filmbeschichtetes Sperrholz Preisliste 2026',
        fr: 'Liste des Prix de Contreplaqué Bouleau & Contreplaqué Filmé 2026',
        'ar-gcc': 'قائمة أسعار الخشب الرقائقي البليوود المكسو بالفيلم 2026',
        fa: 'لیست قیمت تخته سه لا توس و تخته سه لا روکش دار فیلم ۲۰۲۶'
    },
    'meta.desc.prices': {
        en: 'Wholesale and retail price catalog for Birch Plywood, Veneer, Kontraplak, film-faced boards, and H20 beams. Download PDF.',
        tr: 'En güncel toptan ve perakende Huş Plywood, doğal Veneer, inşaatlık Kontraplak ve H20 kiriş fiyat listesi. PDF olarak indirin.',
        de: 'Groß- und Einzelhandelspreiskatalog für Birkensperrholz, filmbeschichtete Betonschalungsplatten und H20-Träger. PDF herunterladen.',
        fr: 'Catalogue de prix de gros et de détail pour le contreplaqué de bouleau, les panneaux de coffrage en béton filmé et les poutres H20. Télécharger le PDF.',
        'ar-gcc': 'كتالوج أسعار الجملة والتجزئة لخشب البليوود البتولا، وألواح قوالب الخرسانة المكسوة بالفيلم، وعوارض H20. تحميل ملف PDF.',
        fa: 'کاتالوگ قیمت عمده و خرده فروشی تخته سه لا توس، ورق‌های قالب‌بندی بتن روکش‌دار فیلم و تیرهای H20. دانلود PDF.'
    },
    'meta.title.about': {
        en: 'Our Heritage | 100 Years of Timber Trade & Wood Craft',
        tr: 'Mirasımız | 100 Yıllık Kereste ve Orman Ürünleri Tarihi',
        de: 'Unser Erbe | 100 Jahre Holzhandel & Holzhandwerk',
        fr: 'Notre Héritage | 100 Ans de Commerce de Bois & Artisanat',
        'ar-gcc': 'تراثنا | 100 عام من تجارة الأخشاب وصناعة الخشب',
        fa: 'میراث ما | ۱۰۰ سال تجارت الوار و صنایع چوبی'
    },
    'meta.desc.about': {
        en: 'Since the 1900s, the Tever family has been defined by wood. From the first water-powered sawmill in Kanlıçay to a global modern trade network.',
        tr: '1900\'lerden beri Tever ailesi ahşapla tanımlanıyor. Kanlıçay\'daki ilk su değirmeninden küresel modern ticaret ağına uzanan başarı öykümüz.',
        de: 'Seit den 1900er Jahren ist die Familie Tever durch Holz geprägt. Vom ersten wasserbetriebenen Sägewerk in Kanlıçay bis zum globalen Handelsnetzwerk.',
        fr: 'Depuis les années 1900, la famille Tever est définie par le bois. Du premier moulin de sciage hydraulique à Kanlıçay au réseau commercial mondial.',
        'ar-gcc': 'منذ القرن العشرين، تميزت عائلة تيفر بالخشب. من أول مصنع خشب يعمل بالقوة المائية في كانليشاي إلى شبكة تجارية عالمية.',
        fa: 'از دهه ۱۹۰۰، خانواده تور با چوب شناخته شده است. از اولین کارگاه چوب‌بری با نیروی آب در روستای کانلیچای تا شبکه تجارت جهانی مدرن.'
    },
    'meta.title.contact': {
        en: 'Contact Us | Tever Orman B2B Sales & Customer Support',
        tr: 'İletişim | Tever Orman Mamülleri A.Ş. Telefon ve Adres',
        de: 'Kontaktieren Sie uns | B2B-Vertrieb & Support',
        fr: 'Contactez-nous | Ventes B2B & Support client',
        'ar-gcc': 'اتصل بنا | مبيعات B2B ودعم العملاء تيفر أورمان',
        fa: 'تماس با ما | فروش B2B و پشتیبانی مشتریان تور اورمان'
    },
    'meta.desc.contact': {
        en: 'Get in touch with Tever Orman for wholesale wood prices, custom dimensions, shipping details, or cultural partnership requests.',
        tr: 'Toptan kontrplak ve kereste fiyat teklifleri, özel ebat siparişleriniz, lojistik detaylar veya kültürel ortaklıklar için bizimle iletişime geçin.',
        de: 'Kontaktieren Sie Tever Orman für Großhandelspreise, Sondermaße, Versanddetails oder Anfragen zu kulturellen Partnerschaften.',
        fr: 'Contactez Tever Orman pour les prix de gros du bois, les dimensions sur mesure, les détails d\'expédition ou les demandes de partenariat culturel.',
        'ar-gcc': 'تواصل مع تيفر أورمان لمعرفة أسعار الخشب بالجملة، الأبعاد المخصصة، تفاصيل الشحن، أو طلبات الشراكة الثقافية.',
        fa: 'برای استعلام قیمت‌های عمده چوب، ابعاد سفارشی، جزئیات حمل و نقل یا درخواست‌های همکاری فرهنگی با تور اورمان تماس بگیرید.'
    },
    'meta.title.teversanat': {
        en: 'Tever Sanat | Wood Sculpture Initiative & Artist Program',
        tr: 'Tever Sanat | Ahşap Heykel ve Sanatçı Destek Programı',
        de: 'Tever Sanat | Holzskulpturen-Initiative & Künstlerprogramm',
        fr: 'Tever Sanat | Initiative de Sculpture sur Bois & Programme d\'Artistes',
        'ar-gcc': 'تيفير للفنون | مبادرة النحت الخشب وبرنامج دعم الفنانين',
        fa: 'تور هنر | طرح مجسمه سازی چوبی و برنامه حمایت از هنرمندان'
    },
    'meta.desc.teversanat': {
        en: 'Connecting industrial wood expertise with artistic expression. Material sponsorship for sculptors and curated art exhibitions.',
        tr: 'Endüstriyel ahşap uzmanlığını sanatsal ifadeyle birleştiriyoruz. Heykeltıraşlar için malzeme sponsorluğu ve seçkin sanat sergileri.',
        de: 'Verbindung von industrieller Holzkompetenz mit künstlerischem Ausdruck. Materialsponsoring für Bildhauer und kuratierte Kunstausstellungen.',
        fr: 'Connecter le savoir-faire industriel du bois à l\'expression artistique. Parrainage matériel pour les sculpteurs et expositions d\'art.',
        'ar-gcc': 'ربط الخبرة الصناعية بالخشب بالتعبير الفني. رعاية مادية للنحاتين ومعارض فنية منسقة.',
        fa: 'پیوند تخصص صنعتی چوب با بیان هنری. حمایت مادی از مجسمه‌سازان و برگزاری نمایشگاه‌های هنری برگزیده.'
    },
    'meta.title.teversanat-gallery': {
        en: 'Art Gallery | Curated Wood Sculptures Collection',
        tr: 'Sanat Galerisi | Küratörlü Ahşap Eserler Koleksiyonu',
        de: 'Kunstgalerie | Kuratierte Auswahl an Holzskulpturen',
        fr: 'Galerie d\'Art | Collection Sélectionnée de Sculptures sur Bois',
        'ar-gcc': 'معرض الفنون | مجموعة منحوتات خشبية مختارة',
        fa: 'گالری هنری | مجموعه انتخاب شده مجسمه های چوبی'
    },
    'meta.desc.teversanat-gallery': {
        en: 'Explore our gallery of modern wood sculptures and mixed-media art pieces curated by Tever Sanat.',
        tr: 'Tever Sanat küratörlüğünde hazırlanan modern ahşap heykeller, papel rölyefler ve karma teknik sanat koleksiyonunu keşfedin.',
        de: 'Entdecken Sie unsere Galerie moderner Holzskulpturen und Mixed-Media-Kunstwerke, kuratiert von Tever Sanat.',
        fr: 'Découvrez notre galerie de sculptures sur bois modernes et d\'œuvres d\'art en techniques mixtes sélectionnées par Tever Sanat.',
        'ar-gcc': 'استكشف معرضنا للمنحوتات الخشبية الحديثة والأعمال الفنية المتنوعة المنسقة بواسطة تيفير للفنون.',
        fa: 'گالری مجسمه‌های چوبی مدرن و آثار هنری ترکیبی ما را که توسط تور هنر گردآوری شده است، کشف کنید.'
    },
    'meta.title.teversanat-apply': {
        en: 'Artist Application | Wood Material Sponsorship Open Call 2026',
        tr: 'Sanatçı Başvurusu | Ahşap Malzeme Sponsorluğu 2026',
        de: 'Künstlerbewerbung | Materialsponsoring für Holz 2026',
        fr: 'Candidature Artiste | Parrainage Matériel de Bois Appel Ouvert 2026',
        'ar-gcc': 'طلب تقديم الفنانين | رعاية المواد الخشبية دعوة مفتوحة 2026',
        fa: 'درخواست هنرمندان | فراخوان عمومی حمایت مادی از مصالح چوبی ۲۰۲۶'
    },
    'meta.desc.teversanat-apply': {
        en: 'Submit your portfolio for our quarterly B2B wood material support program. Supporting sculptors with premium plywood and veneer.',
        tr: 'Heykeltıraşlar ve 3D sanatçılar için üç ayda bir düzenlenen ahşap malzeme (kontrplak/kaplama) destek programına başvurun.',
        de: 'Reichen Sie Ihr Portfolio für unser vierteljährliches Sponsoringprogramm für Holzmaterialien ein. Unterstützung von Bildhauern mit Sperrholz und Furnieren.',
        fr: 'Soumettez votre portfolio pour notre programme de soutien trimestriel en matériaux bois. Soutien aux sculpteurs avec contreplaqué et placage.',
        'ar-gcc': 'قدم ملف أعمالك لبرنامج دعم المواد الخشبية ربع السنوي. دعم النحاتين بالخشب الرقائقي والقشرة الفاخرة.',
        fa: 'نمونه کارهای خود را برای برنامه حمایتی فصلی مصالح چوبی ارسال کنید. حمایت از مجسمه‌سازان با تخته سه‌لا و روکش‌های ممتاز.'
    },

    // Brand & Suffix
    'contact.legal_title': { en: 'Tever Orman Mamülleri', tr: 'Tever Orman Mamülleri', de: 'Tever Orman Mamülleri', fr: 'Tever Orman Mamülleri', 'ar-gcc': 'تيفر أورمان', fa: 'تور اورمان', es: 'Tever Orman Mamülleri', it: 'Tever Orman Mamülleri', 'zh-cn': 'Tever 林产品' },
    'contact.legal_suffix': { en: 'Forest Products Inc.', tr: 'Sanayi ve Ticaret A.Ş.', de: 'Forstprodukte GmbH', fr: 'Industries Forestières SA', 'ar-gcc': 'للمنتجات الحرجية', fa: 'محصولات جنگلی', es: 'Productos Forestales S.A.', it: 'Prodotti Forestali S.p.A.', 'zh-cn': '林产品股份有限公司' },
    'footer.partner_btn': { en: 'Partnership &rarr;', tr: 'İş Birliği &rarr;', de: 'Partnerschaft &rarr;', fr: 'Partenariat &rarr;', 'ar-gcc': 'الشراكة &rarr;', fa: 'همکاری &rarr;', es: 'Asociación &rarr;', it: 'Collaborazione &rarr;', 'zh-cn': '合作 &rarr;' },
    
    // Sub-Navigation for Tever Sanat
    'nav.main_site': { en: 'Main Site', tr: 'Ana Site', de: 'Hauptseite', fr: 'Site Principal', 'ar-gcc': 'الموقع الرئيسي', fa: 'سایت اصلی', es: 'Sitio Principal', it: 'Sito Principale', 'zh-cn': '主站' },
    'nav.sanat_hub': { en: 'Sanat Hub', tr: 'Sanat Hub', de: 'Kunst Hub', fr: "Hub d'Art", 'ar-gcc': 'مركز الفنون', fa: 'مرکز هنر', es: 'Centro de Arte', it: "Centro d'Arte", 'zh-cn': '艺术中心' },
    'nav.gallery': { en: 'Gallery', tr: 'Galeri', de: 'Galerie', fr: 'Galerie', 'ar-gcc': 'المعرض', fa: 'گالری', es: 'Galería', it: 'Galleria', 'zh-cn': '画廊' },
    'nav.apply': { en: 'Apply', tr: 'Başvuru', de: 'Bewerben', fr: 'Candidater', 'ar-gcc': 'تقديم الطلب', fa: 'درخواست', es: 'Solicitar', it: 'Candidati', 'zh-cn': '申请' },
    
    // Tever Sanat Hub
    'sanat.hero.subtitle': { en: 'Est. 2024', tr: 'Kur. 2024', de: 'Gegr. 2024', fr: 'Fondée 2024', 'ar-gcc': 'تأسست 2024', fa: 'تاسیس ۲۰۲۴' },
    'sanat.hero.title': { en: 'From Raw Material<br>to Artistic Language.', tr: 'Ham Maddeden<br>Sanatsal İfadeye.', de: 'Vom Rohstoff<br>zur künstlerischen Sprache.', fr: 'De la matière brute<br>au langage artistique.', 'ar-gcc': 'من المادة الخام<br>إلى اللغة الفنية.', fa: 'از ماده خام<br>تا زبان هنری.' },
    'sanat.hero.desc': { en: 'Tever Sanat is the cultural division of Tever Forest Products. We exist to support sculptors, curate exceptional wood art, and build a bridge between B2B industrial expertise and creative expression.', tr: "Tever Sanat, Tever Orman Mamülleri'nin kültürel koludur. Heykeltıraşları desteklemek, özel ahşap sanat eserlerini sergilemek ve endüstriyel uzmanlık ile yaratıcı ifade arasında bir köprü kurmak için varız.", de: 'Tever Sanat ist die Kulturabteilung von Tever Forstprodukte. Wir unterstützen Bildhauer, kuratieren außergewöhnliche Holzkunst und schlagen eine Brücke zwischen industrieller Kompetenz und kreativem Ausdruck.', fr: "Tever Sanat est la division culturelle de Tever Forest Products. Nous existons durables pour soutenir les sculpteurs, conserver l'art exceptionnel du bois et jeter un pont entre le savoir-faire industriel et l'expression créative.", 'ar-gcc': 'تيفير للفنون هو القسم الثقافي لشركة تيفر للمنتجات الحرجية. نحن موجودون لدعم النحاتين، وتقييم فن الخشب الاستثنائي، وبناء جسر بين الخبرة الصناعية والتعبير الإبداعي.', fa: 'تور هنر بخش فرهنگی محصولات جنگلی تور است. ما برای حمایت از مجسمه‌سازان، نمایش هنرهای چوبی استثنایی و ایجاد پلی بین تخصص صنعتی ve بیان خلاقانه فعالیت می‌کنیم.' },
    'sanat.section.artists.title': { en: 'For Artists', tr: 'Sanatçılar İçin', de: 'Für Künstler', fr: 'Pour les artistes', 'ar-gcc': 'للفنانين', fa: 'برای هنرمندان' },
    'sanat.section.artists.desc': { en: 'We provide high-quality veneer and plywood materials to selected artists, enabling them to push the boundaries of their craft.', tr: 'Seçilen sanatçılara yüksek kaliteli kaplama ve kontrplak malzemeleri sağlayarak zanaatlarının sınırlarını zorlamalarına olanak tanıyoruz.', de: 'Wir stellen ausgewählten Künstlern hochwertige Furnier- und Sperrholzmaterialien zur Verfügung, damit sie die Grenzen ihres Handwerks erweitern können.', fr: 'Nous fournissons des placages et contreplaqués de haute qualité aux artistes sélectionnés, leur permettant de repousser les limites de leur art.', 'ar-gcc': 'نحن نوفر قشرة خشبية وخشب رقائقي عالي الجودة لفنانين مختارين, مما يمكنهم من تجاوز حدود حرفتهم.', fa: 'ما مواد روکش ve تخته سه‌لا با کیفیت بالا را برای هنرمندان منتخب فراهم می‌کنیم و آن‌ها را قادر می‌سازیم تا مرزهای هنر خود را گسترش دهند.' },
    'sanat.section.artists.btn': { en: 'Artist Program', tr: 'Sanatçı Programı', de: 'Künstlerprogramm', fr: "Programme d'Artiste", 'ar-gcc': 'برنامج الفنانين', fa: 'برنامه هنرمندان' },
    'sanat.section.collectors.title': { en: 'For Collectors', tr: 'Koleksiyonerler İçin', de: 'Für Sammler', fr: 'Pour les collectionneurs', 'ar-gcc': 'لجامعي الفنون', fa: 'برای مجموعه داران' },
    'sanat.section.collectors.desc': { en: 'A curated selection of wood sculptures and mixed-media works available for acquisition through our platform.', tr: 'Platformumuz aracılığıyla edinilebilecek ahşap heykeller ve karma teknik çalışmalarından oluşan küratörlü bir seçki.', de: 'Eine kuratierte Auswahl an Holzskulpturen und Mixed-Media-Werken, die über unsere Plattform erworben werden können.', fr: "Une sélection d'œuvres d'art en bois et de techniques mixtes disponibles à l'acquisition via notre plateforme.", 'ar-gcc': 'مجموعة مختارة من المنحوتات الخشبية والأعمال الفنية المتنوعة المتاحة للاقتناء من خلال منصتنا.', fa: 'مجموعه‌ای انتخاب شده از مجسمه‌های چوبی ve آثار هنری ترکیبی برای خرید از طریق پلتفرم ما.' },
    'sanat.section.collectors.btn': { en: 'View Collection', tr: 'Koleksiyonu Görüntüle', de: 'Sammlung ansehen', fr: 'Voir la Collection', 'ar-gcc': 'عرض المجموعة', fa: 'مشاهده مجموعه' },
    'sanat.section.institutions.title': { en: 'For Institutions', tr: 'Kurumlar İçin', de: 'Für Institutionen', fr: 'Pour les institutions', 'ar-gcc': 'للمؤسسات', fa: 'برای موسسات' },
    'sanat.section.institutions.desc': { en: 'We collaborate with museums and galleries on exhibitions, providing material sponsorship and curatorial support.', tr: 'Müzeler ve galerilerle sergilerde iş birliği yapıyor, malzeme sponsorluğu ve küratöryel destek sağlıyoruz.', de: 'Wir arbeiten mit Museen und Galerien bei Ausstellungen zusammen und bieten Materialsponsoring und kuratorische Unterstützung.', fr: 'Nous collaborons avec des musées et des galeries sur des expositions, en fournissant un parrainage matériel et un soutien curatorial.', 'ar-gcc': 'نحن نتعاون مع المتاحف والمعارض في المعارض، ونقدم رعاية المواد والدعم التقييمي.', fa: 'ما با موزه‌ها و گالری‌ها در برگزاری نمایشگاه‌ها همکاری می‌کنیم و حمایت مادی ve هنری ارائه می‌دهیم.' },
    'sanat.section.institutions.btn': { en: 'Partner With Us', tr: 'Bizimle Ortak Olun', de: 'Partner werden', fr: 'Devenir Partenaire', 'ar-gcc': 'شريك معنا', fa: 'شریک ما شوید' },
    
    // Tever Sanat Gallery
    'gallery.title': { en: 'Curated Works', tr: 'Küratörlü Eserler', de: 'Kuratierte Werke', fr: 'Œuvres Sélectionnées', 'ar-gcc': 'الأعمال المختارة', fa: 'آثار برگزیده' },
    'gallery.item1.desc': { en: 'Birch Plywood & Steel', tr: 'Huş Kontrplak & Çelik', de: 'Birken-Sperrholz & Stahl', fr: 'Contreplaqué de bouleau & Acier', 'ar-gcc': 'خشب رقائقي وقرميد', fa: 'تخته سه لا توس ve فولاد' },
    'gallery.item2.desc': { en: 'Steam-bent Poplar', tr: 'Buharla Bükülmüş Kavak', de: 'Dampfgebogene Pappel', fr: 'Peuplier cintré à la vapeur', 'ar-gcc': 'حور مطوي بالبخار', fa: 'صنوبر خم شده با بخار' },
    'gallery.item3.desc': { en: 'Walnut Root Veneer', tr: 'Ceviz Kökü Kaplama', de: 'Walnusswurzel-Furnier', fr: 'Placage de loupe de noyer', 'ar-gcc': 'قشرة جذر الجوز', fa: 'روکش ریشه گردو' },
    'gallery.acquisitions.title': { en: 'Acquisitions', tr: 'Eser Alımı', de: 'Erwerbungen', fr: 'Acquisitions', 'ar-gcc': 'اقتناء الأعمال', fa: 'خرید آثار' },
    'gallery.acquisitions.desc': { en: 'For price lists and acquisition inquiries, please contact our art director.', tr: 'Fiyat listeleri ve satın alma talepleri için lütfen sanat direktörümüzle iletişime geçin.', de: 'Für Preislisten und Erwerbsanfragen wenden Sie sich bitte an unseren Artdirector.', fr: "Pour les listes de prix et les demandes d'acquisition, veuillez contacter notre directeur artistique.", 'ar-gcc': 'للحصول على قوائم الأسعار واستفسارات الاقتناء، يرجى الاتصال بمدير الفنون لدينا.', fa: 'برای دریافت لیست قیمت‌ها ve درخواست خرید، لطفا با مدیر هنری ما تماس بگیرید.' },
    'gallery.acquisitions.btn': { en: 'Inquire', tr: 'Bilgi Alın', de: 'Anfragen', fr: "S'informer", 'ar-gcc': 'استفسار', fa: 'استعلام' },
    
    // Tever Sanat Apply
    'apply.hero.subtitle': { en: 'Open Call 2026', tr: 'Açık Çağrı 2026', de: 'Ausschreibung 2026', fr: 'Appel à Candidatures 2026', 'ar-gcc': 'دعوة مفتوحة 2026', fa: 'فراخوان عمومی ۲۰۲۶' },
    'apply.hero.title': { en: 'Artist Support Program', tr: 'Sanatçı Destek Programı', de: 'Künstler-Support-Programm', fr: 'Programme de Soutien aux Artistes', 'ar-gcc': 'برنامج دعم الفنانين', fa: 'برنامه حمایت از هنرمندان' },
    'apply.hero.desc': { en: 'We select 5 artists every quarter to receive material sponsorship (Plywood/Veneer) and a featured exhibition on Tever Sanat.', tr: "Her çeyrekte 5 sanatçıyı malzeme sponsorluğu (Kontrplak/Kaplama) ve Tever Sanat'ta özel bir sergi açmak üzere seçiyoruz.", de: 'Wir wählen jedes Quartal 5 Künstler aus, die Materialsponsoring (Sperrholz/Furnier) und eine Einzelausstellung auf Tever Sanat erhalten.', fr: "Nous sélectionnons 5 artistes chaque trimestre pour bénéficier d'un parrainage matériel (Contreplaqué/Placage) et d'une exposition sur Tever Sanat.", 'ar-gcc': 'نختار 5 فنانين كل ربع سنة للحصول على رعاية المواد (الخشب الرقائقي / القشرة) ومعرض مميز على منصة تيفير للفنون.', fa: 'ما در هر فصل ۵ هنرمند را برای دریافت حمایت مادی (تخته سه‌لا/روکش) ve برپایی نمایشگاه اختصاصی در تور هنر انتخاب می‌کنیم.' },
    'apply.provide.title': { en: 'What We Provide', tr: 'Neler Sağlıyoruz', de: 'Was wir bieten', fr: 'Ce que nous offrons', 'ar-gcc': 'ما نقدمه', fa: 'خدمات ما' },
    'apply.provide.item1': { en: 'Premium Materials (up to 50 sheets)', tr: 'Birinci Sınıf Malzeme (50 plakaya kadar)', de: 'Premium-Materialien (bis zu 50 Platten)', fr: "Matériaux Premium (jusqu'à 50 plaques)", 'ar-gcc': 'مواد ممتازة (حتى 50 لوحًا)', fa: 'مواد اولیه با کیفیت (تا ۵۰ ورق)' },
    'apply.provide.item2': { en: 'Logistics Support', tr: 'Lojistik Desteği', de: 'Logistikunterstützung', fr: 'Soutien logistique', 'ar-gcc': 'الدعم اللوجستي', fa: 'پشتیبانی لجستیکی' },
    'apply.provide.item3': { en: 'Digital Exhibition', tr: 'Dijital Sergi', de: 'Digitale Ausstellung', fr: 'Exposition numérique', 'ar-gcc': 'معرض رقمي', fa: 'نمایشگاه دیجیتال' },
    'apply.provide.item4': { en: 'Sales Representation', tr: 'Satış Temsilciliği', de: 'Verkaufsvertretung', fr: 'Représentation commerciale', 'ar-gcc': 'تمثيل المبيعات', fa: 'نمایندگی فروش' },
    'apply.lookfor.title': { en: 'We Are Looking For', tr: 'Aradığımız Nitelikler', de: 'Wir suchen', fr: 'Ce que nous recherchons', 'ar-gcc': 'ما نبحث عنه', fa: 'شرایط پذیرش' },
    'apply.lookfor.item1': { en: 'Sculptural / 3D Work', tr: 'Heykel / 3D Çalışmalar', de: 'Bildhauerische / 3D-Arbeiten', fr: 'Œuvre sculpturale / 3D', 'ar-gcc': 'أعمال نحتية / ثلاثية الأبعاد', fa: 'مجسمه‌سازی / آثار سه بعدی' },
    'apply.lookfor.item2': { en: 'Sustainable Practice', tr: 'Sürdürülebilir Pratikler', de: 'Nachhaltige Praxis', fr: 'Pratique durable', 'ar-gcc': 'ممارسات مستدامة', fa: 'فعالیت‌های پایدار' },
    'apply.lookfor.item3': { en: 'Professional Portfolio', tr: 'Profesyonel Portfolyo', de: 'Professionelles Portfolio', fr: 'Portfolio professionnel', 'ar-gcc': 'ملف أعمال احترافي', fa: 'نمونه کار حرفه‌ای' },
    'apply.submit.title': { en: 'Submit Your Portfolio', tr: 'Portfolyonuzu Gönderin', de: 'Reichen Sie Ihr Portfolio ein', fr: 'Soumettez votre Portfolio', 'ar-gcc': 'قدم ملف أعمالك', fa: 'ارسال نمونه کارها' },
    'apply.submit.desc': { en: 'Please include a CV, 10 images of recent work, and a brief statement about how you would use wood materials.', tr: 'Lütfen bir özgeçmiş, son çalışmalarınızdan 10 görsel ve ahşap malzemeleri nasıl kullanacağınıza dair kısa bir açıklama ekleyin.', de: 'Bitte fügen Sie einen Lebenslauf, 10 Bilder aktueller Arbeiten und eine kurze Erklärung hinzu, wie Sie Holzmaterialien verwenden würden.', fr: "Veuillez inclure un CV, 10 images d'œuvres récentes et une brève déclaration sur la façon choisie pour utiliser les matériaux en bois.", 'ar-gcc': 'يرجى إرفاق سيرة ذاتية و 10 صور لأعمالك الأخيرة وبيان موجز حول كيفية استخدام المواد الخشبية.', fa: 'لطفا یک رزومه، ۱۰ تصویر از آثار اخیر و توضیح کوتاهی درباره نحوه استفاده از چوب ارسال کنید.' },
    'apply.submit.btn': { en: 'Email Application', tr: 'E-Posta ile Başvur', de: 'Bewerbung per E-Mail', fr: 'Postuler par E-mail', 'ar-gcc': 'تقديم الطلب بالبريد', fa: 'درخواست از طریق ایمیل' },
    
    // Product Specs values
    'spec.species_values': { en: 'Oak, Beech, Ash, Poplar', tr: 'Meşe, Kayın, Dişbudak, Kavak', de: 'Eiche, Buche, Esche, Pappel', fr: 'Chêne, Hêtre, Frêne, Peuplier', 'ar-gcc': 'البلوط، الزان، الرماد، الحور', fa: 'بلوط، راش، زبان گنجشک، صنوبر' },
    'spec.drying_values': { en: 'Kiln Dried (KD) 8-10%', tr: 'Fırınlanmış (KD) %8-10', de: 'Kammertrocken (KD) 8-10%', fr: 'Séché au séchoir (KD) 8-10%', 'ar-gcc': 'مجفف في الفرن (KD) 8-10%', fa: 'خشک‌کن کوره (KD) %8-10' },
    'spec.grade_values': { en: 'Prime, FAS, Comsel', tr: 'Birinci Sınıf, FAS, Comsel', de: 'Prime, FAS, Comsel', fr: 'Prime, FAS, Comsel', 'ar-gcc': 'درجة ممتازة، FAS، كومسيل', fa: 'درجه یک، FAS، کامسل' },
    'spec.origin_values': { en: 'Europe / North America', tr: 'Avrupa / Kuzey Amerika', de: 'Europa / Nordamerika', fr: 'Europe / Amérique du Nord', 'ar-gcc': 'أوروبا / أمريكا الشمالية', fa: 'اروپا / آمریکای شمالی' },
    'spec.packaging.steel': { en: 'Steel Strapping', tr: 'Çelik Çemberleme', de: 'Stahlbandumreifung', fr: "Feuillard d'acier", 'ar-gcc': 'تغليف فولاذي', fa: 'تسمه کشی فلزی' },
    'spec.packaging.steel_desc': { en: 'All pallets are secured with high-tensile steel straps.', tr: 'Tüm paletler yüksek mukavemetli çelik çemberlerle emniyete alınmıştır.', de: 'Alle Paletten sind mit hochfesten Stahlbändern gesichert.', fr: "Toutes les palettes sont sécurisées par des feuillards d'acier haute résistance.", 'ar-gcc': 'جميع المنصات مؤمنة بأحزمة فولاذية عالية الشد.', fa: 'تمامی پالت‌ها با تسمه‌های فلزی با مقاومت بالا محکم شده‌اند.' },
    'spec.packaging.corner': { en: 'Corner Protection', tr: 'Köşe Koruma', de: 'Kantenschutz', fr: 'Protection des angles', 'ar-gcc': 'حماية الزوايا', fa: 'محافظ گوشه' },
    'spec.packaging.corner_desc': { en: 'Hard cardboard or plastic corners on all edges.', tr: 'Tüm kenarlarda sert karton veya plastik köşebentler.', de: 'Hartpappe- oder Kunststoffecken an allen Kanten.', fr: 'Angles en carton rigide ou en plastique sur tous los bords.', 'ar-gcc': 'زوايا كرتونية صلبة أو بلاستيكية على جميع الحواف.', fa: 'محافظ‌های پلاستیکی یا کارتن‌های سخت در تمام لبه‌ها.' },
    'spec.packaging.moisture': { en: 'Moisture Barrier', tr: 'Nem Bariyeri', de: 'Feuchtigkeitssperre', fr: "Barrière d'humidité", 'ar-gcc': 'حاجز رطوبة', fa: 'عایق رطوبت' },
    'spec.packaging.moisture_desc': { en: 'PE film wrapping to prevent moisture ingress during sea transit.', tr: 'Deniz nakliyesi sırasında nem girişini önlemek için PE film sarımı.', de: 'PE-Folienumwicklung zur Vermeidung von Feuchtigkeitseintritt beim Seetransport.', fr: "Emballage sous film PE pour éviter la pénétration d'humidité pendant le transport maritime.", 'ar-gcc': 'تغليف بغشاء PE لمنع دخول الرطوبة أثناء النقل البحري.', fa: 'سلفون کشی PE برای جلوگیری از ورود رطوبت به پالت در طول حمل و نقل دریایی.' },

    // Navigation
    'nav.home': { en: 'Home', tr: 'Ana Sayfa', fa: 'خانه', 'ar-gcc': 'الرئيسية', 'ar-eg': 'الرئيسية', de: 'Startseite', fr: 'Accueil', es: 'Inicio', it: 'Home', 'zh-cn': '首页' },
    'nav.products': { en: 'Products', tr: 'Ürünler', fa: 'محصولات', 'ar-gcc': 'منتجات', 'ar-eg': 'منتجات', de: 'Produkte', fr: 'Produits', es: 'Productos', it: 'Prodotti', 'zh-cn': '产品' },
    'nav.prices': { en: 'Price List', tr: 'Fiyat Listesi', de: 'Preisliste', fr: 'Liste des prix', es: 'Lista de precios', it: 'Listino prezzi', 'zh-cn': '价格表' },
    'nav.lumber': { en: 'Lumber', tr: 'Kereste', fa: 'الوار', 'ar-gcc': 'الأخشاب', 'ar-eg': 'الأخشاب', de: 'Schnittholz', fr: 'Bois', es: 'Madera', it: 'Legname', 'zh-cn': '木材' },
    'nav.about': { en: 'Our Heritage', tr: 'Mirasımız', fa: 'درباره ما', 'ar-gcc': 'تراثنا', 'ar-eg': 'تراثنا', de: 'Unser Erbe', fr: 'Notre Héritage', es: 'Nuestra Herencia', it: 'La Nostra Eredità', 'zh-cn': '我们的遗产' },
    'nav.sanat': { en: 'Tever Sanat', tr: 'Tever Sanat', fa: 'تور هنر', 'ar-gcc': 'تيفير للفنون', 'ar-eg': 'تيفير للفنون', de: 'Tever Kunst', fr: 'Tever Art', es: 'Tever Arte', it: 'Tever Arte', 'zh-cn': 'Tever 艺术' },
    'nav.contact': { en: 'Contact', tr: 'İletişim', fa: 'تماس', 'ar-gcc': 'اتصل بنا', 'ar-eg': 'اتصل بنا', de: 'Kontakt', fr: 'Contact', es: 'Contacto', it: 'Contatti', 'zh-cn': '联系' },

    // Hero & General
    'hero.title': {
        en: 'Forest Products Supplier for Global Industry.<br>Your Partner in Wood Trade.',
        tr: 'Tüm Ahşap Endüstrisi Tedarikçisi.<br>Global Sanayi için Orman Ürünleri.',
        fa: 'تامین کننده محصولات جنگلی برای صنعت جهانی.<br>برای تمامی صنایع چوبی.',
        'ar-gcc': 'المورد العالمي للمنتجات الحرجية.<br>المورد لجميع صناعات الأخشاب.',
        de: 'Forstprodukte-Lieferant für die globale Industrie.<br>Ihr Partner im Holzhandel.',
        fr: 'Fournisseur de produits forestiers pour l\'industrie mondiale.<br>Votre partenaire dans le commerce du bois.'
    },
    'hero.subtitle': { en: '100+ Years of Material Expertise', tr: '100+ Yıllık Malzeme Uzmanlığı', fa: 'بیش از ۱۰۰ سال تخصص در مواد', 'ar-gcc': 'أكثر من 100 عام من الخبرة في المواد', de: 'Mehr als 100 Jahre Materialexpertise', fr: 'Plus de 100 ans d\'expertise matérielle' },
    'hero.lead': {
        en: 'Building on 100+ years of manufacturing roots, we determine the best global sources. Supplying Plywood, Lumber, OSB & Veneer worldwide.',
        tr: '100 yılı aşkın üretim kökleri üzerine inşa edilen deneyimimizle küresel pazardaki en iyi kaynakları belirliyoruz. Dünya genelinde Kontrplak, Kereste, OSB ve Kaplama tedariki yapıyoruz.',
        de: 'Aufbauend auf über 100 Jahren Produktionserfahrung wählen wir die besten globalen Quellen aus. Sperrholz, Schnittholz, OSB & Furnier weltweit.',
        fr: 'Forts de plus de 100 ans de savoir-faire, nous sélectionnons les meilleures sources mondiales. Contreplaqué, Bois, OSB & Placage partout dans le monde.',
        'ar-gcc': 'بناءً على أكثر من 100 عام من جذور التصنيع، نحدد أفضل المصادر العالمية. نوريد الخشب الرقائقي والأخشاب واللوح والقشرة في جميع أنحاء العالم.',
        fa: 'با تکیه بر بیش از ۱۰۰ سال سابقه تولیدی، بهترین منابع جهانی را شناسایی می‌کنیم. عرضه تخته سه‌لا، الوار، OSB و روکش در سراسر جهان.'
    },
    'brief.eyebrow': { en: 'One Brand, Two Worlds', tr: 'Tek Marka, İki Dünya', de: 'Eine Marke, Zwei Welten', fr: 'Une Marque, Deux Mondes', 'ar-gcc': 'علامة واحدة، عالمان', fa: 'یک برند، دو دنیا' },
    'brief.title': { en: 'Connected by Material Knowledge', tr: 'Malzeme Bilgisiyle Bağlı', de: 'Durch Materialwissen verbunden', fr: 'Connectés par la connaissance du matériau', 'ar-gcc': 'متصلون بمعرفة المواد', fa: 'متصل از طریق دانش مواد' },
    'brief.text': {
        en: 'For more than a century, our family has worked with wood. This deep expertise allows us to understand the material\'s structural limits for industry, and its expressive potential for art.',
        tr: 'Bir asrı aşkın süredir ailemiz ahşapla çalışmaktadır. Bu derin uzmanlık, malzemenin endüstri için yapısal sınırlarını ve sanat için ifade potansiyelini anlamamızı sağlar.',
        de: 'Seit mehr als einem Jahrhundert arbeitet unsere Familie mit Holz. Dieses tiefe Fachwissen ermöglicht es uns, die strukturellen Grenzen des Materials für die Industrie und sein Ausdruckspotenzial für die Kunst zu verstehen.',
        fr: 'Depuis plus d\'un siècle, notre famille travaille le bois. Cette expertise profonde nous permet de comprendre les limites structurelles du matériau pour l\'industrie et son potentiel expressif pour l\'art.',
        'ar-gcc': 'لأكثر من قرن، عملت عائلتنا مع الخشب. تتيح لنا هذه الخبرة العميقة فهم الحدود الهيكلية للمادة في الصناعة وإمكاناتها التعبيرية في الفن.',
        fa: 'برای بیش از یک قرن، خانواده ما با چوب کار کرده است. این تخصص عمیق به ما امکان می‌دهد محدودیت‌های ساختاری مواد را برای صنعت و پتانسیل بیانی آن را برای هنر درک کنیم.'
    },

    'btn.industrial': { en: 'Industrial Products', tr: 'Endüstriyel Ürünler', fa: 'محصولات صنعتی', 'ar-gcc': 'المنتجات الصناعية' },
    'btn.sanat': { en: 'Explore Tever Sanat', tr: 'Tever Sanat\'ı Keşfet', fa: 'کاوش در تور هنر', 'ar-gcc': 'استكشف تيفير للفنون' },
    'btn.quote': { en: 'Request Quote', tr: 'Teklif İste', fa: 'درخواست قیمت', 'ar-gcc': 'طلب عرض سعر' },

    // Catalog & Products
    'catalog.title': { en: 'Forest Products Catalog<br>(Plywood, OSB, MDF, Lumber)', tr: 'Orman Ürünleri Kataloğu<br>(Kontrplak, Kereste, OSB, MDF)' },
    'catalog.subtitle': { en: 'Premium grade Birch/Poplar Plywood, Lumber, and Boards for global industry.', tr: 'Küresel endüstri için premium Huş/Kavak Kontrplak, Kereste ve Levhalar.' },

    // OSB & MDF
    'product.osb.title': { en: 'OSB & MDF', tr: 'OSB & MDF Levha', fa: 'OSB و MDF', 'ar-gcc': 'OSB و MDF' },
    'product.osb.subtitle': { en: 'Engineered Boards', tr: 'Endüstriyel Levhalar' },
    'product.osb.desc': {
        en: 'Versatile structural panels for roofing, wall sheathing, and furniture manufacturing. <strong>OSB-3</strong> and <strong>MDF/HDF</strong> available.',
        tr: 'Çatı kaplama, duvar giydirme ve mobilya üretimi için çok yönlü yapısal paneller. <strong>OSB-3</strong> (Nem Dirençli) ve <strong>MDF/HDF</strong> stoklarımızda.'
    },

    // Marine
    'product.marine.title': { en: 'Film-Faced Plywood (Marine) & H20 Beams', tr: 'Filmli Plywood (Marine Kontraplak) & H20 Kiriş', fa: 'تخته سه لا دریایی', 'ar-gcc': 'الخشب الرقائقي البحري' },
    'product.marine.subtitle': { en: 'Water Resistant / Film-Faced', tr: 'Suya Dayanıklı / Filmli' },
    'product.marine.desc': {
        en: 'High-performance <strong>Film-Faced Plywood</strong> (Marine Plywood) and <strong>H20 Wooden Beams</strong> for heavy-duty concrete formwork and construction.',
        tr: 'Ağır hizmet tipi beton kalıpları ve inşaat için yüksek performanslı <strong>Filmli Plywood</strong> (Marine Kontraplak) ve <strong>H20 Ahşap Kirişler</strong>.'
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
    'footer.connect': { en: 'Connect', tr: 'İletişim', fa: 'ارتباط', 'ar-gcc': 'تواصل', de: 'Kontakt', fr: 'Contact', es: 'Contacto', it: 'Contatti', 'zh-cn': '联系我们' },

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
    'contact.whatsapp_hint': { en: 'Need a faster response? Use the WhatsApp button.', tr: 'Daha hızlı yanıt için WhatsApp butonunu kullanın.' },

    // Prices Page
    'prices.title': { en: 'Birch Plywood & Film-Faced Plywood Price List', tr: 'Huş Kontrplak & Filmli Kontrplak Fiyat Listesi' },
    'prices.subtitle': { en: 'Wholesale and Retail Price Catalog — 2026', tr: 'Toptan ve Perakende Satış Fiyat Kataloğu — 2026' },
    'prices.doc_meta': { en: 'Document No: TO-2026/FL-01 | Issue Date: 09.06.2026', tr: 'Doküman No: TO-2026/FL-01 | Yayın Tarihi: 09.06.2026' },
    'prices.download_text': { en: 'You can download the price list as a PDF to your computer or phone.', tr: 'Fiyat listesini bilgisayarınıza veya telefonunuza PDF olarak indirebilirsiniz.' },
    'prices.download_btn': { en: 'Download PDF Price List', tr: 'Fiyat Listesini PDF Olarak İndir' },
    'prices.film_faced_title': { en: 'Film-Faced Plywood (Filmli Ürünler)', tr: 'Filmli Ürünler (Film-Faced Plywood)' },
    'prices.film_faced_desc': {
        en: 'For our film-faced plywood products, premium 120 g/m² surfactor proTEG 427 phenolic film is used to ensure high wear resistance and a smooth concrete surface finish in formwork applications.',
        tr: 'Filmli kontrplak ürünlerimizin yüzeyinde, beton kalıplarında yüksek aşınma direnci ve pürüzsüz yüzey kalitesi elde etmek amacıyla 120 g/m² surfactor proTEG 427 fenolik film kullanılmaktadır.'
    },
    'prices.plywood_title': { en: 'Birch Plywood Products (Kontrplak Ürünler)', tr: 'Kontrplak Ürünler (Birch Plywood)' },
    'prices.table_thick': { en: 'Thickness', tr: 'Kalınlık' },
    'prices.table_thick_mm': { en: 'THICKNESS (mm)', tr: 'KALINLIK (mm)' },
    'prices.table_width_mm': { en: 'WIDTH (mm)', tr: 'EN (mm)' },
    'prices.table_length_mm': { en: 'LENGTH (mm)', tr: 'BOY (mm)' },
    'prices.table_wholesale': { en: 'WHOLESALE PRICE', tr: 'TOPTAN SATIŞ FİYATI' },
    'prices.table_retail': { en: 'RETAIL PRICE', tr: 'PERAKENDE SATIŞ FİYATI' },
    'prices.table_m3_price': { en: 'm³ PRICE', tr: 'm³ SATIŞ FİYATI' },
    'prices.table_adet_price': { en: 'SHEET PRICE', tr: 'ADET SATIŞ FİYATI' },
    'prices.quality_bb': { en: 'BB/BB GRADE', tr: 'KALİTE BB/BB' },
    'prices.quality_bbb': { en: 'B/BB GRADE', tr: 'KALİTE B/BB' },
    'prices.quality_bb_b': { en: 'B/B GRADE', tr: 'KALİTE B/B' },
    'prices.m3_fiyat': { en: 'm³ Price', tr: 'm³ Fiyatı' },
    'prices.adet_fiyat': { en: 'Sheet Price', tr: 'Adet Fiyatı' },
    'prices.table_swipe_hint': { en: '➔ Swipe horizontally to view all columns', tr: '➔ Tüm sütunları görmek için tabloyu sağa/sola kaydırabilirsiniz.' },
    'prices.terms_title': { en: 'Commercial Terms', tr: 'Ticari Şartlar' },
    'prices.incoterms_label': { en: 'Incoterms:', tr: 'Teslim Şekli:' },
    'prices.currency_label': { en: 'Currency:', tr: 'Para Birimi:' },
    'prices.moq_label': { en: 'MOQ:', tr: 'Minimum Sipariş (MOQ):' },
    'prices.payment_label': { en: 'Payment Terms:', tr: 'Ödeme Şartı:' },
    'prices.lead_label': { en: 'Lead Time:', tr: 'Teslim Süresi:' },
    'prices.validity_label': { en: 'Validity:', tr: 'Geçerlilik:' },
    'prices.bank_title': { en: 'Bank Account Details (IBAN)', tr: 'Banka Hesap Bilgileri (IBAN)' },
    'prices.bank_beneficiary_label': { en: 'Beneficiary:', tr: 'Alıcı / Ünvan:' },
    'prices.bank_eur_label': { en: 'EUR IBAN:', tr: 'EUR IBAN:' },
    'prices.bank_tl_label': { en: 'TL IBAN:', tr: 'TL IBAN:' },
    'prices.bank_usd_label': { en: 'USD IBAN:', tr: 'USD IBAN:' },
    'prices.bank_notice': { en: '* Please state the invoice number in the payment description.', tr: '* Lütfen ödeme açıklamalarında fatura numaranızı belirtiniz.' },
    'prices.incoterms_val': {
        en: '<strong>Delivery Terms:</strong> Prices are Sakarya Factory delivery prices (Ex Works)',
        tr: '<strong>Teslim Şekli:</strong> Fiyatlarımız Sakarya Fabrika teslim fiyatlarıdır.'
    },
    'prices.moq_val': {
        en: '<strong>Wholesale MOQ:</strong> Our wholesale prices are valid for minimum orders of 300 m³ and above.',
        tr: '<strong>Toptan Minimum Sipariş:</strong> Toptan satış fiyatlarımız minimum 300 m³ ve üzeri siparişler için geçerlidir.'
    },
    'prices.currency_val': {
        en: '<strong>Currency:</strong> EUR (Payments made with the order are calculated and processed based on the Central Bank of the Republic of Turkey (CBRT) Effective Selling Rate)',
        tr: '<strong>Para Birimi:</strong> EUR (Sipariş ile birlikte yapılacak ödemeler, Türkiye Cumhuriyet Merkez Bankası (TCMB) Efektif Satış Kuru üzerinden hesap edilerek gerçekleştirilir)'
    },
    'prices.sheets_val': {
        en: '<strong>Approx. Sheets per m³ (1250x2500 mm):</strong> 3mm: 106 Sheets | 4mm: 80 Sheets | 6.5mm: 49 Sheets | 9mm: 35 Sheets | 12mm: 26 Sheets | 15mm: 21 Sheets | 18mm: 17 Sheets | 21mm: 15 Sheets | 24mm: 13 Sheets | 27mm: 11 Sheets | 30mm: 10 Sheets | 35mm: 9 Sheets | 40mm: 8 Sheets | 45mm: 7 Sheets | 50mm: 6 Sheets',
        tr: '<strong>1 m³ Plaka Adetleri (1250x2500 mm):</strong> 3mm: 106 Adet | 4mm: 80 Adet | 6.5mm: 49 Adet | 9mm: 35 Adet | 12mm: 26 Adet | 15mm: 21 Adet | 18mm: 17 Adet | 21mm: 15 Adet | 24mm: 13 Adet | 27mm: 11 Adet | 30mm: 10 Adet | 35mm: 9 Adet | 40mm: 8 Adet | 45mm: 7 Adet | 50mm: 6 Adet'
    },
    'prices.payment_val': {
        en: '<strong>Payment Terms:</strong> Determined at the time of order.',
        tr: '<strong>Ödeme Şartı:</strong> Sipariş esnasında belirlenir.'
    },
    'prices.lead_val': {
        en: '<strong>Lead Time:</strong> 2-4 weeks from order confirmation.',
        tr: '<strong>Teslim Süresi:</strong> Sipariş onayından itibaren 2-4 hafta.'
    },
    'prices.validity_val': {
        en: '<strong>Validity:</strong> Valid for 30 days from the offer date.',
        tr: '<strong>Geçerlilik:</strong> Teklif tarihinden itibaren 30 gün geçerlidir.'
    },

    // Footer Legal
    'contact.legal_title': { en: 'Tever Orman Mamülleri', tr: 'Tever Orman Mamülleri', de: 'Tever Orman Mamülleri', fr: 'Tever Orman Mamülleri', 'ar-gcc': 'تيفر أورمان', fa: 'تور اورمان' },
    'contact.legal_suffix': { en: 'Forest Products Inc.', tr: 'Sanayi ve Ticaret A.Ş.', de: 'Forstprodukte GmbH', fr: 'Industries Forestières SA', 'ar-gcc': 'للمنتجات الحرجية', fa: 'محصولات جنگلی' },

    // Contact Page
    'contact.title': { en: 'Contact Us', tr: 'Bize Ulaşın', de: 'Kontakt', fr: 'Contactez-nous', 'ar-gcc': 'اتصل بنا', fa: 'تماس با ما', es: 'Contáctenos', it: 'Contattaci', 'zh-cn': '联系我们' },
    'contact.subtitle': { en: 'Our team is ready to assist you with product inquiries, pricing and partnerships.', tr: 'Ürün soruları, fiyatlandırma ve ortaklıklar için ekibimiz size yardımcı olmaya hazır.', de: 'Unser Team steht Ihnen für Produktanfragen, Preise und Partnerschaften zur Verfügung.', fr: 'Notre équipe est prête à vous aider pour les demandes de produits, les prix et les partenariats.' },
    'contact.desc': { en: 'For inquiries, quotes or partnerships, fill in the form or reach us directly:', tr: 'Sorularınız, teklifleriniz veya ortaklık talepleriniz için formu doldurun ya da direkt bize ulaşın:', de: 'Für Anfragen, Angebote oder Partnerschaften füllen Sie das Formular aus oder kontaktieren Sie uns direkt:', fr: 'Pour les demandes, devis ou partenariats, remplissez le formulaire ou contactez-nous directement:' },
    'contact.address': { en: 'Address', tr: 'Adres', de: 'Adresse', fr: 'Adresse', 'ar-gcc': 'العنوان', fa: 'آدرس', es: 'Dirección', it: 'Indirizzo', 'zh-cn': '地址' },
    'contact.phone': { en: 'Phone / WhatsApp', tr: 'Telefon / WhatsApp', de: 'Telefon / WhatsApp', fr: 'Téléphone / WhatsApp', 'ar-gcc': 'هاتف / واتساب', fa: 'تلفن / واتساپ' },
    'contact.email': { en: 'Email', tr: 'E-Posta', de: 'E-Mail', fr: 'E-mail', 'ar-gcc': 'البريد الإلكتروني', fa: 'ایمیل', es: 'Correo', it: 'Email', 'zh-cn': '邮件' },

    // About Page - Value Cards
    'about.founded': { en: 'Est. 1918 — Akyazı, Sakarya', tr: 'Kur. 1918 — Akyazı, Sakarya', de: 'Gegr. 1918 — Akyazı, Sakarya', fr: 'Fondée 1918 — Akyazı, Sakarya', 'ar-gcc': 'تأسست 1918 — أقيازي، سقاريا' },
    'value.reliability': { en: 'Supply Stability', tr: 'Tedarik İstikrarı', de: 'Lieferstabilität', fr: 'Stabilité d\'approvisionnement', 'ar-gcc': 'استقرار التوريد', fa: 'ثبات عرضه' },
    'value.reliability.desc': { en: 'Consistent delivery for global B2B operations.', tr: 'Küresel B2B operasyonlar için istikrarlı teslimat.', de: 'Zuverlässige Lieferung für globale B2B-Betriebe.', fr: 'Livraison fiable pour les opérations B2B mondiales.', 'ar-gcc': 'توصيل منتظم للعمليات العالمية B2B.' },
    'value.expertise': { en: 'Material Stewardship', tr: 'Malzeme Uzmanlığı', de: 'Materialverantwortung', fr: 'Expertise matérielle', 'ar-gcc': 'إدارة المواد', fa: 'مسئولیت مواد' },
    'value.expertise.desc': { en: '100+ years of technical wood knowledge.', tr: '100+ yıllık teknik ahşap bilgisi.', de: 'Über 100 Jahre technisches Holzwissen.', fr: 'Plus de 100 ans de connaissance technique du bois.', 'ar-gcc': 'أكثر من 100 عام من المعرفة التقنية بالخشب.' },
    'value.culture': { en: 'Cultural Connection', tr: 'Kültürel Bağlantı', de: 'Kulturelle Verbindung', fr: 'Connexion culturelle', 'ar-gcc': 'التواصل الثقافي', fa: 'ارتباط فرهنگی' },
    'value.culture.desc': { en: 'Supporting art through Tever Sanat.', tr: 'Tever Sanat aracılığıyla sanata destek.', de: 'Unterstützung der Kunst durch Tever Sanat.', fr: 'Soutien à l\'art à travers Tever Sanat.', 'ar-gcc': 'دعم الفن من خلال تيفير للفنون.' },

    // Products Page - Additional Spec Headers
    'spec.moisture': { en: 'Moisture Content', tr: 'Nem Oranı', de: 'Feuchtigkeitsgehalt', fr: 'Teneur en humidité', 'ar-gcc': 'محتوى الرطوبة', fa: 'درصد رطوبت' },
    'spec.quality': { en: 'Quality Grade', tr: 'Kalite Sınıfı', de: 'Qualitätsstufe', fr: 'Classe de qualité', 'ar-gcc': 'درجة الجودة', fa: 'درجه کیفیت' },
    'spec.thickness': { en: 'Thickness', tr: 'Kalınlık', de: 'Dicke', fr: 'Épaisseur', 'ar-gcc': 'السماكة', fa: 'ضخامت', es: 'Grosor', it: 'Spessore', 'zh-cn': '厚度' },
    'products.packaging.title': { en: 'Export Packaging Standards', tr: 'İhracat Ambalaj Standartları', de: 'Exportverpackungsstandards', fr: 'Normes d\'emballage export', 'ar-gcc': 'معايير التغليف للتصدير', fa: 'استانداردهای بسته‌بندی صادراتی' }
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
    if (langBtn && langDropdown) {
        langBtn.onclick = (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
        };
        document.addEventListener('click', () => {
            if (langDropdown) langDropdown.classList.remove('active');
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

    // Dynamic Title & Meta Description Translation
    let pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    if (pageName === '') pageName = 'index';
    
    // Normalize pageName for homepage variations
    if (pageName === 'index' || pageName === 'index.html' || pageName === '/') {
        pageName = 'index';
    }

    const titleKey = `meta.title.${pageName}`;
    const descKey = `meta.desc.${pageName}`;

    if (translations[titleKey]) {
        const titleText = translations[titleKey][code] || translations[titleKey]['en'];
        if (titleText) document.title = titleText;
    }
    if (translations[descKey]) {
        const descText = translations[descKey][code] || translations[descKey]['en'];
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && descText) {
            metaDesc.setAttribute('content', descText);
        }
    }

    // Update all local links to preserve lang parameter
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#') && !href.startsWith('javascript:')) {
            try {
                // Parse the link relative to window location href
                const url = new URL(href, window.location.href);
                url.searchParams.set('lang', code);
                
                // Construct the path preserving absolute or relative structure
                let newHref = url.pathname + url.search + url.hash;
                if (!href.startsWith('/') && newHref.startsWith('/')) {
                    newHref = newHref.substring(1);
                }
                link.setAttribute('href', newHref);
            } catch (e) {
                // Ignore parsing errors
            }
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
    let message = "Hello, Tever Orman Mamülleri. I am interested in your products. Could I get a price quote?"; // Default

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

/* --- Scroll Reveal Logic --- */
function initScrollReveal() {
    // Select elements to reveal
    const revealTargets = document.querySelectorAll(
        '.product-card, .art-card, .stat-item, .info-card, .section h2, .section h3, .section-stats, .about-hero, .hero-inner, .timeline-item'
    );

    // Add CSS reveal class to targets
    revealTargets.forEach(el => {
        el.classList.add('reveal-element');
    });

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    // Stop observing once revealed
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before it enters fully
        });

        revealTargets.forEach(target => {
            revealObserver.observe(target);
        });
    } else {
        // Fallback for older browsers
        revealTargets.forEach(el => el.classList.add('reveal-active'));
    }
}
