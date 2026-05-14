import React, { useState } from 'react';
import { decodeVIN } from '../services/api';
import { toast } from 'react-toastify';

export default function VINDecoder() {
  const [vin, setVin] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDecode = async (e) => {
    e.preventDefault();
    if (!vin || vin.length !== 17) {
      toast.error('VIN must be exactly 17 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await decodeVIN(vin);
      setResult(res.data);
      toast.success('VIN decoded successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to decode VIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">VIN Decoder</h1>
      <form onSubmit={handleDecode} className="bg-gray-800 rounded-lg p-6 mb-6">
        <label className="block text-gray-300 text-sm font-medium mb-2">Enter VIN (17 characters)</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            placeholder="e.g. 1HGBH41JXMN109186"
            maxLength={17}
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Decoding...' : 'Decode VIN'}
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-2">Characters: {vin.length}/17</p>
      </form>

      {result && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Decoded Information</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Year', value: result.year },
              { label: 'Make', value: result.make },
              { label: 'Model', value: result.model },
              { label: 'Engine', value: result.engine },
              { label: 'Transmission', value: result.transmission },
              { label: 'Country of Origin', value: result.country_of_origin },
              { label: 'Assembly Plant', value: result.plant }
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-700 rounded p-3">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</p>
                <p className="text-white font-medium">{value || 'N/A'}</p>
              </div>
            ))}
          </div>
          {result.recall_summary && (
            <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
              <h3 className="text-yellow-400 font-semibold mb-2">Recall Summary</h3>
              <p className="text-yellow-200 text-sm">{result.recall_summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
