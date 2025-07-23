import React, { useState } from 'react';

export default function SignIn() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.location.href = '/'; // redirect to homepage
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-sky-200 text-white">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="bg-white text-black p-6 rounded-lg w-96 shadow-lg">
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full mb-4 p-2 border border-gray-300 rounded" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full mb-4 p-2 border border-gray-300 rounded" />
        <button type="submit" className="bg-sky-700 text-white px-4 py-2 rounded hover:bg-sky-600 w-full">Login</button>
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </form>
    </div>
  );
}
