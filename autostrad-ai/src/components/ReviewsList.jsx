import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function ReviewsList({ isOpen, onClose, segment, reviews, onLike, onDislike }) {
  const { signMessage, publicKey } = useWallet();
  const [processingId, setProcessingId] = useState(null);

  const segmentReviews = reviews.filter((r) => r.segmentId === segment?.id);

  const handleLike = async (reviewId) => {
    if (!publicKey) {
      alert('Подключите кошелек');
      return;
    }

    setProcessingId(reviewId);

    try {
      // Sign transaction with Solana wallet
      const message = new TextEncoder().encode(
        `AutostradAI Like\nReview ID: ${reviewId}\nAction: LIKE\nTimestamp: ${Date.now()}`
      );

      const signature = await signMessage(message);

      onLike(reviewId, {
        voter: publicKey.toString(),
        signature: Buffer.from(signature).toString('base64'),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error liking review:', error);
      alert('Ошибка при голосовании');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDislike = async (reviewId) => {
    if (!publicKey) {
      alert('Подключите кошелек');
      return;
    }

    setProcessingId(reviewId);

    try {
      // Sign transaction with Solana wallet
      const message = new TextEncoder().encode(
        `AutostradAI Dislike\nReview ID: ${reviewId}\nAction: DISLIKE\nTimestamp: ${Date.now()}`
      );

      const signature = await signMessage(message);

      onDislike(reviewId, {
        voter: publicKey.toString(),
        signature: Buffer.from(signature).toString('base64'),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error disliking review:', error);
      alert('Ошибка при голосовании');
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
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 p-6 text-left align-middle shadow-xl transition-all max-h-[80vh] flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Dialog.Title as="h3" className="text-xl font-semibold text-white">
                      Отзывы
                    </Dialog.Title>
                    <p className="text-sm text-gray-400 mt-1">
                      {segment.properties?.name || 'Дорога'} • {segmentReviews.length}{' '}
                      {segmentReviews.length === 1
                        ? 'отзыв'
                        : segmentReviews.length < 5
                        ? 'отзыва'
                        : 'отзывов'}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {segmentReviews.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">Пока нет отзывов</p>
                      <p className="text-sm text-gray-500 mt-2">Будьте первым, кто оставит отзыв!</p>
                    </div>
                  ) : (
                    segmentReviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                              {review.author.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {formatAddress(review.author)}
                              </p>
                              <p className="text-xs text-gray-400">{formatDate(review.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-600'
                                }
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm mb-4 whitespace-pre-wrap">
                          {review.comment}
                        </p>

                        <div className="flex items-center gap-3 pt-3 border-t border-gray-700">
                          <button
                            onClick={() => handleLike(review.id)}
                            disabled={processingId === review.id || !publicKey}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ThumbsUp size={16} className="text-white" />
                            <span className="text-white text-sm font-medium">{review.likes}</span>
                          </button>

                          <button
                            onClick={() => handleDislike(review.id)}
                            disabled={processingId === review.id || !publicKey}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ThumbsDown size={16} className="text-white" />
                            <span className="text-white text-sm font-medium">{review.dislikes}</span>
                          </button>

                          {processingId === review.id && (
                            <span className="text-xs text-gray-400 ml-2">Обработка...</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {!publicKey && segmentReviews.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                    <p className="text-sm text-yellow-400 text-center">
                      Подключите кошелек для голосования за отзывы
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
