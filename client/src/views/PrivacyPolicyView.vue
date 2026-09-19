<!--
  PrivacyPolicyView.vue
  --------------------------
  This is the DEDICATED privacy policy page — different from
  components/landing/PrivacySection.vue, which is marketing copy on
  the landing page explaining the local-first pitch in a few
  sentences. This page is the actual "what data exists, where does it
  live, who can see it, how do you get rid of it" document, written
  to match what the code actually does (see server/models/User.js,
  server/models/Character.js, server/models/WallPost.js,
  server/controllers/authController.js) — update this file if any of
  that changes, rather than letting it drift into inaccuracy.

  No tracking/analytics scripts exist anywhere in this app (checked
  server.js + every controller for third-party env vars) — the only
  external service in the whole stack is MongoDB itself, so that's
  the only thing this page needs to disclose on that front.
-->
<template>
  <div class="policy-page">
    <LandingHeader />

    <main class="policy">
      <router-link to="/" class="policy__back">← Back home</router-link>

      <h1 class="policy__title">Privacy Policy</h1>
      <p class="policy__updated">Last updated: {{ lastUpdated }}</p>

      <p class="policy__intro">
        {{ APP_NAME }} is built to need as little of your data as possible. This page explains,
        plainly, what exists, where it lives, who can see it, and how to get rid of it. For the
        short version and the reasoning behind the design, see the
        <router-link to="/#privacy" class="policy__inline-link">privacy section</router-link>
        on the homepage — this page is the fuller, more formal version of that.
      </p>

      <section class="policy__section">
        <h2 class="policy__heading">1. Guest mode (no account)</h2>
        <p>
          If you never sign up, nothing about you or your characters ever reaches our servers.
          Every character, tag, backstory, bookmark, and dialogue you create is stored entirely
          in your browser's IndexedDB, on your device. We have no way to see it, back it up, or
          recover it if you clear your browser data — that trade-off is intentional. You can
          export any character (or your whole local library) as a JSON file at any time, and
          delete everything locally from the dashboard.
        </p>
      </section>

      <section class="policy__section">
        <h2 class="policy__heading">2. If you create an account</h2>
        <p>Creating an account is optional, and only needed for cloud sync, friends, and the wall. Signing up stores:</p>
        <ul class="policy__list">
          <li><strong>Username and email</strong> — used to identify your account and log you in.</li>
          <li>
            <strong>A password hash</strong>, never your plain-text password. We use bcrypt to hash
            it before it's ever written to the database.
          </li>
          <li>
            <strong>A session cookie</strong> (a signed JWT) — httpOnly, so no script on the page
            can read it, and only sent back to our own API. It's the only cookie this app sets;
            there are no analytics, advertising, or tracking cookies anywhere in {{ APP_NAME }}.
          </li>
        </ul>
      </section>

      <section class="policy__section">
        <h2 class="policy__heading">3. Characters you choose to sync to the cloud</h2>
        <p>
          Saving a character "to the cloud" (or syncing your whole library) copies that
          character's fields — name, premise, tags, backstory, bookmarks, dialogues — to our
          database, tied to your account. This is separate from, and doesn't replace, whatever
          copy still lives in your browser's IndexedDB. Characters you never explicitly save or
          sync stay local-only, exactly as in guest mode.
        </p>
      </section>

      <section class="policy__section">
        <h2 class="policy__heading">4. Friends and the Wall</h2>
        <p>
          Sending or accepting a friend request links two accounts. Posting a character card to
          your wall — including any ratings or reactions left on it — is visible to your friends,
          the same way it would be on any social feature: it's shown to the people you've chosen
          to connect with, not to the public or to us for any purpose beyond serving the feature.
          A wall post is a snapshot taken at the moment you post it; editing the original character
          afterward doesn't change what's already posted.
        </p>
      </section>

      <section class="policy__section">
        <h2 class="policy__heading">5. Third parties</h2>
        <p>
          {{ APP_NAME }} doesn't use analytics, advertising networks, or any third-party trackers.
          The only external service involved is the database itself (MongoDB) that stores
          hosted-mode account and character data — it doesn't get data from anyone except
          {{ APP_NAME }}'s own server, and isn't used for anything beyond storage.
        </p>
      </section>

      <section class="policy__section">
        <h2 class="policy__heading">6. Getting your data deleted</h2>
        <p>
          Local data: clear it yourself anytime from the dashboard's privacy controls, or just
          clear your browser's site data — nothing is held anywhere else. Cloud data: account
          deletion isn't self-serve yet, so
          <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" class="policy__inline-link">
            open an issue on GitHub
          </a>
          and we'll remove your account, characters, wall posts, and friend data by hand. That's a
          gap we're aware of, not a policy choice — self-serve deletion is on the roadmap. Also this app version
          is not for release and only test so before official release version, it will be available.
        </p>
      </section>

      <section class="policy__section">
        <h2 class="policy__heading">7. Self-hosted instances</h2>
        <p>
          {{ APP_NAME }} is free and open source, and this document describes the official
          instance only. If you're using a copy someone else deployed themselves, that operator —
          not us — controls the database and is who to ask about their data handling.
        </p>
      </section>

      <section class="policy__section">
        <h2 class="policy__heading">8. Children's privacy</h2>
        <p>
          {{ APP_NAME }} isn't directed at children, and hosted-mode accounts aren't intended for
          anyone under 13. If you believe a child has created an account, contact us via the
          GitHub link below and we'll remove it.
        </p>
      </section>

      <section class="policy__section">
        <h2 class="policy__heading">9. Changes to this policy</h2>
        <p>
          If what {{ APP_NAME }} collects or does with it changes, this page will be updated and
          the date at the top will change accordingly. Since the app is open source, you can also
          verify any of the above directly against the source code.
        </p>
      </section>

      <section class="policy__section">
        <h2 class="policy__heading">10. Contact</h2>
        <p>
          Questions, deletion requests, or anything else — the
          <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" class="policy__inline-link">
            GitHub repository
          </a>
          is the best place to reach us.
        </p>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import LandingHeader from '../components/landing/LandingHeader.vue'
