# BraTips Admin Dashboard

Vue 3 + TypeScript + Vuetify admin control center for BraTips.

## API connection

Set the backend URL in `.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Only the backend URL belongs here. **Do not put odds, football, xGoals or other provider secrets in this file.** Configure those in `bratips-backend/.env`.

## Integrated modules

- Dashboard and platform KPIs
- Analytics with selectable 7/30/90/180/365-day ranges
- Leagues, seasons, teams and matches CRUD
- User role/status management
- Tipster application approval workflow with sample prediction review
- Approved tipster performance
- Prediction moderation
- Odds provider view
- Live football provider view / data sync
- Prediction trends
- xGoals integration status
- Provider configuration and health status

The admin frontend no longer installs or runs the old fake backend interceptor; requests go to the real API.
