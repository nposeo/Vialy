import { useState, useEffect } from 'react';
import WalletContextProvider from './components/WalletProvider';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import RoadInfoPanel from './components/RoadInfoPanel';
import AddReviewForm from './components/AddReviewForm';
import ReviewsListView from './components/ReviewsListView';

// DePIN Token Economics
const REWARDS = {
  REVIEW_SUBMIT: 10,      // +10 токенов за отзыв
  VOTE_LIKE: 1,           // +1 токен за лайк
  VOTE_DISLIKE: 1,        // +1 токен за дизлайк
  RECEIVE_LIKE: 2,        // +2 токена автору за полученный лайк
  RECEIVE_DISLIKE: -5,    // -5 токенов автору за полученный дизлайк
};

function App() {
  const [routingMode, setRoutingMode] = useState('fast');
  const [selectedRoad, setSelectedRoad] = useState(null);

  // Rewards state
  const [rewards, setRewards] = useState(() => {
    const saved = localStorage.getItem('autostrad_rewards');
    return saved ? parseInt(saved) : 0;
  });

  // Reviews state
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('autostrad_reviews');
      console.log('Raw localStorage data:', saved);
      const parsed = saved ? JSON.parse(saved) : [];
      console.log('Loading reviews from localStorage:', parsed);
      return parsed;
    } catch (error) {
      console.error('Error loading reviews:', error);
      return [];
    }
  });

  // Modal states
  const [showRoadInfo, setShowRoadInfo] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [showReviewsList, setShowReviewsList] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(null);

  // Save rewards to localStorage
  useEffect(() => {
    localStorage.setItem('autostrad_rewards', rewards.toString());
  }, [rewards]);

  // Save reviews to localStorage
  useEffect(() => {
    console.log('Saving reviews to localStorage:', reviews);
    localStorage.setItem('autostrad_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Handle road click on map
  const handleRoadClick = (roadData) => {
    setSelectedRoad(roadData);
    setCurrentSegment(roadData);
    setShowRoadInfo(true);
  };

  // Handle "Добавить" button
  const handleAddReview = (segment) => {
    setCurrentSegment(segment);
    setShowAddReview(true);
  };

  // Handle "Отзывы" button
  const handleViewReviews = (segment) => {
    setCurrentSegment(segment);
    setShowReviewsList(true);
  };

  // Handle review submission
  const handleSubmitReview = (review) => {
    console.log('Submitting review:', review);
    setReviews([...reviews, review]);

    // Reward user for submitting review
    setRewards((prev) => prev + REWARDS.REVIEW_SUBMIT);

    console.log(`Review submitted! +${REWARDS.REVIEW_SUBMIT} tokens`);
    console.log('Total reviews:', reviews.length + 1);
  };

  // Handle like
  const handleLikeReview = (reviewId, voteData) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) => {
        if (review.id === reviewId) {
          return {
            ...review,
            likes: review.likes + 1,
          };
        }
        return review;
      })
    );

    // Reward voter for liking
    setRewards((prev) => prev + REWARDS.VOTE_LIKE);

    console.log(`Liked review! +${REWARDS.VOTE_LIKE} token`);

    // Note: In real DePIN, we would also reward the review author
    // This would require tracking author wallets and distributing tokens
  };

  // Handle dislike
  const handleDislikeReview = (reviewId, voteData) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) => {
        if (review.id === reviewId) {
          return {
            ...review,
            dislikes: review.dislikes + 1,
          };
        }
        return review;
      })
    );

    // Reward voter for disliking (moderation)
    setRewards((prev) => prev + REWARDS.VOTE_DISLIKE);

    console.log(`Disliked review! +${REWARDS.VOTE_DISLIKE} token`);

    // Note: In real DePIN, we would penalize the review author
    // This would require on-chain logic to deduct tokens from author's wallet
  };

  return (
    <WalletContextProvider>
      <div className="flex h-screen bg-dark-bg text-white">
        <Sidebar
          routingMode={routingMode}
          setRoutingMode={setRoutingMode}
          selectedRoad={selectedRoad}
          rewards={rewards}
          setRewards={setRewards}
        />
        <div className="flex-1">
          <Map
            routingMode={routingMode}
            onRoadClick={handleRoadClick}
          />
        </div>

        {/* Road Info Panel */}
        <RoadInfoPanel
          isOpen={showRoadInfo}
          onClose={() => setShowRoadInfo(false)}
          segment={currentSegment}
          onAddReview={handleAddReview}
          onViewReviews={handleViewReviews}
        />

        {/* Add Review Form */}
        <AddReviewForm
          isOpen={showAddReview}
          onClose={() => setShowAddReview(false)}
          segment={currentSegment}
          onSubmit={handleSubmitReview}
        />

        {/* Reviews List */}
        <ReviewsListView
          isOpen={showReviewsList}
          onClose={() => setShowReviewsList(false)}
          segment={currentSegment}
          reviews={reviews}
          onLike={handleLikeReview}
          onDislike={handleDislikeReview}
        />
      </div>
    </WalletContextProvider>
  );
}

export default App;
