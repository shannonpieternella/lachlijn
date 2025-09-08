# PrankCall.nl - Nederlandse AI Prank Call Platform 🎭

Een virale Nederlandse AI prank call website gebouwd met React, VAPI voor real-time AI calls, en een complete admin systeem.

## 🚀 Features

### Voor Gebruikers
- **🎯 6 Nederlandse Prank Scenarios**: Pizza bestelling, Loterij winnaar, Verwarde oma, Radio DJ, HR Interview, Rare verkoper
- **🤖 VAPI AI Integration**: Echte AI calls met Nederlandse stemmen en accenten
- **📱 Nederlandse Nummer Validatie**: Automatische validatie van Nederlandse telefoonnummers
- **💳 Stripe Payments**: Credits systeem met Nederlandse pricing
- **📊 User Dashboard**: Call geschiedenis, achievements, statistieken
- **🔐 User Authentication**: Veilige login/register systeem
- **📱 Responsive Design**: Perfect op alle devices

### Admin Panel (/admin)
- **👤 Agent Management**: Koppel VAPI agents aan prank scenarios
- **📝 Scenario Editor**: Maak nieuwe scenarios of bewerk bestaande
- **🔗 Real-time VAPI Sync**: Automatisch ophalen van VAPI agents
- **📊 Call Monitoring**: Overzicht van alle calls en status
- **🛡️ Admin Authentication**: Beveiligd admin panel

### Technical Stack
- **Frontend**: React 18 + Vite + Framer Motion
- **AI Calls**: VAPI API voor real-time voice AI
- **Payments**: Stripe voor credit systeem
- **Database**: MongoDB voor gebruikers en call data
- **Styling**: Custom viral.css design systeem
- **Deployment Ready**: Environment variabelen setup

## 🛠️ Setup

1. **Clone & Install**
```bash
git clone <repo>
cd vapi-dashboard
npm install
```

2. **Environment Variables**
Update `.env` bestand:
```env
VITE_VAPI_API_KEY=your_vapi_api_key_here
# Required by Vapi: the outbound caller ID from your Vapi account
# Provide either the phone number ID (preferred) or the raw E.164 number
VITE_VAPI_PHONE_NUMBER_ID=pn_xxxxxxxxxxxxx
# or
VITE_VAPI_PHONE_NUMBER=+31XXXXXXXXX

# Server-side (if you place calls from the backend)
VAPI_API_KEY=your_vapi_api_key_here
# Provide either the phone number ID (preferred) or the raw E.164 number
VAPI_PHONE_NUMBER_ID=pn_xxxxxxxxxxxxx
# or
VAPI_PHONE_NUMBER=+31XXXXXXXXX

mongodb+srv://username:password@cluster.mongodb.net/prankcalls
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_PASSWORD=prankadmin2024
```

3. **VAPI Setup**
- Maak assistants aan in VAPI dashboard
- Kopieer agent IDs naar admin panel
- Koppel agents aan scenarios in /admin

4. **Start Development**
```bash
npm run dev
```

## 📋 VAPI Agent Setup

Voor elk scenario heb je een VAPI assistant nodig:

### Pizza Scenario Agent
```json
{
  "name": "Pizza Bot NL",
  "firstMessage": "Hallo! Ik bel omdat ik gisteren 47 pizza's heb besteld voor vanavond...",
  "systemMessage": "Je bent een verwarde persoon die denkt dat hij 47 pizza's heeft besteld. Blijf in karakter en maak het grappig maar niet gemeen.",
  "voice": {
    "provider": "elevenlabs",
    "voiceId": "dutch-male"
  }
}
```

### Andere Scenarios
- **Loterij Bot**: Meldt dat ze €50.000 hebben gewonnen
- **Oma Bot**: Verwarde oma zoekt kleinzoon Kees  
- **Radio DJ Bot**: Spontaan radio interview
- **HR Bot**: Interview voor kattenfluisteraar
- **Sales Bot**: Verkoopt rare producten

## 🔧 Admin Usage

1. Ga naar `/admin`
2. Login met admin wachtwoord: `prankadmin2024`
3. **Agents Tab**: Bekijk je VAPI agents
4. **Pranks Tab**: Koppel agents aan scenarios
5. Test scenarios in de main app

## 🎯 User Flow

1. **Landing**: Gebruiker ziet virale landing page
2. **Register**: Gratis account + 3 credits
3. **Scenario**: Kies prank scenario
4. **Target**: Voer Nederlands nummer in
5. **Call**: VAPI maakt echte AI call
6. **Result**: Download opname, deel resultaat

## 💰 Pricing

- **Starter**: €2.99 voor 10 credits
- **Pro**: €7.99 voor 30 credits  
- **Unlimited**: €19.99 voor unlimited calls

## 🔐 Security

- Admin panel beveiligd met wachtwoord
- Telefoonnummer validatie
- Rate limiting op calls
- Geen opslag van gevoelige data

## 🔔 Stripe Webhooks

- Waarom: redirect-verificatie (Thank You) is niet altijd betrouwbaar (tab gesloten, netwerk). Webhooks garanderen dat credits worden toegevoegd zodra Stripe betaalt bevestigt.
- Endpoint: `POST /api/billing/webhook`
- Verificatie: via `Stripe-Signature` header met `STRIPE_WEBHOOK_SECRET` (HMAC SHA256)
- Event: `checkout.session.completed` → gebruikt `metadata.credits` en `metadata.userId` om credits toe te voegen
- Local testen:
  1. Installeer Stripe CLI en login (`stripe login`)
  2. `stripe listen --forward-to localhost:3001/api/billing/webhook`
  3. Doorloop een test checkout; bij afronden zie je credits in de DB

## 📱 Mobile Ready

Volledig responsive design geoptimaliseerd voor:
- iOS Safari
- Android Chrome  
- Desktop browsers

## 🚀 Deployment

Ready voor deployment op:
- Vercel/Netlify (frontend)
- MongoDB Atlas (database)
- Stripe (payments)
- VAPI (AI calls)

## 🎭 Viral Features

- Nederlandse taal en cultuur
- Sociale media sharing
- Achievement systeem
- Leaderboards (toekomst)
- Referral system (toekomst)

---

**Made with ❤️ in Nederland 🇳🇱**

Voor support: admin@prankcall.nl
