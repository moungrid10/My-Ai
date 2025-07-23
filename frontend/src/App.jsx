import React, { useState } from 'react';
import jsPDF from 'jspdf';

export default function App() {
    const [chats, setChats] = useState([]);  // List of chat sessions
    const [currentChat, setCurrentChat] = useState(null);  // Current active chat
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [models, setModels] = useState([]);
    const [currentModel, setCurrentModel] = useState('mistral');
    const [modelLoadError, setModelLoadError] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(true);
    const [messageRatings, setMessageRatings] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    const copyURL = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                alert('URL copied to clipboard!');
                setShowMenu(false);
            })
            .catch(err => {
                console.error('Failed to copy URL:', err);
                alert('Failed to copy URL');
            });
    };

    const downloadAsPDF = () => {
        if (messages.length === 0) {
            alert('No messages to download');
            return;
        }

        const pdf = new jsPDF();
        const pageHeight = pdf.internal.pageSize.height;
        let yPosition = 20;
        const lineHeight = 10;
        const margin = 20;
        const maxWidth = pdf.internal.pageSize.width - 2 * margin;

        // Add title
        pdf.setFontSize(16);
        pdf.text('Chat Conversation', margin, yPosition);
        yPosition += 20;

        // Add date
        pdf.setFontSize(10);
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
        yPosition += 15;

        // Add messages
        pdf.setFontSize(12);
        messages.forEach((msg, index) => {
            const sender = msg.user ? 'User' : 'AI';
            const text = `${sender}: ${msg.text}`;

            // Split text into lines that fit the page width
            const lines = pdf.splitTextToSize(text, maxWidth);

            // Check if we need a new page
            if (yPosition + (lines.length * lineHeight) > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;
            }

            // Add the text
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * lineHeight + 5;
        });

        // Save the PDF
        const fileName = `chat-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        setShowMenu(false);
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        localStorage.setItem('darkMode', !darkMode);
    };

    // Rate a message
    const rateMessage = (messageIndex, rating) => {
        setMessageRatings(prev => ({
            ...prev,
            [messageIndex]: rating
        }));
    };

    // Handle file upload
    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        const newFiles = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
    };

    // Remove uploaded file
    const removeFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    // Filter messages based on search
    const filteredMessages = messages.filter(msg =>
        msg.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Load dark mode preference
    React.useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    const createNewChat = async () => {
        const newChat = {
            title: 'New Chat',
            messages: []
        };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/save-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newChat)
            });

            const savedChat = await res.json();
            setChats(prev => [savedChat, ...prev]);
            setCurrentChat(savedChat._id);
            setMessages([]);
        } catch (err) {
            console.error("❌ Failed to create chat:", err);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        // Create new chat if none exists
        if (!currentChat) {
            await createNewChat(); // Wait until the chat is created
            return; // Wait for user to type again after creation
        }

        setIsLoading(true);
        const updatedMessages = [...messages, { user: true, text: input }];
        setMessages(updatedMessages);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    model: currentModel
                })
            });

            const data = await res.json();
            console.log('Received response:', data);

            let newMessage;
            if (data.error) {
                console.error('Error from backend:', data.error);
                newMessage = { user: false, text: `Error: ${data.error}` };
            } else if (data.response) {
                newMessage = { user: false, text: data.response };
            } else {
                console.error('Unexpected response format:', data);
                newMessage = { user: false, text: 'Unexpected response format' };
            }

            const finalMessages = [...updatedMessages, newMessage];
            setMessages(finalMessages);

            const newTitle = input.slice(0, 30) + (input.length > 30 ? '...' : '');
            const isFirstMessage = chats.find(chat => chat._id === currentChat)?.messages?.length === 0;

            setChats(currentChats =>
                currentChats.map(chat =>
                    chat._id === currentChat
                        ? {
                            ...chat,
                            title: chat.title === 'New Chat'
                                ? input.slice(0, 30) + (input.length > 30 ? '...' : '')
                                : chat.title,
                            messages: finalMessages
                        }
                        : chat
                )
            );


            const token = localStorage.getItem('token');
            await fetch(`/api/update-chat/${currentChat}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: finalMessages,
                    ...(isFirstMessage && { title: newTitle })
                })
            });

        } catch (err) {
            console.error('Frontend error:', err);
            setMessages(msgs => [...msgs, { user: false, text: `Error: ${err.message}` }]);
        } finally {
            setIsLoading(false);
            setInput('');
        }
    };


    // Format the message with proper spacing and structure
    const formatMessage = (text) => {
        return text
            .split('\n')
            .map((line, i) => {
                // Check for list items
                if (line.match(/^[1-9]\.|^\-|\*/)) {
                    return `\n${line}`;
                }
                // Check for code blocks or sections
                if (line.match(/^```/)) {
                    return `\n${line}`;
                }
                // Add spacing after periods and question marks that end sentences
                return line.replace(/([.!?])\\s+/g, '$1\n\n');
            })
            .join('\n');
    };

    // Fetch available models from Ollama
    const fetchModels = async () => {
        setModelLoadError(false);
        try {
            console.log('Fetching models...');
            const response = await fetch('/api/models');
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Received data:', data);

            // Check if data is the expected format from Ollama's response
            if (data && data.models) {
                const modelNames = Array.isArray(data.models)
                    ? data.models.map(model => model.name || model.model || model)
                    : Object.keys(data.models);

                console.log('Setting models:', modelNames);
                setModels(modelNames);

                // Keep current model if it exists in the list, otherwise set to first available
                if (modelNames.length > 0) {
                    if (!modelNames.includes(currentModel)) {
                        setCurrentModel(modelNames[0]);
                    }
                }
            } else {
                setModelLoadError(true);
                console.error('Invalid models data received:', data);
            }
        } catch (error) {
            setModelLoadError(true);
            console.error('Error fetching models:', error);
            if (error.message.includes('Failed to fetch')) {
                console.error('Backend server might not be running or not accessible');
            }
        }
    };

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (showMenu && !event.target.closest('.relative')) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    // Fetch models when component mounts
    React.useEffect(() => {
        const fetchChats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('No token found, skipping chat fetch');
                    return;
                }

                const res = await fetch('/api/chats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    console.error('Failed to fetch chats:', res.status, res.statusText);
                    return;
                }

                const data = await res.json();
                setChats(data);

                if (data.length > 0) {
                    setCurrentChat(data[0]._id); // Use MongoDB's _id
                    setMessages(data[0].messages);
                }
            } catch (err) {
                console.error("❌ Failed to load chats:", err);
                // Don't crash the component, just log the error
            }
        };

        // Only fetch data if we have a token
        const token = localStorage.getItem('token');
        if (token) {
            fetchChats();
        }
        fetchModels();
    }, []);

    const deleteChat = async (chatId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/delete-chat/${chatId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setChats(prev => prev.filter(chat => chat._id !== chatId));

            if (currentChat === chatId) {
                setCurrentChat(null);
                setMessages([]);
            }
        } catch (err) {
            console.error('❌ Failed to delete chat:', err);
        }
    };




    return (
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-600'} flex flex-row h-screen transition-colors`}>
            {/* Sidebar with History */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-sky-900'} w-80 flex flex-col h-screen transition-colors`}>
                <div>
                    <div className="flex items-center justify-between px-4 py-4">
                        <span className="font-bold text-md text-gray-200">
                            {JSON.parse(localStorage.getItem('user') || '{}').username || 'User'}
                        </span>
                        <div className="flex items-center gap-2">

                            <button
                                className="text-blue-400 hover:text-blue-300 text-sm"
                                title="Search Messages"
                            >
                                🔍
                            </button>
                            
                        </div>
                    </div>

                    {showSearch && (
                        <div className="px-4 pb-4">
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <hr className="border-gray-200 border-1" />


                    <div className="mt-10 mx-2">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-white text-lg font-bold">Chat History</h2>
                            <button
                                onClick={createNewChat}
                                className="bg-sky-700 text-white px-3 py-1 rounded-lg hover:bg-sky-600 transition-colors text-sm"
                            >
                                New Chat
                            </button>
                        </div>
                        <div className="overflow-y-auto" style={{ height: "calc(100vh - 200px)" }}>
                            {chats.length === 0 ? (
                                <div className="text-gray-300 p-4 text-center">No chats yet.</div>
                            ) : (
                                chats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => {
                                            setCurrentChat(chat.id);
                                            setMessages(chat.messages);
                                        }}
                                        className={`flex  justify-start flex-col p-3 px-4 mt-2 rounded-xl cursor-pointer bg-sky-700 hover:bg-sky-800 transition-colors ${currentChat === chat.id ? 'bg-gray-300 border-2 border-white' : ''
                                            }`}
                                    >
                                        <div className='flex items-center justify-between flex-row'>
                                            <div className={`text-gray-200 group-hover:text-gray-800 truncate font-bold ${currentChat === chat.id ? 'text-gray-800 ' : ''
                                                }`}>
                                                {chat.title}
                                            </div>

                                            <button
                                                className='text-gray-400 font-bold hover:text-red-800 ml-2'
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent chat click
                                                    deleteChat(chat._id);
                                                }}
                                            >
                                                X
                                            </button>

                                        </div>
                                        <div className="text-xs text-gray-400 flex justify-end">
                                            {(() => {
                                                const createdDate = new Date(chat.createdAt);
                                                const now = new Date();
                                                const isToday = createdDate.toDateString() === now.toDateString();

                                                return isToday
                                                    ? "Today"
                                                    : createdDate.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
                                            })()}


                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                {/* <button
                                onClick={logout}
                                className="text-red-500 hover:text-red-300 text-sm justify-end mb-20"
                                title="Logout"
                            >
                                Logout
                            </button> */}
            </div>

            <div className={`flex-1 flex flex-col h-full ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors`}>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} flex-col flex transition-colors`}>
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-2 py-2 items-center justify-between flex-row flex transition-colors`}>
                        <div >
                            <select
                                className="rounded-2xl pl-2 py-2 font-bold bg-sky-800 text-gray-200 bg-transparent  focus:outline-none focus:bg-gray-800 hover:bg-gray-800"
                                value={models.includes(currentModel) ? currentModel : ''}
                                onChange={(e) => setCurrentModel(e.target.value)}
                                disabled={modelLoadError || models.length === 0}
                            >
                                {modelLoadError ? (
                                    <option value="">Error loading models</option>
                                ) : models.length === 0 ? (
                                    <option value="">Loading models...</option>
                                ) : (
                                    models.map(model => {
                                        const displayName = model.replace(':latest', '');
                                        return (
                                            <option key={model} value={model}>
                                                {displayName}
                                            </option>
                                        );
                                    })
                                )}
                            </select>
                            <button
                                onClick={() => {
                                    setModels([]);  // Clear models before fetching
                                    fetchModels();
                                }}
                                className="ml-2 text-gray-500 hover:text-sky-900 "
                                title="Refresh models"
                                disabled={modelLoadError}
                            >
                                ⟳
                            </button>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className="text-yellow-400 hover:text-yellow-300 text-lg"
                            title={darkMode ? 'Light Mode' : 'Dark Mode'}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        <button
                            onClick={copyURL}
                            className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                            <span className={`mr-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>📋 Copy URL</span>
                         
                        </button>
                        <button
                            onClick={downloadAsPDF}
                            className=" text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            disabled={messages.length === 0}
                        >
                            <span className={`mr-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>📄 Download as PDF</span>
                            
                        </button>


                    </div>
                    <hr className="border-gray-600 border-1" />
                </div>
                <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-white'} p-6 transition-colors`}>
                    <div className="max-w-4xl mx-auto">
                        {(searchTerm ? filteredMessages : messages).map((msg, i) => (
                            <div key={i} className={msg.user ? 'text-right' : 'text-left'}>
                                <div className={`inline-block px-4 py-2 rounded-lg my-1 max-w-[80%] break-words ${msg.user ? 'bg-sky-900 text-white' : 'bg-gray-100 text-black'}`}>
                                    {msg.user ? (
                                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                    ) : (
                                        <div className="whitespace-pre-line break-words">
                                            {formatMessage(msg.text).split('\n').map((line, index) => (
                                                <React.Fragment key={index}>
                                                    {line.startsWith('```') ? (
                                                        <pre className="bg-gray-800 text-gray-100 p-2 rounded my-8 overflow-x-auto">
                                                            <code>{line.replace(/```/g, '')}</code>
                                                        </pre>
                                                    ) : line.match(/^[1-9]\.|\-|\*/) ? (
                                                        <p className="ml-4">{line}</p>
                                                    ) : (
                                                        <p className="mb-5">{line}</p>
                                                    )}

                                                </React.Fragment>

                                            ))

                                            }
                                            <p className="text-xs text-gray-400 mt-1 flex justify-end">
                                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </p>
                                        </div>
                                    )}

                                    {/* Message Rating for AI responses */}
                                    {!msg.user && (
                                        <div className="flex items-center gap-1 mt-2 text-xs">
                                            <span className="text-gray-500">Rate:</span>
                                            {[1, 2, 3, 4, 5].map(rating => (
                                                <button
                                                    key={rating}
                                                    onClick={() => rateMessage(i, rating)}
                                                    className={`text-lg hover:scale-110 transition-transform ${messageRatings[i] >= rating ? 'text-yellow-400' : 'text-gray-300'
                                                        }`}
                                                >
                                                    ⭐
                                                </button>
                                            ))}
                                            {messageRatings[i] && (
                                                <span className="text-gray-500 ml-2">({messageRatings[i]}/5)</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="text-left">
                                <div className="inline-block px-4 py-2 rounded-lg my-1 bg-gray-100">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-sky-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-sky-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-sky-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Input Area */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-sky-900'} p-4 transition-colors`}>
                    <div className="max-w-4xl mx-auto">
                        {/* File Upload Area */}
                        {uploadedFiles.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {uploadedFiles.map(file => (
                                    <div key={file.id} className="flex items-center bg-gray-700 text-white px-3 py-1 rounded-lg text-sm">
                                        <span className="mr-2">📄</span>
                                        <span className="truncate max-w-32">{file.name}</span>
                                        <button
                                            onClick={() => removeFile(file.id)}
                                            className="ml-2 text-red-400 hover:text-red-300"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <input
                                    className={`w-full border-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-sky-800 bg-white text-black'} rounded-xl p-4 focus:outline-none focus:border-sky-600 h-20 pr-12 transition-colors`}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !isLoading && sendMessage()}
                                    placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
                                    disabled={isLoading}
                                />

                                {/* File Upload Button */}
                                <label className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                    />
                                    <span className="text-sky-900 text-4xl font-bold hover:bg-gray-700 hover:text-white h-8 w-8 flex items-center justify-center cursor-pointer pb-2 rounded-full " title="Upload files">
                                        +
                                    </span>
                                </label>
                            </div>

                            <button
                                className={`text-white font-bold px-6 py-4 rounded-full transition-colors ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-sky-600 hover:bg-green-800'
                                    }`}
                                onClick={sendMessage}
                                disabled={isLoading}
                            >
                                {isLoading ? "..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
