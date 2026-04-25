import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X, Plus, Minus, Trash2, CreditCard, Phone, MapPin, UserCircle, CheckCircle2, Package, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserProfile } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [orderStatus, setOrderStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [isAdmin, setIsAdmin] = useState(false);
  const [orderForm, setOrderForm] = useState({
    phone: '09',
    telegram: '',
    paymentMethod: 'cod',
    address: ''
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setIsAdmin(profile.role === 'admin');
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setOrderStatus('submitting');
    try {
      const user = auth.currentUser;
      
      // 1. Create the order
      await addDoc(collection(db, 'orders'), {
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          gender: item.selectedGender
        })),
        totalPrice,
        ...orderForm,
        customerUid: user?.uid || 'anonymous',
        customerName: user?.displayName || 'Anonymous Customer',
        customerEmail: user?.email || 'No Email',
        customerPhoto: user?.photoURL || '',
        createdAt: serverTimestamp(),
        status: 'pending',
        paymentStatus: 'unpaid',
        isArchived: false
      });

      // 2. Update product stocks
      for (const item of items) {
        const productRef = doc(db, 'products', item.id);
        const updateData: any = {};
        if (item.selectedGender === 'male') {
          updateData.maleStock = increment(-item.quantity);
        } else {
          updateData.femaleStock = increment(-item.quantity);
        }
        await updateDoc(productRef, updateData);
      }

      setOrderStatus('success');
      clearCart(); // Clear cart immediately on success
      
        setTimeout(() => {
          setOrderStatus('idle');
          onClose();
          setOrderForm({ phone: '09', telegram: '', paymentMethod: 'cod', address: '' });
        }, 3500);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders');
      setOrderStatus('idle');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-md"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-white/80 backdrop-blur-2xl shadow-2xl flex flex-col border-l border-white/20"
          >
            <div className="p-6 border-b border-white/20 flex justify-between items-center bg-transparent sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{items.length} items</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && orderStatus !== 'success' && (
                  <div className="flex items-center gap-2">
                    {showClearConfirm ? (
                      <div className="flex items-center gap-2 bg-red-50 p-1 rounded-xl animate-in fade-in slide-in-from-right-2">
                        <span className="text-[10px] font-bold text-red-600 px-2">Clear cart?</span>
                        <button
                          onClick={() => {
                            clearCart();
                            setShowClearConfirm(false);
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="px-3 py-1 bg-gray-200 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear Cart
                      </button>
                    )}
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {orderStatus === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Order placed!</h3>
                  <p className="text-gray-500 mb-8">Thank you for your purchase. We will contact you soon.</p>
                  
                  {isAdmin && (
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/admin');
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-2xl font-bold hover:bg-primary hover:text-white transition-all"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      View in Admin Panel
                    </button>
                  )}
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h3>
                  <p className="text-gray-400 text-sm mb-8">Looks like you haven't added anything yet.</p>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-primary transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        layout
                        key={`${item.id}-${item.selectedGender}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4 p-4 bg-white/40 backdrop-blur-lg rounded-3xl border border-white/30 group"
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-200">
                          <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-grow flex flex-col justify-between py-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-gray-900 line-clamp-1 text-sm">{item.name}</h4>
                              <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-md">
                                {item.selectedGender === 'male' ? 'Male' : 'Female'}
                              </span>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id, item.selectedGender)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.selectedGender, Math.max(1, item.quantity - 1))}
                                className="p-1 hover:bg-gray-50 rounded-lg text-gray-500"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.selectedGender, Math.min(item.selectedGender === 'male' ? (item.maleStock || 0) : (item.femaleStock || 0), item.quantity + 1))}
                                className="p-1 hover:bg-gray-50 rounded-lg text-gray-500"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-bold text-primary text-sm">{((item.price || 0) * (item.quantity || 0)).toLocaleString()} MMK</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Checkout Details</h3>
                    <form onSubmit={handleSubmitOrder} className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Phone className="w-3 h-3" /> Phone Number
                          </label>
                          <input
                            required
                            type="tel"
                            maxLength={11}
                            value={orderForm.phone}
                            onChange={e => {
                              let value = e.target.value.replace(/\D/g, '');
                              // Always ensure it starts with 09
                              if (!value.startsWith('09')) {
                                value = '09' + value.replace(/^0+/, '');
                              }
                              if (value.length <= 11) {
                                setOrderForm({ ...orderForm, phone: value });
                              }
                            }}
                            className="w-full px-4 py-3 bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            placeholder="09123456789 (11 digits)"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.36-.48.99-.73 3.84-1.67 6.4-2.77 7.68-3.3 3.64-1.51 4.4-1.77 4.9-.18z"/>
                            </svg> Telegram Account
                          </label>
                          <input
                            required
                            type="text"
                            value={orderForm.telegram}
                            onChange={e => setOrderForm({ ...orderForm, telegram: e.target.value })}
                            className="w-full px-4 py-3 bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            placeholder="@username or phone number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <CreditCard className="w-3 h-3" /> Payment Method
                        </label>
                        <select
                          required
                          value={orderForm.paymentMethod}
                          onChange={e => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
                          className="w-full px-4 py-3 bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                        >
                          <option value="cod">Cash on Delivery</option>
                          <option value="kpay">KBZPay</option>
                          <option value="wave">WavePay</option>
                          <option value="bank">Bank Transfer</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> Address
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={orderForm.address}
                          onChange={e => setOrderForm({ ...orderForm, address: e.target.value })}
                          className="w-full px-4 py-3 bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                          placeholder="Delivery address..."
                        />
                      </div>

                      <div className="bg-gray-900 rounded-3xl p-6 text-white space-y-4">
                        <div className="flex justify-between items-center text-gray-400 text-sm">
                          <span>Subtotal</span>
                          <span>{(totalPrice || 0).toLocaleString()} MMK</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400 text-sm">
                          <span>Delivery</span>
                          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Free</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                          <span className="font-bold">Total Amount</span>
                          <span className="text-2xl font-bold text-primary">{(totalPrice || 0).toLocaleString()} MMK</span>
                        </div>
                        <button
                          type="submit"
                          disabled={orderStatus === 'submitting'}
                          className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-white hover:text-gray-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                        >
                          {orderStatus === 'submitting' ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Package className="w-5 h-5" />
                              Confirm Order
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
