# End-to-end tests

`deal-flow.spec.ts` walks a deal from listing to COMPLETED in the browser with
a seller, a buyer and an admin, and fails on any console error or failed
request.

1. Start the backend stack (in the backend repo): `docker compose up -d postgres redis minio`,
   then `npm run prisma:migrate:deploy && npm run start:dev` with `PAYMENT_PROVIDER=manual`.
2. Create the admin once:
   `ADMIN_EMAIL=admin-e2e@example.com ADMIN_PASSWORD='AdminE2E-Password1' npm run admin:bootstrap`.
3. Build and start this app against it:
   `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 npm run build`
   `API_URL=http://localhost:3000/api/v1 npm start`
4. `npm run test:e2e` (uses the installed Chrome; `E2E_BROWSER_CHANNEL= npx playwright install chromium` otherwise).

Override with `E2E_BASE_URL`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`.
