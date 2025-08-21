import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MillionSongMind from "./pages/MillionSongMind";
import MillionSongMindTest from "./pages/MillionSongMindTest";
import Index from "./pages/Index";
import BraidCalibration from "./pages/BraidCalibration";
import NotFound from "./pages/NotFound";
import BraidPage from "./pages/Braid";
import NovaxeBraidPage from "./pages/NovaxeBraidPage";
import BraidClassicPage from "./pages/BraidClassicPage";
import BraidTonalPage from "./pages/BraidTonalPage";
import BraidNew2Page from "./pages/BraidNew2Page";
import BraidLiveMetricsPage from "./pages/BraidLiveMetricsPage";
import BraidTest from './pages/BraidTest';
import LigatureTest from './pages/LigatureTest';
import FontDiagnostic from './pages/FontDiagnostic';
import NvxFontRealTest from './pages/NvxFontRealTest';
import FontLigatureTest from './components/FontLigatureTest';
import FontLigatureComparison from './components/FontLigatureComparison';
import TestPage from './pages/TestPage';
import LiveTest from './pages/LiveTest';
import { BraidGeometryProvider } from "@/state/braidGeometryStore";
import ErrorBoundary from "@/components/ErrorBoundary";
import TopNav from "@/components/layout/TopNav";
import { GlobalKeyProvider } from "@/state/globalKeyStore";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BraidGeometryProvider>
          <GlobalKeyProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/test" element={<TestPage />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/live" element={<LiveTest />} />
                <Route path="/debug" element={
                  <div style={{
                    background: 'red',
                    color: 'white',
                    padding: '50px',
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    minHeight: '100vh'
                  }}>
                    <h1>🚨 DEBUG ROUTE WORKING 🚨</h1>
                    <p>React Router is functional!</p>
                    <p>Browser should display this red page.</p>
                  </div>
                } />
                <Route path="/" element={<MillionSongMind />} />
                <Route path="/test" element={<MillionSongMindTest />} />
                <Route path="/calibrate-braid" element={<BraidCalibration />} />
                <Route path="/braid" element={<BraidTonalPage />} />
                <Route path="/braid-classic" element={<BraidTonalPage />} />
                <Route path="/braid-tonal" element={<BraidTonalPage />} />
                <Route path="/braid-blues" element={<BraidClassicPage />} />
                <Route path="/braid-new2" element={<BraidNew2Page />} />
                <Route path="/braid-hive" element={<BraidNew2Page />} />
                <Route path="/braid-live-metrics" element={<BraidLiveMetricsPage />} />
                <Route path="/novaxe-braid" element={<NovaxeBraidPage />} />
                <Route path="/braid-test" element={<BraidTest />} />
                <Route path="/ligature-test" element={<LigatureTest />} />
                <Route path="/font-ligature-test" element={<FontLigatureTest />} />
                <Route path="/font-ligature-comparison" element={<FontLigatureComparison />} />
                <Route path="/font-diagnostic" element={<FontDiagnostic />} />
                <Route path="/nvx-font-real-test" element={<NvxFontRealTest />} />
                <Route path="/million-song-mind" element={<MillionSongMind />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </GlobalKeyProvider>
        </BraidGeometryProvider>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
