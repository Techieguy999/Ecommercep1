import type { Address, AddressFormData } from '../types/location.types';

export function formatShortAddress(address: Partial<Address> | AddressFormData): string {
  const parts = [
    address.houseNumber,
    address.building,
    address.street,
    address.area,
    address.city
  ].filter(Boolean);
  
  return parts.slice(0, 3).join(', ');
}

export function formatFullAddress(address: Partial<Address> | AddressFormData): string {
  const parts = [
    address.houseNumber,
    address.building,
    address.street,
    address.area,
    address.landmark ? `Near ${address.landmark}` : null,
    address.city,
    address.state,
    address.pincode,
    address.country || 'India'
  ].filter(Boolean);

  return parts.join(', ');
}
