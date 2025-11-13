import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { BreadcrumbSchema } from '../components/SEO/StructuredData';
import { seoPages } from '../components/SEO/seoConfig';
import StepAddress from '../components/booking/StepAddress';
import StepPhotos from '../components/booking/StepPhotos';
import StepCharities from '../components/booking/StepCharities';
import StepSchedule from '../components/booking/StepSchedule';
import StepPayment from '../components/booking/StepPayment';
import type { DonationCenter } from '../lib/supabase';

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
}

export default function BookingFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [pickupAddress, setPickupAddress] = useState<Address | null>(null);

  // Check if address was passed from landing page
  useEffect(() => {
    const state = location.state as { address?: Address };
    if (state?.address) {
      setPickupAddress(state.address);
      setStep(2); // Skip to step 2 (Photos/Details)
    }
  }, [location.state]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [itemsTypes, setItemsTypes] = useState<string[]>([]);
  const [itemsCount, setItemsCount] = useState(3);
  const [locationType, setLocationType] = useState('front_door');
  const [instructions, setInstructions] = useState('');
  const [selectedCharity, setSelectedCharity] = useState<DonationCenter | null>(null);
  const [schedule, setSchedule] = useState<{ date: string; timeStart: string; timeEnd: string; pricing?: any } | null>(null);

  const steps = [
    { number: 1, name: 'Address' },
    { number: 2, name: 'Details' },
    { number: 3, name: 'Select Charity' },
    { number: 4, name: 'Schedule' },
    { number: 5, name: 'Payment' }
  ];

  return (
    <>
      <SEO {...seoPages.booking} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://dropgood.com' },
          { name: 'Book Pickup', url: 'https://dropgood.com/book' },
        ]}
      />

      <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-70">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <span className="ml-2 text-xl sm:text-2xl font-bold text-white">DropGood</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="hidden md:flex justify-between items-center mb-4">
            {steps.map((s, idx) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= s.number ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {s.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${step >= s.number ? 'text-blue-500' : 'text-gray-500'}`}>
                  {s.name}
                </span>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${step > s.number ? 'bg-blue-600' : 'bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="md:hidden flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Step {step} of {steps.length}
            </div>
            <div className="text-sm font-semibold text-blue-500">
              {steps[step - 1].name}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-md p-4 sm:p-6 md:p-8">
          {step === 1 && (
            <StepAddress
              onNext={(address) => {
                setPickupAddress(address);
                setStep(2);
              }}
              initialData={pickupAddress}
            />
          )}

          {step === 2 && (
            <StepPhotos
              onNext={(photoUrls, types, boxes, bags, location, inst) => {
                setPhotos(photoUrls);
                setItemsTypes(types);
                setItemsCount(boxes + bags);
                setLocationType(location);
                setInstructions(inst);
                setStep(3);
              }}
              onBack={() => setStep(1)}
              initialPhotos={photos}
              initialTypes={itemsTypes}
              initialCount={itemsCount}
              initialLocationType={locationType}
              initialInstructions={instructions}
            />
          )}

          {step === 3 && pickupAddress && (
            <StepCharities
              pickupAddress={pickupAddress}
              itemsTypes={itemsTypes}
              itemsCount={itemsCount}
              onSelect={(charity) => {
                setSelectedCharity(charity);
                setStep(4);
              }}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && selectedCharity && (
            <StepSchedule
              charity={selectedCharity}
              onNext={(scheduleData) => {
                setSchedule(scheduleData);
                setSelectedCharity({ ...selectedCharity, pricing: scheduleData.pricing });
                setStep(5);
              }}
              onBack={() => setStep(3)}
              initialSchedule={schedule}
            />
          )}

          {step === 5 && pickupAddress && selectedCharity && schedule && (
            <StepPayment
              pickupAddress={pickupAddress}
              charity={selectedCharity}
              schedule={schedule}
              itemsTypes={itemsTypes}
              itemsCount={itemsCount}
              photos={photos}
              locationType={locationType}
              instructions={instructions}
              onBack={() => setStep(4)}
            />
          )}
        </div>
      </div>
    </div>
    </>
  );
}
