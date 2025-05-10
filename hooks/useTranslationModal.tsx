'use client';

import { useState } from 'react';
import { TranslationModal } from '@/components/translation-modal';

export function useTranslationModal(entityType: string) {
  const [translationEntityId, setTranslationEntityId] = useState<number | null>(null);

  const openTranslationModal = (id: number) => setTranslationEntityId(id);
  const closeTranslationModal = () => setTranslationEntityId(null);

  const TranslationModalWrapper = () =>
    translationEntityId !== null ? (
      <TranslationModal
        entityId={translationEntityId}
        entityType={entityType}
        open={true}
        onClose={closeTranslationModal}
      />
    ) : null;

  return {
    openTranslationModal,
    TranslationModalWrapper,
  };
}
