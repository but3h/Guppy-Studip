import { motion } from 'motion/react';
import { Fish, Waves, Droplets, Shield, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden bg-sky-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=2000" 
            alt="Vibrant Coral Reef" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sky-900 via-sky-900/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-3 py-1 bg-sky-400/20 text-sky-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              Dive Into Elegance
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Bring the <span className="text-primary-light">Ocean Home</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Discover a vibrant world of exotic guppies, bettas, and premium aquatic life. Hand-picked for beauty, health, and vitality.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all flex items-center gap-2 group">
                Explore Our Collection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Guppy Studio?</h2>
            <p className="text-gray-500">We are dedicated to providing the healthiest fish and the best advice for your aquarium journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Fish, title: "Premium Strains", desc: "We specialize in rare and high-quality guppy and betta strains with vibrant colors." },
              { icon: Droplets, title: "Healthy Environment", desc: "Our fish are raised in meticulously maintained tanks to ensure they arrive healthy." },
              { icon: Star, title: "Expert Guidance", desc: "Whether you're a beginner or a pro, our team is here to help your aquarium thrive." }
            ].map((benefit, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-gray-50 rounded-3xl border border-gray-100"
              >
                <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-500 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
