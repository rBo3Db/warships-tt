import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { I18nProvider, useI18n } from '../../../context/I18nContext';
import * as vehiclesService from '../../../services/vehiclesService';
import type { Vehicle } from '../../../types/vehicle';

describe('useVehicles hook', () => {
  const mockVehicles: Vehicle[] = [
    {
      id: 'ship_1',
      name: 'Yamato',
      level: 10,
      type: 'Battleship',
      nation: 'japan',
      tags: [],
      icons: { default: 'yamato.png' },
      localization: { mark: { ru: 'Ямато', en: 'Yamato' } },
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(I18nProvider, null, children)
  );

  it('initializes with cached vehicles on frame 0', () => {
    vi.spyOn(vehiclesService, 'getCachedVehiclesSync').mockReturnValue(mockVehicles);
    vi.spyOn(vehiclesService, 'loadAndSyncVehicles').mockImplementation(() => Promise.resolve());

    const { result } = renderHook(() => useVehicles(), { wrapper });

    expect(result.current.vehicles).toEqual(mockVehicles);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.vehiclesError).toBeNull();
  });

  it('updates state with fresh vehicles on successful sync', async () => {
    vi.spyOn(vehiclesService, 'getCachedVehiclesSync').mockReturnValue(null);

    let onUpdateCallback: ((vehicles: Vehicle[]) => void) | null = null;
    vi.spyOn(vehiclesService, 'loadAndSyncVehicles').mockImplementation((onUpdate) => {
      onUpdateCallback = onUpdate;
      return Promise.resolve();
    });

    const { result } = renderHook(() => useVehicles(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      onUpdateCallback?.(mockVehicles);
    });

    expect(result.current.vehicles).toEqual(mockVehicles);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.bannerError).toBeNull();
  });

  it('shows banner error and preserves cached vehicles if background sync fails', () => {
    vi.spyOn(vehiclesService, 'getCachedVehiclesSync').mockReturnValue(mockVehicles);

    let onErrorCallback: (() => void) | null = null;
    vi.spyOn(vehiclesService, 'loadAndSyncVehicles').mockImplementation((_onUpdate, _hasCached, onError) => {
      onErrorCallback = onError as () => void;
      return Promise.resolve();
    });

    const { result } = renderHook(() => useVehicles(), { wrapper });

    act(() => {
      onErrorCallback?.();
    });

    expect(result.current.vehicles).toEqual(mockVehicles);
    expect(result.current.vehiclesError).toBeNull();
    expect(result.current.bannerError).toBeTruthy();
  });

  it('shows full error and wipes vehicles if initial sync fails without cached data', () => {
    vi.spyOn(vehiclesService, 'getCachedVehiclesSync').mockReturnValue(null);

    let onErrorCallback: (() => void) | null = null;
    vi.spyOn(vehiclesService, 'loadAndSyncVehicles').mockImplementation((_onUpdate, _hasCached, onError) => {
      onErrorCallback = onError as () => void;
      return Promise.resolve();
    });

    const { result } = renderHook(() => useVehicles(), { wrapper });

    act(() => {
      onErrorCallback?.();
    });

    expect(result.current.vehicles).toBeNull();
    expect(result.current.vehiclesError).toBeTruthy();
    expect(result.current.bannerError).toBeNull();
  });

  it('automatically translates error messages when language changes without re-syncing', () => {
    vi.spyOn(vehiclesService, 'getCachedVehiclesSync').mockReturnValue(null);

    let onErrorCallback: (() => void) | null = null;
    const loadSpy = vi.spyOn(vehiclesService, 'loadAndSyncVehicles').mockImplementation((_onUpdate, _hasCached, onError) => {
      onErrorCallback = onError as () => void;
      return Promise.resolve();
    });

    const { result } = renderHook(
      () => {
        const vehicles = useVehicles();
        const { setLang, lang } = useI18n();
        return { vehicles, setLang, lang };
      },
      { wrapper }
    );

    // Initial sync call
    expect(loadSpy).toHaveBeenCalledTimes(1);

    // Trigger error
    act(() => {
      onErrorCallback?.();
    });

    const initialError = result.current.vehicles.vehiclesError;
    expect(initialError).toBeTruthy();

    // Change language
    act(() => {
      result.current.setLang(result.current.lang === 'ru' ? 'en' : 'ru');
    });

    // Error text is immediately updated in the new language
    expect(result.current.vehicles.vehiclesError).toBeTruthy();
    expect(result.current.vehicles.vehiclesError).not.toBe(initialError);

    // loadAndSyncVehicles was NOT called again on language change
    expect(loadSpy).toHaveBeenCalledTimes(1);
  });

  it('clears banner error when dismissBanner is called', () => {
    vi.spyOn(vehiclesService, 'getCachedVehiclesSync').mockReturnValue(mockVehicles);

    let onErrorCallback: (() => void) | null = null;
    vi.spyOn(vehiclesService, 'loadAndSyncVehicles').mockImplementation((_onUpdate, _hasCached, onError) => {
      onErrorCallback = onError as () => void;
      return Promise.resolve();
    });

    const { result } = renderHook(() => useVehicles(), { wrapper });

    act(() => {
      onErrorCallback?.();
    });
    expect(result.current.bannerError).toBeTruthy();

    act(() => {
      result.current.dismissBanner();
    });
    expect(result.current.bannerError).toBeNull();
  });
});
