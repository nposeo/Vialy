const fs = require('fs');
const path = require('path');

const REVIEWS_FILE = path.join(__dirname, 'reviews.json');

// Read reviews
const reviews = JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf8'));

// Add voters field to all reviews that don't have it
const updatedReviews = reviews.map(review => {
  if (!review.voters) {
    return {
      ...review,
      voters: {
        likes: [],
        dislikes: []
      }
    };
  }
  return review;
});

// Write back
fs.writeFileSync(REVIEWS_FILE, JSON.stringify(updatedReviews, null, 2));

console.log(`Updated ${updatedReviews.length} reviews with voters field`);
