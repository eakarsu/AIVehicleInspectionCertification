import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'fs';
import { runInNewContext } from 'vm';
import api, { getInspections, getCompliances, getConditionScores, getMarketValues, getDamageReports, getVehicleHistories, getRecallAlerts, getInsuranceEstimates, getMaintenanceSchedules, getPartsPricings, recordRows } from '../services/api';
import InspectionsPage from '../pages/InspectionsPage';
import CompliancePage from '../pages/CompliancePage';
import ConditionScoresPage from '../pages/ConditionScoresPage';
import MarketValuesPage from '../pages/MarketValuesPage';
import DamageReportsPage from '../pages/DamageReportsPage';
import VehicleHistoryPage from '../pages/VehicleHistoryPage';
import RecallAlertsPage from '../pages/RecallAlertsPage';
import InsuranceEstimatesPage from '../pages/InsuranceEstimatesPage';
import MaintenanceSchedulesPage from '../pages/MaintenanceSchedulesPage';
import PartsPricingPage from '../pages/PartsPricingPage';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: () => ({
      get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(),
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
    })
  }
}));

global.IS_REACT_ACT_ENVIRONMENT = true;

const seed = readFileSync('../server/seeds/seed.js', 'utf8');
function seededRecords(model) {
  const match = seed.match(new RegExp(`await ${model}\\.bulkCreate\\((\\[[\\s\\S]*?\\])\\);`));
  if (!match) throw new Error(`Missing existing ${model} fixture`);
  return runInNewContext(match[1]).map((row, index) => ({ id: index + 1, ...row }));
}

const cases = [
  ['Inspection', '/inspections', getInspections, InspectionsPage],
  ['Compliance', '/compliance', getCompliances, CompliancePage],
  ['ConditionScore', '/condition-scores', getConditionScores, ConditionScoresPage],
  ['MarketValue', '/market-values', getMarketValues, MarketValuesPage],
  ['DamageReport', '/damage-reports', getDamageReports, DamageReportsPage],
  ['VehicleHistory', '/vehicle-history', getVehicleHistories, VehicleHistoryPage],
  ['RecallAlert', '/recall-alerts', getRecallAlerts, RecallAlertsPage],
  ['InsuranceEstimate', '/insurance-estimates', getInsuranceEstimates, InsuranceEstimatesPage],
  ['MaintenanceSchedule', '/maintenance-schedules', getMaintenanceSchedules, MaintenanceSchedulesPage],
  ['PartsPricing', '/parts-pricing', getPartsPricings, PartsPricingPage]
];

afterEach(() => jest.restoreAllMocks());

test('collection adapter retains array and paginated response shapes and guards malformed payloads', () => {
  expect(recordRows([{ id: 1 }])).toHaveLength(1);
  expect(recordRows({ data: [{ id: 1 }], pagination: { total: 1 } })).toHaveLength(1);
  expect(recordRows({ data: {} })).toEqual([]);
  expect(recordRows(undefined)).toEqual([]);
});

test.each(cases)('%s record page renders 15 project seed rows from real paginated API shape', async (model, path, getList, Page) => {
  const rows = seededRecords(model);
  expect(rows).toHaveLength(15);
  const request = jest.spyOn(api, 'get').mockResolvedValue({ data: { data: rows, pagination: { page: 1, limit: 20, total: 15 } } });
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  const response = await getList();
  expect(response.data).toHaveLength(15);
  expect(response.pagination.total).toBe(15);
  expect(request).toHaveBeenCalledWith(path);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => { root.render(<MemoryRouter><Page /></MemoryRouter>); });
  expect(container.querySelectorAll('tbody tr')).toHaveLength(15);
  expect(error).not.toHaveBeenCalled();
  await act(async () => root.unmount());
  container.remove();
});
