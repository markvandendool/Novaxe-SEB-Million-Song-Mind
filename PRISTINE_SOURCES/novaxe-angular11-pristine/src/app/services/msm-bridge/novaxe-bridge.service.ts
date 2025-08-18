import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChordData {
	root: string;
	quality: string;
	intervals: number[];
	midi?: number[];
	timestamp: number;
}

export interface ScaleData {
	root: string;
	type: string;
	notes: string[];
	intervals: number[];
	timestamp: number;
}

export interface ProgressionData {
	key: string;
	chords: string[];
	romanNumerals: string[];
	timestamp: number;
}

export interface BridgeMessage {
	type: 'CHORD_UPDATE' | 'SCALE_UPDATE' | 'PROGRESSION_UPDATE' | 'HEARTBEAT';
	source: 'msm';
	payload?: ChordData | ScaleData | ProgressionData;
	timestamp: number;
	version: string;
}

export interface BridgeStatus {
	isConnected: boolean;
	lastMessageTime: number | null;
	messageCount: number;
	errorCount: number;
	fallbackMode: boolean;
}

class NovaxeBridge {
	private listeners: Map<string, ((data: any) => void)[]> = new Map();
	private status: BridgeStatus = {
		isConnected: false,
		lastMessageTime: null,
		messageCount: 0,
		errorCount: 0,
		fallbackMode: false
	};

	constructor() {
		this.initializeListeners();
	}

	private initializeListeners() {
		window.addEventListener('message', (event) => {
			this.handleMessage(event.data);
		});

		window.addEventListener('storage', (event) => {
			if (event.key && event.key.startsWith('msm-to-novaxe-') && event.newValue) {
				try {
					const data = JSON.parse(event.newValue);
					this.handleMessage(data);
					this.status.fallbackMode = true;
				} catch {
					this.status.errorCount++;
				}
			}
		});
	}

	private handleMessage(data: any) {
		if (!data || data.source !== 'msm') return;
		this.status.lastMessageTime = Date.now();
		this.status.messageCount++;
		this.status.isConnected = true;
		switch (data.type) {
			case 'CHORD_UPDATE':
				this.notify('chord', data.payload);
				break;
			case 'SCALE_UPDATE':
				this.notify('scale', data.payload);
				break;
			case 'PROGRESSION_UPDATE':
				this.notify('progression', data.payload);
				break;
			case 'HEARTBEAT':
				this.status.isConnected = true;
				break;
			default:
				break;
		}
	}

	private notify(type: string, payload: any) {
		const arr = this.listeners.get(type);
		if (arr) arr.forEach((cb) => { try { cb(payload); } catch { this.status.errorCount++; } });
	}

	on(type: 'chord'|'scale'|'progression', cb: (data: any) => void) {
		if (!this.listeners.has(type)) this.listeners.set(type, []);
		this.listeners.get(type)!.push(cb);
	}

	getStatus(): BridgeStatus {
		return { ...this.status };
	}
}

@Injectable({ providedIn: 'root' })
export class NovaxeBridgeService implements OnDestroy {
	private bridge = new NovaxeBridge();
	private statusSubject = new BehaviorSubject<BridgeStatus>(this.bridge.getStatus());
	private chordSubject = new BehaviorSubject<ChordData | null>(null);
	private scaleSubject = new BehaviorSubject<ScaleData | null>(null);
	private progressionSubject = new BehaviorSubject<ProgressionData | null>(null);

	constructor() {
		this.bridge.on('chord', (d) => { this.chordSubject.next(d); this.statusSubject.next(this.bridge.getStatus()); });
		this.bridge.on('scale', (d) => { this.scaleSubject.next(d); this.statusSubject.next(this.bridge.getStatus()); });
		this.bridge.on('progression', (d) => { this.progressionSubject.next(d); this.statusSubject.next(this.bridge.getStatus()); });
	}

	get status$(): Observable<BridgeStatus> { return this.statusSubject.asObservable(); }
	get chord$(): Observable<ChordData | null> { return this.chordSubject.asObservable(); }
	get scale$(): Observable<ScaleData | null> { return this.scaleSubject.asObservable(); }
	get progression$(): Observable<ProgressionData | null> { return this.progressionSubject.asObservable(); }

	ngOnDestroy() {}
}

