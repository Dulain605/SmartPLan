import React, { useState, useEffect, useCallback } from 'react';

const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: 'Too Weak', color: 'bg-red-500' });

  const CHARSETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  const calculateStrength = useCallback(() => {
    let score = 0;
    if (length >= 8) score++;
    if (length >= 12) score++;
    if (length >= 16) score++;
    
    let charTypes = 0;
    if (includeUppercase) charTypes++;
    if (includeLowercase) charTypes++;
    if (includeNumbers) charTypes++;
    if (includeSymbols) charTypes++;

    if (charTypes >= 2) score++;
    if (charTypes >= 4) score++;
    
    let strengthInfo = { score: 0, label: 'Too Weak', color: 'bg-red-500' };
    switch (score) {
      case 1: strengthInfo = { score: 20, label: 'Weak', color: 'bg-red-500' }; break;
      case 2: strengthInfo = { score: 40, label: 'Medium', color: 'bg-orange-500' }; break;
      case 3: strengthInfo = { score: 60, label: 'Good', color: 'bg-yellow-500' }; break;
      case 4: strengthInfo = { score: 80, label: 'Strong', color: 'bg-green-500' }; break;
      case 5: strengthInfo = { score: 100, label: 'Very Strong', color: 'bg-emerald-500' }; break;
    }
    setStrength(strengthInfo);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const generatePassword = useCallback(() => {
    let charset = '';
    let requiredChars = [];
    if (includeUppercase) {
      charset += CHARSETS.uppercase;
      requiredChars.push(CHARSETS.uppercase[Math.floor(Math.random() * CHARSETS.uppercase.length)]);
    }
    if (includeLowercase) {
      charset += CHARSETS.lowercase;
      requiredChars.push(CHARSETS.lowercase[Math.floor(Math.random() * CHARSETS.lowercase.length)]);
    }
    if (includeNumbers) {
      charset += CHARSETS.numbers;
      requiredChars.push(CHARSETS.numbers[Math.floor(Math.random() * CHARSETS.numbers.length)]);
    }
    if (includeSymbols) {
      charset += CHARSETS.symbols;
      requiredChars.push(CHARSETS.symbols[Math.floor(Math.random() * CHARSETS.symbols.length)]);
    }

    if (charset === '') {
        setPassword('');
        return;
    }
    
    let generated = requiredChars.join('');
    const remainingLength = length - generated.length;

    for (let i = 0; i < remainingLength; i++) {
      generated += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the result to avoid predictable character placement
    setPassword(generated.split('').sort(() => 0.5 - Math.random()).join(''));
    setCopied(false);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  useEffect(() => {
    generatePassword();
    calculateStrength();
  }, [generatePassword, calculateStrength]);

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Password Generator</h2>
        <p className="text-slate-500">Create strong, secure passwords for your accounts.</p>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div className="relative bg-slate-900 p-4 rounded-2xl flex items-center">
            <span className="flex-1 text-2xl font-mono text-slate-300 tracking-wider truncate pr-16">
                {password || 'Select options to generate'}
            </span>
            <button
                onClick={handleCopy}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition"
                title="Copy to clipboard"
            >
                <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            </button>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold text-slate-700">Password Length</label>
              <span className="text-indigo-600 font-bold text-lg">{length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[ // FIX: Use square brackets to create a proper array literal.
              ['Uppercase (A-Z)', includeUppercase, setIncludeUppercase],
              ['Lowercase (a-z)', includeLowercase, setIncludeLowercase],
              ['Numbers (0-9)', includeNumbers, setIncludeNumbers],
              ['Symbols (!@#$)', includeSymbols, setIncludeSymbols]
            ].map(([label, state, setState], index) => (
                <div key={index} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <input
                        type="checkbox"
                        checked={state as boolean}
                        onChange={(e) => (setState as React.Dispatch<React.SetStateAction<boolean>>)(e.target.checked)}
                        className="w-5 h-5 accent-indigo-600 rounded"
                    />
                    <label className="text-sm font-medium text-slate-700">{label as string}</label>
                </div>
            ))}
          </div>

          <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-200">
              <span className="text-sm font-semibold text-slate-500">STRENGTH</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-800">{strength.label}</span>
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }}></div>
                </div>
              </div>
          </div>
        </div>

        <button
          onClick={generatePassword}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 text-lg shadow-lg shadow-indigo-100"
        >
          <i className="fas fa-sync-alt"></i>
          <span>Generate New Password</span>
        </button>
      </div>
    </div>
  );
};

export default PasswordGenerator;
