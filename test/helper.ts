// for future keccak using
export function parseUint8ArrayToStrArray(
	value: Uint8Array
): string[] {
	let array: string[] = [];
	for (let i = 0; i < value.length; i++) {
		array[i] = value[i].toString();
	}
	return array;
}