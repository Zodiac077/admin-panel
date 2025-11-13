import { useState, useRef, useEffect } from 'react';
import { Lock, AlertCircle, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const CORRECT_PIN = '1234'; // Change this to your desired 4-digit PIN

export function AdminLogin({ onLogin, isDarkMode, toggleTheme }: AdminLoginProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 digits are entered
    if (index === 3 && value) {
      const enteredPin = [...newPin.slice(0, 3), value].join('');
      setTimeout(() => verifyPin(enteredPin), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === CORRECT_PIN) {
      onLogin(true);
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pin.join('');
    if (enteredPin.length === 4) {
      verifyPin(enteredPin);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={toggleTheme}
            className={`rounded-full w-12 h-12 p-0 ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                : 'bg-white hover:bg-gray-100 text-gray-700'
            } shadow-lg`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        <div className={`rounded-3xl p-8 shadow-2xl ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}>
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-5 rounded-2xl shadow-lg">
              <Lock className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className={`text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Panel</h1>
          <p className={`text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enter your 4-digit security PIN</p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 justify-center mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-16 h-16 text-center rounded-2xl text-2xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border-2 border-gray-600 text-white' 
                      : 'bg-gray-50 border-2 border-gray-200 text-gray-900'
                  }`}
                />
              ))}
            </div>

            {error && (
              <Alert className={`mb-6 ${
                isDarkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'
              }`}>
                <AlertCircle className={`h-4 w-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                <AlertDescription className={isDarkMode ? 'text-red-300' : 'text-red-700'}>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50 h-12 rounded-xl"
              disabled={pin.join('').length !== 4}
            >
              Unlock Panel
            </Button>
          </form>

          <div className={`mt-6 p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              🔑 Default PIN: <span className="text-purple-600">1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}