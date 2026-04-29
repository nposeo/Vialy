import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Star, Calendar } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function ReviewForm({ isOpen, onClose, segment, onSubmit }) {
  const { signMessage, publicKey } = useWallet();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    roadName: segment?.properties?.name || '',
    rating: 0,
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxChars = 1000;
  const remainingChars = maxChars - formData.comment.length;

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!publicKey) {
      alert('Подключите кошелек');
      return;
    }

    if (formData.rating === 0) {
      alert('Выберите оценку');
      return;
    }

    if (formData.comment.trim().length < 10) {
      alert('Отзыв должен содержать минимум 10 символов');
      return;
    }

    setIsSubmitting(true);

    try {
      // Sign message with Solana wallet
      const message = new TextEncoder().encode(
        `AutostradAI Review\nRoad: ${formData.roadName}\nRating: ${formData.rating}\nDate: ${formData.date}\nComment: ${formData.comment}\nTimestamp: ${Date.now()}`
      );

      const signature = await signMessage(message);

      // Create review object
      const review = {
        id: Date.now().toString(),
        segmentId: segment.id,
        roadName: formData.roadName,
        rating: formData.rating,
        comment: formData.comment,
        date: formData.date,
        author: publicKey.toString(),
        signature: Buffer.from(signature).toString('base64'),
        timestamp: Date.now(),
        likes: 0,
        dislikes: 0,
      };

      onSubmit(review);

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        roadName: segment?.properties?.name || '',
        rating: 0,
        comment: '',
      });

      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Ошибка при отправке отзыва');
    } finally {
      setIsSubmitting(false);
    }
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-white">
                    Добавить отзыв
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Date Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Дата поездки
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <Calendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={20} />
                    </div>
                  </div>

                  {/* Road Name (Auto-filled) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Дорога
                    </label>
                    <input
                      type="text"
                      value={formData.roadName}
                      readOnly
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white cursor-not-allowed opacity-75"
                    />
                  </div>

                  {/* Rating Stars */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Оценка состояния
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            size={32}
                            className={
                              star <= formData.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-600 hover:text-gray-500'
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Комментарий
                    </label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => {
                        if (e.target.value.length <= maxChars) {
                          setFormData({ ...formData, comment: e.target.value });
                        }
                      }}
                      placeholder="Опишите состояние дороги, качество покрытия, наличие ям..."
                      rows={6}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">Минимум 10 символов</span>
                      <span className={`text-xs ${remainingChars < 100 ? 'text-yellow-500' : 'text-gray-500'}`}>
                        {remainingChars} / {maxChars}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !publicKey}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Отправка...' : publicKey ? 'Отправить отзыв' : 'Подключите кошелек'}
                  </button>

                  {publicKey && (
                    <p className="text-xs text-gray-400 text-center">
                      Отзыв будет подписан вашим кошельком и вознагражден токенами
                    </p>
                  )}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
