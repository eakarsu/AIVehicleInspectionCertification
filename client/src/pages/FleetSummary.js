import React, { useState, useEffect } from 'react';
import { getFleetSummary } from '../services/api';
import { toast } from 'react-toastify';

export default function FleetSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getFleetSummary();
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load fleet summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading fleet summary...</div>;
  if (!data) return <div className="p-6 text-gray-400">No data available</div>;

  const { summary, fleetByModel, upcomingInspections } = data;

  const getComplianceBadge = (rate) => {
    const n = parseFloat(rate);
    if (n >= 80) return 'bg-green-900 text-green-300 border-green-600';
    if (n >= 60) return 'bg-yellow-900 text-yellow-300 border-yellow-600';
    return 'bg-red-900 text-red-300 border-red-600';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Fleet Summary Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Inspections', value: summary.totalInspections, color: 'blue' },
          { label: 'Passed', value: summary.passCount, color: 'green' },
          { label: 'Failed', value: summary.failCount, color: 'red' },
          { label: 'Compliance Rate', value: `${summary.complianceRate}%`, color: 'purple' }
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-900 border border-${color}-700 rounded-lg p-4`}>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className={`text-${color}-300 text-3xl font-bold`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Open Recalls */}
      {summary.openRecalls > 0 && (
        <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-6">
          <p className="text-yellow-300 font-semibold">Warning: {summary.openRecalls} open recall alert(s) require attention</p>
        </div>
      )}

      {/* Fleet by Model */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Fleet by Model</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 py-2 pr-4">Vehicle</th>
                <th className="text-center text-gray-400 py-2 px-2">Total</th>
                <th className="text-center text-gray-400 py-2 px-2">Pass</th>
                <th className="text-center text-gray-400 py-2 px-2">Fail</th>
                <th className="text-center text-gray-400 py-2 px-2">Conditional</th>
                <th className="text-center text-gray-400 py-2 px-2">Compliance Rate</th>
              </tr>
            </thead>
            <tbody>
              {fleetByModel.map((vehicle, i) => (
                <tr key={i} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="text-white py-3 pr-4">{vehicle.year} {vehicle.make} {vehicle.model}</td>
                  <td className="text-gray-300 text-center py-3 px-2">{vehicle.total}</td>
                  <td className="text-green-400 text-center py-3 px-2">{vehicle.pass}</td>
                  <td className="text-red-400 text-center py-3 px-2">{vehicle.fail}</td>
                  <td className="text-yellow-400 text-center py-3 px-2">{vehicle.conditional}</td>
                  <td className="text-center py-3 px-2">
                    <span className={`px-2 py-1 rounded border text-xs font-medium ${getComplianceBadge(vehicle.complianceRate)}`}>
                      {vehicle.complianceRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {fleetByModel.length === 0 && <p className="text-gray-400 text-center py-4">No fleet data available</p>}
        </div>
      </div>

      {/* Upcoming / Pending Inspections */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Pending Inspections</h2>
        {upcomingInspections.length === 0 ? (
          <p className="text-gray-400">No pending inspections</p>
        ) : (
          <div className="space-y-2">
            {upcomingInspections.map((insp) => (
              <div key={insp.id} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
                <div>
                  <p className="text-white">{insp.vehicleYear} {insp.vehicleMake} {insp.vehicleModel}</p>
                  <p className="text-gray-400 text-sm">VIN: {insp.vin || 'N/A'} | Inspector: {insp.inspectorName || 'N/A'}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${insp.overallStatus === 'fail' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
                  {insp.overallStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
