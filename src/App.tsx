import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Maximize2, Minimize2 } from "lucide-react";
import Index from "./pages/Index.tsx";
import Planning from "./pages/Planning.tsx";
import Bestanden from "./pages/Bestanden.tsx";
import Quotes from "./pages/Quotes.tsx";
import Klastools from "./pages/Klastools.tsx";
import Focus from "./pages/Focus.tsx";
import Whiteboard from "./pages/Whiteboard.tsx";
import Klassenafspraken from "./pages/Klassenafspraken.tsx";
import Beloningen from "./pages/Beloningen.tsx";
import ToolsPage from "./pages/ToolsPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const FullscreenButton = ({ side }: { side: "left" | "right" }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <button
      onClick={toggle}
      title={isFullscreen ? "Volledig scherm verlaten" : "Volledig scherm"}
      className={`fixed bottom-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-smooth hover:border-primary hover:text-primary ${side === "left" ? "left-5" : "right-5"}`}
    >
      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </button>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/bestanden" element={<Bestanden />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/klastools" element={<Klastools />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/whiteboard" element={<Whiteboard />} />
          <Route path="/klassenafspraken" element={<Klassenafspraken />} />
          <Route path="/beloningen" element={<Beloningen />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FullscreenButton side="left" />
        <FullscreenButton side="right" />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
