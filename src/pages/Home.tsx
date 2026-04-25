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
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&q=80&w=2000" 
            alt="Guppy Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Premium <span className="text-primary">Guppy</span> Studio
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover the most vibrant and healthy guppies for your aquarium. 
              Expertly bred, carefully delivered.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/shop" className="px-10 py-5 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all flex items-center gap-3 group shadow-2xl shadow-primary/20">
                Explore Our Collection
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
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
            <p className="text-gray-500">We are dedicated to providing the healthiest fish and best advice for your aquarium journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Fish, title: "Premium Species", desc: "We specialize in rare and high-quality guppy and betta strains with vibrant colors." },
              { icon: Droplets, title: "Healthy Environment", desc: "Our fish are raised in meticulously maintained tanks to ensure they arrive healthy at your doorstep." },
              { icon: Star, title: "Expert Guidance", desc: "Whether you're a beginner or an expert, our team is here to help your aquarium thrive." }
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
