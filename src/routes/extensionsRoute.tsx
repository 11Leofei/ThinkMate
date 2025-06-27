/**
 * Extensions Demo Route Configuration
 * 
 * Add this route to your main router configuration to access the extensions demo.
 * If using React Router, add to your App.tsx or router configuration:
 * 
 * import ExtensionsDemo from './pages/ExtensionsDemo';
 * 
 * <Route path="/extensions-demo" element={<ExtensionsDemo />} />
 * 
 * Or if using a different routing solution, configure accordingly.
 * The demo page is available at: /extensions-demo
 */

import ExtensionsDemo from '../pages/ExtensionsDemo';

export const extensionsRoute = {
  path: '/extensions-demo',
  component: ExtensionsDemo,
  title: 'ThinkMate Extensions Demo'
};

// Example integration with React Router v6:
/*
import { Routes, Route } from 'react-router-dom';
import ExtensionsDemo from './pages/ExtensionsDemo';

function App() {
  return (
    <Routes>
      {/* Your existing routes */}
      <Route path="/extensions-demo" element={<ExtensionsDemo />} />
    </Routes>
  );
}
*/