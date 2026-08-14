export const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function isEthereumAddress(value: string): boolean {
  return ETH_ADDRESS_REGEX.test(value);
}

export function isZeroAddress(value: string): boolean {
  return /^0x0{40}$/i.test(value);
}
