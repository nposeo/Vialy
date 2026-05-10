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
  const [ratingsUpdateTrigger, setRatingsUpdateTrigger] = useState(0);

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

        // Trigger ratings update in Map
        setRatingsUpdateTrigger(prev => prev + 1);

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
        ratingsUpdateTrigger={ratingsUpdateTrigger}
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
  ratingsUpdateTrigger,
  handleRoadClick,
  handleAddReview,
  handleViewReviews,
  handleSubmitReview,
  handleLikeReview,
  handleDislikeReview,
}) {
  const { publicKey } = useWallet();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4  mt-20 z-[1000] bg-purple-600 hover:bg-purple-700 p-3 rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar - hidden on mobile by default */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-[1000]
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <Sidebar
          routingMode={routingMode}
          setRoutingMode={setRoutingMode}
          selectedRoad={selectedRoad}
          rewards={rewards}
          setRewards={setRewards}
        />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Map - full width on mobile */}
      <div className="flex-1 w-full">
        <Map
          routingMode={routingMode}
          onRoadClick={handleRoadClick}
          ratingsUpdateTrigger={ratingsUpdateTrigger}
        />
      </div>

      {/* Road Info Panel */}
      <RoadInfoPanel
        key={`${currentSegment?.id}-${reviews.length}`}
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
