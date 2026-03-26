export const siteConfig = {
  name: 'Tever Tech',
  url: 'https://tevertech.com',
  logo: 'https://tevertech.com/logo.png', // Placeholder URL
  contact: {
    phone: '+90 539 796 02 30',
    email: 'hello@tevertech.com',
    address: {
      street: 'Tech District',
      city: 'Istanbul',
      country: 'Turkey',
      postalCode: '34000'
    }
  },
  social: {
    linkedin: 'https://linkedin.com/company/tevertech',
    twitter: 'https://twitter.com/tevertech'
  }
};

export const pageSeo = {
  home: {
    title: 'Tever Tech - Digital Solutions for Manufacturing & Logistics',
    description: 'Tever Tech transforms traditional industries into digital systems. We design, build, and scale software solutions powered by real industry experience.',
    keywords: 'digital transformation, manufacturing software, logistics software, industrial iot, custom software development',
    path: '/'
  },
  about: {
    title: 'About Tever Tech - Technology Company',
    description: 'Meet the Tever Tech team - passionate builders and innovators dedicated to creating digital products that make a real impact on millions of users.',
    keywords: 'about tever tech, technology team, software engineers, digital innovation, tech company mission',
    path: '/about'
  },
  services: {
    title: 'Services - Tever Tech Digital Solutions',
    description: 'Comprehensive digital product services including app development, AI solutions, product scaling, and technology partnership from Tever Tech.',
    keywords: 'app development, ai solutions, software scaling, technology partnership, enterprise software',
    path: '/services'
  },
  products: {
    title: 'Products - Tever Tech Software Solutions',
    description: 'Explore successful digital products built by Tever Tech, including OpsCore, InventorySync, and FactoryConnect - serving industries worldwide.',
    keywords: 'OpsCore, InventorySync, FactoryConnect, industrial software products, saas platforms',
    path: '/products'
  },
  contact: {
    title: 'Contact Tever Tech - Get in Touch',
    description: 'Ready to build something amazing? Get in touch with Tever Tech to discuss your project. We are excited to help you succeed.',
    keywords: 'contact tever tech, hire developers, software consultation, tech support, business inquiry',
    path: '/contact'
  }
};

export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: siteConfig.logo,
  sameAs: [
    siteConfig.social.linkedin,
    siteConfig.social.twitter
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: siteConfig.contact.phone,
    contactType: 'customer service',
    email: siteConfig.contact.email
  }
});

export const generateLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: siteConfig.name,
  image: siteConfig.logo,
  telephone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.contact.address.street,
    addressLocality: siteConfig.contact.address.city,
    postalCode: siteConfig.contact.address.postalCode,
    addressCountry: siteConfig.contact.address.country
  },
  url: siteConfig.url
});

export const generateServiceSchema = (name, description) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: name,
  provider: {
    '@type': 'Organization',
    name: siteConfig.name
  },
  description: description
});

export const generateProductSchema = (name, description) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: name,
  description: description,
  brand: {
    '@type': 'Brand',
    name: siteConfig.name
  }
});