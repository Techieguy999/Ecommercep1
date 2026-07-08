import { useState, useCallback } from 'react';
import { AddressService } from '../services/addressService';
import type { Address, AddressFormData } from '../types/location.types';

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AddressService.listAddresses();
      setAddresses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses.');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAddress = useCallback(async (formData: AddressFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newAddr = await AddressService.saveAddress(formData);
      setAddresses((prev) => {
        const resetList = formData.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev;
        return [newAddr, ...resetList];
      });
      return newAddr;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save address.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editAddress = useCallback(async (id: string, formData: AddressFormData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await AddressService.updateAddress(id, formData);
      setAddresses((prev) => {
        const resetList = formData.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev;
        return resetList.map(addr => addr.id === id ? updated : addr);
      });
      return updated;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to update address.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeAddress = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await AddressService.deleteAddress(id);
      setAddresses((prev) => prev.filter(addr => addr.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const makeDefault = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await AddressService.makeDefault(id);
      setAddresses((prev) =>
        prev.map(addr => {
          if (addr.id === id) return updated;
          return { ...addr, isDefault: false };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default address.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addresses,
    loading,
    error,
    loadAddresses,
    saveAddress,
    editAddress,
    removeAddress,
    makeDefault
  };
}
