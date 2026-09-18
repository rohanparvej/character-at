/**
 * routes/wall.js
 * -----------------
 * All require login. getFriendWall additionally checks actual
 * friendship inside the controller itself — requireAuth alone only
 * proves you're logged in, not that you're allowed to see this
 * specific person's wall.
 */
const express = require('express')
const router = express.Router()
const { createOrUpdatePost, listMyPosts, deletePost, getFriendWall } = require('../controllers/wallController')
const { ratePost, toggleReaction } = require('../controllers/wallInteractionController')
const { requireAuth } = require('../middleware/auth')

router.post('/posts', requireAuth, createOrUpdatePost)
router.get('/posts/mine', requireAuth, listMyPosts)
router.delete('/posts/:id', requireAuth, deletePost)
router.get('/friend/:friendId', requireAuth, getFriendWall)
router.post('/posts/:id/rate', requireAuth, ratePost)
router.post('/posts/:id/react', requireAuth, toggleReaction)

module.exports = router