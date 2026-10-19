import type { FC } from 'react';
import type { UiTranslations } from '../../utils/i18n';
import { CenteredContainer } from '../ui/CenteredContainer';
import { ErrorCard } from '../ui/ErrorCard';
import { Loader } from '../ui/Loader';

interface ColdStartFallbackProps {
  error: string | null;
  ui: UiTranslations;
  onRetry: () => void;
}

export const ColdStartFallback: FC<ColdStartFallbackProps> = ({
  error,
  ui,
  onRetry,
}) => {
  return (
    <CenteredContainer>
      {error ? (
        <ErrorCard
          title={ui.connectionError}
          message={error}
          retryLabel={ui.retry}
          onRetry={onRetry}
        />
      ) : (
        <Loader />
      )}
    </CenteredContainer>
  );
};

export default ColdStartFallback;
