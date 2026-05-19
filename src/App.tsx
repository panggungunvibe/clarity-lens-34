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
import Dashboard from "./pages/dashboard/Dashboard";
import AllNegativeTopics from "./pages/dashboard/AllNegativeTopics";
import AllTopicResults from "./pages/dashboard/AllTopicResults";
import DashboardTopicDetail from "./pages/dashboard/DashboardTopicDetail";
import TopicAllLogs from "./pages/dashboard/TopicAllLogs";
import RechargeBuy from "./pages/recharge/Buy";
import RechargeRecords from "./pages/recharge/Records";
import RechargePaymentOrder from "./pages/recharge/PaymentOrder";
import RechargeEnterpriseTransferOrder from "./pages/recharge/EnterpriseTransferOrder";
import RechargeOrderDetail from "./pages/recharge/OrderDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/dashboard/negative-topics" element={<RequireAuth><AllNegativeTopics /></RequireAuth>} />
          <Route path="/dashboard/topic-results" element={<RequireAuth><AllTopicResults /></RequireAuth>} />
          <Route path="/dashboard/topics/:id" element={<RequireAuth><DashboardTopicDetail /></RequireAuth>} />
          <Route path="/dashboard/topics/:id/logs" element={<RequireAuth><TopicAllLogs /></RequireAuth>} />

          <Route path="/recharge" element={<Navigate to="/recharge/buy" replace />} />
          <Route path="/recharge/buy" element={<RequireAuth><RechargeBuy /></RequireAuth>} />
          <Route path="/recharge/records" element={<RequireAuth><RechargeRecords /></RequireAuth>} />
          <Route path="/recharge/pay/:id" element={<RequireAuth><RechargePaymentOrder /></RequireAuth>} />
          <Route path="/recharge/bank/:id" element={<RequireAuth><RechargeEnterpriseTransferOrder /></RequireAuth>} />
          <Route path="/recharge/orders/:id" element={<RequireAuth><RechargeOrderDetail /></RequireAuth>} />

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
