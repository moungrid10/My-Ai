import React, { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setSuccess('✅ Registered successfully! You can now log in.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sky-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Register</h1>
      <form onSubmit={handleSubmit} className="bg-white text-black p-6 rounded-lg w-96 shadow-lg">
        <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required className="w-full mb-4 p-2 border border-gray-300 rounded" />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full mb-4 p-2 border border-gray-300 rounded" />
        <button type="submit" className="bg-sky-700 text-white px-4 py-2 rounded hover:bg-sky-600 w-full">Register</button>
        {error && <p className="text-red-600 mt-4">{error}</p>}
        {success && <p className="text-green-600 mt-4">{success}</p>}
      </form>
    </div>
  );
}
