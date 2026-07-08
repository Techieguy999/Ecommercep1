import type { Address, AddressFormData } from '../types/location.types';

const API_BASE_URL = 'http://localhost:5000/address';

function getHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  try {
    const userStr = localStorage.getItem('dtf_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
  } catch (err) {
    console.warn('Failed to parse user session for auth header:', err);
  }
  return headers;
}

export const AddressService = {
  async listAddresses(): Promise<Address[]> {
    try {
      const response = await fetch(API_BASE_URL, {
        headers: getHeaders()
      });
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
        headers: getHeaders(),
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
        headers: getHeaders(),
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
        method: 'DELETE',
        headers: getHeaders()
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
        method: 'PATCH',
        headers: getHeaders()
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
