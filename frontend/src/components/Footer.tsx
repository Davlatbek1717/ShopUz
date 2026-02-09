import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Kompaniya',
      links: [
        { name: 'Biz haqimizda', href: '/about' },
        { name: 'Yangiliklar', href: '/news' },
        { name: 'Karyera', href: '/careers' },
        { name: 'Aloqa', href: '/contact' },
      ],
    },
    {
      title: 'Xizmatlar',
      links: [
        { name: 'Yetkazib berish', href: '/shipping' },
        { name: 'Qaytarish', href: '/returns' },
        { name: 'Yordam', href: '/help' },
        { name: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Kategoriyalar',
      links: [
        { name: 'Elektronika', href: '/products?category=electronics' },
        { name: 'Moda', href: '/products?category=fashion' },
        { name: 'Uy va bog\'', href: '/products?category=home' },
        { name: 'Sport', href: '/products?category=sports' },
      ],
    },
    {
      title: 'Hisob',
      links: [
        { name: 'Kirish', href: '/login' },
        { name: 'Ro\'yxatdan o\'tish', href: '/register' },
        { name: 'Buyurtmalarim', href: '/orders' },
        { name: 'Sevimlilar', href: '/wishlist' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Yangiliklar va chegirmalardan xabardor bo'ling!</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Email manzilingizni qoldiring va eng yaxshi takliflardan birinchi bo'lib xabardor bo'ling
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email manzilingiz"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
              />
              <button
                type="submit"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Obuna bo'lish
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                🛒
              </div>
              <div>
                <h2 className="text-2xl font-bold">ShopUz</h2>
                <p className="text-gray-400 text-sm">Online Do'kon</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              O'zbekistondagi eng yaxshi online do'kon. Sifatli mahsulotlar, qulay narxlar va tez yetkazib berish.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                📘
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors">
                🐦
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors">
                📷
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                📺
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                📍
              </div>
              <div>
                <h4 className="font-semibold">Manzil</h4>
                <p className="text-gray-400 text-sm">Toshkent, Chilonzor tumani</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                📞
              </div>
              <div>
                <h4 className="font-semibold">Telefon</h4>
                <p className="text-gray-400 text-sm">+998 90 123 45 67</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                ✉️
              </div>
              <div>
                <h4 className="font-semibold">Email</h4>
                <p className="text-gray-400 text-sm">info@shopuz.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h4 className="font-semibold mb-2">To'lov usullari</h4>
              <div className="flex gap-3">
                <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-xs font-bold text-blue-600">
                  VISA
                </div>
                <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-xs font-bold text-red-600">
                  MC
                </div>
                <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-xs font-bold text-blue-800">
                  PayPal
                </div>
                <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-xs font-bold text-green-600">
                  UzCard
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">24/7 Onlayn yordam</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <span>🔒</span>
                <span className="text-sm">SSL sertifikati bilan himoyalangan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} ShopUz. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Maxfiylik siyosati
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Foydalanish shartlari
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie siyosati
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}