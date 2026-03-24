const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');

router.post('/', testimonialController.createTestimonial);
router.get('/collection/:collectionId', testimonialController.getTestimonialsByCollection);
router.get('/embed/:collectionId', testimonialController.getApprovedTestimonials);
router.patch('/:id/status', testimonialController.updateTestimonialStatus);
router.delete('/:id', testimonialController.deleteTestimonial);

module.exports = router;
