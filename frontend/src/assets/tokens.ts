export const tokens = [
  {
    name: 'Not USD Coin',
    address: '0xB1282B067a4D355aa4Ad6D1C7E94a788A9420eC3',
    decimals: 6,
    symbol: 'NUSD',
  },
  {
    name: 'ChainLink Token',
    address: '0x1dE9993Be1Fe26712b2C2ade4a3bA7E044591E90',
    decimals: 18,
    symbol: 'LINK',
  },
];

export function findSymbolByAddress(address: string): string {
  const token = tokens.find(
    (token) => token.address.toLowerCase() === address.toLowerCase(),
  );
  return token ? token.symbol : 'Unknown Token';
}
