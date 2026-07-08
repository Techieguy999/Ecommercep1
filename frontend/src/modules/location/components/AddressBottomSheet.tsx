import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAddresses } from '../hooks/useAddresses';
import { useGeolocation } from '../hooks/useGeolocation';
import { useReverseGeocode } from '../hooks/useReverseGeocode';
import { AddressForm } from './AddressForm';
import { AddressCard } from './AddressCard';
import type { Address, AddressFormData, Coordinates } from '../types/location.types';

interface AddressBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelected?: (address: Address) => void;
}

type SheetView = 'list' | 'choose-method' | 'form';

/**
 * AddressBottomSheet — Primary interface overlay for choosing or adding
 * a delivery location. Fits into standard luxury checkout flows.
 */
export const AddressBottomSheet: React.FC<AddressBottomSheetProps> = ({
  isOpen,
  onClose,
  onAddressSelected
}) => {
  const [view, setView] = useState<SheetView>('list');
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsData, setGpsData] = useState<Coordinates | null>(null);
  const [gpsInitialForm, setGpsInitialForm] = useState<Partial<AddressFormData> | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'gps' | 'away'>('away');

  const {
    addresses,
    loading: listLoading,
    loadAddresses,
    saveAddress,
    editAddress,
    removeAddress,
    makeDefault
  } = useAddresses();

  const {
    status: geoStatus,
    error: geoError,
    coords: geoCoords,
    requestLocation
  } = useGeolocation();

  const { performReverseGeocode } = useReverseGeocode();

  // Load addresses when opening the bottom sheet
  useEffect(() => {
    if (isOpen) {
      loadAddresses();
      setView('list');
      setEditingAddress(null);
      setGpsData(null);
      setGpsInitialForm(null);
      setGpsError(null);
    }
  }, [isOpen, loadAddresses]);

  // Handle GPS state changes (Phase 4)
  useEffect(() => {
    if (geoStatus === 'loading') {
      setGpsLoading(true);
      setGpsError(null);
    } else if (geoStatus === 'success' && geoCoords) {
      setGpsLoading(false);
      const coords = { lat: geoCoords.latitude, lng: geoCoords.longitude };
      setGpsData(coords);
      
      // Perform reverse geocoding to prefill manual form
      performReverseGeocode(coords.lat, coords.lng).then((result) => {
        if (result && result.address) {
          setGpsInitialForm({
            houseNumber: result.address.houseNumber || '',
            building: result.address.building || '',
            street: result.address.street || '',
            area: result.address.area || '',
            city: result.address.city || '',
            state: result.address.state || '',
            pincode: result.address.pincode || '',
            country: result.address.country || 'India',
            latitude: coords.lat,
            longitude: coords.lng
          });
          // Switch to form mode to edit details
          setView('form');
        } else {
          setGpsError('Could not resolve address components from GPS coordinates.');
          setView('form'); // Fallback to manual entry with coords
        }
      });
    } else if (geoStatus === 'denied' || geoStatus === 'error') {
      setGpsLoading(false);
      setGpsError(geoError || 'Location access failed.');
      // Auto-fallback to manual entry mode (Phase 4 requirement)
      setGpsInitialForm({
        latitude: 20.5937,
        longitude: 78.9629
      });
      setView('form');
    }
  }, [geoStatus, geoCoords, geoError, performReverseGeocode]);

  const handleManualFormSubmit = async (data: AddressFormData) => {
    try {
      if (editingAddress) {
        await editAddress(editingAddress.id, data);
      } else {
        const saved = await saveAddress(data);
        if (onAddressSelected) {
          onAddressSelected(saved);
        }
      }
      setView('list');
      setEditingAddress(null);
    } catch (err) {
      console.error('Failed to save address details:', err);
    }
  };

  const handleEditInit = (address: Address) => {
    setFormMode('away');
    setEditingAddress(address);
    setGpsInitialForm({
      fullName: address.fullName,
      mobile: address.mobile,
      alternateMobile: address.alternateMobile || '',
      houseNumber: address.houseNumber,
      building: address.building || '',
      street: address.street,
      area: address.area,
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode,
      latitude: address.latitude,
      longitude: address.longitude,
      addressType: address.addressType,
      isDefault: address.isDefault
    });
    setGpsData({ lat: address.latitude, lng: address.longitude });
    setView('form');
  };

  const handleSelectAddress = (address: Address) => {
    if (onAddressSelected) {
      onAddressSelected(address);
    }
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white/90 backdrop-blur-xl border-t border-black/10 rounded-t-[32px] max-h-[90vh] overflow-y-auto shadow-2xl transition-transform duration-300 ease-out translate-y-0 text-slate-800">
        
        {/* Header Handle */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md pt-4 pb-3 px-6 border-b border-black/5">
          <div className="w-12 h-1 bg-black/20 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div>
              {view !== 'list' && (
                <button
                  onClick={() => {
                    if (view === 'choose-method') {
                      setView('list');
                    } else if (view === 'form') {
                      if (editingAddress) {
                        setView('list');
                        setEditingAddress(null);
                      } else {
                        setView('choose-method');
                      }
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-black/50 hover:text-black transition-colors mb-1 cursor-pointer"
                >
                  ← Back
                </button>
              )}
              <h2 className="text-lg font-bold text-slate-900 tracking-wide">
                {view === 'list' 
                  ? 'Select Delivery Address' 
                  : view === 'choose-method'
                    ? 'Choose Addition Method'
                    : editingAddress 
                      ? 'Edit Address' 
                      : 'Add Delivery Address'
                }
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 text-black/50 hover:text-black hover:bg-black/10 transition-all cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Geolocation Loading Indicator */}
          {gpsLoading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-600">Detecting your location via GPS…</p>
            </div>
          )}

          {/* ── LIST VIEW ───────────────────────────────────────── */}
          {view === 'list' && !gpsLoading && (
            <div className="space-y-6">
              
              {/* Add New Location Action Button */}
              <button
                onClick={() => setView('choose-method')}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-indigo-600/20 bg-indigo-600/5 hover:bg-indigo-600/10 text-indigo-600 font-bold transition-all cursor-pointer text-sm"
              >
                ➕ Add New Location
              </button>

              {/* Address List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saved Locations</h3>
                
                {listLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        onSelect={handleSelectAddress}
                        onEdit={handleEditInit}
                        onDelete={removeAddress}
                        onMakeDefault={makeDefault}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-black/5 rounded-2xl border border-dashed border-black/10">
                    <p className="text-sm text-slate-500">No saved addresses found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CHOOSE METHOD VIEW ──────────────────────────────── */}
          {view === 'choose-method' && !gpsLoading && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-6 font-medium">How would you like to add the delivery location?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setFormMode('gps');
                    requestLocation();
                  }}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-600/5 border border-indigo-500/20 hover:bg-indigo-600/10 hover:border-indigo-600/30 transition-all text-left cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 text-xl group-hover:scale-105 transition-transform">
                    📍
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Use Current Location</h3>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">Autodetect location via GPS & convert to text address</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setFormMode('away');
                    setGpsInitialForm(null);
                    setGpsData(null);
                    setView('form');
                  }}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-black/5 border border-black/10 hover:bg-black/10 hover:border-black/20 transition-all text-left cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center text-black/60 text-xl group-hover:scale-105 transition-transform">
                    🏠
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Away from Delivery Location</h3>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">Enter manual address details & pin marker on map</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setView('list')}
                className="w-full py-3 rounded-xl border border-black/10 text-sm text-slate-600 hover:text-slate-900 hover:border-black/30 hover:bg-black/5 transition-all font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ── FORM VIEW ───────────────────────────────────────── */}
          {view === 'form' && !gpsLoading && (
            <div className="space-y-4">
              {gpsError && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600">
                  ⚠️ {gpsError}
                </div>
              )}
              <AddressForm
                initialData={gpsInitialForm || undefined}
                gpsCoords={gpsData}
                onSubmit={handleManualFormSubmit}
                onCancel={() => setView('list')}
                formMode={formMode}
              />
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};
