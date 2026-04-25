import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, onSnapshot, deleteDoc, doc, updateDoc, orderBy, increment, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Package, Image as ImageIcon, Tag, Banknote, ListChecks, X, CheckCircle2, AlertCircle, LayoutGrid, Box, Save, MinusCircle, PlusCircle, ShoppingCart, UserCircle, Phone, CreditCard, MapPin, Archive, CheckCircle, Bell, BellOff, Search, Video } from 'lucide-react';
import { Product, UserProfile, Order } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { motion, AnimatePresence } from 'motion/react';

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'publish' | 'stock' | 'orders'>('publish');
  const [orderView, setOrderView] = useState<'active' | 'delivered' | 'cancelled'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsActive, setNotificationsActive] = useState(() => {
    const saved = localStorage.getItem('order_notifications_active');
    return saved !== null ? saved === 'true' : true;
  });
  const isFirstLoad = useRef(true);
  const notificationsActiveRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationsActiveRef.current = notificationsActive;
    localStorage.setItem('order_notifications_active', notificationsActive.toString());
  }, [notificationsActive]);

  useEffect(() => {
    // Initialize notification sound
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    
    // Check for existing permission
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
    }
  };
  const testNotification = () => {
    // Play sound
    audioRef.current?.play().catch(e => console.log('Audio play failed:', e));
    
    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification('Notification Test', {
        body: 'This is how you will be notified of new orders!',
        icon: '/favicon.ico'
      });
    }
  };

  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'guppy',
    photoUrl: '',
    maleStock: '10',
    femaleStock: '10',
    specs: '',
    videoUrl: ''
  });

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Immediate check for default admin
        if (user.email?.toLowerCase() === 'butchh246@gmail.com') {
          setIsAdmin(true);
          setLoading(false);
        }

        onSnapshot(doc(db, 'users', user.uid), (doc) => {
          const profile = doc.data() as UserProfile;
          if (profile?.role === 'admin' || user.email?.toLowerCase() === 'butchh246@gmail.com') {
            setIsAdmin(true);
          } else {
            navigate('/');
          }
          setLoading(false);
        }, (error) => {
          if (user.email?.toLowerCase() === 'butchh246@gmail.com') {
            setIsAdmin(true);
            setLoading(false);
          } else {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
            navigate('/');
          }
        });
      } else {
        navigate('/');
      }
    });

    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      // Check for new orders
      if (!isFirstLoad.current && notificationsActiveRef.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const orderData = change.doc.data() as Order;
            // Play sound
            audioRef.current?.play().catch(e => console.log('Audio play failed:', e));
            
            // Browser notification
            if (Notification.permission === 'granted') {
              new Notification('New Order Received!', {
                body: `Order from ${orderData.customerName || 'Customer'} for ${(orderData.totalPrice || 0).toLocaleString()} MMK`,
                icon: '/favicon.ico'
              });
            }
          }
        });
      }
      
      setOrders(newOrders);
      isFirstLoad.current = false;
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    
    try {
      let parsedSpecs: Record<string, string> = {};
      if (formData.specs) {
        formData.specs.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            parsedSpecs[key.trim()] = valueParts.join(':').trim();
          }
        });
      }

      await addDoc(collection(db, 'products'), {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: 'guppy',
        photoUrl: formData.photoUrl,
        maleStock: parseInt(formData.maleStock) || 0,
        femaleStock: parseInt(formData.femaleStock) || 0,
        specs: parsedSpecs,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        videoUrl: formData.videoUrl || ''
      });

      setFormData({ name: '', description: '', price: '', category: 'guppy', photoUrl: '', maleStock: '10', femaleStock: '10', specs: '', videoUrl: '' });
      setStatus({ type: 'success', message: 'Product published successfully!' });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    } catch (error) {
      console.error("Error adding product:", error);
      setStatus({ type: 'error', message: 'Failed to publish product. Please try again.' });
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  const updateStock = async (id: string, gender: 'male' | 'female', newStock: number) => {
    if (newStock < 0) return;
    try {
      const updateData: any = {
        updatedAt: serverTimestamp()
      };
      if (gender === 'male') updateData.maleStock = newStock;
      else updateData.femaleStock = newStock;

      await updateDoc(doc(db, 'products', id), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error("No product ID provided for deletion.");
      return;
    }
    
    console.log("Attempting to delete product with ID:", id);
    setDeletingId(id);
    try {
      const productRef = doc(db, 'products', id);
      console.log("Product reference created:", productRef.path);
      await deleteDoc(productRef);
      console.log("Delete operation successful for ID:", id);
      setStatus({ type: 'success', message: 'Product deleted successfully!' });
      setConfirmDeleteId(null);
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    } catch (error: any) {
      console.error("Delete operation failed for ID:", id, error);
      const errorMessage = error?.message || 'Failed to delete product.';
      setStatus({ type: 'error', message: `Error: ${errorMessage}` });
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    } finally {
      setDeletingId(null);
    }
  };

  const updatePaymentStatus = async (id: string, newStatus: Order['paymentStatus']) => {
    try {
      await updateDoc(doc(db, 'orders', id), {
        paymentStatus: newStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', id), {
        status: newStatus,
        isArchived: newStatus !== 'pending'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const handleArchiveOrder = async (id: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), {
        isArchived: true
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const handleDeleteOrderPermanent = async (id: string) => {
    try {
      const order = orders.find(o => o.id === id);
      if (order && order.items) {
        // Return items to stock
        for (const item of order.items) {
          if (!item.productId) continue;
          const productRef = doc(db, 'products', item.productId);
          // Check if product still exists before updating
          const productDoc = await getDoc(productRef);
          if (productDoc.exists()) {
            const updateData: any = { updatedAt: serverTimestamp() };
            if (item.gender === 'male') {
              updateData.maleStock = increment(item.quantity || 0);
            } else {
              updateData.femaleStock = increment(item.quantity || 0);
            }
            await updateDoc(productRef, updateData);
          }
        }
      }
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      console.error("Error deleting order:", error);
      handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-500 text-lg">Manage your aquatic inventory and products.</p>
          
          {/* Debug Info - Only visible to admin for troubleshooting */}
          <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200 text-xs text-gray-500 w-fit shadow-sm">
            <p>Logged in as: <span className="font-mono font-bold text-gray-700">{auth.currentUser?.email}</span></p>
            <p>Admin status: <span className={`font-bold ${isAdmin ? 'text-green-600' : 'text-red-600'}`}>{isAdmin ? 'VERIFIED ADMIN' : 'NOT ADMIN'}</span></p>
          </div>

          {status.type && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-2xl flex items-center gap-3 w-full max-w-3xl ${
                status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-sm font-bold">{status.message}</p>
            </motion.div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 p-1.5 bg-white rounded-2xl w-fit border border-gray-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('publish')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'publish' 
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-5 h-5" />
            Publish Product
          </button>
          <button 
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'stock' 
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="w-5 h-5" />
            Manage Products
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'orders' 
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Customer Orders
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence mode="wait">
            {activeTab === 'publish' ? (
              <motion.div
                key="publish"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-gray-100"
              >
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <LayoutGrid className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">New Product Details</h2>
                      <p className="text-gray-500 text-sm">Fill in the information to list a new item on the shop.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Product Name</label>
                        <div className="relative">
                          <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            required
                            type="text" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" 
                            placeholder="e.g. Blue Grass Guppy"
                          />
                        </div>
                      </div>
                    </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Price (MMK)</label>
                          <div className="relative">
                            <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                              required
                              type="number" 
                              value={formData.price}
                              onChange={e => setFormData({...formData, price: e.target.value})}
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" 
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Male Stock</label>
                          <div className="relative">
                            <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                              required
                              type="number" 
                              value={formData.maleStock}
                              onChange={e => setFormData({...formData, maleStock: e.target.value})}
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" 
                              placeholder="10"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Female Stock</label>
                          <div className="relative">
                            <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                              required
                              type="number" 
                              value={formData.femaleStock}
                              onChange={e => setFormData({...formData, femaleStock: e.target.value})}
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" 
                              placeholder="10"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Photo URL</label>
                        <div className="flex flex-col gap-3">
                          <div className="relative">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                              required
                              type="url" 
                              value={formData.photoUrl}
                              onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" 
                              placeholder="https://images.unsplash.com/..."
                            />
                          </div>
                          {formData.photoUrl && (
                            <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                              <img 
                                src={formData.photoUrl} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/guppy/800/600';
                                }}
                              />
                              <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white uppercase">
                                Preview
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                      <textarea 
                        required
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none" 
                        placeholder="Describe the product features and benefits..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Technical Specs (One per line)</label>
                      <div className="relative">
                        <ListChecks className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea 
                          value={formData.specs}
                          onChange={e => setFormData({...formData, specs: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none" 
                          placeholder={"Strain: Blue Grass\nAge: 3 Months\nGender: Pair"}
                          rows={4}
                        />
                      </div>
                      <p className="mt-2 text-[10px] text-gray-400 ml-1">Type each specification as "Name: Value" on a new line.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Video Showcase URL (Optional)</label>
                      <div className="flex flex-col gap-3">
                        <div className="relative">
                          <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="url" 
                            value={formData.videoUrl}
                            onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" 
                            placeholder="Direct video link or YouTube embed link"
                          />
                        </div>
                        {formData.videoUrl && (
                          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-600 font-bold uppercase flex items-center gap-2">
                            {formData.videoUrl.includes('youtube.com') || formData.videoUrl.includes('youtu.be') ? 'YouTube Video Detected' : 'Direct Video Link Detected'}
                          </div>
                        )}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-bold hover:bg-primary transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-3"
                    >
                      <Save className="w-5 h-5" />
                      Publish Product to Website
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : activeTab === 'stock' ? (
              <motion.div
                key="stock"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <Box className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Manage Products & Stock</h2>
                      <p className="text-gray-500 text-sm">Update quantities or remove products from the shop.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-100">
                      {products.filter(p => p.maleStock === 0 || p.femaleStock === 0).length} Partially Sold Out
                    </div>
                    <div className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-100">
                      {products.filter(p => (p.maleStock > 0 && p.maleStock < 5) || (p.femaleStock > 0 && p.femaleStock < 5)).length} Low Stock
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <AnimatePresence mode="popLayout">
                    {products.map(p => (
                      <motion.div 
                        layout
                        key={p.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className={`flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl border transition-all group ${
                          (p.maleStock === 0 && p.femaleStock === 0) ? 'bg-red-50 border-red-100' : (p.maleStock < 5 || p.femaleStock < 5) ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-100 hover:border-primary/20 hover:shadow-lg'
                        }`}
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-200 relative">
                          <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          {(p.maleStock === 0 && p.femaleStock === 0) && (
                            <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] flex items-center justify-center">
                              <X className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-grow min-w-0 text-center sm:text-left">
                          <h4 className="font-bold text-gray-900 mb-1">{p.name}</h4>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              (p.maleStock || 0) === 0 
                                ? 'bg-red-500 text-white' 
                                : (p.maleStock || 0) < 5 
                                  ? 'bg-orange-500 text-white' 
                                  : 'bg-emerald-500 text-white'
                            }`}>
                              Male: {(p.maleStock || 0) === 0 ? 'Out of Stock' : (p.maleStock || 0) < 5 ? 'Low Stock' : 'In Stock'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              (p.femaleStock || 0) === 0 
                                ? 'bg-red-500 text-white' 
                                : (p.femaleStock || 0) < 5 
                                  ? 'bg-orange-500 text-white' 
                                  : 'bg-emerald-500 text-white'
                            }`}>
                              Female: {(p.femaleStock || 0) === 0 ? 'Out of Stock' : (p.femaleStock || 0) < 5 ? 'Low Stock' : 'In Stock'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
                            <span className="text-[10px] font-bold text-gray-400 uppercase w-12">Male</span>
                            <button 
                              onClick={() => updateStock(p.id, 'male', (p.maleStock || 0) - 1)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Decrease Male Stock"
                            >
                              <MinusCircle className="w-5 h-5" />
                            </button>
                            <div className="w-12 text-center">
                              <input 
                                type="number"
                                min="0"
                                value={p.maleStock || 0}
                                onChange={(e) => updateStock(p.id, 'male', parseInt(e.target.value) || 0)}
                                className={`w-full text-center bg-transparent focus:outline-none text-sm font-bold ${(p.maleStock || 0) < 5 ? 'text-orange-600' : 'text-gray-900'}`}
                              />
                            </div>
                            <button 
                              onClick={() => updateStock(p.id, 'male', (p.maleStock || 0) + 1)}
                              className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"
                              title="Increase Male Stock"
                            >
                              <PlusCircle className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
                            <span className="text-[10px] font-bold text-gray-400 uppercase w-12">Female</span>
                            <button 
                              onClick={() => updateStock(p.id, 'female', (p.femaleStock || 0) - 1)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Decrease Female Stock"
                            >
                              <MinusCircle className="w-5 h-5" />
                            </button>
                            <div className="w-12 text-center">
                              <input 
                                type="number"
                                min="0"
                                value={p.femaleStock || 0}
                                onChange={(e) => updateStock(p.id, 'female', parseInt(e.target.value) || 0)}
                                className={`w-full text-center bg-transparent focus:outline-none text-sm font-bold ${(p.femaleStock || 0) < 5 ? 'text-orange-600' : 'text-gray-900'}`}
                              />
                            </div>
                            <button 
                              onClick={() => updateStock(p.id, 'female', (p.femaleStock || 0) + 1)}
                              className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"
                              title="Increase Female Stock"
                            >
                              <PlusCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {confirmDeleteId === p.id ? (
                            <div className="flex items-center gap-2 bg-red-50 p-1 rounded-2xl border border-red-100">
                              <button 
                                onClick={() => handleDelete(p.id)}
                                disabled={deletingId === p.id}
                                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all flex items-center gap-2"
                              >
                                {deletingId === p.id ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                                Confirm
                              </button>
                              <button 
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-4 py-2 bg-white text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setConfirmDeleteId(p.id)}
                              className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                              title="Delete Product"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {products.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-1">No products yet</h3>
                      <p className="text-gray-500">Publish a product first to manage its stock.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <ShoppingCart className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Customer Orders</h2>
                      <p className="text-gray-500 text-sm">Review and manage incoming orders from your customers.</p>
                    </div>
                  </div>
                  {notificationsEnabled ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200">
                        <button
                          onClick={() => setNotificationsActive(true)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            notificationsActive 
                              ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                          ON
                        </button>
                        <button
                          onClick={() => setNotificationsActive(false)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            !notificationsActive 
                              ? 'bg-white text-red-600 shadow-sm ring-1 ring-red-100' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <BellOff className="w-4 h-4" />
                          OFF
                        </button>
                      </div>
                      <button
                        onClick={testNotification}
                        className="px-4 py-2 text-[10px] font-bold text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                        Test Alert
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={requestNotificationPermission}
                      className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-2xl text-xs font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <Bell className="w-4 h-4" />
                      Enable Order Notifications
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-100 rounded-xl w-fit">
                  <button
                    onClick={() => setOrderView('active')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      orderView === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Active ({orders.filter(o => !o.isArchived).length})
                  </button>
                  <button
                    onClick={() => setOrderView('delivered')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      orderView === 'delivered' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Delivered ({orders.filter(o => o.isArchived && o.status !== 'cancelled').length})
                  </button>
                  <button
                    onClick={() => setOrderView('cancelled')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      orderView === 'cancelled' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Cancelled ({orders.filter(o => o.isArchived && o.status === 'cancelled').length})
                  </button>

                  <div className="flex-grow max-w-md ml-auto">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search order ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-gray-100 border border-transparent rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {(() => {
                    const filteredOrders = orders.filter(order => {
                      if (searchQuery) {
                        const cleanQuery = searchQuery.startsWith('#') ? searchQuery.slice(1).toLowerCase() : searchQuery.toLowerCase();
                        const searchMatch = 
                          order.id.toLowerCase().includes(cleanQuery) ||
                          (order.customerName || '').toLowerCase().includes(cleanQuery) ||
                          (order.phone || '').toLowerCase().includes(cleanQuery);
                        if (!searchMatch) return false;
                      }
                      if (orderView === 'active') return !order.isArchived;
                      if (orderView === 'delivered') return order.isArchived && order.status !== 'cancelled';
                      if (orderView === 'cancelled') return order.isArchived && order.status === 'cancelled';
                      return false;
                    });

                    if (filteredOrders.length === 0) {
                      return (
                        <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {searchQuery ? 'No matching orders' : 'No orders yet'}
                          </h3>
                          <p className="text-gray-500 text-sm max-w-xs mx-auto">
                            {searchQuery 
                              ? `We couldn't find any orders matching "${searchQuery}"` 
                              : `Incoming customer orders will appear here.`}
                          </p>
                        </div>
                      );
                    }

                    return filteredOrders.map(order => (
                      <div key={order.id} className="p-4 sm:p-6 rounded-3xl border border-gray-100 bg-white hover:border-primary/20 hover:shadow-xl transition-all group">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-4 flex-grow min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="group/id relative">
                                <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase">
                                  ID: #{order.id.slice(-8).toUpperCase()}
                                </span>
                                <div className="absolute bottom-full left-0 mb-2 hidden group-hover/id:block z-50">
                                  <div className="bg-gray-900 text-white text-[10px] font-mono py-1 px-3 rounded shadow-xl whitespace-nowrap">
                                    Full ID: {order.id}
                                  </div>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                                order.status === 'shipped' ? 'bg-purple-100 text-purple-600' :
                                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {order.status}
                              </span>
                              <span className="text-xs text-gray-400 font-medium">
                                {order.createdAt?.toDate?.() ? order.createdAt.toDate().toLocaleString() : 'Just now'}
                              </span>
                            </div>
                            <div className="sm:text-right">
                              <p className="text-sm font-bold text-gray-900">
                                {order.items ? `${order.items.length} Items` : order.productName}
                              </p>
                              <p className="text-xs text-primary font-bold">
                                {(order.totalPrice || order.price || 0).toLocaleString()} MMK
                              </p>
                            </div>
                          </div>

                          {order.items && (
                            <div className="bg-white p-3 rounded-2xl border border-gray-100 space-y-2">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Items</p>
                              <div className="space-y-1.5">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center text-[11px]">
                                    <div className="flex items-center gap-2">
                                      <span className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center font-bold text-[9px]">
                                        {item.quantity}x
                                      </span>
                                      <span className="font-medium text-gray-700 line-clamp-1">{item.productName} ({item.gender})</span>
                                    </div>
                                    <span className="font-bold text-gray-900 whitespace-nowrap">{(item.totalPrice || 0).toLocaleString()} MMK</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {order.customerName && (
                            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                                <img 
                                  src={order.customerPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customerName)}&background=random`} 
                                  alt={order.customerName} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Account Info</p>
                                <p className="text-xs font-bold text-gray-900 truncate">{order.customerName}</p>
                                <p className="text-[10px] text-gray-500 truncate">{order.customerEmail}</p>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-gray-100">
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div className="min-w-0">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                                <p className="text-xs font-bold text-gray-900 truncate">{order.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.36-.48.99-.73 3.84-1.67 6.4-2.77 7.68-3.3 3.64-1.51 4.4-1.77 4.9-.18z"/>
                              </svg>
                              <div className="min-w-0">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Telegram</p>
                                <p className="text-xs font-bold text-gray-900 truncate">{order.telegram || '-'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div className="min-w-0">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Payment</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold text-gray-900 uppercase truncate">{order.paymentMethod}</p>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                    order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                  }`}>
                                    {order.paymentStatus || 'unpaid'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 bg-white p-3 rounded-2xl border border-gray-100">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address</p>
                              <p className="text-xs text-gray-600 leading-tight line-clamp-2">{order.address}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-[160px] flex-shrink-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Update Status</p>
                          <div className="space-y-2">
                            {order.paymentStatus !== 'paid' ? (
                              <button
                                onClick={() => updatePaymentStatus(order.id, 'paid')}
                                className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Confirm Payment
                              </button>
                            ) : (
                              <button
                                onClick={() => updatePaymentStatus(order.id, 'unpaid')}
                                className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100"
                              >
                                <X className="w-4 h-4" />
                                Mark as Unpaid
                              </button>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                              {(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as Order['status'][]).map(s => (
                              <button
                                key={s}
                                onClick={() => updateOrderStatus(order.id, s)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                  order.status === s 
                                    ? 'bg-gray-900 text-white border-gray-900' 
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                                }`}
                              >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </button>
                            ))}
                            </div>
                          </div>
                          
                          {order.isArchived && (
                            <button
                              onClick={() => handleDeleteOrderPermanent(order.id)}
                              className="mt-4 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-100"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Permanently
                            </button>
                          )}
                        </div>
                      </div>
                      </div>
                    ))
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
