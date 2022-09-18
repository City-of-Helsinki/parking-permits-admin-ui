// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
// eslint-disable-next-line import/no-named-default,import/no-extraneous-dependencies
import { default as RO } from 'resize-observer-polyfill';

global.ResizeObserver = RO;
