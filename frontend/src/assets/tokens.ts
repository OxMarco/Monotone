export const tokens = [
  {
    name: 'Mock USD Coin',
    address: '0x7563943E99CCf404CDBeFDD98ddE91DC52b08836',
    decimals: 18,
    symbol: 'MUSD',
  },
  {
    name: 'Mock ChainLink Token',
    address: '0x87F3D0d1Ea8781b01Ae4e2bF99aCe343804122F3',
    decimals: 18,
    symbol: 'MLINK',
  },
];

export function findSymbolByAddress(address: string): string {
  const token = tokens.find(
    (token) => token.address.toLowerCase() === address.toLowerCase(),
  );
  return token ? token.symbol : 'Unknown Token';
}
