import { ChakraProvider } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, Chain, sepolia, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import '@rainbow-me/rainbowkit/styles.css';

// Define the custom chain
const modeChain: Chain = {
  id: 919,
  name: 'Mode',
  network: 'mode',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.mode.network'],
    },
    public: {
      http: ['https://sepolia.mode.network'],
    }
  },
  blockExplorers: {
    default: { name: 'Mode Explorer', url: 'https://sepolia.explorer.mode.network/' },
  },
  testnet: true,
};

const { chains, publicClient } = configureChains([modeChain], [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: 'Monotone App',
  projectId: 'YOUR_PROJECT_ID',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ChakraProvider>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
};
