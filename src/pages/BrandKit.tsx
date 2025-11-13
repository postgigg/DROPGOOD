import { Download } from 'lucide-react';
import DropGoodLogo from '../components/DropGoodLogo';

export default function BrandKit() {
  const downloadSVG = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const logoOnlySVG = `<svg width="128" height="128" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="url(#gradient)"/>
  <rect x="10" y="14" width="12" height="10" rx="1.5" fill="white" opacity="0.9"/>
  <path d="M16 20.5C16 20.5 13 18.5 13 17C13 15.8 13.8 15 14.5 15C15.2 15 16 15.5 16 15.5C16 15.5 16.8 15 17.5 15C18.2 15 19 15.8 19 17C19 18.5 16 20.5 16 20.5Z" fill="#3B82F6"/>
  <circle cx="12" cy="11" r="1.2" fill="white"/>
  <circle cx="16" cy="8" r="1.2" fill="white"/>
  <circle cx="20" cy="11" r="1.2" fill="white"/>
  <path d="M11 24 Q 16 4, 21 24" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.3"/>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
  </defs>
</svg>`;

  const logoWithTextDarkSVG = `<svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Logo Icon -->
  <rect x="10" y="10" width="40" height="40" rx="8" fill="url(#gradient)"/>
  <rect x="17.5" y="25" width="25" height="20" rx="2" fill="white" opacity="0.9"/>
  <path d="M30 36C30 36 25 33 25 31C25 29.5 26 28.5 27 28.5C28 28.5 30 29.5 30 29.5C30 29.5 32 28.5 33 28.5C34 28.5 35 29.5 35 31C35 33 30 36 30 36Z" fill="#3B82F6"/>
  <circle cx="22" cy="20" r="2" fill="white"/>
  <circle cx="30" cy="15" r="2" fill="white"/>
  <circle cx="38" cy="20" r="2" fill="white"/>
  <path d="M21 45 Q 30 8, 39 45" stroke="white" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.3"/>

  <!-- Text: DropGood -->
  <text x="65" y="40" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="white">DropGood</text>

  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
  </defs>
</svg>`;

  const logoWithTextLightSVG = `<svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Logo Icon -->
  <rect x="10" y="10" width="40" height="40" rx="8" fill="url(#gradient)"/>
  <rect x="17.5" y="25" width="25" height="20" rx="2" fill="white" opacity="0.9"/>
  <path d="M30 36C30 36 25 33 25 31C25 29.5 26 28.5 27 28.5C28 28.5 30 29.5 30 29.5C30 29.5 32 28.5 33 28.5C34 28.5 35 29.5 35 31C35 33 30 36 30 36Z" fill="#3B82F6"/>
  <circle cx="22" cy="20" r="2" fill="white"/>
  <circle cx="30" cy="15" r="2" fill="white"/>
  <circle cx="38" cy="20" r="2" fill="white"/>
  <path d="M21 45 Q 30 8, 39 45" stroke="white" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.3"/>

  <!-- Text: DropGood -->
  <text x="65" y="40" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#111827">DropGood</text>

  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
  </defs>
</svg>`;

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-4">Brand Kit</h1>
          <p className="text-xl text-gray-400">Download DropGood logos, brand colors, and assets</p>
        </div>

        {/* Logo Variations */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Logo Variations</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Logo Only */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
              <div className="bg-gray-700 rounded-lg p-8 mb-4 flex items-center justify-center">
                <DropGoodLogo size={80} />
              </div>
              <h3 className="text-white font-bold mb-2">Logo Icon Only</h3>
              <p className="text-gray-400 text-sm mb-4">Use for app icons, favicons, social media avatars</p>
              <button
                onClick={() => downloadSVG(logoOnlySVG, 'dropgood-logo-icon.svg')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download SVG
              </button>
            </div>

            {/* Logo with Text - Dark */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
              <div className="bg-gray-700 rounded-lg p-8 mb-4 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <DropGoodLogo size={48} />
                  <span className="text-3xl font-black text-white">DropGood</span>
                </div>
              </div>
              <h3 className="text-white font-bold mb-2">Full Logo - Dark Mode</h3>
              <p className="text-gray-400 text-sm mb-4">Use on dark backgrounds</p>
              <button
                onClick={() => downloadSVG(logoWithTextDarkSVG, 'dropgood-logo-dark.svg')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download SVG
              </button>
            </div>

            {/* Logo with Text - Light */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
              <div className="bg-white rounded-lg p-8 mb-4 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <DropGoodLogo size={48} />
                  <span className="text-3xl font-black text-gray-900">DropGood</span>
                </div>
              </div>
              <h3 className="text-white font-bold mb-2">Full Logo - Light Mode</h3>
              <p className="text-gray-400 text-sm mb-4">Use on light backgrounds</p>
              <button
                onClick={() => downloadSVG(logoWithTextLightSVG, 'dropgood-logo-light.svg')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download SVG
              </button>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Brand Colors</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="w-full h-24 rounded-lg mb-4" style={{ backgroundColor: '#3B82F6' }}></div>
              <h3 className="text-white font-bold mb-1">Primary Blue</h3>
              <p className="text-gray-400 text-sm font-mono">#3B82F6</p>
              <p className="text-gray-500 text-xs mt-1">RGB(59, 130, 246)</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="w-full h-24 rounded-lg mb-4" style={{ backgroundColor: '#2563EB' }}></div>
              <h3 className="text-white font-bold mb-1">Secondary Blue</h3>
              <p className="text-gray-400 text-sm font-mono">#2563EB</p>
              <p className="text-gray-500 text-xs mt-1">RGB(37, 99, 235)</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="w-full h-24 rounded-lg mb-4 border border-gray-600" style={{ backgroundColor: '#FFFFFF' }}></div>
              <h3 className="text-white font-bold mb-1">White</h3>
              <p className="text-gray-400 text-sm font-mono">#FFFFFF</p>
              <p className="text-gray-500 text-xs mt-1">RGB(255, 255, 255)</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="w-full h-24 rounded-lg mb-4" style={{ backgroundColor: '#111827' }}></div>
              <h3 className="text-white font-bold mb-1">Dark Gray</h3>
              <p className="text-gray-400 text-sm font-mono">#111827</p>
              <p className="text-gray-500 text-xs mt-1">RGB(17, 24, 39)</p>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Typography</h2>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="mb-6">
              <h3 className="text-white font-bold mb-2">Primary Font</h3>
              <p className="text-gray-400 mb-4">System Font Stack (Inter, SF Pro, Helvetica)</p>
              <div className="space-y-2">
                <p className="text-white text-4xl font-black">DropGood Aa</p>
                <p className="text-gray-400 text-sm">Font Weight: 900 (Black) for headings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Usage Guidelines</h2>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-white font-bold mb-2">✓ Do</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use the logo with proper spacing around it</li>
                  <li>Maintain the aspect ratio when resizing</li>
                  <li>Use dark mode logo on dark backgrounds</li>
                  <li>Use light mode logo on light backgrounds</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">✗ Don't</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Alter the logo colors or design</li>
                  <li>Rotate or distort the logo</li>
                  <li>Add effects or shadows to the logo</li>
                  <li>Use low-resolution versions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <a href="/" className="text-blue-400 hover:text-blue-300 transition">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
