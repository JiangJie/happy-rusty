import { describe, expect, test } from '@jest/globals';
// import { Some } from 'happy-rusty';
import { Some } from '../../src/mod';

describe('Option', () => {
    test('unwrap Some', () => {
        const v = Some(10);
        expect(v.unwrap()).toBe(10);
    });
});