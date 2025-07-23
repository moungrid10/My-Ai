import React, { useState } from 'react';

export default function Auth({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const requestBody = isLogin
                ? { email, password }
                : { username, email, password };

            const res = await fetch(`http://localhost:3001/api/${isLogin ? 'login' : 'register'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Something went wrong');

            if (isLogin) {
                // Save token to localStorage for login
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onAuthSuccess(data.user);
            } else {
                // For registration, switch to login mode
                setIsLogin(true);
                setError('');
                alert('Registration successful! Please login.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-sky-900 text-white">
            <div className="p-8 rounded shadow-md max-w-xs">
                <h2 className="text-3xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Register'}</h2>
                <form onSubmit={handleSubmit} >
                    {!isLogin && (
                        <input
                            className="w-full mb-6 p-3 rounded bg-gray-700 text-black"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    )}
                    <input
                        className="w-full mb-6 p-3 rounded bg-gray-700 text-black"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="w-full mb-6 p-3 rounded bg-gray-700 text-black"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded"
                        type="submit"
                        

                    >
                        {isLogin ? 'Login' : 'Register'}

                    </button>
                </form>
                {error && <p className="mt-4 text-red-400">{error}</p>}
                <p
                    onClick={() => setIsLogin(!isLogin)}
                    className="mt-4 cursor-pointer text-sky-400 hover:underline text-sm text-center"
                >
                    {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
                </p>
            </div>
        </div>
    );
}
