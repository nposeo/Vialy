import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTranslation } from 'react-i18next';

export default function ReviewsListView({ isOpen, onClose, segment, reviews, onLike, onDislike }) {
  const { signMessage, publicKey } = useWallet();
  const { t } = useTranslation();
  const [processingId, setProcessingId] = useState(null);

  console.log('ReviewsListView - segment:', segment);
  console.log('ReviewsListView - all reviews:', reviews);

  const segmentReviews = reviews.filter((r) => r.segmentId === segment?.id);

  console.log('ReviewsListView - filtered reviews:', segmentReviews);
  console.log('ReviewsListView - segment.id:', segment?.id);

  // Check if current user voted
  const hasUserLiked = (review) => {
    return review.voters?.likes?.includes(publicKey?.toString());
  };

  const hasUserDisliked = (review) => {
    return review.voters?.dislikes?.includes(publicKey?.toString());
  };

  const handleLike = async (reviewId) => {
    if (!publicKey) {
      alert(t('alerts.connectWallet'));
      return;
    }

    setProcessingId(reviewId);

    try {
      const message = new TextEncoder().encode(
        `Vialy Like\nReview ID: ${reviewId}\nAction: LIKE\nTimestamp: ${Date.now()}`
      );

      const signature = await signMessage(message);

      onLike(reviewId, {
        voter: publicKey.toString(),
        signature: btoa(String.fromCharCode(...signature)),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error liking review:', error);
      alert(t('alerts.errorVoting'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDislike = async (reviewId) => {
    if (!publicKey) {
      alert(t('alerts.connectWallet'));
      return;
    }

    setProcessingId(reviewId);

    try {
      const message = new TextEncoder().encode(
        `Vialy Dislike\nReview ID: ${reviewId}\nAction: DISLIKE\nTimestamp: ${Date.now()}`
      );

      const signature = await signMessage(message);

      onDislike(reviewId, {
        voter: publicKey.toString(),
        signature: btoa(String.fromCharCode(...signature)),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error disliking review:', error);
      alert(t('alerts.errorVoting'));
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!segment) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" style={{ position: 'relative', zIndex: 9999 }} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
        </Transition.Child>

        <div style={{ position: 'fixed', inset: 0, overflowY: 'auto' }}>
          <div style={{ display: 'flex', minHeight: '100%', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                style={{
                  width: '100%',
                  maxWidth: '42rem',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  maxHeight: '80vh',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <Dialog.Title style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                      {t('reviewsList.title')}
                    </Dialog.Title>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      {segment.properties?.name || 'Дорога'} • {segmentReviews.length}{' '}
                      {segmentReviews.length === 1
                        ? t('roadInfo.review')
                        : t('roadInfo.reviews')}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {segmentReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                      <p style={{ color: '#9ca3af' }}>{t('reviewsList.noReviews')}</p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        {t('alerts.beFirstReview')}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {segmentReviews.map((review) => (
                        <div
                          key={review.id}
                          style={{
                            backgroundColor: '#374151',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            border: '1px solid #4b5563'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div
                                style={{
                                  width: '2.5rem',
                                  height: '2.5rem',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.875rem'
                                }}
                              >
                                {review.author.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p style={{ color: 'white', fontWeight: 500, fontSize: '0.875rem' }}>
                                  {formatAddress(review.author)}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(review.date)}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  style={{
                                    color: star <= review.rating ? '#facc15' : '#6b7280',
                                    fill: star <= review.rating ? '#facc15' : 'none'
                                  }}
                                />
                              ))}
                            </div>
                          </div>

                          <p style={{ color: '#d1d5db', fontSize: '0.875rem', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
                            {review.comment}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #4b5563' }}>
                            <button
                              onClick={() => handleLike(review.id)}
                              disabled={processingId === review.id || !publicKey}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                backgroundColor: hasUserLiked(review) ? '#22c55e' : '#4b5563',
                                border: 'none',
                                cursor: publicKey ? 'pointer' : 'not-allowed',
                                opacity: processingId === review.id || !publicKey ? 0.5 : 1
                              }}
                              onMouseOver={(e) => {
                                if (publicKey && processingId !== review.id && !hasUserLiked(review)) {
                                  e.currentTarget.style.backgroundColor = '#22c55e';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!hasUserLiked(review)) {
                                  e.currentTarget.style.backgroundColor = '#4b5563';
                                }
                              }}
                            >
                              <ThumbsUp size={16} style={{ color: 'white' }} />
                              <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500 }}>{review.likes || 0}</span>
                            </button>

                            <button
                              onClick={() => handleDislike(review.id)}
                              disabled={processingId === review.id || !publicKey}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                backgroundColor: hasUserDisliked(review) ? '#ef4444' : '#4b5563',
                                border: 'none',
                                cursor: publicKey ? 'pointer' : 'not-allowed',
                                opacity: processingId === review.id || !publicKey ? 0.5 : 1
                              }}
                              onMouseOver={(e) => {
                                if (publicKey && processingId !== review.id && !hasUserDisliked(review)) {
                                  e.currentTarget.style.backgroundColor = '#ef4444';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!hasUserDisliked(review)) {
                                  e.currentTarget.style.backgroundColor = '#4b5563';
                                }
                              }}
                            >
                              <ThumbsDown size={16} style={{ color: 'white' }} />
                              <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500 }}>{review.dislikes || 0}</span>
                            </button>

                            {processingId === review.id && (
                              <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.5rem' }}>{t('reviewsList.processing')}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!publicKey && segmentReviews.length > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '0.5rem'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#fbbf24', textAlign: 'center' }}>
                      {t('reviewsList.connectWallet')}
                    </p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
