import {
	type Subscriber,
	type Unsubscriber,
	writable,
	type Writable,
	type Updater,
	get
} from 'svelte/store';

export class FullscreenStore implements Writable<boolean> {
	private _element: Element;
	private _isFullscreen: Writable<boolean>;

	constructor(ele: Element = document.body) {
		this._element = ele;
		const isFullscreen = document.fullscreenElement === ele;
		this._isFullscreen = writable(isFullscreen);
	}

	private onChange = () => {
		console.log(`onChange`, document.fullscreenElement === this._element);
		this._isFullscreen.set(document.fullscreenElement === this._element);
	};

	private onIsFullscreenChange = (isFullscreen: boolean) => {
		console.log('onIsFullscreenChange', isFullscreen);
		if (isFullscreen && document.fullscreenEnabled) {
			this._element.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};

	subscribe(run: Subscriber<boolean>, invalidate?: (value?: boolean) => void): Unsubscriber {
		this._element.addEventListener('fullscreenchange', this.onChange);
		const unsubscribeStore = this._isFullscreen.subscribe(run, invalidate);

		return () => {
			this._element.removeEventListener('fullscreenchange', this.onChange);
			unsubscribeStore();
		};
	}
	set(isFullscreen: boolean): void {
		this.onIsFullscreenChange(isFullscreen);
	}
	update(updater: Updater<boolean>): void {
		this.onIsFullscreenChange(updater(get(this._isFullscreen)));
	}
	toggle(): void {
		this.update((v) => !v);
	}
}
