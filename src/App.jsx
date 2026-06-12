import React, { useState } from 'react';
import HomePage from './components/HomePage';
import MenuPage from './components/MenuPage';
import Checkout from './components/Checkout';
import OrderTracking from './components/OrderTracking';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import FoodManagement from './components/FoodManagement';
import Analytics from './components/Analytics';
import AIAssistant from './components/AIAssistant';
import DigitalClock from './components/DigitalClock';
import WeatherDashboard from './components/WeatherDashboard';
import WorldClock from './components/WorldClock';
import './styles/index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const addToCart = (food) => {
    const existingItem = cart.find(item => item._id === food._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item._id === food._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...food, quantity: 1 }]);
    }
  };

  const removeFromCart = (foodId) => {
    setCart(cart.filter(item => item._id !== foodId));
  };

  const updateQuantity = (foodId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
    } else {
      setCart(cart.map(item =>
        item._id === foodId ? { ...item, quantity } : item
      ));
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.style.background = isDarkMode ? 'white' : '#1a1a1a';
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo" onClick={() => setCurrentPage('home')}>
            🏨 VIZON Hotel
          </div>
          <ul className="nav-menu">
            <li><a onClick={() => setCurrentPage('home')}>🏠 Home</a></li>
            <li><a onClick={() => setCurrentPage('menu')}>🍽️ Menu</a></li>
            <li><a onClick={() => setCurrentPage('weather')}>🌦️ Weather</a></li>
            <li><a onClick={() => setCurrentPage('clock')}>🕐 Clock</a></li>
            <li><a onClick={() => setCurrentPage('orders')}>📍 Orders</a></li>
            <li><a onClick={() => setCurrentPage('admin')}>👨‍💼 Admin</a></li>
          </ul>
          <div className="nav-right">
            <button className="dark-mode-btn" onClick={toggleDarkMode}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div className="cart-icon" onClick={() => setShowCheckout(true)}>
              🛒 {cart.length}
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'menu' && <MenuPage />}
        {currentPage === 'weather' && <WeatherDashboard />}
        {currentPage === 'clock' && <WorldClock />}
        {currentPage === 'orders' && <OrderTracking />}
        {currentPage === 'admin' && <AdminLogin />}
        {currentPage === 'admin-dashboard' && <AdminDashboard />}
        {currentPage === 'food-management' && <FoodManagement />}
        {currentPage === 'analytics' && <Analytics />}
      </main>

      {showCheckout && (
        <Checkout
          cartItems={cart}
          onClose={() => setShowCheckout(false)}
        />
      )}

      <AIAssistant />

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>🏨 VIZON Hotel</h4>
            <p>Advanced AI Food Delivery Platform</p>
          </div>
          <div className="footer-section">
            <h4>📞 Contact</h4>
            <p>Email: riskrishi340@gmail.com</p>
            <p>Phone: 9905461669</p>
          </div>
          <div className="footer-section">
            <h4>🔗 Links</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
            <a href="#">About Us</a>
          </div>
          <div className="footer-section">
            <h4>🌐 Social</h4>
            <a href="https://whatsapp.com">WhatsApp</a>
            <a href="https://instagram.com">Instagram</a>
            <a href="https://facebook.com">Facebook</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 VIZON Hotel. All rights reserved. | Made with ❤️ by Rishi Risk</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
