import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Phone, CreditCard, MapPin, Search } from 'lucide-react';
import { Order } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { motion, AnimatePresence } from 'motion/react';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/');
        return;
      }

      const q = query(
        collection(db, 'orders'),
        where('customerUid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeOrders = onSnapshot(q, (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
        setLoading(false);
      });

      return () => unsubscribeOrders();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-500 text-lg">Track and review your aquatic purchases.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {orders.map(order => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-white/40 hover:border-primary/40 transition-all group"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-600' :
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {order.paymentStatus || 'unpaid'}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {order.createdAt?.toDate?.() ? order.createdAt.toDate().toLocaleString() : 'Just now'}
                      </span>
                    </div>
                    <div className="group/id relative inline-block">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 cursor-help">Order #{order.id?.slice(-8).toUpperCase()}</h3>
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover/id:block z-50">
                        <div className="bg-gray-900 text-white text-[10px] font-mono py-1 px-3 rounded shadow-xl whitespace-nowrap">
                          Full ID: {order.id}
                        </div>
                      </div>
                    </div>
                    <p className="text-primary font-bold">{(order.totalPrice || 0).toLocaleString()} MMK</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
                        <MapPin className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shipping Address</p>
                        <p className="text-sm text-gray-600 truncate max-w-[250px]">{order.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
                        <Phone className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Number</p>
                        <p className="text-sm text-gray-600">{order.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Method</p>
                        <p className="text-sm text-gray-600 uppercase font-medium">{order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Order Items</p>
                  <div className="flex flex-wrap gap-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 min-w-[200px]">
                        <div className="p-2 bg-white rounded-xl shadow-sm">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-none">{item.productName}</p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {item.quantity}x • {item.gender} • {(item.totalPrice || 0).toLocaleString()} MMK
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {orders.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't placed any orders yet. Head to the shop and find your first guppy!</p>
              <button 
                onClick={() => navigate('/shop')}
                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-primary transition-all shadow-lg shadow-gray-900/10 flex items-center gap-2 mx-auto"
              >
                <Search className="w-5 h-5" />
                Browse Shop
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
