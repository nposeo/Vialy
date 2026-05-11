const BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001'
    : import.meta.env.VITE_API_URL;

const API_URL = `${BASE_URL}/api`;

export const api = {
  // Get all reviews
  async getReviews() {
    const response = await fetch(`${API_URL}/reviews`);
    return response.json();
  },

  // Add new review
  async addReview(review) {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    return response.json();
  },

  // Like review
  async likeReview(reviewId, voter) {
    const response = await fetch(`${API_URL}/reviews/${reviewId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter }),
    });
    return response.json();
  },

  // Dislike review
  async dislikeReview(reviewId, voter) {
    const response = await fetch(`${API_URL}/reviews/${reviewId}/dislike`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter }),
    });
    return response.json();
  },

  // Get balance
  async getBalance(wallet) {
    const response = await fetch(`${API_URL}/balance/${wallet}`);
    return response.json();
  },

  // Get average rating for segment
  async getSegmentAverageRating(segmentId) {
    const response = await fetch(`${API_URL}/segments/${segmentId}/average-rating`);
    return response.json();
  },

  // Confirm road quality
  async confirmQuality(wallet, roadName, quality, signature) {
    const response = await fetch(`${API_URL}/confirm-quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet, roadName, quality, signature }),
    });
    return response.json();
  },

  // Get average ratings for all roads
  async getRoadRatings() {
    const response = await fetch(`${API_URL}/roads/ratings`);
    return response.json();
  },
};
