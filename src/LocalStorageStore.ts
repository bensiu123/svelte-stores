import { get, writable, type Updater, type Writable } from 'svelte/store';

type parserOptions<T> = {
	serializer?: (value: T) => string;
	deserializer?: (value: string) => T;
};

export class LocalStorageStore<T> implements Writable<T> {
	private key: string;
	private deserializer: ((value: string) => T) | undefined;
	private serializer: ((value: T) => string) | undefined;
	private _store: Writable<T | undefined>;
	private _unsubscribe: () => void;
	constructor(key: string, initialValue?: T, options?: parserOptions<T>) {
		this.key = key;

		this.serializer = options?.serializer ?? JSON.stringify;
		this.deserializer = options?.deserializer ?? JSON.parse;

		const initializer = (key: string): T | undefined => {
			try {
				const localStorageValue = localStorage.getItem(key);
				if (localStorageValue !== null) {
					return this.deserializer(localStorageValue);
				} else {
					initialValue && localStorage.setItem(key, this.serializer(initialValue));
					return initialValue;
				}
			} catch {
				// If user is in private mode or has storage restriction
				// localStorage can throw. JSON.parse and JSON.stringify
				// can throw, too.
				return initialValue;
			}
		};

		this._store = writable(initializer(key));

		const onStorageChange = (e: StorageEvent) => {
			if (e.storageArea === localStorage) {
				this._store.set(initializer(key));
			}
		};

		window.addEventListener('storage', onStorageChange);
		this._unsubscribe = () => window.removeEventListener('storage', onStorageChange);
	}

	public readonly subscribe: Writable<T>['subscribe'] = (run, invalidate) => {
		const unsubscribe = this._store.subscribe(run, invalidate);
		return () => {
			this._unsubscribe();
			unsubscribe();
		};
	};

	public readonly set = (value: T) => {
		localStorage.setItem(this.key, this.serializer(value));
		this._store.set(value);
	};

	public readonly update = (updater: Updater<T>) => {
		const newValue = updater(get(this._store));
		localStorage.setItem(this.key, this.serializer(newValue));
		this._store.update(updater);
	};
}
