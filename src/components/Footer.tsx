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
    <footer className="bg-white/40 backdrop-blur-xl border-t border-white/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-primary rounded-lg shadow-lg shadow-primary/20">
                <Fish className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-sky-950 tracking-tight">Guppy Studio</span>
            </div>
            <p className="text-sm text-sky-900/70 leading-relaxed max-w-xs font-medium">
              Your premier destination for high-quality guppies, bettas, and aquatic accessories. Dive into our world today.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sky-950 text-sm uppercase tracking-widest mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-sky-900/60 font-medium">
              <li><a href="/" className="hover:text-primary transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" /> Home</a></li>
              <li><a href="/shop" className="hover:text-primary transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" /> Shop</a></li>
              <li><a href="/about" className="hover:text-primary transition-colors flex items-center gap-2 group"><div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" /> About</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sky-950 text-sm uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-sky-900/60 font-medium">
              <li className="flex items-center gap-3">
                <div className="p-2 bg-white/50 rounded-lg border border-white/40 shadow-sm">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                butchh246@gmail.com
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-white/50 rounded-lg border border-white/40 shadow-sm">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                +95 9799997070
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-white/50 rounded-lg border border-white/40 shadow-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                North Dagon, Yangon
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sky-950 text-sm uppercase tracking-widest mb-6">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="p-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 text-sky-950 hover:bg-primary hover:text-white transition-all shadow-sm" title="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://t.me/Duhhh_3" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 text-sky-950 hover:bg-primary hover:text-white transition-all shadow-sm" title="Telegram">
                <Send className="w-5 h-5" />
              </a>
              <a href="#" className="p-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 text-sky-950 hover:bg-primary hover:text-white transition-all shadow-sm" title="TikTok">
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-sky-900/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-sky-900/40">
            © 2026 Guppy Studio. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs text-sky-900/40">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
