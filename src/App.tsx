import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Whiteboard from "./Whiteboard.tsx";
import Index from "./pages/Index.tsx";
import Planning from "./pages/Planning.tsx";
import Bestanden from "./pages/Bestanden.tsx";
import Quotes from "./pages/Quotes.tsx";
import Klastools from "./pages/Klastools.tsx";
import Focus from "./pages/Focus.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/bestanden" element={<Bestanden />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/klastools" element={<Klastools />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
