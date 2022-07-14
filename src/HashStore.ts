import { type Updater, writable, type Writable } from 'svelte/store';

/**
 * Writable
 *
 * read and write url hash, response to url hash change
 */
export class HashStore implements Writable<string> {
	constructor() {
		const onHashChange = () => {
			console.log('hash change in HashStore');
			this._store.set(window.location.hash);
		};

		window.addEventListener('hashchange', onHashChange);
		this._unsubscribe = () => window.removeEventListener('hashchange', onHashChange);
	}

	private _store = writable<string>(window.location.hash);
	private _unsubscribe: () => void = () => {};

	public readonly subscribe: Writable<string>['subscribe'] = (run, invalidate) => {
		const unsubscribe = this._store.subscribe(run, invalidate);
		return () => {
			this._unsubscribe();
			unsubscribe();
		};
	};

	public readonly set = (hash: string) => {
		window.location.hash = hash;
		this._store.set(hash);
	};

	public readonly update = (updater: Updater<string>) => {
		window.location.hash = updater(window.location.hash);
		this._store.update(updater);
	};
}
