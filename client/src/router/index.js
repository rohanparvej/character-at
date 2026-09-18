/**
 * router/index.js
 * -----------------
 * Central route table for the app. Each route maps a URL path to a
 * view component (from src/views/). Components inside src/components/
 * are never routed to directly — they're pieces that views assemble,
 * same as LandingView does with HeroSection/FeatureGrid/AppFooter.
 */
import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
  },

  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/SignupView.vue'), // lazy-loaded
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },

  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
  },
  {
    path: '/friends',
    name: 'friends',
    component: () => import('../views/FriendsView.vue'),
  },
  {
    path: '/wall',
    name: 'my-wall',
    component: () => import('../views/MyWallView.vue'),
  },
  {
    // :friendId is a route param — matched AFTER the static '/wall'
    // route above, so '/wall' itself is never mistaken for this one.
    path: '/wall/:friendId',
    name: 'friend-wall',
    component: () => import('../views/FriendWallView.vue'),
  },
  {
    path: '/characters/new',
    name: 'character-new',
    component: () => import('../views/CharacterFormView.vue'),
  },
  {
    path: '/characters/:id',
    name: 'character-detail',
    component: () => import('../views/CharacterDetailView.vue'),
  },
  {
    // :id is a route param — read inside CharacterFormView via route.params.id
    path: '/characters/:id/edit',
    name: 'character-edit',
    component: () => import('../views/CharacterFormView.vue'),
  },
]

const router = createRouter({
  // createWebHistory gives clean URLs (no # in the address bar).
  // Needs a small server rewrite rule when deployed (Netlify/Vercel
  // handle this automatically for SPAs) — we'll cover that at deploy time.
  history: createWebHistory(),
  routes,

  // BUG FIX: without this, navigating to a URL with a #hash (e.g. the
  // dashboard's "Learn more about privacy" link to /#privacy) changes
  // the route but never actually scrolls the page — Vue Router doesn't
  // do this automatically, it has to be told to.
  //
  // SECOND FIX (after adding page transitions in App.vue): scrollBehavior
  // normally fires as soon as navigation resolves — but with
  // mode="out-in" on the <Transition> wrapping router-view, the new
  // page's content doesn't actually mount until AFTER the old page
  // finishes fading out (~220ms, see App.vue's .page-leave-active).
  // scrollBehavior was trying to scroll to #privacy before that
  // element existed in the DOM yet, so it silently failed. Returning a
  // Promise that resolves after a short delay (comfortably longer than
  // the transition) fixes it — Vue Router explicitly supports async
  // scrollBehavior for exactly this kind of case.
  scrollBehavior(to) {
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            el: to.hash,
            behavior: 'smooth',
            top: 80, // offsets for AppNav's height so the section isn't hidden behind it
          })
        }, 300) // slightly longer than the .22s page transition, so the target element is guaranteed to exist
      })
    }
    // No hash — reset scroll to top on every normal navigation, which
    // is what you'd want anyway (e.g. going Dashboard → Detail shouldn't
    // preserve the previous page's scroll position).
    return { top: 0 }
  },
})

export default router