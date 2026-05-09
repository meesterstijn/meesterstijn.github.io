import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home, Maximize2, Minimize2 } from "lucide-react";
import AuthGate from "@/components/AuthGate";
import Index from "./pages/Index.tsx";
import Planning from "./pages/Planning.tsx";
import Bestanden from "./pages/Bestanden.tsx";
import Weer from "./pages/Weer.tsx";
import Klastools from "./pages/Klastools.tsx";
import Focus from "./pages/Focus.tsx";
import Whiteboard from "./pages/Whiteboard.tsx";
import Klassenafspraken from "./pages/Klassenafspraken.tsx";
import Beloningen from "./pages/Beloningen.tsx";
import ToolsPage from "./pages/ToolsPage.tsx";
import Spellen from "./pages/Spellen.tsx";
import Taakjes from "./pages/Taakjes.tsx";
import Dagritme from "./pages/Dagritme.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const btnCls = "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-smooth hover:border-primary hover:text-primary";

const FullscreenButton = () => {
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
    <button onClick={toggle} title={isFullscreen ? "Volledig scherm verlaten" : "Volledig scherm"} className={btnCls}>
      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </button>
  );
};

const HomeButton = () => (
  <Link to="/" title="Naar startpagina" className={btnCls}>
    <Home className="h-4 w-4" />
  </Link>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthGate>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/bestanden" element={<Bestanden />} />
          <Route path="/weer" element={<Weer />} />
          <Route path="/klastools" element={<Klastools />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/whiteboard" element={<Whiteboard />} />
          <Route path="/klassenafspraken" element={<Klassenafspraken />} />
          <Route path="/beloningen" element={<Beloningen />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/spellen" element={<Spellen />} />
          <Route path="/taakjes" element={<Taakjes />} />
          <Route path="/dagritme" element={<Dagritme />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <div className="fixed bottom-5 left-5 z-50 flex gap-2">
          <FullscreenButton />
          <HomeButton />
        </div>
        <div className="fixed bottom-5 right-5 z-50 flex gap-2">
          <HomeButton />
          <FullscreenButton />
        </div>
      </BrowserRouter>
      </AuthGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
