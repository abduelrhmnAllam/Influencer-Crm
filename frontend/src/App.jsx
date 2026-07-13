import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import useAuthStore from './stores/authStore';
import AppShell from './components/layout/AppShell';
import LoginPage from './views/auth/LoginPage';
import CustomerListPage from './views/customers/CustomerListPage';
import InfluencerListPage from './views/influencers/InfluencerListPage';
import CampaignListPage from './views/campaigns/CampaignListPage';
import TaskListPage from './views/tasks/TaskListPage';
import CalendarPage from './views/calendar/CalendarPage';
import WhatsAppChatPage from './views/whatsapp/WhatsAppChatPage';
import TransferWorkspace from './views/finance/TransferWorkspace';
import DashboardPage from './views/dashboard/DashboardPage';
import ModulePage from './views/modules/ModulePage';
import AnalyticsPage from './views/analytics/AnalyticsPage';
import ContentPage from './views/content/ContentPage';
import UgcAdminPage from './views/ugc/UgcAdminPage';
import OrdersCampaignsPage from './views/orders/OrdersCampaignsPage';
import SettingsPage from './views/settings/SettingsPage';
import EntityFormPage from './views/crud/EntityFormPage';
import EntityDetailPage from './views/crud/EntityDetailPage';
import TransferFormPage from './views/finance/TransferFormPage';
import TransferDetailPage from './views/finance/TransferDetailPage';
import RequestFormPage from './views/requests/RequestFormPage';
import RequestDetailPage from './views/requests/RequestDetailPage';
import RequestUsersPage from './views/requests/RequestUsersPage';
import RequestsPage from './views/requests/RequestsPage';
import RequestsPortalPage from './views/portal/RequestsPortalPage';
import ApprovalPage from './views/portal/ApprovalPage';
import LegacyPage from './views/modules/LegacyPage';
import LegacyRedirect, { NotFoundPage } from './views/modules/LegacyRedirect';

// Placeholder Dashboard Page (will be fully designed in Phase 5)
/* Legacy placeholder retained temporarily for history.
function PlaceholderDashboardPage() {
  const { user } = useAuthStore();
  return (
    <div className="bg-white rounded-3xl shadow-card border border-surface-150 p-8 text-center max-w-4xl mx-auto font-sans">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center text-3xl font-bold mb-6">
        {user?.name?.charAt(0) || 'U'}
      </div>
      <h1 className="text-2xl font-bold text-surface-900 mb-2">
        مرحباً بك في لوحة تحكم Smart Code CRM، {user?.name || 'المستخدم'}
      </h1>
      <p className="text-sm text-surface-600 mb-6">
        البريد الإلكتروني: {user?.email || user?.username}
      </p>
      <div className="p-4 bg-surface-100 rounded-2xl text-xs text-surface-700 font-semibold max-w-md mx-auto">
        الدور الحالي في النظام: {user?.role}
      </div>
    </div>
  );
}

*/
/**
 * Private Route Guard
 * Redirects to /login if user is not authenticated.
 */
