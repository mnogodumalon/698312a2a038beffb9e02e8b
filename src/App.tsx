import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import TestprojektePage from '@/pages/TestprojektePage';
import TestausfuehrungenPage from '@/pages/TestausfuehrungenPage';
import TestfaellePage from '@/pages/TestfaellePage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="testprojekte" element={<TestprojektePage />} />
          <Route path="testausfuehrungen" element={<TestausfuehrungenPage />} />
          <Route path="testfaelle" element={<TestfaellePage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}