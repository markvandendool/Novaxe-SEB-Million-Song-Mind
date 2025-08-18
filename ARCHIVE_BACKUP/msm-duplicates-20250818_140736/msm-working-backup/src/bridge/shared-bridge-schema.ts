export const BRIDGE_VERSION = "1.0.0";
export type BridgeChannel = "MSM_TO_NOVAXE" | "NOVAXE_TO_MSM";
export type MsmToNovaxeKind = "HANDSHAKE"|"HEARTBEAT"|"READY"|"KEY_SET"|"SELECTION_SET"|"COMMAND";
export type NovaxeToMsmKind = "HANDSHAKE_ACK"|"HEARTBEAT_ACK"|"READY_ACK"|"KEY_CHANGED"|"CHORD_SELECTED"|"SELECTION_SYNC"|"COMMAND_RESULT";
export interface BridgeEnvelope<T>{version:string;type:BridgeChannel;kind:string;nonce?:string;ts:number;source:"MSM"|"NOVAXE";origin:string;payload:T}
export interface KeyPayload{key:string;mode?:"major"|"minor"}
export interface ChordSelectionPayload{roman:string;key?:string;source:"braid"|"graph"|"msm-chart"}
export interface SelectionSyncPayload{slot:string;selected:boolean;key?:string;reason?:string}
export interface CommandPayload{name:"playChord"|"highlightNode"|"setKey"|"ping";args?:Record<string,unknown>}
export interface CommandResultPayload{name:string;ok:boolean;error?:string}
export function isBridgeEnvelope(x:any):x is BridgeEnvelope<any>{return x&&typeof x==="object"&&typeof x.version==="string"&&typeof x.type==="string"&&typeof x.kind==="string"&&typeof x.ts==="number"&&x.payload!==undefined}
