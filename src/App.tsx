import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RequireAuth } from "@/components/RequireAuth";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login";
import StrategyList from "./pages/strategies/StrategyList";
import StrategyForm from "./pages/strategies/StrategyForm";
import StrategyDetail from "./pages/strategies/StrategyDetail";
import AlertList from "./pages/alerts/AlertList";
import AlertDetail from "./pages/alerts/AlertDetail";
import AnalysisList from "./pages/analysis/AnalysisList";
import TopicDetail from "./pages/analysis/TopicDetail";
import SystemSettings from "./pages/settings/SystemSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/analysis" replace />} />
          <Route path="/strategies" element={<RequireAuth><StrategyList /></RequireAuth>} />
          <Route path="/strategies/new" element={<RequireAuth><StrategyForm mode="create" /></RequireAuth>} />
          <Route path="/strategies/:id/edit" element={<RequireAuth><StrategyForm mode="edit" /></RequireAuth>} />
          <Route path="/strategies/:id" element={<RequireAuth><StrategyDetail /></RequireAuth>} />
          <Route path="/alerts" element={<RequireAuth><AlertList /></RequireAuth>} />
          <Route path="/alerts/:id" element={<RequireAuth><AlertDetail /></RequireAuth>} />
          <Route path="/analysis" element={<RequireAuth><AnalysisList /></RequireAuth>} />
          <Route path="/analysis/:id" element={<RequireAuth><TopicDetail /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SystemSettings /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
