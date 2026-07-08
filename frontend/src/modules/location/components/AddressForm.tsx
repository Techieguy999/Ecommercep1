import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { LocationService } from '../services/locationService';
import { MapPicker } from './MapPicker';
import { DistanceAlert } from './DistanceAlert';
import { AccuracyBadge } from './AccuracyBadge';
import type { AddressFormData, Coordinates } from '../types/location.types';
import { calculateDistance } from '../utils/distance';

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  gpsCoords: Coordinates | null;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
  formMode?: 'gps' | 'away';
}

/**
 * AddressForm — Premium Flipkart-style delivery address form with integrated Leaflet map,
 * debounced OSM geocoding, distance offsets verification, and contact validations.
 */
export const AddressForm: React.FC<AddressFormProps> = ({
  initialData,
  gpsCoords,
  onSubmit,
  onCancel,
  submitting = false,
  formMode = 'away'
}) => {
  const [mapCenter, setMapCenter] = useState<Coordinates>(
    gpsCoords || { lat: 20.5937, lng: 78.9629 } // Default center of India
  );
  const [accuracy, setAccuracy] = useState<string>('APPROXIMATE');
  const [geocodePending, setGeocodePending] = useState(false);
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAway, setIsAway] = useState(false);

  useEffect(() => {
    if (!gpsCoords) {
      setIsAway(true); // If GPS is denied/failed, treat as manual away entry
      return;
    }
    const dist = calculateDistance(gpsCoords.lat, gpsCoords.lng, mapCenter.lat, mapCenter.lng);
    setIsAway(dist > 100); // More than 100m is away
  }, [gpsCoords, mapCenter]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors }
  } = useForm<AddressFormData>({
    defaultValues: {
      fullName: '',
      mobile: '',
      houseNumber: '',
      building: '',
      street: '',
      area: '',
      landmark: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      latitude: mapCenter.lat,
      longitude: mapCenter.lng,
      addressType: 'home',
      isDefault: false,
      ...initialData
    }
  });

  // Watch fields to trigger debounced geocoding (Phase 6)
  const watchedHouse = watch('houseNumber');
  const watchedBuilding = watch('building');
  const watchedStreet = watch('street');
  const watchedArea = watch('area');
  const watchedCity = watch('city');
  const watchedState = watch('state');
  const watchedPin = watch('pincode');

  const triggerGeocoding = useCallback(async () => {
    if (!watchedStreet || !watchedArea || !watchedCity || !watchedPin) return;

    setGeocodePending(true);
    try {
      const result = await LocationService.geocode({
        houseNumber: watchedHouse,
        building: watch('building'),
        street: watchedStreet,
        area: watchedArea,
        city: watchedCity,
        state: watch('state'),
        pincode: watchedPin,
        country: watch('country')
      });

      if (result) {
        const coords = { lat: result.latitude, lng: result.longitude };
        setMapCenter(coords);
        setValue('latitude', result.latitude);
        setValue('longitude', result.longitude);
        setAccuracy(result.accuracy);
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
    } finally {
      setGeocodePending(false);
    }
  }, [watchedHouse, watchedStreet, watchedArea, watchedCity, watchedPin, setValue, watch]);

  // Debounce address changes by 400ms (Phase 6)
  useEffect(() => {
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    geocodeTimeoutRef.current = setTimeout(() => {
      triggerGeocoding();
    }, 400);

    return () => {
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    };
  }, [watchedHouse, watchedStreet, watchedArea, watchedCity, watchedPin, triggerGeocoding]);

  // Handle map marker repositioning (Phase 7)
  const handleMapLocationChange = useCallback(async (coords: Coordinates) => {
    setMapCenter(coords);
    setValue('latitude', coords.lat);
    setValue('longitude', coords.lng);

    try {
      // Reverse geocode to resolve missing address fields
      const result = await LocationService.reverseGeocode(coords.lat, coords.lng);
      if (result && result.address) {
        setAccuracy(result.accuracy);
        // Fill fields if they are currently blank
        if (result.address.street) setValue('street', result.address.street);
        if (result.address.area) setValue('area', result.address.area);
        if (result.address.city) setValue('city', result.address.city);
        if (result.address.state) setValue('state', result.address.state);
        if (result.address.pincode) setValue('pincode', result.address.pincode);
      }
    } catch (err) {
      console.warn('Map drag reverse-geocode failed:', err);
    }
  }, [setValue]);  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-slate-800">
      {formMode === 'gps' ? (
        /* ── GPS Detected Location View ── */
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-indigo-600/5 border border-indigo-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                📍 Current Location (Converted to Text)
              </h4>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                Resolved via GPS
              </span>
            </div>
            
            <div className="space-y-1 text-slate-800">
              <p className="text-sm font-bold text-slate-900">
                {[watchedHouse, watchedBuilding].filter(Boolean).join(', ') || 'House details not detected'}
              </p>
              <p className="text-xs text-slate-600 font-semibold">
                {[watchedStreet, watchedArea].filter(Boolean).join(', ') || 'Street details not detected'}
              </p>
              <p className="text-xs text-slate-500 font-semibold">
                {watchedCity}, {watchedState} - {watchedPin}
              </p>
            </div>

            <div style={{ pointerEvents: 'none', opacity: 0.85 }}>
              <MapPicker center={mapCenter} onLocationChange={() => {}} />
            </div>
            
            {/* Accuracy badge */}
            <AccuracyBadge accuracy={accuracy} />
          </div>
        </div>
      ) : (
        /* ── Away Mode: Manual Address Fields & Map Picker ── */
        <>
          {isAway && (
            <div className="p-4 rounded-xl bg-indigo-600/5 border border-indigo-600/20 text-xs text-indigo-700 flex items-start gap-2.5">
              <span className="text-base leading-none">💡</span>
              <div>
                <p className="font-bold mb-0.5">Away from Current GPS Location</p>
                <p className="text-slate-500 font-medium">Please enter manual address details below. The map coordinates will automatically predict your city, area, and state as you update.</p>
              </div>
            </div>
          )}

          {/* ── Address Fields ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                House/Flat Number *
              </label>
              <input
                type="text"
                {...register('houseNumber', { required: 'House/Flat number is required.' })}
                className={`w-full bg-black/5 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-black/30 outline-none transition-all focus:border-indigo-600 focus:bg-white
                  ${errors.houseNumber ? 'border-red-500/50 bg-red-500/5' : 'border-black/10'}`}
                placeholder="e.g. Flat 402 / D-12"
              />
              {errors.houseNumber && (
                <p className="text-xs text-red-600 mt-1">{errors.houseNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Apartment/Building Name (Optional)
              </label>
              <input
                type="text"
                {...register('building')}
                className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-black/30 outline-none transition-all focus:border-indigo-600 focus:bg-white"
                placeholder="e.g. Signature Towers"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Street Name/Road *
              </label>
              <input
                type="text"
                {...register('street', { required: 'Street name is required.' })}
                className={`w-full bg-black/5 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-black/30 outline-none transition-all focus:border-indigo-600 focus:bg-white
                  ${errors.street ? 'border-red-500/50 bg-red-500/5' : 'border-black/10'}`}
                placeholder="e.g. 12th Main Road"
              />
              {errors.street && (
                <p className="text-xs text-red-600 mt-1">{errors.street.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Area/Locality/Village *
              </label>
              <input
                type="text"
                {...register('area', { required: 'Area/locality is required.' })}
                className={`w-full bg-black/5 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-black/30 outline-none transition-all focus:border-indigo-600 focus:bg-white
                  ${errors.area ? 'border-red-500/50 bg-red-500/5' : 'border-black/10'}`}
                placeholder="e.g. Indiranagar"
              />
              {errors.area && (
                <p className="text-xs text-red-600 mt-1">{errors.area.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                City *
              </label>
              <input
                type="text"
                {...register('city', { required: 'City name is required.' })}
                className={`w-full bg-black/5 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-black/30 outline-none transition-all focus:border-indigo-600 focus:bg-white
                  ${errors.city ? 'border-red-500/50 bg-red-500/5' : 'border-black/10'}`}
                placeholder="e.g. Bengaluru"
              />
              {errors.city && (
                <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                State *
              </label>
              <input
                type="text"
                {...register('state', { required: 'State name is required.' })}
                className={`w-full bg-black/5 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-black/30 outline-none transition-all focus:border-indigo-600 focus:bg-white
                  ${errors.state ? 'border-red-500/50 bg-red-500/5' : 'border-black/10'}`}
                placeholder="e.g. Karnataka"
              />
              {errors.state && (
                <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Pin Code *
              </label>
              <input
                type="text"
                maxLength={6}
                {...register('pincode', {
                  required: 'PIN code is required.',
                  pattern: { value: /^\d{6}$/, message: 'Must be a 6-digit number.' }
                })}
                className={`w-full bg-black/5 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-black/30 outline-none transition-all focus:border-indigo-600 focus:bg-white
                  ${errors.pincode ? 'border-red-500/50 bg-red-500/5' : 'border-black/10'}`}
                placeholder="e.g. 560038"
              />
              {errors.pincode && (
                <p className="text-xs text-red-600 mt-1">{errors.pincode.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Landmark (Optional)
              </label>
              <input
                type="text"
                {...register('landmark')}
                className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-black/30 outline-none transition-all focus:border-indigo-600 focus:bg-white"
                placeholder="e.g. Near Metro Station"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Country
              </label>
              <input
                type="text"
                {...register('country')}
                className="w-full bg-black/10 border border-black/10 rounded-xl px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed"
                readOnly
              />
            </div>
          </div>

          {/* ── Mini Map Container ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Confirm Location on Map (Drag marker to adjust)
              </label>
              {geocodePending && (
                <span className="text-[10px] text-indigo-600 animate-pulse">Updating coordinates…</span>
              )}
            </div>
            <MapPicker center={mapCenter} onLocationChange={handleMapLocationChange} />
            
            {/* Accuracy badge */}
            <AccuracyBadge accuracy={accuracy} />

            {/* GPS validation offsets alert banner */}
            <DistanceAlert gpsCoords={gpsCoords} markerCoords={mapCenter} />
          </div>
        </>
      )}

      {/* ── Contact Details ──────────────────────────── */}
      <div className="border-t border-black/5 pt-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Contact Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              {...register('fullName', {
                required: 'Full name is required.',
                minLength: { value: 3, message: 'Minimum 3 characters.' },
                maxLength: { value: 100, message: 'Maximum 100 characters.' }
              })}
              className={`w-full bg-black/5 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-black/30 outline-none transition-all focus:border-indigo-600 focus:bg-white
                ${errors.fullName ? 'border-red-500/50 bg-red-500/5' : 'border-black/10'}`}
              placeholder="e.g. Purna Sai"
            />
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Mobile Number *
            </label>
            <input
              type="tel"
              maxLength={10}
              {...register('mobile', {
                required: 'Mobile number is required.',
                pattern: { value: /^\d{10}$/, message: 'Must be exactly 10 digits.' }
              })}
              className={`w-full bg-black/5 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-black/30 outline-none transition-all focus:border-indigo-600 focus:bg-white
                ${errors.mobile ? 'border-red-500/50 bg-red-500/5' : 'border-black/10'}`}
              placeholder="98765 43210"
            />
            {errors.mobile && (
              <p className="text-xs text-red-600 mt-1">{errors.mobile.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Alternative Mobile Number
            </label>
            <input
              type="tel"
              maxLength={10}
              {...register('alternateMobile', {
                pattern: { value: /^\d{10}$/, message: 'Must be exactly 10 digits.' }
              })}
              className={`w-full bg-black/5 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-black/30 outline-none transition-all focus:border-indigo-600 focus:bg-white
                ${errors.alternateMobile ? 'border-red-500/50 bg-red-500/5' : 'border-black/10'}`}
              placeholder="e.g. 98765 11111"
            />
            {errors.alternateMobile && (
              <p className="text-xs text-red-600 mt-1">{errors.alternateMobile.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Address Type & Default Options ──────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-black/5 pt-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Save Address As
          </label>
          <div className="flex gap-2">
            <Controller
              name="addressType"
              control={control}
              render={({ field }) => (
                <>
                  <button
                    type="button"
                    onClick={() => field.onChange('home')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border
                      ${field.value === 'home'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-black/5 border-black/10 text-slate-600 hover:bg-black/10'
                      }`}
                  >
                    🏠 Home
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange('work')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border
                      ${field.value === 'work'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-black/5 border-black/10 text-slate-600 hover:bg-black/10'
                      }`}
                  >
                    💼 Work
                  </button>
                </>
              )}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group mt-4 md:mt-6">
          <input
            type="checkbox"
            {...register('isDefault')}
            className="w-4 h-4 rounded border-black/20 bg-black/5 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
            Set as default delivery address
          </span>
        </label>
      </div>

      {/* ── Action Buttons ──────────────────────────────────────── */}
      <div className="flex gap-3 pt-4 border-t border-black/5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-black/10 text-sm text-slate-600 hover:text-slate-900 hover:border-black/30 hover:bg-black/5 transition-all font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all
            ${submitting
              ? 'bg-indigo-700/50 cursor-wait'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30'
            }`}
        >
          {submitting ? 'Saving Address…' : 'Save Address'}
        </button>
      </div>
    </form>
  );
};
