import type { Address, AddressFormData } from '../types/location.types';

const API_BASE_URL = 'http://localhost:5000/address';

export const AddressService = {
  async listAddresses(): Promise<Address[]> {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch addresses.');
      const json = await response.json();
      return json.success ? json.data : [];
    } catch (error) {
      console.error('listAddresses service error:', error);
      throw error;
    }
  },

  async saveAddress(address: AddressFormData): Promise<Address> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address)
      });
      
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.errors ? json.errors.join(' ') : 'Failed to save address.');
      }
      return json.data;
    } catch (error) {
      console.error('saveAddress service error:', error);
      throw error;
    }
  },

  async updateAddress(id: string, address: AddressFormData): Promise<Address> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address)
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.errors ? json.errors.join(' ') : 'Failed to update address.');
      }
      return json.data;
    } catch (error) {
      console.error('updateAddress service error:', error);
      throw error;
    }
  },

  async deleteAddress(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete address.');
      }
      return true;
    } catch (error) {
      console.error('deleteAddress service error:', error);
      throw error;
    }
  },

  async makeDefault(id: string): Promise<Address> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/default`, {
        method: 'PATCH'
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to set default address.');
      }
      return json.data;
    } catch (error) {
      console.error('makeDefault service error:', error);
      throw error;
    }
  }
};
