# characterAt

A web app for writers to build living "dossiers" for the characters in their novels, scripts, and games — premise, backstory, chapter/scene bookmarks, rough dialogue collections — and turn them into shareable cards for friends to see, rate, and react to.

**Status: work in progress.** Core character management, auth, and the social/wall features are built and tested; some polish and features are still to come.

---

## Philosophy

- **100% free and open source stack** — no paid services required to run or host this.
- **Local-first by default.** No account needed to use the app — characters live in your browser (IndexedDB) unless you explicitly sign up and sync.
- **Self-hostable.** Clone this repo and run your own instance with your own database — no dependency on any official server.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Vue 3 + Vue Router + Pinia |
| Styling | Tailwind CSS v4 |
| Backend | Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (httpOnly cookie) + bcrypt |

## Project structure

```
characterAt/
├── client/                  # Vue app
│   └── src/
│       ├── assets/
│       ├── components/      # organized by feature: landing/, auth/, dashboard/,
│       │                    #   character-detail/, friends/, wall/, layout/, shared/
│       ├── views/           # one component per route
│       ├── stores/          # Pinia: auth, characters, friends, wall
│       ├── services/        # one file per API resource, all built on utils/apiClient.js
│       ├── utils/           # indexedDB, import/export, avatar generation, etc.
│       ├── router/
│       └── config/          # branding.js — logo path, app name
│
├── server/                  # Express app
│   ├── models/               # Mongoose schemas: User, Character, FriendRequest, WallPost, ...
│   ├── controllers/           # one file per resource, following authController.js's pattern
│   ├── routes/                 # one file per resource
│   ├── middleware/             # requireAuth (JWT verification)
│   ├── config/                  # DB connection
│   └── server.js
│
└── README.md
```

---

## Getting started

### Prerequisites

- Node.js and npm
- A MongoDB instance — either running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone and install

```bash
git clone <your-repo-url>
cd characterAt

cd client && npm install
cd ../server && npm install
```

### 2. Environment variables

**`server/.env`**
```
MONGODB_URI=mongodb://localhost:27017/characterAt
JWT_SECRET=<a long random string>
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

Generate a random `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**`client/.env`**
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run it

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Visit the URL Vite prints (usually `http://localhost:5173`).

---

## Features

### Guest mode (no account)
- Create, edit, and delete characters — stored entirely in your browser (IndexedDB)
- Full dossier per character: premise, tags, character type, emojis, backstory, chapter/scene bookmarks, rough dialogue collection
- Export any character (or your whole local library) as a JSON file; re-import it later
- Per-character "card sharing settings" — choose which sections would be visible if the card is ever shared

### Accounts (optional, unlocks the social features)
- Sign up / log in (JWT-based, httpOnly cookie)
- Edit your profile (username, email) with a confirm-before-save step
- **Friends** — search for users, send/accept/decline/cancel friend requests, unfriend
- **Wall** — post a character's card (respecting its sharing settings) to your wall; view friends' walls
- **Ratings & reactions** — friends can rate a posted card 1–5 stars and react with the 🖊️ (this app's "like")

### Not built yet
- Card trading between friends
- Notifications
- Various design polish (see open items in project notes)

---

## Self-hosting

Self-hosting is a first-class option, not an afterthought — run this exact repo against your own MongoDB instance and nothing touches any official server. Social features (friends, walls) work the same way in a self-hosted instance; they just live in your own database instead of a shared one.

---

## License

NOT YET PREPARED FOR RELEASE