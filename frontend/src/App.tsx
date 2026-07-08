import { useState, useEffect } from 'react';
import { AddressBottomSheet } from './modules/location/components/AddressBottomSheet';
import { AddressCard } from './modules/location/components/AddressCard';
import { AddressForm } from './modules/location/components/AddressForm';
import { useAddresses } from './modules/location/hooks/useAddresses';
import type { Address } from './modules/location/types/location.types';

export default function App({ isIntegrated = false }: { isIntegrated?: boolean }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeAddress, setActiveAddress] = useState<Address | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const {
    addresses,
    loading,
    loadAddresses,
    saveAddress,
    editAddress,
    removeAddress,
    makeDefault
  } = useAddresses();

  useEffect(() => {
    if (!isIntegrated) {
      loadAddresses();
    }
  }, [isIntegrated, loadAddresses]);

  // Handle selected delivery address update
  const handleAddressSelected = (address: Address) => {
    setActiveAddress(address);
    setSheetOpen(false);
  };

  // Integrated navbar mount structure (Phase 3 button)
  if (isIntegrated) {
    return (
      <div style={{ display: 'inline-block' }}>
        <button
          onClick={() => setSheetOpen(true)}
          className="nav-location-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#000000',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginRight: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.08)';
            e.currentTarget.style.borderColor = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
          }}
        >
          <span>📍</span>
          <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeAddress 
              ? `${activeAddress.houseNumber}, ${activeAddress.street}`
              : 'Set Location'
            }
          </span>
        </button>

        <AddressBottomSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onAddressSelected={handleAddressSelected}
        />
      </div>
    );
  }

  // Standalone Address Management Page View
  return (
    <div className="min-h-screen bg-[#080810] text-white py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Delivery Addresses</h1>
            <p className="text-sm text-white/50 mt-1">Manage your saved shipping locations for DevTech Fashion</p>
          </div>

          {!showAddForm && !editingAddress && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              + Add New Address
            </button>
          )}
        </div>

        {/* Form View (Add/Edit) */}
        {(showAddForm || editingAddress) && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h2 className="text-lg font-bold">
              {editingAddress ? `Edit Address: ${editingAddress.fullName}` : 'Add New Shipping Address'}
            </h2>
            <AddressForm
              initialData={editingAddress ? {
                fullName: editingAddress.fullName,
                mobile: editingAddress.mobile,
                houseNumber: editingAddress.houseNumber,
                building: editingAddress.building || '',
                street: editingAddress.street,
                area: editingAddress.area,
                landmark: editingAddress.landmark || '',
                city: editingAddress.city,
                state: editingAddress.state,
                country: editingAddress.country,
                pincode: editingAddress.pincode,
                latitude: editingAddress.latitude,
                longitude: editingAddress.longitude,
                addressType: editingAddress.addressType,
                isDefault: editingAddress.isDefault
              } : undefined}
              gpsCoords={editingAddress ? { lat: editingAddress.latitude, lng: editingAddress.longitude } : null}
              onSubmit={async (data) => {
                if (editingAddress) {
                  await editAddress(editingAddress.id, data);
                  setEditingAddress(null);
                } else {
                  await saveAddress(data);
                  setShowAddForm(false);
                }
              }}
              onCancel={() => {
                setShowAddForm(false);
                setEditingAddress(null);
              }}
            />
          </div>
        )}

        {/* Address Cards List */}
        {!showAddForm && !editingAddress && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onEdit={(address) => handleEditInit(address)}
                    onDelete={removeAddress}
                    onMakeDefault={makeDefault}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10 space-y-3">
                <p className="text-base text-white/50">No delivery addresses saved yet.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                >
                  Create your first address
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  function handleEditInit(address: Address) {
    setEditingAddress(address);
  }
}
