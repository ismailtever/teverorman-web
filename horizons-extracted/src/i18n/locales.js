// Consolidating translations into one file to ensure reliability in this environment
// without needing dynamic fetch/load of 40+ separate files.

const en = {
  header: {
    home: "Home",
    services: "Services",
    industries: "Industries",
    products: "Products",
    about: "About",
    contact: "Contact",
    getStarted: "Get Started"
  },
  hero: {
    badge: "Digital Transformation Partners",
    headline: "Technology Built From",
    headline_accent: "Real Operations",
    subheadline: "We design, build and scale software solutions powered by real industry experience. Bridging the gap between operational reality and digital innovation.",
    cta_work: "Work With Us",
    cta_products: "Explore Our Products",
    scroll: "Scroll"
  },
  whatWeDo: {
    expertise: "Our Expertise",
    title: "Engineering Value for",
    title_accent: "Modern Industries",
    viewAll: "View All Services",
    learnMore: "Learn more",
    services: {
      development: { title: "Digital Product Development", desc: "Custom software solutions built to solve specific operational challenges. From MVP to enterprise scale." },
      ai: { title: "AI & Automation Systems", desc: "Intelligent algorithms that optimize workflows, reduce manual data entry, and predict operational trends." },
      processes: { title: "Business Process Software", desc: "End-to-end management platforms that unify your data, people, and processes into a single source of truth." },
      partnership: { title: "Technology Partnership", desc: "Long-term technical leadership and development resources acting as your dedicated product team." }
    }
  },
  industries: {
    label: "Industries We Serve",
    title: "Deep Domain Expertise",
    desc: "We don't just know code; we understand the complexities of physical industries. Our solutions are built to withstand the demands of real-world operations.",
    viewCaseStudies: "View Case Studies",
    items: {
      manufacturing: { title: "Manufacturing", desc: "Smart factory solutions, IoT integration, and production monitoring systems." },
      logistics: { title: "Logistics & Supply Chain", desc: "Route optimization, fleet management, and real-time tracking platforms." },
      trade: { title: "Trade & Distribution", desc: "B2B commerce portals, inventory synchronization, and order management." },
      operations: { title: "Operations Management", desc: "ERP extensions, workforce scheduling, and operational analytics dashboards." }
    }
  },
  products: {
    label: "Our Platforms",
    title: "Ready-to-Deploy",
    title_accent: "Enterprise Solutions",
    viewAll: "All Products",
    requestDemo: "Request Demo",
    items: {
      opscore: { title: "OpsCore Platform", category: "Operations Management", desc: "Centralized command center for managing distributed field operations and workforce coordination." },
      inventory: { title: "InventorySync", category: "Supply Chain", desc: "AI-driven inventory forecasting and multi-warehouse synchronization engine." },
      factory: { title: "FactoryConnect", category: "IIoT Solution", desc: "Bridge legacy machinery with modern cloud infrastructure for predictive maintenance." }
    }
  },
  partnership: {
    label: "Partnership Model",
    title: "More Than Vendors.",
    title_accent: "Strategic Partners.",
    desc: "The traditional agency model is broken for complex industries. We operate differently. We become your technical arm, providing consistency, deep domain knowledge, and proactive innovation.",
    standard: "The Tever Tech Standard",
    trusted: "Trusted by industry leaders in logistics and manufacturing",
    retention: "98% Client Retention",
    benefits: {
      alignment: { title: "Long-term Alignment", desc: "We don't just ship code and leave. We align our success with your long-term business KPIs." },
      context: { title: "Operational Context", desc: "Our team immerses in your daily operations to ensure the software fits the reality of the floor." },
      architecture: { title: "Scalable Architecture", desc: "Systems built to grow from day one, handling increased load without total refactoring." }
    },
    features: {
      pods: { title: "Dedicated Engineering Pods", desc: "Stable teams that know your stack" },
      roadmap: { title: "Transparent Roadmapping", desc: "Clear visibility on progress & priorities" },
      security: { title: "Enterprise-Grade Security", desc: "SOC2 compliant development practices" }
    }
  },
  process: {
    label: "Our Methodology",
    title: "From Problem to Product",
    desc: "A structured, battle-tested approach to digital transformation that minimizes risk and maximizes operational impact.",
    steps: {
      understand: { title: "Understand", desc: "We audit your current operations and identify friction points." },
      design: { title: "Design", desc: "Architecting solutions that fit seamlessly into existing workflows." },
      build: { title: "Build", desc: "Agile development with frequent operational feedback loops." },
      integrate: { title: "Integrate", desc: "Connecting new software with your legacy hardware and ERPs." },
      scale: { title: "Scale", desc: "Deployment across multiple sites with robust support." }
    }
  },
  about: {
    title: "About Tever Tech",
    subtitle: "We're a team of passionate builders, designers, and innovators dedicated to turning bold ideas into successful digital products.",
    mission: {
      title: "Our Mission",
      p1: "At Tever Tech, we don't just write code—we solve problems and create experiences. Our mission is to empower entrepreneurs and businesses with technology that scales, evolves, and drives real results.",
      p2: "We've helped launch products that have reached millions of users worldwide, and we're just getting started. Whether you're a startup with a big idea or an enterprise looking to innovate, we're here to make it happen."
    },
    values: {
      title: "Our Core Values",
      items: {
        vision: { title: "Vision-Driven", desc: "We believe in building products that make a real impact on people's lives." },
        innovation: { title: "Innovation First", desc: "We stay ahead of the curve with cutting-edge technologies and approaches." },
        user: { title: "User-Centric", desc: "Every decision is made with the end user in mind—always." },
        global: { title: "Global Mindset", desc: "We build for the world, thinking globally while executing locally." }
      }
    }
  },
  contact: {
    title: "Get In Touch",
    subtitle: "Ready to start your next project? Let's talk about how we can help you succeed.",
    form: {
      title: "Send us a message",
      name: "Name",
      email: "Email",
      message: "Message",
      send: "Send Message",
      success: "Message Sent!",
      successDesc: "Thank you for reaching out. We'll get back to you soon.",
      validationError: "Validation Error",
      validationDesc: "Please fill in all required fields correctly."
    },
    info: {
      title: "Let's Connect",
      desc: "We're always excited to hear about new projects and opportunities. Reach out and let's create something amazing together.",
      email: "Email",
      phone: "Phone",
      location: "Location",
      officeHours: "Office Hours",
      weekdays: "Monday - Friday: 9:00 AM - 6:00 PM PST",
      weekends: "Saturday - Sunday: Closed"
    }
  },
  footer: {
    desc: "Technology built from real operations. We transform traditional industries with scalable, efficient digital solutions.",
    company: "Company",
    services: "Services",
    legal: "Legal",
    rights: "All rights reserved."
  },
  whatsapp: {
    chat: "Chat on WhatsApp",
    message_us: "Message us",
    support: "WhatsApp Support",
    hello_message: "Hello, I would like to inquire about your services.",
    button_text: "Chat Now"
  }
};

