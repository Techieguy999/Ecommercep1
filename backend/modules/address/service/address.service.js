import * as repo from '../repository/address.repository.js';

export async function createAddressService(userId, addressData) {
  if (addressData.isDefault) {
    await repo.clearDefaultAddresses(userId);
  }
  return await repo.createAddress(userId, addressData);
}

export async function updateAddressService(id, userId, addressData) {
  if (addressData.isDefault) {
    await repo.clearDefaultAddresses(userId);
  }
  return await repo.updateAddress(id, userId, addressData);
}

export async function deleteAddressService(id, userId) {
  return await repo.deleteAddress(id, userId);
}

export async function listAddressesService(userId) {
  return await repo.listAddresses(userId);
}

export async function makeDefaultAddressService(id, userId) {
  return await repo.setDefaultAddress(id, userId);
}
