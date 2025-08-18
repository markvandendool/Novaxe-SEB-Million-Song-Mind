import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MillionSongMind from "./pages/MillionSongMind";
import Index from "./pages/Index";
import BraidCalibration from "./pages/BraidCalibration";
import NotFound from "./pages/NotFound";
import BraidPage from "./pages/Braid";
import NovaxeBraidPage from "./pages/NovaxeBraidPage";
import BraidClassicPage from "./pages/BraidClassicPage";
import BraidTonalPage from "./pages/BraidTonalPage";
import BraidNew2Page from "./pages/BraidNew2Page";
import BraidLiveMetricsPage from "./pages/BraidLiveMetricsPage";
// import IntegrationTestPage from "./components/IntegrationTest";
import IntegrationTestSimple from "./components/IntegrationTestSimple";
import { BraidGeometryProvider } from "@/state/braidGeometryStore";
import ErrorBoundary from "@/components/ErrorBoundary";
import TopNav from "@/components/layout/TopNav";
import { GlobalKeyProvider } from "@/state/globalKeyStore";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

// Font loading for nvxFont
const NvxFontLoader: React.FC = () => {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Create font face for nvxFont
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'nvxFont';
        src: url('./assets/fonts/nvxFont.ttf') format('truetype'),
             url('./assets/fonts/nvxFont.woff') format('woff'),
             url('./assets/fonts/nvxFont.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }

      .nvx-font {
        font-family: 'nvxFont', 'Arial', serif;
      }
    `;
    document.head.appendChild(style);

    // Test font loading
    const fontFace = new FontFace('nvxFont', 'url(./assets/fonts/nvxFont.ttf)');
    fontFace.load().then(() => {
      setFontLoaded(true);
      console.log('✅ nvxFont loaded successfully');
    }).catch((error) => {
      console.warn('⚠️ nvxFont loading failed, using fallback:', error);
      setFontLoaded(true); // Continue with fallback
    });

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NvxFontLoader />
      <ErrorBoundary>
        <BraidGeometryProvider>
          <GlobalKeyProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<MillionSongMind />} />
                <Route path="/integration-test" element={<IntegrationTestSimple />} />
                <Route path="/integration-simple" element={<IntegrationTestSimple />} />
                <Route path="/calibrate-braid" element={<BraidCalibration />} />
                <Route path="/braid" element={<BraidTonalPage />} />
                <Route path="/braid-classic" element={<BraidTonalPage />} />
                <Route path="/braid-tonal" element={<BraidTonalPage />} />
                <Route path="/braid-blues" element={<BraidClassicPage />} />
                <Route path="/braid-new2" element={<BraidNew2Page />} />
                <Route path="/braid-hive" element={<BraidNew2Page />} />
                <Route path="/braid-live-metrics" element={<BraidLiveMetricsPage />} />
                <Route path="/novaxe-braid" element={<NovaxeBraidPage />} />
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