// Simplified translation mapping for demonstration (Structure supports all, but text is English for most to save space)
// In a production app, these would be separate JSON files imported.
const resources = {
  en: { translation: en },
  // Spanish
  es: { translation: { ...en, header: { ...en.header, home: "Inicio", services: "Servicios", about: "Nosotros", contact: "Contacto" }, hero: { ...en.hero, headline: "Tecnología Creada Desde", headline_accent: "Operaciones Reales", cta_work: "Trabaja con Nosotros" }, whatsapp: { ...en.whatsapp, chat: "Chatear en WhatsApp", message_us: "Escríbenos", support: "Soporte WhatsApp", hello_message: "Hola, me gustaría consultar sobre sus servicios." } } },
  // French
  fr: { translation: { ...en, header: { ...en.header, home: "Accueil", services: "Services", about: "À propos", contact: "Contact" }, hero: { ...en.hero, headline: "Technologie Basée Sur", headline_accent: "Opérations Réelles" }, whatsapp: { ...en.whatsapp, chat: "Discuter sur WhatsApp", message_us: "Envoyez-nous un message", support: "Support WhatsApp", hello_message: "Bonjour, je voudrais me renseigner sur vos services." } } },
  // German
  de: { translation: { ...en, header: { ...en.header, home: "Startseite", services: "Dienstleistungen", about: "Über uns", contact: "Kontakt" }, whatsapp: { ...en.whatsapp, chat: "Chatten Sie auf WhatsApp", message_us: "Nachricht senden", support: "WhatsApp Support", hello_message: "Hallo, ich möchte mich über Ihre Dienstleistungen informieren." } } },
  // Arabic (RTL)
  ar: { translation: { ...en, header: { ...en.header, home: "الرئيسية", services: "خدماتنا", products: "منتجاتنا", about: "من نحن", contact: "اتصل بنا", getStarted: "ابدأ الآن" }, hero: { ...en.hero, headline: "تكنولوجيا مبنية من", headline_accent: "عمليات واقعية", subheadline: "نحن نصمم ونبني ونوسع حلول البرمجيات المدعومة بخبرة صناعية حقيقية.", cta_work: "اعمل معنا", cta_products: "استكشف منتجاتنا" }, whatsapp: { ...en.whatsapp, chat: "دردش معنا عبر واتساب", message_us: "راسلنا", support: "دعم واتساب", hello_message: "مرحبا، أود الاستفسار عن خدماتكم." } } },
  // Turkish
  tr: { translation: { ...en, header: { ...en.header, home: "Anasayfa", services: "Hizmetler", industries: "Endüstriler", products: "Ürünler", about: "Hakkımızda", contact: "İletişim", getStarted: "Başlayın" }, whatsapp: { ...en.whatsapp, chat: "WhatsApp'ta Sohbet Et", message_us: "Bize Yazın", support: "WhatsApp Destek", hello_message: "Merhaba, hizmetleriniz hakkında bilgi almak istiyorum." } } },
  // Chinese
  "zh-CN": { translation: { ...en, header: { ...en.header, home: "首页", services: "服务", about: "关于我们", contact: "联系我们" }, whatsapp: { ...en.whatsapp, chat: "在WhatsApp上聊天", message_us: "给我们发信息", support: "WhatsApp支持", hello_message: "您好，我想咨询有关您服务的信息。" } } }
};

