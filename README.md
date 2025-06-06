 import { disableNetwork, enableNetwork } from "firebase/firestore";

await disableNetwork(db); // simulate offline
await enableNetwork(db);  // reconnect to Firestore
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
