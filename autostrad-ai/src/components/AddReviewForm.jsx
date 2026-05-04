import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Star, Calendar } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function AddReviewForm({ isOpen, onClose, segment, onSubmit }) {
  const { signMessage, publicKey } = useWallet();

  // Initialize form data when segment changes
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    roadName: '',
    segment: '',
    rating: 0,
    comment: '',
  });

  // Update form when segment changes
  useEffect(() => {
    if (segment) {
      setFormData(prev => ({
        ...prev,
        roadName: segment.properties?.name || '',
        segment: segment.properties?.settlements || 'Копти-Глухов-Бачевск',
      }));
    }
  }, [segment]);

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
      const message = new TextEncoder().encode(
        `AutostradAI Review\nRoad: ${formData.roadName}\nRating: ${formData.rating}\nDate: ${formData.date}\nComment: ${formData.comment}\nTimestamp: ${Date.now()}`
      );

      const signature = await signMessage(message);

      const review = {
        id: Date.now().toString(),
        segmentId: segment?.id || `segment-${Date.now()}`,
        roadName: formData.roadName,
        segment: formData.segment,
        rating: formData.rating,
        comment: formData.comment,
        date: formData.date,
        author: publicKey.toString(),
        signature: btoa(String.fromCharCode(...signature)),
        timestamp: Date.now(),
        likes: 0,
        dislikes: 0,
      };

      onSubmit(review);

      setFormData({
        date: new Date().toISOString().split('T')[0],
        roadName: segment?.properties?.name || '',
        segment: segment?.properties?.settlements || '',
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
                  maxWidth: '28rem',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <Dialog.Title style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                    Добавить отзыв
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Date */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', marginBottom: '0.5rem' }}>
                      Дата поездки
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        style={{
                          width: '100%',
                          backgroundColor: '#374151',
                          border: '1px solid #4b5563',
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          color: 'white',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Road Name */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', marginBottom: '0.5rem' }}>
                      Трасса
                    </label>
                    <input
                      type="text"
                      value={formData.roadName}
                      readOnly
                      style={{
                        width: '100%',
                        backgroundColor: '#374151',
                        border: '1px solid #4b5563',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        color: '#9ca3af',
                        fontSize: '1rem',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>

                  {/* Segment */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', marginBottom: '0.5rem' }}>
                      Участок
                    </label>
                    <input
                      type="text"
                      value={formData.segment}
                      readOnly
                      style={{
                        width: '100%',
                        backgroundColor: '#374151',
                        border: '1px solid #4b5563',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        color: '#9ca3af',
                        fontSize: '1rem',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>

                  {/* Rating */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', marginBottom: '0.5rem' }}>
                      Оценка
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Star
                            size={32}
                            style={{
                              color: star <= formData.rating ? '#facc15' : '#6b7280',
                              fill: star <= formData.rating ? '#facc15' : 'none',
                              transition: 'all 0.2s'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', marginBottom: '0.5rem' }}>
                      Ваш отзыв
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
                      style={{
                        width: '100%',
                        backgroundColor: '#374151',
                        border: '1px solid #4b5563',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        color: 'white',
                        fontSize: '1rem',
                        resize: 'none'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Минимум 10 символов</span>
                      <span style={{ fontSize: '0.75rem', color: remainingChars < 100 ? '#facc15' : '#6b7280' }}>
                        {remainingChars} / {maxChars}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !publicKey}
                    style={{
                      width: '100%',
                      backgroundColor: publicKey ? '#22c55e' : '#4b5563',
                      color: 'white',
                      fontWeight: 600,
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: publicKey ? 'pointer' : 'not-allowed',
                      fontSize: '1rem'
                    }}
                  >
                    {isSubmitting ? 'Отправка...' : publicKey ? 'Сохранить' : 'Подключите кошелек'}
                  </button>

                  {publicKey && (
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '0.75rem' }}>
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
