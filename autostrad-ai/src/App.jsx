import { useState, useEffect } from 'react';
import WalletContextProvider from './components/WalletProvider';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import RoadSegmentPanel from './components/RoadSegmentPanel';
import ReviewForm from './components/ReviewForm';
import ReviewsList from './components/ReviewsList';

// Token economics constants
const REWARDS = {
  REVIEW_SUBMIT: 10,
  REVIEW_LIKE: 1,
  REVIEW_DISLIKE: -2,
  RECEIVE_LIKE: 2,
  RECEIVE_DISLIKE: -5,
};

function App() {
  const [routingMode, setRoutingMode] = useState('fast');
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [rewards, setRewards] = useState(() => {
    const saved = localStorage.getItem('autostrad_rewards');
    return saved ? parseInt(saved) : 0;
  });

  // Reviews state
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('autostrad_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal states
  const [showSegmentPanel, setShowSegmentPanel] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReviewsList, setShowReviewsList] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(null);

  // Save rewards to localStorage
  useEffect(() => {
    localStorage.setItem('autostrad_rewards', rewards.toString());
  }, [rewards]);

  // Save reviews to localStorage
  useEffect(() => {
    localStorage.setItem('autostrad_reviews', JSON.stringify(reviews));
  }, [reviews]);

  const handleRoadClick = (roadData) => {
    setSelectedRoad(roadData);
    setCurrentSegment(roadData);
    setShowSegmentPanel(true);
  };

  const handleAddReview = (segment) => {
    setCurrentSegment(segment);
    setShowReviewForm(true);
  };

  const handleViewReviews = (segment) => {
    setCurrentSegment(segment);
    setShowReviewsList(true);
  };

  const handleSubmitReview = (review) => {
    setReviews([...reviews, review]);
    setRewards((prev) => prev + REWARDS.REVIEW_SUBMIT);
  };

  const handleLikeReview = (reviewId, voteData) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) => {
        if (review.id === reviewId) {
          // Reward the voter
          setRewards((prev) => prev + REWARDS.REVIEW_LIKE);

          // Reward the review author (if we track author rewards separately)
          // For now, we just increment the like count
          return {
            ...review,
            likes: review.likes + 1,
          };
        }
        return review;
      })
    );
  };

  const handleDislikeReview = (reviewId, voteData) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) => {
        if (review.id === reviewId) {
          // Penalty for the voter
          setRewards((prev) => prev + REWARDS.REVIEW_DISLIKE);

          // Penalty for the review author (tracked in their account)
          return {
            ...review,
            dislikes: review.dislikes + 1,
          };
        }
        return review;
      })
    );
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

        {/* Road Segment Panel */}
        <RoadSegmentPanel
          isOpen={showSegmentPanel}
          onClose={() => setShowSegmentPanel(false)}
          segment={currentSegment}
          onAddReview={handleAddReview}
          onViewReviews={handleViewReviews}
        />

        {/* Review Form */}
        <ReviewForm
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          segment={currentSegment}
          onSubmit={handleSubmitReview}
        />

        {/* Reviews List */}
        <ReviewsList
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
