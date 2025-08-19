import React from 'react';

export type ChordData = { root: string; quality: string; intervals: number[]; midi?: number[] };
export type ScaleData = { root: string; type: string; notes: string[]; intervals: number[] };
export type ProgressionData = { key: string; chords: string[]; romanNumerals: string[] };

function sendMessage(message: any) {
	try {
		window.opener?.postMessage(message, '*');
	} catch {}
	try {
		const key = `msm-to-novaxe-${Date.now()}`;
		localStorage.setItem(key, JSON.stringify(message));
		window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(message) }));
	} catch {}
}

export const NovaxeBridgeSender: React.FC = () => null;

export const sendChord = (data: ChordData) =>
	sendMessage({ type: 'CHORD_UPDATE', source: 'msm', payload: { ...data, timestamp: Date.now() }, timestamp: Date.now(), version: '1.0.0' });
export const sendScale = (data: ScaleData) =>
	sendMessage({ type: 'SCALE_UPDATE', source: 'msm', payload: { ...data, timestamp: Date.now() }, timestamp: Date.now(), version: '1.0.0' });
export const sendProgression = (data: ProgressionData) =>
	sendMessage({ type: 'PROGRESSION_UPDATE', source: 'msm', payload: { ...data, timestamp: Date.now() }, timestamp: Date.now(), version: '1.0.0' });

