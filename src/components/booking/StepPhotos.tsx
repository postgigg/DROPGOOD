import { useState, useRef } from 'react';
import { Camera, X, AlertCircle, ShoppingBag, Upload } from 'lucide-react';
import DropGoodLogo from '../DropGoodLogo';

interface Props {
  onNext: (photos: string[], itemsTypes: string[], boxesCount: number, bagsCount: number, locationType: string, instructions: string) => void;
  onBack: () => void;
  initialPhotos: string[];
  initialTypes: string[];
  initialCount: number;
  initialLocationType?: string;
  initialInstructions?: string;
}

const itemTypeOptions = [
  'Clothing & Shoes',
  'Books & Media',
  'Household Goods',
  'Electronics',
  'Toys & Baby Items'
];

const MAX_TOTAL_ITEMS = 7;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PHOTOS = 5;
const TARGET_WIDTH = 1200;

export default function StepPhotos({ onNext, onBack, initialPhotos, initialTypes, initialCount, initialLocationType, initialInstructions }: Props) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialTypes);
  const [boxesCount, setBoxesCount] = useState(Math.floor((initialCount || 3) / 2));
  const [bagsCount, setBagsCount] = useState(Math.ceil((initialCount || 3) / 2));
  const [locationType, setLocationType] = useState(initialLocationType || 'front_door');
  const [instructions, setInstructions] = useState(initialInstructions || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCount = boxesCount + bagsCount;

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > TARGET_WIDTH) {
            height = (height * TARGET_WIDTH) / width;
            width = TARGET_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                  resolve(reader.result as string);
                };
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > MAX_PHOTOS) {
      setUploadError(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const newPhotos: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > MAX_PHOTO_SIZE) {
          setUploadError(`${file.name} is too large. Maximum 5MB per photo.`);
          continue;
        }

        if (!file.type.startsWith('image/')) {
          setUploadError(`${file.name} is not an image file.`);
          continue;
        }

        const compressed = await compressImage(file);
        newPhotos.push(compressed);
      }

      setPhotos(prev => [...prev, ...newPhotos]);
    } catch (error) {
      console.error('Photo upload error:', error);
      setUploadError('Failed to process photos. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCount > MAX_TOTAL_ITEMS) {
      alert(`Maximum ${MAX_TOTAL_ITEMS} bags and boxes combined`);
      return;
    }
    if (totalCount < 1) {
      alert('Please select at least one bag or box');
      return;
    }
    onNext(photos, selectedTypes, boxesCount, bagsCount, locationType, instructions);
  };

  // Calculate estimated tax value
  const BAG_VALUE = 30;
  const BOX_VALUE = 40;
  const estimatedValue = (bagsCount * BAG_VALUE) + (boxesCount * BOX_VALUE);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Donation Details</h2>
        <p className="text-gray-400">Tell us how many bags and boxes you're donating</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <DropGoodLogo size={24} />
              <div>
                <h3 className="text-lg font-bold text-white">Number of Boxes</h3>
                <p className="text-sm text-gray-400">Cardboard boxes with items</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-end">
              <button
                type="button"
                onClick={() => setBoxesCount(Math.max(0, boxesCount - 1))}
                className="w-12 h-12 bg-gray-700 text-white rounded-lg font-bold text-xl hover:bg-gray-600 transition border border-gray-600 flex items-center justify-center"
              >
                -
              </button>
              <div className="w-20 h-12 bg-gray-900 border border-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {boxesCount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBoxesCount(boxesCount + 1)}
                disabled={totalCount >= MAX_TOTAL_ITEMS}
                className="w-12 h-12 bg-gray-700 text-white rounded-lg font-bold text-xl hover:bg-gray-600 transition border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-xs text-gray-300 space-y-1">
            <p><span className="font-semibold text-gray-200">Weight:</span> Each box must weigh less than 5 pounds</p>
            <p><span className="font-semibold text-gray-200">Size:</span> Maximum 24" × 18" × 18"</p>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-green-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Number of Bags</h3>
                <p className="text-sm text-gray-400">Trash bags or shopping bags</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-end">
              <button
                type="button"
                onClick={() => setBagsCount(Math.max(0, bagsCount - 1))}
                className="w-12 h-12 bg-gray-700 text-white rounded-lg font-bold text-xl hover:bg-gray-600 transition border border-gray-600 flex items-center justify-center"
              >
                -
              </button>
              <div className="w-20 h-12 bg-gray-900 border border-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {bagsCount}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBagsCount(bagsCount + 1)}
                disabled={totalCount >= MAX_TOTAL_ITEMS}
                className="w-12 h-12 bg-gray-700 text-white rounded-lg font-bold text-xl hover:bg-gray-600 transition border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-xs text-gray-300 space-y-1">
            <p><span className="font-semibold text-gray-200">Weight:</span> Each bag must weigh less than 5 pounds</p>
            <p><span className="font-semibold text-gray-200">Type:</span> Large trash bags or sturdy shopping bags</p>
          </div>
        </div>
      </div>

      {/* What's Inside - Optional Item Type Selection */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span>💰</span> What's inside? (optional)
          </h3>
          <p className="text-sm text-gray-400">
            Select item types to see your estimated tax deduction value
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {itemTypeOptions.map((type) => (
            <label
              key={type}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition cursor-pointer ${
                selectedTypes.includes(type)
                  ? 'bg-blue-900/30 border-blue-500'
                  : 'bg-gray-900/50 border-gray-600 hover:border-gray-500'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeToggle(type)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-200 font-medium">{type}</span>
            </label>
          ))}
        </div>

        {/* Estimated Value Display */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Estimated tax deduction value</p>
              <div className="text-xs text-gray-500">
                {bagsCount > 0 && <span>{bagsCount} bag{bagsCount > 1 ? 's' : ''} × $30 </span>}
                {bagsCount > 0 && boxesCount > 0 && <span>+ </span>}
                {boxesCount > 0 && <span>{boxesCount} box{boxesCount > 1 ? 'es' : ''} × $40</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-green-400">
                ${estimatedValue}
              </div>
              <p className="text-xs text-gray-500 mt-1">Based on industry standards</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          💡 Item types help charities prepare for your donation. Values are conservative estimates based on Salvation Army/Goodwill guides.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Pickup location
        </label>
        <div className="space-y-2">
          {[
            { value: 'front_door', label: 'Front door/porch' },
            { value: 'garage', label: 'Garage' },
            { value: 'side_of_house', label: 'Side of house' },
            { value: 'other', label: 'Other' }
          ].map(option => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="locationType"
                value={option.value}
                checked={locationType === option.value}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Special instructions (optional)
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Gate code, parking instructions, etc."
        />
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300 space-y-1">
            <p className="font-semibold text-blue-300">Important Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Items must fit in a standard vehicle</li>
              <li>Maximum {MAX_TOTAL_ITEMS} bags and boxes combined</li>
              <li>Driver will not enter your home or move heavy furniture</li>
              <li>Please have items ready at pickup location</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-700 text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={totalCount > MAX_TOTAL_ITEMS || totalCount < 1}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
