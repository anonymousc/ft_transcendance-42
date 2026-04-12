import pdp1 from "@/assets/pdp1.jpg";
import pdp1Png from "@/assets/pdp1.png";
import pdp2 from "@/assets/pdp2.jpg";
import pdp3 from "@/assets/pdp3.jpg";
import type { Conversation, Message } from "../types";

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    participant: { id: "Jaaffar", name: "Jaaffar", avatar: pdp1, isOnline: true },
    lastMessage: "And maybe Cascais on another day. Hey How are you doing :> ?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 1,
  },
  {
    id: "2",
    participant: { id: "walid", name: "Walid", avatar: pdp1Png, isOnline: false },
    lastMessage: "I'm free this weekend, maybe we plan it properly?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 1,
  },
  {
    id: "3",
    participant: { id: "Abdulah", name: "Abdulah", avatar: pdp2, isOnline: true },
    lastMessage: "Rest up first 😅 See you later!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 0,
  },
  {
    id: "4",
    participant: { id: "Touria", name: "Touria", avatar: pdp3, isOnline: false },
    lastMessage: "Thank youu",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    unreadCount: 0,
  },
  {
    id: "5",
    participant: { id: "Bakhira", name: "Bakhira", avatar: pdp3, isOnline: false },
    lastMessage: "Thank youu",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    unreadCount: 0,
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    { id: "1-m1", conversationId: "1", senderId: "Jaaffar", content: "Hey! Are you still thinking about Portugal this summer?", timestamp: new Date(Date.now() - 1000 * 60 * 35), status: "read" },
    { id: "1-m2", conversationId: "1", senderId: "me", content: "100%! I've been looking at flights to Lisbon. Prices are actually reasonable right now.", timestamp: new Date(Date.now() - 1000 * 60 * 33), status: "read" },
    { id: "1-m3", conversationId: "1", senderId: "Jaaffar", content: "Nice! What about accommodation? I found a really cool guesthouse in Alfama, right in the old district.", timestamp: new Date(Date.now() - 1000 * 60 * 30), status: "read" },
    { id: "1-m4", conversationId: "1", senderId: "me", content: "Alfama sounds perfect. I want to do the tram 28 ride and visit the Jerónimos Monastery for sure.", timestamp: new Date(Date.now() - 1000 * 60 * 28), status: "read" },
    { id: "1-m5", conversationId: "1", senderId: "Jaaffar", content: "And we have to try pastel de nata from the original place in Belém. That's non-negotiable 😄", timestamp: new Date(Date.now() - 1000 * 60 * 25), status: "read" },
    { id: "1-m6", conversationId: "1", senderId: "me", content: "Absolutely. Should we also do a day trip to Sintra? The palaces there are unreal.", timestamp: new Date(Date.now() - 1000 * 60 * 22), status: "read" },
    { id: "1-m7", conversationId: "1", senderId: "Jaaffar", content: "Yes! And maybe Cascais on another day. Hey How are you doing :> ?", timestamp: new Date(Date.now() - 1000 * 60 * 30), status: "read" },
  ],
  "2": [
    { id: "2-m1", conversationId: "2", senderId: "walid", content: "Bro, I've been thinking about doing a road trip along the coast. You in?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), status: "read" },
    { id: "2-m2", conversationId: "2", senderId: "me", content: "Which coast? Morocco? Spain?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5), status: "read" },
    { id: "2-m3", conversationId: "2", senderId: "walid", content: "Morocco! Agadir → Essaouira → Casablanca. Windows down, good music, fresh fish at every stop.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 8), status: "read" },
    { id: "2-m4", conversationId: "2", senderId: "me", content: "That route is legendary. Essaouira especially — the wind, the medina, the vibes.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 12), status: "read" },
    { id: "2-m5", conversationId: "2", senderId: "walid", content: "Exactly. We could rent a car in Agadir. I'm free this weekend, maybe we plan it properly?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), status: "read" },
  ],
  "3": [
    { id: "3-m1", conversationId: "3", senderId: "Abdulah", content: "Hey, just got back from Japan yesterday. Completely jet-lagged but it was worth every second.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), status: "read" },
    { id: "3-m2", conversationId: "3", senderId: "me", content: "No way! I've been waiting to hear about this. How was Tokyo?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 10), status: "read" },
    { id: "3-m3", conversationId: "3", senderId: "Abdulah", content: "Insane. The food alone made it the best trip of my life. I had ramen at 2am in Shinjuku and genuinely teared up.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 15), status: "read" },
    { id: "3-m4", conversationId: "3", senderId: "me", content: "You're making me jealous. Did you make it to Kyoto?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 20), status: "read" },
    { id: "3-m5", conversationId: "3", senderId: "Abdulah", content: "Yes! Spent two days there. Fushimi Inari at sunrise with almost no one around — that was surreal. I have thousands of photos to show you.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 25), status: "read" },
    { id: "3-m6", conversationId: "3", senderId: "me", content: "I need to see them all. Let's catch up this week, you have to tell me everything.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 30), status: "read" },
    { id: "3-m7", conversationId: "3", senderId: "Abdulah", content: "For sure! Rest up first 😅 See you later!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: "read" },
  ],
  "4": [
    { id: "4-m1", conversationId: "4", senderId: "me", content: "Hey Touria, you travel a lot — any tips for packing light for a two-week trip?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 40), status: "read" },
    { id: "4-m2", conversationId: "4", senderId: "Touria", content: "Capsule wardrobe is the answer. Neutral colors only — everything mixes and matches. Max 7 items of clothing.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 45), status: "read" },
    { id: "4-m3", conversationId: "4", senderId: "me", content: "What about shoes? That's always where I go wrong.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 50), status: "read" },
    { id: "4-m4", conversationId: "4", senderId: "Touria", content: "Three max. Sneakers, sandals, one smart pair. Wear the heaviest ones on the plane to save bag space.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 55), status: "read" },
    { id: "4-m5", conversationId: "4", senderId: "me", content: "That's actually genius. Any apps you swear by for finding good flights?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 58), status: "read" },
    { id: "4-m6", conversationId: "4", senderId: "Touria", content: "Google Flights for tracking prices, then book directly with the airline. Also set a price alert — it saved me $200 last time.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), status: "read" },
  ],
  "5": [
    { id: "5-m1", conversationId: "5", senderId: "Bakhira", content: "If you could travel anywhere tomorrow, no budget limit — where would you go?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 30), status: "read" },
    { id: "5-m2", conversationId: "5", senderId: "me", content: "Easy — Patagonia. Torres del Paine, no phone signal, just mountains and silence.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 35), status: "read" },
    { id: "5-m3", conversationId: "5", senderId: "Bakhira", content: "That's beautiful. Mine would be the Maldives — overwater bungalow, total disconnect from everything.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 40), status: "read" },
    { id: "5-m4", conversationId: "5", senderId: "me", content: "That sounds incredible. I feel like we always say these things and never actually book 😄", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 43), status: "read" },
    { id: "5-m5", conversationId: "5", senderId: "Bakhira", content: "That's it, I'm opening Skyscanner right now. Life is short!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), status: "read" },
  ],
};
