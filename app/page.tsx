'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPaperclip, FaPaperPlane, FaFilePdf, FaFileImage, FaFileArchive, FaFileWord, FaFileExcel, FaFileDownload } from 'react-icons/fa';
import { FiSmile } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import io from 'socket.io-client';
import Sidebar from '@/components/Sidebar';
import { DateTime } from 'luxon';  // For date and time formatting

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

type Message = {
  id: number;
  message: string | null;
  sender: string;
  file?: string | null;
  fileName?: string | null;
  roomId?: string | null;
  timestamp: string;  // Added timestamp
};

const ROOM_ID = 'test-room-id';
const socket = io('https://chat-backend-ten-mu.vercel.app/');

const getFileIcon = (fileName: string | null | undefined) => {
  if (!fileName) return null;
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return <FaFilePdf className="text-red-600" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FaFileImage className="text-blue-600" />;
    case 'zip':
    case 'rar':
      return <FaFileArchive className="text-green-600" />;
    case 'doc':
    case 'docx':
      return <FaFileWord className="text-blue-700" />;
    case 'xls':
    case 'xlsx':
      return <FaFileExcel className="text-green-700" />;
    default:
      return <FaFileImage className="text-gray-600" />;
  }
};

const ChatApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit('join room', ROOM_ID);

    const handleNewMessage = (newMessage: Message) => {
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg) => msg.id === newMessage.id);
        if (messageExists) {
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });
    };

    socket.on('message', handleNewMessage);

    socket.on('typing', (username: string) => {
      setIsTyping(`${username} is typing...`);
    });

    socket.on('stop typing', () => {
      setIsTyping(null);
    });

    return () => {
      socket.emit('leave room', ROOM_ID);
      socket.off('message', handleNewMessage);
      socket.off('typing');
      socket.off('stop typing');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
      socket.emit('typing', { roomId: ROOM_ID, username: 'user' });
    }

    const timeout = setTimeout(() => {
      setTyping(false);
      socket.emit('stop typing', ROOM_ID);
    }, 2000);

    return () => clearTimeout(timeout);
  };

  const handleEmojiClick = (emojiData: any) => {
    setInputValue((prevInput) => prevInput + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const sendMessage = () => {
    const trimmedMessage = inputValue.trim();

    if (!trimmedMessage && !attachedFile) {
      console.log('Cannot send an empty message.');
      return;
    }

    const messageData: Message = {
      id: Date.now(),
      message: trimmedMessage || null,
      sender: 'user',
      file: attachedFile ? URL.createObjectURL(attachedFile) : null,
      fileName: attachedFile ? attachedFile.name : null,
      roomId: ROOM_ID,
      timestamp: DateTime.now().toISO(),  // Add timestamp
    };

    socket.emit('message', messageData);
    setMessages((prevMessages) => [...prevMessages, messageData]);
    setInputValue('');
    setAttachedFile(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }

    socket.emit('stop typing', ROOM_ID);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    handleTyping();

    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
  };

  const formatTimestamp = (isoString: string) => {
    const dateTime = DateTime.fromISO(isoString);
    return dateTime.toLocaleString(DateTime.TIME_SIMPLE);  // Format time
  };

  const formatDate = (isoString: string) => {
    const dateTime = DateTime.fromISO(isoString);
    return dateTime.toLocaleString(DateTime.DATE_MED);  // Format date
  };

  return (
    <div className="flex flex-col h-screen mx-auto max-w-full md:max-w-4xl px-4 sm:px-6 md:px-8">
      <div className="bg-white p-4 flex items-center shadow-md mb-2 md:mb-4">
      <img
          src='https://cdn.esquimaltmfrc.com/wp-content/uploads/2015/09/flat-faces-icons-circle-man-9.png'
          alt='profile'
          className='w-12 h-12 rounded-full mr-4'
        />
        <div className='flex flex-col'>
          <span className='text-sm text-black'>@salesmembernickname</span>
          <span className='font-semibold text-black'>Accounting and Finance</span>
        </div>
        <div className='ml-4 mt-5 text-sm text-red-500'>Deadline: 30-Aug-2024</div>
      </div>
      <Sidebar />
      <div className="flex flex-col flex-grow h-full border-gray-300 rounded-xl border-2 overflow-hidden mb-6">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const showDate =
              !prevMessage ||
              formatDate(message.timestamp) !== formatDate(prevMessage.timestamp);
 
            return (
              <div key={message.id} className={`flex w-full mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                              {/* {isTyping && <p className='text-gray-500 italic'>{isTyping}</p>} */}
                {showDate && <div className="w-full justify-center py-2 text-center"><span className="text-center text-blue-500">{formatDate(message.timestamp)}</span></div>}
                <div className="flex items-end max-w-xs md:max-w-md lg:max-w-lg">
                  {message.sender !== 'user' && (
                    <img src="/user.svg" alt="salesmember" className="w-8 h-8 rounded-full mr-2" />
                  )}
                  <div className={`p-3 rounded-lg ${message.sender === 'user' ? 'self-end border-blue-500 border-2' : 'self-start border-green-500 border-2'} max-w-[100%] whitespace-pre-wrap overflow-hidden mt-10`}>
                    {message.message || message.fileName ? message.message : 'No message content'}
                    {message.file && (
                      <div className="mt-2 flex items-center">
                        {getFileIcon(message.fileName)}
                        <a href={message.file} download={message.fileName || 'file'} className="ml-2 text-blue-600 flex items-center">
                          {message.fileName || 'Download'} <FaFileDownload className="ml-1" />
                        </a>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">{formatTimestamp(message.timestamp)}</div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white shadow-md flex flex-col items-center">
          {showEmojiPicker && (
            <div className="absolute bottom-20 md:bottom-24">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <div className="relative flex items-center w-full border border-gray-300 rounded-lg p-2 pr-4">
            <textarea
              ref={textareaRef}
              placeholder="Type your message..."
              className="flex-1 border-none focus:outline-none resize-none overflow-hidden"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown} 
              rows={1}
              style={{ height: '24px' }}
            />
            <div className="flex items-center ml-2">
              <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="text-blue-500 hover:text-blue-800">
                <FiSmile className='w-6 h-6'/>
              </button>
              <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} />
              <label htmlFor="fileInput" className="ml-2 text-blue-500 hover:text-blue-800">
                <FaPaperclip className='w-6 h-6'/>
              </label>
              <button onClick={sendMessage} className="ml-2 text-blue-500 hover:text-blue-800">
                <FaPaperPlane className='w-6 h-6'/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
