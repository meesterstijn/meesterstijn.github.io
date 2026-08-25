import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home, Maximize2, Minimize2 } from "lucide-react";
import AuthGate from "@/components/AuthGate";
import { AuthProvider } from "@/context/AuthContext";
import { ClassProvider } from "@/context/ClassContext";

const Index           = lazy(() => import("./pages/Index.tsx"));
const Planning        = lazy(() => import("./pages/Planning.tsx"));
const Bestanden       = lazy(() => import("./pages/Bestanden.tsx"));
const Weer            = lazy(() => import("./pages/Weer.tsx"));
const Klastools       = lazy(() => import("./pages/Klastools.tsx"));
const Focus           = lazy(() => import("./pages/Focus.tsx"));
const Whiteboard      = lazy(() => import("./pages/Whiteboard.tsx"));
const Klassenafspraken = lazy(() => import("./pages/Klassenafspraken.tsx"));
const Beloningen      = lazy(() => import("./pages/Beloningen.tsx"));
const ToolsPage       = lazy(() => import("./pages/ToolsPage.tsx"));
const Spellen         = lazy(() => import("./pages/Spellen.tsx"));
const Taakjes         = lazy(() => import("./pages/Taakjes.tsx"));
const Dagritme        = lazy(() => import("./pages/Dagritme.tsx"));
const Prive           = lazy(() => import("./pages/Prive.tsx"));
const Notities        = lazy(() => import("./pages/Notities.tsx"));
const Bloemenveld     = lazy(() => import("./pages/Bloemenveld.tsx"));
const Werkwoordspelling = lazy(() => import("./pages/Werkwoordspelling.tsx"));
const Tafelvoetbal    = lazy(() => import("./pages/Tafelvoetbal.tsx"));
const NotFound        = lazy(() => import("./pages/NotFound.tsx"));

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
      <AuthProvider>
      <AuthGate>
      <ClassProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={null}>
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
          <Route path="/prive" element={<Prive />} />
          <Route path="/notities" element={<Notities />} />
          <Route path="/bloemenveld" element={<Bloemenveld />} />
          <Route path="/werkwoordspelling" element={<Werkwoordspelling />} />
          <Route path="/tafelvoetbal" element={<Tafelvoetbal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        <div className="fixed bottom-5 left-5 z-50 flex gap-2">
          <FullscreenButton />
          <HomeButton />
        </div>
        <div className="fixed bottom-5 right-5 z-50 flex gap-2">
          <HomeButton />
          <FullscreenButton />
        </div>
      </BrowserRouter>
      </ClassProvider>
      </AuthGate>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
