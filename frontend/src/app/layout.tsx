import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShopUz - Online Do\'kon',
  description: 'O\'zbekistondagi eng yaxshi online do\'kon. Sifatli mahsulotlar, qulay narxlar va tez yetkazib berish.',
  keywords: ['online dokon', 'ecommerce', 'uzbekistan', 'mahsulot', 'xarid', 'shopping'],
  authors: [{ name: 'ShopUz Team' }],
  openGraph: {
    title: 'ShopUz - Online Do\'kon',
    description: 'O\'zbekistondagi eng yaxshi online do\'kon',
    type: 'website',
    locale: 'uz_UZ',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}