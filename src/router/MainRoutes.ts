const MainRoutes = {
  path: '/main',
  meta: { requiresAuth: true },
  redirect: '/dashboard',
  component: () => import('@/layouts/dashboard/DashboardLayout.vue'),
  children: [
    { name: 'Dashboard', path: '/dashboard', component: () => import('@/views/dashboard/DefaultDashboard.vue') },
    { name: 'Leagues', path: '/leagues', component: () => import('@/views/football/LeaguesPage.vue') },
    { name: 'Seasons', path: '/seasons', component: () => import('@/views/football/SeasonsPage.vue') },
    { name: 'Teams', path: '/teams', component: () => import('@/views/football/TeamsPage.vue') },
    { name: 'Matches', path: '/matches', component: () => import('@/views/football/MatchesPage.vue') },
    { name: 'Users', path: '/users', component: () => import('@/views/football/UsersPage.vue') },
    { name: 'Tipster Applications', path: '/tipsters/applications', component: () => import('@/views/tipsters/ApplicationsPage.vue') },
    { name: 'Approved Tipsters', path: '/tipsters', component: () => import('@/views/tipsters/TipstersPage.vue') },
    { name: 'Tipster Rewards', path: '/tipsters/rewards', component: () => import('@/views/tipsters/RewardsPage.vue') },
    { name: 'Predictions', path: '/predictions', component: () => import('@/views/football/PredictionsPage.vue') },
    { name: 'Prediction History', path: '/prediction-history', component: () => import('@/views/football/PredictionHistoryPage.vue') },
    { name: 'Bet of the Day', path: '/bet-of-day', component: () => import('@/views/football/BetOfDayPage.vue') },
    { name: 'Odds', path: '/odds', component: () => import('@/views/football/OddsPage.vue') },
    { name: 'Trends', path: '/trends', component: () => import('@/views/football/TrendsPage.vue') },
    { name: 'xGoals', path: '/xgoals', component: () => import('@/views/football/XGoalsPage.vue') },
    { name: 'Sync', path: '/sync', component: () => import('@/views/football/SyncPage.vue') },
    { name: 'Analytics', path: '/analytics', component: () => import('@/views/analytics/AnalyticsPage.vue') },
    { name: 'Settings', path: '/settings', component: () => import('@/views/settings/SettingsPage.vue') }
  ]
};
export default MainRoutes;
