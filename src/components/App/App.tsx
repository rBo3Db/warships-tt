import { I18nProvider, ConfigProvider } from '../../context';
import { useAppBootstrap } from './useAppBootstrap';
import { ColdStartFallback } from './ColdStartFallback';
import { Encyclopedia } from '../Encyclopedia';

export function App() {
  const {
    mediaPath,
    nations,
    vehicleTypes,
    availableLanguages,
    isColdStart,
    bootstrapError,
    retryBootstrap,
  } = useAppBootstrap();

  return (
    <I18nProvider availableLanguages={availableLanguages}>
      <ConfigProvider
        mediaPath={mediaPath || ''}
        nations={nations || []}
        vehicleTypes={vehicleTypes || {}}
      >
        {isColdStart ? (
          <ColdStartFallback
            error={bootstrapError}
            onRetry={retryBootstrap}
          />
        ) : (
          <Encyclopedia />
        )}
      </ConfigProvider>
    </I18nProvider>
  );
}

export default App;
