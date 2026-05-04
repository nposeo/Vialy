import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, ThumbsUp, Star } from 'lucide-react';

export default function RoadInfoPanel({ isOpen, onClose, segment, onAddReview, onViewReviews }) {
  if (!segment) return null;

  const { name, rating = 0, votes = 0, likes = 0 } = segment.properties || {};

  // Mock data для демонстрации (если нет в GeoJSON)
  const settlements = segment.properties?.settlements || 'Копти-Глухов-Бачевск';
  const length = segment.properties?.length || '45 км';
  const condition = segment.properties?.condition || 'Среднее';

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
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <Dialog.Title style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                    {name || 'M-03'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    style={{
                      color: '#9ca3af',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Settlements */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                    Населенные пункты
                  </div>
                  <div style={{ fontSize: '1rem', color: 'white', fontWeight: 500 }}>
                    {settlements}
                  </div>
                </div>

                {/* Length */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                    Протяженность участка
                  </div>
                  <div style={{ fontSize: '1rem', color: 'white', fontWeight: 500 }}>
                    {length}
                  </div>
                </div>

                {/* Condition */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                    Текущее состояние дороги
                  </div>
                  <div style={{ fontSize: '1rem', color: 'white', fontWeight: 500 }}>
                    {condition}
                  </div>
                </div>

                {/* Rating */}
                <div style={{
                  backgroundColor: '#374151',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ThumbsUp style={{ color: '#22c55e' }} size={20} />
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                        {rating.toFixed(1)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          style={{
                            color: star <= rating ? '#facc15' : '#6b7280',
                            fill: star <= rating ? '#facc15' : 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    ({votes} {votes === 1 ? 'голос' : votes < 5 ? 'голоса' : 'голосов'})
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      onAddReview(segment);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#22c55e',
                      color: 'white',
                      fontWeight: 600,
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#16a34a'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#22c55e'}
                  >
                    Добавить
                  </button>
                  <button
                    onClick={() => {
                      onViewReviews(segment);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontWeight: 600,
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    Отзывы
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
