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
import NovaxeBraid from "./pages/NovaxeBraid";
import BraidClassicPage from "./pages/BraidClassicPage";
import BraidTonalPage from "./pages/BraidTonalPage";
import BraidNew2Page from "./pages/BraidNew2Page";
import { BraidGeometryProvider } from "@/state/braidGeometryStore";
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BraidGeometryProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MillionSongMind />} />
              <Route path="/calibrate-braid" element={<BraidCalibration />} />
              <Route path="/braid" element={<BraidTonalPage />} />
              <Route path="/braid-classic" element={<BraidTonalPage />} />
              <Route path="/braid-tonal" element={<BraidTonalPage />} />
              <Route path="/braid-blues" element={<BraidClassicPage />} />
              <Route path="/braid-new2" element={<BraidNew2Page />} />
              <Route path="/braid-hive" element={<BraidNew2Page />} />
              <Route path="/novaxe-braid" element={<NovaxeBraid />} />
              <Route path="/million-song-mind" element={<MillionSongMind />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BraidGeometryProvider>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
