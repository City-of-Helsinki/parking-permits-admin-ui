import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useSet from './useSet';

describe('useSet', () => {
  it('initializes with the provided values and updates them immutably', () => {
    const initialSet = new Set(['existing']);
    const { result } = renderHook(() => useSet(initialSet));

    expect([...result.current[0]]).toEqual(['existing']);

    act(() => result.current[1].add('added'));
    expect([...result.current[0]]).toEqual(['existing', 'added']);
    expect([...initialSet]).toEqual(['existing']);

    act(() => result.current[1].delete('existing'));
    expect([...result.current[0]]).toEqual(['added']);
    expect([...initialSet]).toEqual(['existing']);
  });

  it('clears the current set without mutating its initial value', () => {
    const initialSet = new Set(['one', 'two']);
    const { result } = renderHook(() => useSet(initialSet));

    act(() => result.current[1].clear());

    expect([...result.current[0]]).toEqual([]);
    expect([...initialSet]).toEqual(['one', 'two']);
  });

  it('replaces the set and applies later updates immutably', () => {
    const initialSet = new Set(['initial']);
    const replacement = new Set(['replacement']);
    const { result } = renderHook(() => useSet(initialSet));

    act(() => result.current[1].set(replacement));
    expect([...result.current[0]]).toEqual(['replacement']);

    act(() => result.current[1].add('added'));
    expect([...result.current[0]]).toEqual(['replacement', 'added']);
    expect([...replacement]).toEqual(['replacement']);
    expect([...initialSet]).toEqual(['initial']);
  });
});
