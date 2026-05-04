const API_URL = '/api';

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
};