function PrivateRoute({ children, permission }) {
  const { user, loading, can } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * Guest Route Guard
 * Redirects to /dashboard if user is already authenticated.
 */
function GuestRoute({ children }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  const { fetchUser } = useAuthStore();

  // On app mount, check if user has an active session
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            } 
          />
          <Route path='/requests-portal' element={<RequestsPortalPage/>}/>
          <Route path='/ugc-portal' element={<RequestsPortalPage/>}/>
          <Route path='/influencer-portal' element={<RequestsPortalPage/>}/>
          <Route path='/campaign-approval' element={<ApprovalPage title='اعتماد ترشيحات الحملة'/>}/>
          <Route path='/client-approval' element={<ApprovalPage title='اعتماد المؤثرين للعميل'/>}/>
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <AppShell>
                  <DashboardPage />
                </AppShell>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/customers" 
            element={
              <PrivateRoute permission="view-customers">
                <AppShell>
                  <CustomerListPage />
                </AppShell>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/influencers" 
            element={
              <PrivateRoute permission="view-influencers">
                <AppShell>
                  <InfluencerListPage />
                </AppShell>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/campaigns" 
            element={
              <PrivateRoute permission="view-campaigns">
                <AppShell>
                  <CampaignListPage />
                </AppShell>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <PrivateRoute permission="view-tasks">
                <AppShell>
                  <TaskListPage />
                </AppShell>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <PrivateRoute permission="view-campaigns">
                <AppShell>
                  <CalendarPage />
                </AppShell>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/finance" 
            element={
              <PrivateRoute permission="view-transfers">
                <AppShell>
                  <TransferWorkspace />
                </AppShell>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/whatsapp" 
            element={
              <PrivateRoute permission="view-whatsapp">
                <AppShell>
                  <WhatsAppChatPage />
                </AppShell>
              </PrivateRoute>
            } 
          />
          <Route path='/404' element={<NotFoundPage/>}/>
          <Route path='/content' element={<PrivateRoute permission='view-content'><AppShell><ContentPage /></AppShell></PrivateRoute>} />
          <Route path='/requests' element={<PrivateRoute permission='view-requests'><AppShell><RequestsPage /></AppShell></PrivateRoute>} />
          <Route path='/analytics' element={<PrivateRoute permission='view-analytics'><AppShell><AnalyticsPage /></AppShell></PrivateRoute>} />
          <Route path='/notifications' element={<PrivateRoute permission='view-notifications'><AppShell><ModulePage type='notifications' /></AppShell></PrivateRoute>} />
          <Route path='/settings' element={<PrivateRoute permission='view-settings'><AppShell><SettingsPage /></AppShell></PrivateRoute>} />
          <Route path='/customers/add' element={<PrivateRoute permission='create-customers'><AppShell><EntityFormPage type='customer'/></AppShell></PrivateRoute>} />
          <Route path='/customers/:id/edit' element={<PrivateRoute permission='edit-customers'><AppShell><EntityFormPage type='customer'/></AppShell></PrivateRoute>} />
          <Route path='/customers/:id' element={<PrivateRoute permission='view-customers'><AppShell><EntityDetailPage type='customer'/></AppShell></PrivateRoute>} />
          <Route path='/influencers/add' element={<PrivateRoute permission='create-influencers'><AppShell><EntityFormPage type='influencer'/></AppShell></PrivateRoute>} />
          <Route path='/influencers/:id/edit' element={<PrivateRoute permission='edit-influencers'><AppShell><EntityFormPage type='influencer'/></AppShell></PrivateRoute>} />
          <Route path='/influencers/:id' element={<PrivateRoute permission='view-influencers'><AppShell><EntityDetailPage type='influencer'/></AppShell></PrivateRoute>} />
          <Route path='/campaigns/add' element={<PrivateRoute permission='create-campaigns'><AppShell><EntityFormPage type='campaign'/></AppShell></PrivateRoute>} />
          <Route path='/campaigns/:id/edit' element={<PrivateRoute permission='edit-campaigns'><AppShell><EntityFormPage type='campaign'/></AppShell></PrivateRoute>} />
          <Route path='/campaigns/:id' element={<PrivateRoute permission='view-campaigns'><AppShell><EntityDetailPage type='campaign'/></AppShell></PrivateRoute>} />
          <Route path='/finance/request' element={<PrivateRoute permission='create-transfers'><AppShell><TransferFormPage/></AppShell></PrivateRoute>} />
          <Route path='/finance/:id' element={<PrivateRoute permission='view-transfers'><AppShell><TransferDetailPage/></AppShell></PrivateRoute>} />
          <Route path='/requests/add' element={<PrivateRoute permission='create-requests'><AppShell><RequestFormPage/></AppShell></PrivateRoute>} />
          <Route path='/requests/:id' element={<PrivateRoute permission='view-requests'><AppShell><RequestDetailPage/></AppShell></PrivateRoute>} />
          <Route path='/request-users' element={<PrivateRoute permission='manage-portal-users'><AppShell><RequestUsersPage/></AppShell></PrivateRoute>} />
          <Route path='/customer-add' element={<Navigate to='/customers/add' replace/>}/>
          <Route path='/customer-detail' element={<PrivateRoute permission='view-customers'><LegacyRedirect base='/customers' fallback='/customers'/></PrivateRoute>}/>
          <Route path='/influencer-add' element={<Navigate to='/influencers/add' replace/>}/>
          <Route path='/influencer-detail' element={<PrivateRoute permission='view-influencers'><LegacyRedirect base='/influencers' fallback='/influencers'/></PrivateRoute>}/>
          <Route path='/campaign-detail' element={<PrivateRoute permission='view-campaigns'><LegacyRedirect base='/campaigns' fallback='/campaigns'/></PrivateRoute>}/>
          <Route path='/transfer-request' element={<Navigate to='/finance/request' replace/>}/>
          <Route path='/transfer-detail' element={<PrivateRoute permission='view-transfers'><LegacyRedirect base='/finance' fallback='/finance'/></PrivateRoute>}/>
          <Route path='/request-detail' element={<PrivateRoute permission='view-requests'><LegacyRedirect base='/requests' fallback='/requests'/></PrivateRoute>}/>
          <Route path='/requests-users' element={<Navigate to='/request-users' replace/>}/>
          <Route path='/publishers' element={<PrivateRoute permission='view-influencers'><AppShell><LegacyPage type='publishers'/></AppShell></PrivateRoute>}/>
          <Route path='/publisher-detail' element={<PrivateRoute permission='view-influencers'><AppShell><LegacyPage type='publisher'/></AppShell></PrivateRoute>}/>
          <Route path='/ugc-admin' element={<PrivateRoute permission='view-content'><AppShell><UgcAdminPage /></AppShell></PrivateRoute>}/>
          <Route path='/orders-campaigns' element={<PrivateRoute permission='view-campaigns'><AppShell><OrdersCampaignsPage /></AppShell></PrivateRoute>}/>
          <Route path='/monthly-report' element={<PrivateRoute permission='view-analytics'><AppShell><LegacyPage type='report'/></AppShell></PrivateRoute>}/>
          <Route path='/document' element={<PrivateRoute permission='view-content'><AppShell><LegacyPage type='document'/></AppShell></PrivateRoute>}/>
          <Route path='/influencer-booking' element={<PrivateRoute permission='create-requests'><AppShell><LegacyPage type='booking'/></AppShell></PrivateRoute>}/>
          <Route path='/index' element={<Navigate to='/dashboard' replace/>}/>
          <Route path='*' element={<NotFoundPage/>}/>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;


