import type { FC } from 'react';
import { useI18n } from '../../context';
import { CenteredContainer } from '../ui/CenteredContainer';
import { ErrorCard } from '../ui/ErrorCard';
import { Loader } from '../ui/Loader';

interface ColdStartFallbackProps {
  error: string | null;
  onRetry: () => void;
}

export const ColdStartFallback: FC<ColdStartFallbackProps> = ({
  error,
  onRetry,
}) => {
  const { ui } = useI18n();

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
