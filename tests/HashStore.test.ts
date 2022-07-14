import { get } from 'svelte/store';
import { HashStore } from '../src/HashStore';

globalThis.window = Object.create(window);
let mockHash = '#';
const mockLocation = {};
Object.defineProperty(mockLocation, 'hash', {
	get() {
		return mockHash;
	},
	set(newHash) {
		mockHash = newHash;
		window.dispatchEvent(new HashChangeEvent('hashchange'));
	}
});
Object.defineProperty(window, 'location', {
	value: mockLocation
});

beforeEach(() => {
	window.location.hash = '#';
});

test('returns current url hash', () => {
	window.location.hash = '#abc';

	const hashStore = new HashStore();

	const hash = get(hashStore);
	expect(hash).toBe('#abc');
});

test('returns latest url hash when change the hash with set', () => {
	const hashStore = new HashStore();

	const hash = get(hashStore);
	expect(hash).toBe('#');

	hashStore.set('#abc');
	const hash2 = get(hashStore);
	expect(hash2).toBe('#abc');
});

it('returns latest url hash when change the hash with "hashchange" event', () => {
	const hashStore = new HashStore();

	const hash = get(hashStore);
	expect(hash).toBe('#');

	window.location.hash = '#abc';

	setTimeout(() => {
		const hash2 = get(hashStore);
		expect(hash2).toBe('#abc');
	}, 0);
});
