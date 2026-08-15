import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAntiCheat from './useAntiCheat';

const postMock = vi.fn().mockResolvedValue({ data: {} });

vi.mock('../api/axios', () => ({
  default: { post: (...args) => postMock(...args) },
}));

const fire = (target, type, init = {}) => {
  target.dispatchEvent(new Event(type, init));
};

describe('useAntiCheat', () => {
  beforeEach(() => {
    postMock.mockClear();
    vi.useFakeTimers();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reporta tab_switch cuando la pestaña queda oculta', () => {
    renderHook(() => useAntiCheat(1, true));

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    act(() => fire(document, 'visibilitychange'));

    expect(postMock).toHaveBeenCalledWith(
      '/exams/attempts/1/cheat',
      expect.objectContaining({ event_type: 'tab_switch' })
    );
  });

  it('reporta window_blur al perder foco', () => {
    renderHook(() => useAntiCheat(1, true));
    act(() => fire(window, 'blur'));
    expect(postMock).toHaveBeenCalledWith(
      '/exams/attempts/1/cheat',
      expect.objectContaining({ event_type: 'window_blur' })
    );
  });

  it('reporta extended_absence cuando el foco vuelve tras más de 2s', () => {
    renderHook(() => useAntiCheat(1, true));
    act(() => fire(window, 'blur'));
    act(() => vi.advanceTimersByTime(2500));
    act(() => fire(window, 'focus'));
    expect(postMock).toHaveBeenCalledWith(
      '/exams/attempts/1/cheat',
      expect.objectContaining({ event_type: 'extended_absence' })
    );
  });

  it.each([
    ['copy', 'copy_attempt'],
    ['cut', 'cut_attempt'],
    ['paste', 'paste_attempt'],
    ['contextmenu', 'right_click'],
  ])('previene y reporta el evento %s como %s', (type, eventType) => {
    renderHook(() => useAntiCheat(1, true));
    const event = new Event(type, { cancelable: true });
    const spy = vi.spyOn(event, 'preventDefault');
    act(() => document.dispatchEvent(event));
    expect(spy).toHaveBeenCalled();
    expect(postMock).toHaveBeenCalledWith(
      '/exams/attempts/1/cheat',
      expect.objectContaining({ event_type: eventType })
    );
  });

  it('reporta atajos de teclado y apertura de DevTools', () => {
    renderHook(() => useAntiCheat(1, true));

    const ctrlC = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, cancelable: true });
    act(() => document.dispatchEvent(ctrlC));
    expect(postMock).toHaveBeenCalledWith(
      '/exams/attempts/1/cheat',
      expect.objectContaining({ event_type: 'keyboard_shortcut' })
    );

    postMock.mockClear();
    const f12 = new KeyboardEvent('keydown', { key: 'F12', cancelable: true });
    act(() => document.dispatchEvent(f12));
    expect(postMock).toHaveBeenCalledWith(
      '/exams/attempts/1/cheat',
      expect.objectContaining({ event_type: 'devtools_attempt' })
    );
  });

  it('no reporta nada cuando no hay attemptId', () => {
    renderHook(() => useAntiCheat(null, true));
    act(() => fire(document, 'visibilitychange'));
    act(() => fire(window, 'blur'));
    expect(postMock).not.toHaveBeenCalled();
  });

  it('no reporta nada cuando isActive es false', () => {
    renderHook(() => useAntiCheat(1, false));
    act(() => fire(window, 'blur'));
    act(() => fire(document, 'visibilitychange'));
    expect(postMock).not.toHaveBeenCalled();
  });

  it('registra el error sin lanzar cuando el reporte falla', async () => {
    postMock.mockRejectedValueOnce(new Error('network'));
    renderHook(() => useAntiCheat(1, true));
    act(() => fire(window, 'blur'));
    await act(async () => {});
    expect(postMock).toHaveBeenCalledTimes(1);
  });
});