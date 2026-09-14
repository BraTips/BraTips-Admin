import {
  DashboardOutlined,
  TrophyOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  LineChartOutlined,
  SettingOutlined,
  CloudSyncOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue';

export interface menu {
  header?: string; title?: string; icon?: object; to?: string; divider?: boolean;
  chip?: string; chipColor?: string; chipVariant?: string; children?: menu[];
  disabled?: boolean; type?: string; subCaption?: string;
}

const sidebarItem: menu[] = [
  { header: 'BraTipsters' },
  { title: 'Dashboard', icon: DashboardOutlined, to: '/dashboard' },
  { title: 'Analytics', icon: BarChartOutlined, to: '/analytics' },

  { header: 'Football Data' },
  { title: 'Leagues', icon: TrophyOutlined, to: '/leagues' },
  { title: 'Seasons', icon: CalendarOutlined, to: '/seasons' },
  { title: 'Teams', icon: TeamOutlined, to: '/teams' },
  { title: 'Matches', icon: CalendarOutlined, to: '/matches' },

  { header: 'Analytics' },
  { title: 'Predictions', icon: LineChartOutlined, to: '/predictions' },
  { title: 'Prediction History', icon: LineChartOutlined, to: '/prediction-history' },
  { title: 'Bet of the Day', icon: ThunderboltOutlined, to: '/bet-of-day' },
  { title: 'Odds', icon: BarChartOutlined, to: '/odds' },
  { title: 'Trends', icon: ThunderboltOutlined, to: '/trends' },
  { title: 'xGoals', icon: LineChartOutlined, to: '/xgoals' },

  { header: 'Platform' },
  { title: 'Users', icon: UserOutlined, to: '/users' },
  { title: 'Tipster Applications', icon: UserOutlined, to: '/tipsters/applications', chip: 'Review', chipColor: 'warning' },
  { title: 'Approved Tipsters', icon: TeamOutlined, to: '/tipsters' },
  { title: 'Tipster Rewards', icon: TrophyOutlined, to: '/tipsters/rewards' },
  { title: 'Data Sync', icon: CloudSyncOutlined, to: '/sync' },
  { title: 'Billing', icon: SettingOutlined, to: '/billing' },
  { title: 'Settings', icon: SettingOutlined, to: '/settings' },
  { title: 'Email Configuration', icon: SettingOutlined, to: '/settings/email' }
];
export default sidebarItem;
