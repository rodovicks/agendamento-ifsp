/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './screens/**/*.{js,ts,tsx}',
    './navigation/**/*.{js,ts,tsx}',
    './utils/**/*.{js,ts,tsx}',
    './contexts/**/*.{js,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  safelist: [
    // Garantir que as classes do tema escuro sejam incluídas
    'bg-slate-900',
    'bg-slate-800',
    'bg-slate-700',
    'text-slate-100',
    'text-slate-300',
    'text-slate-400',
    'border-slate-600',
    'border-slate-700',
    // Classes do tema claro
    'bg-gray-50',
    'bg-white',
    'text-gray-900',
    'text-gray-600',
    'text-gray-500',
    'border-gray-200',
    'border-gray-100',
  ],
  plugins: [],
};
