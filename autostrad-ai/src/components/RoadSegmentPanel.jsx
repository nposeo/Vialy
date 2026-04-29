import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, ThumbsUp, Star } from 'lucide-react';

export default function RoadSegmentPanel({ isOpen, onClose, segment, onAddReview, onViewReviews }) {
  if (!segment) return null;

  const { name, rating = 0, votes = 0, likes = 0 } = segment.properties || {};

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
                    {name || 'Дорога'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Rating Section */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="text-green-500" size={20} />
                        <span className="text-white font-medium">{likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {votes} {votes === 1 ? 'голос' : votes < 5 ? 'голоса' : 'голосов'}
                    </div>
                  </div>

                  {/* Segment Info */}
                  <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Номер дороги:</span>
                      <span className="text-white font-medium">{name || 'Н/Д'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Состояние:</span>
                      <span className="text-white font-medium">
                        {rating >= 4 ? 'Хорошее' : rating >= 2.5 ? 'Среднее' : 'Плохое'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onAddReview(segment);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Добавить
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onViewReviews(segment);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Отзывы
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
