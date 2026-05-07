import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletContextProvider from './components/WalletProvider';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import RoadInfoPanel from './components/RoadInfoPanel';
import AddReviewForm from './components/AddReviewForm';
import ReviewsListView from './components/ReviewsListView';
import { api } from './utils/api';
import './i18n';

function App() {
  const [routingMode, setRoutingMode] = useState('fast');
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [rewards, setRewards] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showRoadInfo, setShowRoadInfo] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [showReviewsList, setShowReviewsList] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(null);

  // Load reviews on mount
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await api.getReviews();
      setReviews(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setLoading(false);
    }
  };

  // Handle road click on map
  const handleRoadClick = (roadData) => {
    console.log('handleRoadClick - roadData:', roadData);
    console.log('handleRoadClick - roadData.id:', roadData?.id);

    // Create a clean copy to ensure all fields are preserved
    // Convert LatLng to plain object to avoid serialization issues
    const segmentCopy = {
      id: roadData.id,
      properties: { ...roadData.properties },
      geometry: roadData.geometry,
      coordinates: roadData.coordinates ? {
        lat: roadData.coordinates.lat,
        lng: roadData.coordinates.lng
      } : null
    };

    console.log('handleRoadClick - segmentCopy:', segmentCopy);
    console.log('handleRoadClick - segmentCopy.id:', segmentCopy.id);

    setSelectedRoad(segmentCopy);
    setCurrentSegment(segmentCopy);

    // Add a small delay to ensure state updates
    setTimeout(() => {
      console.log('After setState - checking currentSegment');
      setShowRoadInfo(true);
    }, 0);
  };

  // Handle "Добавить" button
  const handleAddReview = (segment) => {
    setCurrentSegment(segment);
    setShowAddReview(true);
  };

  // Handle "Отзывы" button
  const handleViewReviews = (segment) => {
    console.log('handleViewReviews called with segment:', segment);
    console.log('handleViewReviews - segment.id:', segment?.id);
    setCurrentSegment(segment);

    // Add a small delay to ensure state updates
    setTimeout(() => {
      setShowReviewsList(true);
    }, 0);
  };

  // Handle review submission
  const handleSubmitReview = async (review) => {
    try {
      console.log('Submitting review:', review);
      const result = await api.addReview(review);

      if (result.success) {
        // Reload reviews
        await loadReviews();

        // Update balance
        setRewards(result.balance);

        console.log(`Review submitted! Balance: ${result.balance} tokens`);
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Ошибка при отправке отзыва');
    }
  };

  // Handle like
  const handleLikeReview = async (reviewId, voteData) => {
    try {
      console.log('Liking review:', reviewId, 'by voter:', voteData.voter);
      const result = await api.likeReview(reviewId, voteData.voter);
      console.log('Like result:', result);

      if (result.success) {
        // Reload reviews
        await loadReviews();

        // Update balance
        setRewards(result.balance);

        console.log(`Liked review! Balance: ${result.balance} tokens`);
      }
    } catch (error) {
      console.error('Failed to like review:', error);
      alert('Ошибка при голосовании');
    }
  };

  // Handle dislike
  const handleDislikeReview = async (reviewId, voteData) => {
    try {
      const result = await api.dislikeReview(reviewId, voteData.voter);

      if (result.success) {
        // Reload reviews
        await loadReviews();

        // Update balance
        setRewards(result.balance);

        console.log(`Disliked review! Balance: ${result.balance} tokens`);
      }
    } catch (error) {
      console.error('Failed to dislike review:', error);
      alert('Ошибка при голосовании');
    }
  };

  return (
    <WalletContextProvider>
      <AppContent
        routingMode={routingMode}
        setRoutingMode={setRoutingMode}
        selectedRoad={selectedRoad}
        rewards={rewards}
        setRewards={setRewards}
        reviews={reviews}
        loading={loading}
        showRoadInfo={showRoadInfo}
        setShowRoadInfo={setShowRoadInfo}
        showAddReview={showAddReview}
        setShowAddReview={setShowAddReview}
        showReviewsList={showReviewsList}
        setShowReviewsList={setShowReviewsList}
        currentSegment={currentSegment}
        handleRoadClick={handleRoadClick}
        handleAddReview={handleAddReview}
        handleViewReviews={handleViewReviews}
        handleSubmitReview={handleSubmitReview}
        handleLikeReview={handleLikeReview}
        handleDislikeReview={handleDislikeReview}
      />
    </WalletContextProvider>
  );
}

function AppContent({
  routingMode,
  setRoutingMode,
  selectedRoad,
  rewards,
  setRewards,
  reviews,
  loading,
  showRoadInfo,
  setShowRoadInfo,
  showAddReview,
  setShowAddReview,
  showReviewsList,
  setShowReviewsList,
  currentSegment,
  handleRoadClick,
  handleAddReview,
  handleViewReviews,
  handleSubmitReview,
  handleLikeReview,
  handleDislikeReview,
}) {
  const { publicKey } = useWallet();

  // Track currentSegment changes
  useEffect(() => {
    console.log('currentSegment changed:', currentSegment);
    console.log('currentSegment.id:', currentSegment?.id);
  }, [currentSegment]);

  // Load balance when wallet connects
  useEffect(() => {
    if (publicKey) {
      loadBalance();
    }
  }, [publicKey]);

  const loadBalance = async () => {
    try {
      const result = await api.getBalance(publicKey.toString());
      setRewards(result.balance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-dark-bg text-white items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-bg text-white">
      <Sidebar
        routingMode={routingMode}
        setRoutingMode={setRoutingMode}
        selectedRoad={selectedRoad}
        rewards={rewards}
        setRewards={setRewards}
      />
      <div className="flex-1">
        <Map routingMode={routingMode} onRoadClick={handleRoadClick} />
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
        onClose={() => {
          console.log('Closing ReviewsList');
          setShowReviewsList(false);
        }}
        segment={currentSegment}
        reviews={reviews}
        onLike={handleLikeReview}
        onDislike={handleDislikeReview}
      />
    </div>
  );
}

export default App;
