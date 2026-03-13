import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function NewMemberModal({ isOpen, onClose, onComplete }: Props) {
  const [formData, setFormData] = useState({
    email: '',
    emailConfirm: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    termsAgreed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email !== formData.emailConfirm) newErrors.emailConfirm = 'Emails do not match';
    if (!formData.lastName) newErrors.lastName = 'Last Name is required';
    if (!formData.zip) newErrors.zip = 'Zip is required';
    if (!formData.termsAgreed) newErrors.termsAgreed = 'You must agree to the terms';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save to local storage to remember they filled it out
    localStorage.setItem('hasCompletedProfile', 'true');
    onComplete();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="bg-navy p-6 text-white shrink-0">
              <h2 className="font-serif text-2xl mb-1">New Member Registration</h2>
              <p className="text-white/60 text-sm">Please fill this out the first time you use the calculators.</p>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              <form id="new-member-form" onSubmit={handleSubmit} className="space-y-5">
                <p className="text-sm text-text-3 mb-4">(*) fields are required</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-2">Your Email Address (*)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full p-2.5 border rounded-md font-mono text-sm outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/10 ${errors.email ? 'border-red' : 'border-border'}`}
                    />
                    {errors.email && <p className="text-red text-xs">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-2">Re-type your email (*)</label>
                    <input
                      type="email"
                      name="emailConfirm"
                      value={formData.emailConfirm}
                      onChange={handleChange}
                      placeholder="please type a 2nd time to validate"
                      className={`w-full p-2.5 border rounded-md font-mono text-sm outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/10 ${errors.emailConfirm ? 'border-red' : 'border-border'}`}
                    />
                    {errors.emailConfirm && <p className="text-red text-xs">{errors.emailConfirm}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-border rounded-md font-mono text-sm outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-2">Last Name (*)</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full p-2.5 border rounded-md font-mono text-sm outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/10 ${errors.lastName ? 'border-red' : 'border-border'}`}
                    />
                    {errors.lastName && <p className="text-red text-xs">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-border rounded-md font-mono text-sm outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-border rounded-md font-mono text-sm outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-border rounded-md font-mono text-sm outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-2">Zip (*)</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      className={`w-full p-2.5 border rounded-md font-mono text-sm outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/10 ${errors.zip ? 'border-red' : 'border-border'}`}
                    />
                    {errors.zip && <p className="text-red text-xs">{errors.zip}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-border rounded-md font-mono text-sm outline-none transition-colors focus:border-blue focus:ring-2 focus:ring-blue/10"
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="termsAgreed"
                      checked={formData.termsAgreed}
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 text-blue border-border rounded focus:ring-blue"
                    />
                    <span className="text-sm text-text-2 leading-relaxed">
                      Yes, I have read and agree to the Terms and Conditions statement. (*)
                    </span>
                  </label>
                  {errors.termsAgreed && <p className="text-red text-xs mt-1 ml-7">{errors.termsAgreed}</p>}
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-border bg-gray-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-text-2 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="new-member-form"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue hover:bg-[#1448b8] rounded-md transition-colors shadow-sm"
              >
                Save & Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
