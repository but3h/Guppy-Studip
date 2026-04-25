import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-10 text-sm">Get in touch with Guppy Studio for any inquiries.</p>
        
        <div className="space-y-6">
          <a 
            href="mailto:butchh246@gmail.com"
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-primary/5 transition-colors"
          >
            <div className="p-3 bg-white rounded-xl shadow-sm text-primary group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Us</p>
              <p className="text-gray-900 font-bold">butchh246@gmail.com</p>
            </div>
          </a>

          <a 
            href="https://t.me/Duhhh_3"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-primary/5 transition-colors"
          >
            <div className="p-3 bg-white rounded-xl shadow-sm text-primary group-hover:scale-110 transition-transform">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Telegram</p>
              <p className="text-gray-900 font-bold">@Duhhh_3</p>
            </div>
          </a>

          <a 
            href="tel:+959799997070"
            className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-primary/5 transition-colors"
          >
            <div className="p-3 bg-white rounded-xl shadow-sm text-primary group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Call Us</p>
              <p className="text-gray-900 font-bold">+95 9799997070</p>
            </div>
          </a>

          <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-primary/5 transition-colors">
            <div className="p-3 bg-white rounded-xl shadow-sm text-primary group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
              <p className="text-gray-900 font-bold">North Dagon, Yangon</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
