import { useState, useEffect } from 'react';
import { LogOut, Download, Trash2, Search, Mail, User, MessageSquare, Bell, BellOff, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';

// Railway backend URL - works everywhere
const API_URL = 'https://web-production-966d0.up.railway.app/api';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

interface AdminPanelProps {
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function AdminPanel({ onLogout, isDarkMode, toggleTheme }: AdminPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample data fallback
  const sampleData = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Question about services',
      message: 'Hi, I would like to know more about your services. Can you provide more details?',
      date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
    },
    {
      id: '2',
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      subject: 'Partnership opportunity',
      message: 'Hello, I represent a company that would like to explore partnership opportunities with you.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      subject: 'Feedback',
      message: 'Great work on your recent project! I really enjoyed it.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read: true,
    },
  ];

  // Fetch messages from database or use sample data
  const fetchMessages = async () => {
    try {
      console.log('🔄 Fetching from:', `${API_URL}/contacts`);
      
      const response = await fetch(`${API_URL}/contacts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('📦 Response status:', response.status);
      
      if (response.ok) {
        const jsonData = await response.json();
        console.log('📥 Raw data from API:', jsonData);
        
        // Railway API wraps data in { success, data }
        const data = jsonData.data || jsonData;
        
        if (Array.isArray(data) && data.length > 0) {
          // Map API response to component data structure
          const mappedData = data.map((msg: any) => ({
            id: msg._id || msg.id,
            name: msg.name,
            email: msg.email,
            subject: msg.title || msg.subject || 'No Subject',
            message: msg.message,
            date: msg.createdAt || msg.date,
            read: msg.read || false
          }));
          console.log('✅ Mapped data:', mappedData);
          setMessages(mappedData);
          setError(null);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to sample data
      console.log('⚠️  Using sample data (API not available)');
      setMessages(sampleData);
      setError(null);
      setLoading(false);
    } catch (err: any) {
      console.log('⚠️  API unavailable, loading sample data');
      // On any error, show sample data
      setMessages(sampleData);
      setError(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Check notification permission status
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }

    // Poll for new messages every 10 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      toast.success('Notifications enabled!');
      
      new Notification('Notifications Enabled', {
        body: 'You will now receive alerts for new messages',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
    } else {
      setNotificationsEnabled(false);
      toast.error('Notification permission denied');
    }
  };

  const toggleNotifications = () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      toast.info('Notifications disabled');
    } else {
      requestNotificationPermission();
    }
  };

  const showNotification = (message: Message) => {
    if (!notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification('New Message Received', {
      body: `From: ${message.name}\nSubject: ${message.subject}`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: message.id,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      handleViewMessage(message);
      notification.close();
    };

    toast.success(`New message from ${message.name}`, {
      description: message.subject,
      duration: 5000,
    });
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      try {
        await fetch(`${API_URL}/messages/${message.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true })
        });
        
        const updated = messages.map((m) =>
          m.id === message.id ? { ...m, read: true } : m
        );
        setMessages(updated);
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/messages/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      
      const updated = messages.filter((m) => m.id !== id);
      setMessages(updated);
      setDeleteId(null);
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      toast.success('Message deleted successfully');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message');
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['Name', 'Email', 'Subject', 'Message', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...messages.map((m) =>
        [
          `"${m.name}"`,
          `"${m.email}"`,
          `"${m.subject}"`,
          `"${m.message.replace(/"/g, '""')}"`,
          `"${new Date(m.date).toLocaleString()}"`,
          m.read ? 'Read' : 'Unread',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className={`rounded-3xl p-8 shadow-xl max-w-md w-full ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ⚠️ Connection Error
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>
          <div className="space-y-2 text-sm">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              <strong>To fix this:</strong>
            </p>
            <ol className={`list-decimal list-inside space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>Open a new terminal</li>
              <li>Navigate to the project folder</li>
              <li>Run: <code className="bg-gray-700 px-2 py-1 rounded">npm install express cors sqlite3</code></li>
              <li>Run: <code className="bg-gray-700 px-2 py-1 rounded">npm run server</code></li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`rounded-3xl p-6 shadow-xl mb-6 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className={isDarkMode ? 'text-white' : 'text-gray-900'}>Messages Dashboard</h1>
              <div className="flex gap-2">
                <Badge className={`border-0 ${
                  isDarkMode 
                    ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-900/50' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-100'
                }`}>
                  📨 Total: {messages.length}
                </Badge>
                {unreadCount > 0 && (
                  <Badge className={`border-0 ${
                    isDarkMode 
                      ? 'bg-pink-900/50 text-pink-300 hover:bg-pink-900/50' 
                      : 'bg-pink-100 text-pink-700 hover:bg-pink-100'
                  }`}>
                    ✨ Unread: {unreadCount}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={toggleTheme}
                className={`${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } shadow-lg`}
              >
                {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {isDarkMode ? 'Light' : 'Dark'}
              </Button>
              <Button
                onClick={toggleNotifications}
                className={`${
                  notificationsEnabled 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                } text-white shadow-lg`}
              >
                {notificationsEnabled ? (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications On
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4 mr-2" />
                    Notifications Off
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownloadCSV}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/30"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={onLogout}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className={`rounded-3xl p-6 shadow-xl mb-6 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}>
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <Input
              type="text"
              placeholder="Search messages by name, email, subject, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-12 h-12 rounded-xl focus:ring-2 focus:ring-purple-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Messages Table */}
        <div className={`rounded-3xl shadow-xl overflow-hidden ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={`${
                  isDarkMode 
                    ? 'border-gray-700 bg-gray-900/50 hover:bg-gray-900/50' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-50'
                }`}>
                  <TableHead className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Status</TableHead>
                  <TableHead className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Name</TableHead>
                  <TableHead className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Email</TableHead>
                  <TableHead className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Subject</TableHead>
                  <TableHead className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Date</TableHead>
                  <TableHead className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className={`text-center py-8 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Loading messages...
                    </TableCell>
                  </TableRow>
                ) : filteredMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className={`text-center py-8 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      No messages found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map((message) => (
                    <TableRow
                      key={message.id}
                      className={`cursor-pointer transition-colors ${
                        isDarkMode 
                          ? 'border-gray-700 hover:bg-purple-900/20' 
                          : 'border-gray-100 hover:bg-purple-50'
                      }`}
                      onClick={() => handleViewMessage(message)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!message.read && (
                            <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
                          )}
                          <span className={`text-sm ${
                            message.read 
                              ? (isDarkMode ? 'text-gray-500' : 'text-gray-500')
                              : (isDarkMode ? 'text-purple-400' : 'text-purple-600')
                          }`}>
                            {message.read ? 'Read' : 'New'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{message.name}</TableCell>
                      <TableCell className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{message.email}</TableCell>
                      <TableCell className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{message.subject}</TableCell>
                      <TableCell className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {new Date(message.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${
                            isDarkMode 
                              ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-900/30' 
                              : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(message.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* View Message Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className={`max-w-2xl ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              {selectedMessage?.subject}
            </DialogTitle>
            <DialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {selectedMessage && new Date(selectedMessage.date).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className={`flex items-center gap-2 p-3 rounded-xl ${
              isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-50'
            }`}>
              <User className="w-4 h-4 text-purple-500" />
              <span>{selectedMessage?.name}</span>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-xl ${
              isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-50'
            }`}>
              <Mail className="w-4 h-4 text-pink-500" />
              <span>{selectedMessage?.email}</span>
            </div>
            <div className={`rounded-2xl p-5 border ${
              isDarkMode 
                ? 'bg-gray-900/50 border-gray-700 text-gray-200' 
                : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 text-gray-800'
            }`}>
              <p className="whitespace-pre-wrap">{selectedMessage?.message}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className={`${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={`${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
            }`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}