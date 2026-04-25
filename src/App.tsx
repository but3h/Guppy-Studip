import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import Admin from './pages/Admin';
import MyOrders from './pages/MyOrders';
import ProductDetails from './pages/ProductDetails';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';
import { Fish } from 'lucide-react';

export default function App() {
  const [isCartOpen, setIsCartOpen] = React.useState(false);

  return (
    <ErrorBoundary>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col font-sans text-gray-900 selection:bg-primary/20 relative bg-gray-50">
            <Navbar onOpenCart={() => setIsCartOpen(true)} />
            <main className="flex-grow">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                  <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
                  <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
                  <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
                  <Route path="/orders" element={<PageWrapper><MyOrders /></PageWrapper>} />
                  <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
                </Routes>
              </AnimatePresence>
            </main>
            <Footer />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
