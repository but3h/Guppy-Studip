import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Product, UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, ShoppingCart, Search, SlidersHorizontal, X, Phone, MapPin, CreditCard, UserCircle, CheckCircle2, Plus, Minus, Package } from 'lucide-react';

export default function Shop() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Local State for the card
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedGenders, setSelectedGenders] = useState<Record<string, 'male' | 'female' | 'both'>>({});

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        if (user.email?.toLowerCase() === 'butchh246@gmail.com') {
          setIsAdmin(true);
        }
        onSnapshot(doc(db, 'users', user.uid), (doc) => {
          const profile = doc.data() as UserProfile;
          setIsAdmin(profile?.role === 'admin' || user.email?.toLowerCase() === 'butchh246@gmail.com');
        });
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeAuth();
    };
  }, []);

  const handleAddToCart = (product: Product) => {
    const qty = quantities[product.id] || 1;
    const gender = selectedGenders[product.id] || 'male';
    addToCart(product, qty, gender);
    // Reset local state
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    setSelectedGenders(prev => ({ ...prev, [product.id]: 'male' }));
  };

  // Remove handleSubmitOrder as it's now in CartDrawer

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Guppy Collection</h1>
            <p className="text-gray-500">Premium guppies for your aquarium.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 group hover:shadow-2xl transition-all flex flex-col"
                >
                  <div 
                    className="h-56 overflow-hidden relative cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <img 
                      src={product.photoUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/guppy/800/600';
                      }}
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {(product.maleStock || 0) === 0 && (product.femaleStock || 0) === 0 ? (
                        <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit">
                          Sold Out
                        </span>
                      ) : (selectedGenders[product.id] || 'male') === 'male' ? (
                        (product.maleStock || 0) === 0 ? (
                          <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit">
                            Male Sold Out
                          </span>
                        ) : (product.maleStock || 0) < 5 ? (
                          <span className="px-2 py-1 bg-orange-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit">
                            Only {product.maleStock || 0} Male Left
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit">
                            Male In Stock
                          </span>
                        )
                      ) : (
                        (product.femaleStock || 0) === 0 ? (
                          <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit">
                            Female Sold Out
                          </span>
                        ) : (product.femaleStock || 0) < 5 ? (
                          <span className="px-2 py-1 bg-orange-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit">
                            Only {product.femaleStock || 0} Female Left
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit">
                            Female In Stock
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                      <span className="text-primary font-bold">{(product.price || 0).toLocaleString()} MMK</span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                      {product.description}
                    </p>
                    
                    {product.specs && Object.keys(product.specs).length > 0 && (
                      <div className="mb-4 space-y-1">
                        {Object.entries(product.specs).slice(0, 2).map(([key, val]) => (
                          <div key={key} className="flex justify-between text-[10px] text-gray-400 uppercase tracking-tight">
                            <span>{key}</span>
                            <span className="font-medium text-gray-600">{val}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
                        {(['male', 'female'] as const).map((g) => (
                          <button
                            key={g}
                            onClick={() => setSelectedGenders(prev => ({ ...prev, [product.id]: g }))}
                            className={`flex-grow py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                              (selectedGenders[product.id] || 'male') === g
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1">
                        <button 
                          onClick={() => setQuantities(prev => ({ ...prev, [product.id]: Math.max(1, (prev[product.id] || 1) - 1) }))}
                          className="p-1.5 hover:bg-white rounded-lg text-gray-500 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{quantities[product.id] || 1}</span>
                        <button 
                          onClick={() => setQuantities(prev => ({ ...prev, [product.id]: Math.min((selectedGenders[product.id] || 'male') === 'male' ? (product.maleStock || 0) : (product.femaleStock || 0), (prev[product.id] || 1) + 1) }))}
                          className="p-1.5 hover:bg-white rounded-lg text-gray-500 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        disabled={((selectedGenders[product.id] || 'male') === 'male' ? (product.maleStock || 0) : (product.femaleStock || 0)) === 0}
                        onClick={() => handleAddToCart(product)}
                        className="flex-grow py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {((selectedGenders[product.id] || 'male') === 'male' ? (product.maleStock || 0) : (product.femaleStock || 0)) === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
