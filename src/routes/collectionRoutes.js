const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');

router.post('/', collectionController.createCollection);
router.get('/user/:userId', collectionController.getUserCollections);
router.get('/slug/:slug', collectionController.getCollectionBySlug);
router.get('/:id', collectionController.getCollectionById);
router.delete('/:id', collectionController.deleteCollection);

module.exports = router;
