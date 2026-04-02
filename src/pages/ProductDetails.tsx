import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Product, UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, ArrowLeft, CheckCircle2, Phone, MapPin, CreditCard, UserCircle, X, Package, ShieldCheck, Truck, Plus, Minus } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Order Modal State (Removed as it's now in CartDrawer)
  const [orderStatus, setOrderStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, 'products', id), (docSnap) => {
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      } else {
        setProduct(null);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `products/${id}`);
      setLoading(false);
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
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedGender);
  };

  // Remove handleSubmitOrder as it's now in CartDrawer

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/shop')}
          className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-primary transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <button 
              onClick={() => navigate('/shop')}
              className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <div className="p-2 bg-white rounded-xl border border-gray-100 group-hover:border-gray-200 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Back to Shop</span>
            </button>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm relative group">
              <img 
                src={product.photoUrl} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/guppy/1200/1200';
                }}
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-gray-100 shadow-sm flex-grow">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  {(product.maleStock || 0) === 0 && (product.femaleStock || 0) === 0 ? (
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      Sold Out
                    </span>
                  ) : selectedGender === 'male' ? (
                    (product.maleStock || 0) === 0 ? (
                      <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        Male Sold Out
                      </span>
                    ) : (product.maleStock || 0) < 5 ? (
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        Low Male Stock: {product.maleStock || 0} Left
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        Male In Stock: {product.maleStock || 0} Available
                      </span>
                    )
                  ) : (
                    (product.femaleStock || 0) === 0 ? (
                      <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        Female Sold Out
                      </span>
                    ) : (product.femaleStock || 0) < 5 ? (
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        Low Female Stock: {product.femaleStock || 0} Left
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        Female In Stock: {product.femaleStock || 0} Available
                      </span>
                    )
                  )}
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>
                <div className="text-3xl font-bold text-primary">
                  {(product.price || 0).toLocaleString()} <span className="text-lg font-medium text-gray-400">MMK</span>
                </div>
              </div>

              <div className="space-y-8 mb-12">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Select Gender</h3>
                  <div className="flex flex-wrap gap-3">
                    {(['male', 'female'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setSelectedGender(g)}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all border ${
                          selectedGender === g
                            ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20'
                            : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Description</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {product.description}
                  </p>
                </div>

                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Product Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(product.specs).map(([key, val]) => (
                        <div key={key} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="text-xs text-gray-400 uppercase tracking-tight mb-1">{key}</div>
                          <div className="font-bold text-gray-900">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Quality Assured</span>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-12">
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-gray-200 hover:border-primary hover:text-primary transition-all shadow-sm"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="w-12 text-center">
                    <span className="text-xl font-bold text-gray-900">{quantity}</span>
                  </div>
                  <button 
                    onClick={() => setQuantity(prev => Math.min(selectedGender === 'male' ? (product.maleStock || 0) : (product.femaleStock || 0), prev + 1))}
                    className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-gray-200 hover:border-primary hover:text-primary transition-all shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <button 
                  disabled={(selectedGender === 'male' ? (product.maleStock || 0) : (product.femaleStock || 0)) === 0}
                  onClick={handleAddToCart}
                  className="flex-grow py-5 bg-gray-900 text-white rounded-[2rem] font-bold text-xl hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {(selectedGender === 'male' ? (product.maleStock || 0) : (product.femaleStock || 0)) === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
