const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data files
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');
const BALANCES_FILE = path.join(__dirname, 'balances.json');

// Initialize data files if they don't exist
if (!fs.existsSync(REVIEWS_FILE)) {
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(BALANCES_FILE)) {
  fs.writeFileSync(BALANCES_FILE, JSON.stringify({}));
}

// Helper functions
const readReviews = () => {
  const data = fs.readFileSync(REVIEWS_FILE, 'utf8');
  return JSON.parse(data);
};

const writeReviews = (reviews) => {
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
};

const readBalances = () => {
  const data = fs.readFileSync(BALANCES_FILE, 'utf8');
  return JSON.parse(data);
};

const writeBalances = (balances) => {
  fs.writeFileSync(BALANCES_FILE, JSON.stringify(balances, null, 2));
};

// Routes

// Get all reviews
app.get('/api/reviews', (req, res) => {
  try {
    const reviews = readReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read reviews' });
  }
});

// Add new review
app.post('/api/reviews', (req, res) => {
  try {
    const review = req.body;
    const reviews = readReviews();
    reviews.push(review);
    writeReviews(reviews);

    // Update author's balance
    const balances = readBalances();
    const author = review.author;
    balances[author] = (balances[author] || 0) + 10; // +10 tokens for review
    writeBalances(balances);

    res.json({ success: true, review, balance: balances[author] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Like review
app.post('/api/reviews/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    const { voter } = req.body;

    const reviews = readReviews();
    const review = reviews.find(r => r.id === id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Initialize votes tracking
    if (!review.voters) {
      review.voters = { likes: [], dislikes: [] };
    }

    const balances = readBalances();
    let balanceChange = 0;

    // Check if user already liked
    const alreadyLiked = review.voters.likes.includes(voter);
    // Check if user already disliked
    const alreadyDisliked = review.voters.dislikes.includes(voter);

    if (alreadyLiked) {
      // Remove like
      review.likes = Math.max(0, (review.likes || 0) - 1);
      review.voters.likes = review.voters.likes.filter(v => v !== voter);
      balanceChange = -1; // Remove token
    } else {
      // Add like
      review.likes = (review.likes || 0) + 1;
      review.voters.likes.push(voter);
      balanceChange = 1; // Add token

      // If user had disliked, remove dislike
      if (alreadyDisliked) {
        review.dislikes = Math.max(0, (review.dislikes || 0) - 1);
        review.voters.dislikes = review.voters.dislikes.filter(v => v !== voter);
        balanceChange += 1; // Refund dislike token
      }
    }

    writeReviews(reviews);

    // Update voter's balance
    balances[voter] = (balances[voter] || 0) + balanceChange;
    writeBalances(balances);

    res.json({ success: true, review, balance: balances[voter] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like review' });
  }
});

// Dislike review
app.post('/api/reviews/:id/dislike', (req, res) => {
  try {
    const { id } = req.params;
    const { voter } = req.body;

    const reviews = readReviews();
    const review = reviews.find(r => r.id === id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Initialize votes tracking
    if (!review.voters) {
      review.voters = { likes: [], dislikes: [] };
    }

    const balances = readBalances();
    let balanceChange = 0;

    // Check if user already disliked
    const alreadyDisliked = review.voters.dislikes.includes(voter);
    // Check if user already liked
    const alreadyLiked = review.voters.likes.includes(voter);

    if (alreadyDisliked) {
      // Remove dislike
      review.dislikes = Math.max(0, (review.dislikes || 0) - 1);
      review.voters.dislikes = review.voters.dislikes.filter(v => v !== voter);
      balanceChange = -1; // Remove token
    } else {
      // Add dislike
      review.dislikes = (review.dislikes || 0) + 1;
      review.voters.dislikes.push(voter);
      balanceChange = 1; // Add token

      // If user had liked, remove like
      if (alreadyLiked) {
        review.likes = Math.max(0, (review.likes || 0) - 1);
        review.voters.likes = review.voters.likes.filter(v => v !== voter);
        balanceChange += 1; // Refund like token
      }
    }

    writeReviews(reviews);

    // Update voter's balance
    balances[voter] = (balances[voter] || 0) + balanceChange;
    writeBalances(balances);

    res.json({ success: true, review, balance: balances[voter] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to dislike review' });
  }
});

// Get balance for wallet
app.get('/api/balance/:wallet', (req, res) => {
  try {
    const { wallet } = req.params;
    const balances = readBalances();
    const balance = balances[wallet] || 0;
    res.json({ wallet, balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// Get average rating for a segment
app.get('/api/segments/:segmentId/average-rating', (req, res) => {
  try {
    const { segmentId } = req.params;
    const reviews = readReviews();

    // Filter reviews for this segment
    const segmentReviews = reviews.filter(r => r.segmentId === segmentId);

    if (segmentReviews.length === 0) {
      return res.json({
        segmentId,
        averageRating: 0,
        totalReviews: 0
      });
    }

    // Calculate average rating
    const totalRating = segmentReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / segmentReviews.length;

    res.json({
      segmentId,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: segmentReviews.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get average rating' });
  }
});

// Confirm road quality and reward tokens
app.post('/api/confirm-quality', (req, res) => {
  try {
    const { wallet, roadName, quality, signature } = req.body;

    if (!wallet || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update balance
    const balances = readBalances();
    balances[wallet] = (balances[wallet] || 0) + 10;
    writeBalances(balances);

    res.json({
      success: true,
      balance: balances[wallet],
      reward: 10
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm quality' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
