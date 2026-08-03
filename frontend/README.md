# IMSolutions Frontend

## Local development

Install dependencies in `frontend/`, then run:

- `npm start` to launch the React dev server on `http://localhost:3000`
- `npm run build` to create the production bundle in `frontend/build`

The frontend reads its API base URL from `REACT_APP_API_URL`.

## Combined cPanel deployment

This project is set up for a single Node app on cPanel:

1. Build the frontend from `frontend/`:
   - `npm install`
   - `npm run build`
2. Set the Node application root in cPanel to `backend/`
3. Install backend dependencies in `backend/`
4. Configure production environment variables in cPanel:
   - `NODE_ENV=production`
   - `PORT`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `FRONTEND_URL`
   - `ALLOWED_ORIGINS`
   - `DB_PATH`
5. Start the backend app with `npm start`

`backend/server.js` serves the compiled React app from `frontend/build`, so the built frontend must be deployed alongside the backend with the same repository layout.

## Notes

- Do not commit local `.env` files, build artifacts, or SQLite database files.
- For cPanel, `DB_PATH` should point to a writable persistent location outside the deployed code directory when possible.
