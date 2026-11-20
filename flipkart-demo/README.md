# Flipkart mobile MVP demo

## Run locally

Install Node.js and Docker Desktop. Keep Docker running, then:

```sh
npm install
npm run db:setup
npm run dev
```

Open http://localhost:3000. The setup command starts a new local Supabase project, applies migrations and seeds three example orders, and writes its public connection settings to `.env.local`. Restart Next.js after generating that file. No hosted Supabase project is needed.

- `npm run db:status`: show API and Studio addresses without printing secret keys.
- `npm run db:stop`: stop the services while retaining local database data.
- `npm run db:start`: start them again and refresh connection settings.
- Supabase Studio: http://127.0.0.1:54333.

## Clickable experiences

- `/`: customer and driver chooser.
- `/orders/details`: customer order, checks, chat, cancellation, rescheduling, arrival, OTP warning, delivery, ratings, returns, and refund steps.
- `/drivers`: driver Home, Parcels, start confirmation, route states, customer chat, and delivery instructions.
- `/drivers/parcels`: open the Parcels tab directly.
- `/drivers/parcels/issues`: issue guidance.

Both demos are manual. Click the mobile app normally. Use the side panel to select an order, change delivery or shipping/route states, open screens, and edit shared order details. Reset view only returns to the initial screen; it does not erase saved data. There is no automatic playback, timed state advancement, or scripted message sending. Screens retain short transitions and support reduced motion.

Open customer and driver views in separate tabs to see shared updates. Starting a driver delivery changes that order to Out for delivery; cancellation moves it to Issues; arrival and completion update the customer view. Instructions, product/customer details, ratings, return fields, and submitted-return state are persisted. Chat messages are shared per order and shown from the appropriate sender's perspective. Selecting a customer order does not start a delivery.

The initial assignment total is the supplied 32-parcel sample; three editable parcel records are seeded. Completed and cancelled counts track these example orders. Live navigation and actual delivery/refund processing are not implemented. Driver route previews use supplied static assets; the customer live-map slot remains empty. Phone calls require configured phone numbers.

## Shared local database

`lib/demo/seed.json` defines the example records. `supabase/migrations` contains the schema, policies, transactional patch function, realtime publication, and private attachment bucket. `supabase/seed.sql` initializes the records on first setup.

The frontend signs in anonymously to the local Supabase Auth service. All signed-in demo sessions share one workspace. This intentionally permits both demo roles to edit the same records; it is not a production customer/driver authorization model. Unauthenticated database requests are blocked. Browser configuration uses only the public key, never a service-role key. Keep the stack on your own computer.

`lib/demo/store.ts` handles optimistic updates, field patches, realtime updates, revision ordering, and a five-second catch-up refresh. Pending changes are retained in browser storage and retried when the connection recovers. The sidebar distinguishes saved, saving, and offline/queued states. Reloaded pages read canonical data from Supabase. Attachments use private Supabase Storage (10 MB maximum; JPEG, PNG, WebP, PDF, MP4).

Chat is reusable through `components/chat/chat-screen.tsx`, with controlled `messages`, async `onSend`, and attachment-opening callbacks. Shared order context supplies the currently selected order to mobile components.

## Assets and checks

All illustrations come from `public/assets`; mappings are in `components/demo-assets.ts` and the customer/driver data modules. No new illustrations were generated.

```sh
npm run lint
npx tsc --noEmit
npm run build
node scripts/test-sync.mjs
```

The sync check needs the local stack running. It tests authentication policies, realtime delivery, independent concurrent field edits, cross-session chat, and private attachments. It restores order fields after testing and adds clearly labelled verification messages.