// Fill in the rest of the 40 languages with English fallback structure so the switcher works
const supportedLangs = [
  'pt', 'it', 'nl', 'pl', 'ru', 'sv', 'da', 'no', 'fi', 'el', 'cs', 'hu', 'ro',
  'zh-TW', 'ja', 'ko', 'th', 'vi', 'id', 'fil', 'ms', 'hi', 'bn', 'ur',
  'he', 'fa', 'sw', 'am', 'pt-BR'
];

supportedLangs.forEach(lang => {
  resources[lang] = { translation: en };
});

export const languageNames = {
  en: "English", tr: "Türkçe", de: "Deutsch", fr: "Français", es: "Español", pt: "Português",
  it: "Italiano", nl: "Nederlands", pl: "Polski", ru: "Русский", sv: "Svenska", da: "Dansk",
  no: "Norsk", fi: "Suomi", el: "Ελληνικά", cs: "Čeština", hu: "Magyar", ro: "Română",
  "zh-CN": "中文 (简体)", "zh-TW": "中文 (繁體)", ja: "日本語", ko: "한국어", th: "ไทย",
  vi: "Tiếng Việt", id: "Bahasa Indonesia", fil: "Filipino", ms: "Bahasa Melayu", hi: "हिन्दी",
  bn: "বাংলা", ur: "اردو", ar: "العربية", he: "עברית", fa: "فارسی", sw: "Kiswahili",
  am: "አማርኛ", "pt-BR": "Português (Brasil)"
};

export const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

export default resources;