import AppFooter from '../components/landing/AppFooter.vue'
import { APP_NAME, GITHUB_URL } from '../config/branding'

// Plain hardcoded string rather than a dynamic date — this should only
// change when the POLICY ITSELF changes, not on every rebuild/deploy.
// Bump it by hand whenever you edit the sections above.
const lastUpdated = 'September 2026'
</script>

<style scoped>
.policy-page {
  min-height: 100vh;
  background: #14131f; /* ink-950 */
  color: #b8b4cc;
  display: flex;
  flex-direction: column;
}

.policy {
  flex: 1;
  max-width: 42rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  width: 100%;
}

.policy__back {
  display: inline-block;
  font-size: 0.8rem;
  color: #8b87a6;
  text-decoration: none;
  margin-bottom: 1.5rem;
}

.policy__back:hover {
  color: #f0e9da;
}

.policy__title {
  font-family: 'Fraunces', serif;
  font-size: clamp(2rem, 4vw, 2.5rem);
  color: #f0e9da; /* parchment */
  margin-bottom: 0.5rem;
}

.policy__updated {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #3fa796; /* signal-teal */
  margin-bottom: 2rem;
}

.policy__intro {
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

.policy__section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(139, 135, 166, 0.15);
}

.policy__section:last-of-type {
  border-bottom: none;
}

.policy__heading {
  font-family: 'Fraunces', serif;
  font-size: 1.25rem;
  color: #f0e9da;
  margin-bottom: 0.75rem;
}

.policy__section p {
  font-size: 0.9rem;
  line-height: 1.7;
}

.policy__list {
  margin: 0.75rem 0 0;
  padding-left: 1.25rem;
  font-size: 0.9rem;
  line-height: 1.7;
}

.policy__list li {
  margin-bottom: 0.5rem;
}

.policy__inline-link {
  color: #d4a24c; /* quill-gold */
  text-decoration: none;
  border-bottom: 1px solid rgba(212, 162, 76, 0.4);
}

.policy__inline-link:hover {
  color: #f0e9da;
}
</style>