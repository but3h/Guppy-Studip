import { Fish, Mail, Phone, MapPin, Facebook, Send } from 'lucide-react';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.76-.53-1.43-1.19-1.93-1.97V14.5c.01 1.44-.35 2.89-1.16 4.09-1.32 1.97-3.65 3.13-6.03 2.92-2.38-.21-4.51-1.85-5.23-4.13-.72-2.28-.01-4.82 1.75-6.41 1.76-1.59 4.41-1.92 6.51-.83v4.02c-1.1-.63-2.52-.56-3.53.21-1.01.77-1.47 2.11-1.11 3.33.36 1.22 1.55 2.07 2.83 2.05 1.28-.02 2.4-1.01 2.62-2.26.04-.23.06-.47.06-.71V.02h.01z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-primary rounded-lg">
                <Fish className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900">Guppy Studio</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your premium destination for high-quality guppies, bettas, and aquatic supplies. Dive into the world of Guppy Studio today.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="/shop" className="hover:text-primary transition-colors">Shop</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors">About Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                butchh246@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                +95 9799997070
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                North Dagon, Yangon
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/20 transition-all" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://t.me/Duhhh_3" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/20 transition-all" title="Telegram">
                <Send className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/20 transition-all" title="TikTok">
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © 2026 Guppy Studio. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
