import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO/SEO';
import { BreadcrumbSchema } from '../components/SEO/StructuredData';
import { seoPages } from '../components/SEO/seoConfig';
import StepAddress from '../components/booking/StepAddress';
import StepPhotos from '../components/booking/StepPhotos';
import StepCharities from '../components/booking/StepCharities';
import StepSchedule from '../components/booking/StepSchedule';
import StepPayment from '../components/booking/StepPayment';
import type { DonationCenter } from '../lib/supabase';
import DropGoodLogo from '../components/DropGoodLogo';

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
      console.log('📦 BookingFlow received address from landing page:', state.address);
      console.log('📦 Coordinates:', {
        latitude: state.address.latitude,
        longitude: state.address.longitude
      });
      setPickupAddress(state.address);
      setStep(2); // Skip to step 2 (Photos/Details)
    } else {
      console.log('📦 BookingFlow: No address in state, starting at step 1');
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
          { name: 'Home', url: 'https://dropgood.co' },
          { name: 'Book Pickup', url: 'https://dropgood.co/book' },
        ]}
      />

      <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <button onClick={() => navigate('/')} className="flex items-center hover:opacity-70">
              <DropGoodLogo size={32} />
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
                <motion.div
                  initial={false}
                  animate={{
                    scale: step === s.number ? [1, 1.1, 1] : 1,
                    backgroundColor: step >= s.number ? 'rgb(37, 99, 235)' : 'rgb(55, 65, 81)',
                  }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    step >= s.number ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {step > s.number ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    s.number
                  )}
                </motion.div>
                <span className={`ml-2 text-sm font-medium ${step >= s.number ? 'text-blue-500' : 'text-gray-500'}`}>
                  {s.name}
                </span>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-4 bg-gray-700 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: step > s.number ? '100%' : '0%' }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-blue-600 absolute top-0 left-0"
                    />
                  </div>
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
            <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(step / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="p-0 sm:p-2 md:p-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StepAddress
                  onNext={(address) => {
                    setPickupAddress(address);
                    setStep(2);
                  }}
                  initialData={pickupAddress}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            )}

            {step === 3 && pickupAddress && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            )}

            {step === 4 && selectedCharity && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StepSchedule
                  charity={selectedCharity}
                  pickupAddress={pickupAddress}
                  onNext={(scheduleData) => {
                    setSchedule(scheduleData);
                    setSelectedCharity({ ...selectedCharity, pricing: scheduleData.pricing });
                    setStep(5);
                  }}
                  onBack={() => setStep(3)}
                  initialSchedule={schedule}
                />
              </motion.div>
            )}

            {step === 5 && pickupAddress && selectedCharity && schedule && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </>
  );
}
