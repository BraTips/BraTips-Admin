# BraTips Public / User Interface

Public-facing Vue 3 + Vite application for BraTips.

## Includes
- Public browsing without authentication
- Login and normal user registration
- Tipster application / sign-up
- Public latest predictions
- Public tipster directory and profiles
- Public Bet of the Day
- Public prediction track record
- Authenticated My Picks tracker with stake and potential return
- Authenticated tipster dashboard and prediction submission
- Uses the same BraTips logo as the admin app

## Run
1. Copy `.env.example` to `.env` and set `VITE_API_URL`.
2. Install dependencies with `npm install`.
3. Run `npm run dev`.
4. Build with `npm run build`.

The My Picks feature records a user's selections and stake for tracking; it does not process deposits, withdrawals, bookmaker execution, or real-money settlement.
