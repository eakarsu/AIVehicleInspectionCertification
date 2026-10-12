import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { fillDisplayedExample } from './CompleteAIExamples';
import FormattedAIReport from './FormattedAIReport';
import Login from '../pages/Login';

jest.mock('../services/api', () => ({ login: jest.fn() }));

global.IS_REACT_ACT_ENVIRONMENT = true;

function mount(element) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return { container, cleanup: () => act(() => { root.unmount(); container.remove(); }) };
}

test('preset fills required and optional inputs without submitting or inventing source references', () => {
  const form = document.createElement('form');
  form.innerHTML = '<input name="make" required><input name="region"><select name="severity"><option value="minor">Minor</option><option value="major">Major</option></select><input type="number" data-ai-field="inspection_id" required><input type="file" data-ai-field="vehicle_photo">';
  let submissions = 0;
  form.addEventListener('submit', event => { event.preventDefault(); submissions += 1; });
  document.body.appendChild(form);
  const result = fillDisplayedExample(form, 1, 'Vehicle planning review', { make: 'Ford', region: 'UK', severity: 'major' });
  expect(form.elements.make.value).toBe('Ford');
  expect(form.elements.region.value).toBe('UK');
  expect(form.elements.severity.value).toBe('major');
  expect(form.querySelector('[data-ai-field="inspection_id"]').value).toBe('');
  expect(form.querySelector('[type="file"]').files).toHaveLength(0);
  expect(result.manual.join(' ')).toMatch(/actual saved reference|documented source/);
  expect(submissions).toBe(0);
  form.remove();
});

test('structured returned and saved values render labels, tables, false, zero and empty strings', () => {
  const report = { result_json: { eligible: false, estimated_cost: 0, notes: '', parts: [{ name: 'Bumper', cost: 0 }], details: { verified: false } }, id: 4 };
  const { container, cleanup } = mount(<><FormattedAIReport response={report} /><FormattedAIReport response={JSON.stringify(report.result_json)} /></>);
  expect(container.querySelectorAll('table')).toHaveLength(2);
  expect(container.textContent).toMatch(/Eligible/);
  expect(container.textContent).toMatch(/No/);
  expect(container.textContent).toMatch(/0/);
  expect(container.textContent).toMatch(/Notes/);
  expect(container.textContent).toMatch(/Empty string/);
  expect(container.querySelector('dt')).not.toBeNull();
  cleanup();
});

test('demo fill action does not submit and reports missing client configuration', () => {
  const oldEmail = process.env.REACT_APP_DEMO_EMAIL;
  const oldPassword = process.env.REACT_APP_DEMO_PASSWORD;
  delete process.env.REACT_APP_DEMO_EMAIL;
  delete process.env.REACT_APP_DEMO_PASSWORD;
  const onLogin = jest.fn();
  const { container, cleanup } = mount(<Login onLogin={onLogin} />);
  act(() => container.querySelector('.auto-fill-btn').click());
  expect(onLogin).not.toHaveBeenCalled();
  expect(container.textContent).toMatch(/not configured/);
  expect(container.querySelector('input[type="password"]').value).toBe('');
  cleanup();
  if (oldEmail === undefined) delete process.env.REACT_APP_DEMO_EMAIL; else process.env.REACT_APP_DEMO_EMAIL = oldEmail;
  if (oldPassword === undefined) delete process.env.REACT_APP_DEMO_PASSWORD; else process.env.REACT_APP_DEMO_PASSWORD = oldPassword;
});

test('configured demo fixture fills both fields without logging in', () => {
  const oldEmail = process.env.REACT_APP_DEMO_EMAIL;
  const oldPassword = process.env.REACT_APP_DEMO_PASSWORD;
  process.env.REACT_APP_DEMO_EMAIL = 'demo@example.test';
  process.env.REACT_APP_DEMO_PASSWORD = 'fixture-only-password';
  const onLogin = jest.fn();
  const { container, cleanup } = mount(<Login onLogin={onLogin} />);
  act(() => container.querySelector('.auto-fill-btn').click());
  expect(container.querySelector('input[type="email"]').value).toBe(process.env.REACT_APP_DEMO_EMAIL);
  expect(container.querySelector('input[type="password"]').value).toBe(process.env.REACT_APP_DEMO_PASSWORD);
  expect(onLogin).not.toHaveBeenCalled();
  cleanup();
  if (oldEmail === undefined) delete process.env.REACT_APP_DEMO_EMAIL; else process.env.REACT_APP_DEMO_EMAIL = oldEmail;
  if (oldPassword === undefined) delete process.env.REACT_APP_DEMO_PASSWORD; else process.env.REACT_APP_DEMO_PASSWORD = oldPassword;
});
