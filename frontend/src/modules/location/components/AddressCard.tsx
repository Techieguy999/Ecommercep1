import React, { useState } from 'react';
import type { Address } from '../types/location.types';
import { formatFullAddress } from '../utils/addressFormatter';

interface AddressCardProps {
  address: Address;
  onSelect?: (address: Address) => void;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => Promise<void>;
  onMakeDefault: (id: string) => Promise<void>;
}

/**
 * AddressCard — Individual saved address card view showing formatted addresses and CRUD triggers.
 */
export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onSelect,
  onEdit,
  onDelete,
  onMakeDefault
}) => {
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    setDeleting(true);
    try {
      await onDelete(address.id);
    } catch (err) {
      alert('Failed to delete address.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSetDefault = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingDefault(true);
    try {
      await onMakeDefault(address.id);
    } catch (err) {
      alert('Failed to set default address.');
    } finally {
      setSettingDefault(false);
    }
  };

  const typeEmoji = address.addressType === 'work' ? '💼' : '🏠';
  const typeLabel = address.addressType === 'work' ? 'Work' : 'Home';

  return (
    <div
      onClick={() => onSelect && onSelect(address)}
      className={`p-5 rounded-2xl border transition-all duration-200 text-left group
        ${onSelect ? 'cursor-pointer' : ''}
        ${address.isDefault
          ? 'border-indigo-600/30 bg-indigo-600/5 shadow-md shadow-indigo-600/5'
          : 'border-black/10 bg-black/5 hover:border-black/20 hover:bg-black/10'
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm">{typeEmoji}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{typeLabel}</span>
            {address.isDefault && (
              <span className="text-[10px] bg-indigo-600/10 text-indigo-600 border border-indigo-600/20 px-2 py-0.5 rounded-md font-semibold">
                Default
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-900">{address.fullName}</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {formatFullAddress(address)}
          </p>
          <p className="text-xs text-slate-500 font-semibold">
            📞 {address.mobile} {address.alternateMobile && `| Alt: ${address.alternateMobile}`}
          </p>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(address);
            }}
            className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-black/10 text-slate-700 hover:text-slate-900 hover:border-black/30 transition-all cursor-pointer bg-white"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-red-500/20 text-red-600 hover:text-red-700 hover:border-red-500/40 transition-all cursor-pointer bg-white"
          >
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Set Default Address trigger */}
      {!address.isDefault && (
        <button
          onClick={handleSetDefault}
          disabled={settingDefault}
          className="mt-4 w-full py-2 text-center text-xs font-semibold rounded-xl border border-black/5 text-slate-500 hover:text-slate-700 hover:border-black/10 transition-all cursor-pointer bg-white"
        >
          {settingDefault ? 'Updating default…' : 'Set as default address'}
        </button>
      )}
    </div>
  );
};
