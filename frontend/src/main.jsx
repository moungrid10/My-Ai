import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Auth from "../pages/Auth"; // adjust path
import './index.css';

function Root() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // You could add token validation here
      setUser(true);
    } else {
      setUser(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <>
      {user ? <App /> : <Auth onAuthSuccess={() => setUser(true)} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
