import { useEffect, useState } from 'react';
import {
  Flex,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  InputGroup,
  Input,
  Alert,
  AlertIcon,
  Stack,
  Card,
  CardBody,
  CardFooter,
} from '@chakra-ui/react';
import {
  useContractWrite,
  sepolia,
  useAccount,
  erc20ABI,
  useWalletClient,
} from 'wagmi';
import {
  keccak256,
  encodePacked,
  createPublicClient,
  http,
  maxUint256,
} from 'viem';
import { routerAbi, routerAddress } from '../assets/router';
import { findSymbolByAddress, tokens } from '../assets/tokens';
import Layout from './Layout';
import TokenSelect from '../components/TokenSelect';

export default function SwapPage() {
  const [poolId, setPoolId] = useState<string>('');
  const [token0, setToken0] = useState<string>('');
  const [token1, setToken1] = useState<string>('');
  const [amount, setAmount] = useState<bigint>(0n);
  const [pools, setPools] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [quote, setQuote] = useState(0n);
  const [poolAmount, setPoolAmount] = useState(0n);
  const { address } = useAccount();
  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  const { write: redeem } = useContractWrite({
    address: routerAddress,
    abi: routerAbi,
    functionName: 'redeem',
  });
  const { write: deposit } = useContractWrite({
    address: routerAddress,
    abi: routerAbi,
    functionName: 'deposit',
  });

  const { isError, write: create } = useContractWrite({
    address: routerAddress,
    abi: routerAbi,
    functionName: 'create',
  });

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });
  const { data: walletClient } = useWalletClient();

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => {
      setError('');
    }, 5000); // 5000 milliseconds (5 seconds)
  };

  useEffect(() => {
    if (isError) {
      handleError('Pool already exists');
    }
  }, [isError]);

  useEffect(() => {
    const load = async () => {
      const logs = await client.getContractEvents({
        address: routerAddress,
        abi: routerAbi,
        eventName: 'PoolCreated',

        fromBlock: 4919815n,
        toBlock: 4959815n,
      });
      let data: any[] = [];
      logs.map((log: any) => {
        data.push({
          token: log.args['token'],
          numeraire: log.args['numeraire'],
          poolId: log.args['poolId'],
        });
      });
      setPools(data);
    };

    load();
  }, []);

  useEffect(() => {
    const quoter = async () => {
      if (!poolId || amount == 0n) return;
      console.log('poolId', poolId);
      const data = await publicClient.readContract({
        address: routerAddress,
        abi: routerAbi,
        functionName: 'quoteTokenForNumeraire',
        args: [poolId as any, amount],
      });

      setQuote(data);
    };

    quoter();
  }, [poolId, amount]);

  useEffect(() => {
    if (token0 && token1) {
      const poolId = keccak256(
        encodePacked(['address', 'address'], [token0 as any, token1 as any]),
      );
      setPoolId(poolId);
    }
  }, [token0, token1]);

  const selectToken0 = (val: string) => {
    setToken0(val);
  };

  const selectToken1 = (val: string) => {
    setToken1(val);
  };

  const performSwap = async () => {
    if (!token0 || !token1) {
      handleError('Please ensure you select a token pair');
    } else {
      const poolId = keccak256(
        encodePacked(['address', 'address'], [token0 as any, token1 as any]),
      );
      const minAmountOut = 0n;
      const final = (Number(amount) * 10) ^ 18;
      redeem({
        args: [poolId, BigInt(final), minAmountOut],
      });

      setToken0('');
      setToken1('');
    }
  };

  const performDeposit = async () => {
    if (!poolAmount) {
      handleError('Please enter a valid amount');
    } else {
      const { request } = await publicClient.simulateContract({
        chain: sepolia,
        account: address,
        address: token0 as any,
        abi: erc20ABI,
        functionName: 'approve',
        args: [routerAddress as any, maxUint256],
      });

      const tx = await walletClient?.writeContract(request);
      const transaction = await publicClient.waitForTransactionReceipt({
        hash: tx as any,
      });

      if (transaction.status === 'success') {
        deposit({
          args: [poolId as any, token0 as any, poolAmount],
        });
      } else {
        console.log('Error', transaction);
      }
    }

    setToken0('');
    setToken1('');
  };

  const createPool = async () => {
    if (!token0 || !token1) {
      handleError('Please ensure you select a token pair');
    } else {
      try {
        create({
          args: [token0 as any, token1 as any],
        });
      } catch (e) {
        console.error(e);
      }
    }

    setToken0('');
    setToken1('');
  };

  return (
    <Layout>
      <Flex
        align="center"
        w="full"
        justify="center"
        minH="90vh"
        direction="column"
      >
        <Flex
          paddingY="12px"
          paddingX="8px"
          direction="column"
          border="1px solid"
          w={{ base: 'full', md: '500px' }}
          minH="370px"
          rounded="20px"
          fontSize="16px"
          fontWeight="500"
          position="absolute"
          shadow="md"
        >
          <Tabs isLazy variant="soft-rounded" colorScheme="gray">
            <TabList>
              <Tab>Swap</Tab>
              <Tab>Pool</Tab>
            </TabList>

            <TabPanels h="inherit">
              <TabPanel px="0px">
                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <Flex
                  gap="4px"
                  direction="column"
                  fontSize="16px"
                  fontWeight="500"
                >
                  <Flex
                    fontSize="14px"
                    fontWeight="500"
                    lineHeight="20px"
                    padding="16px"
                    position="relative"
                    w="100%"
                    h="120px"
                    rounded="20px"
                    border="1px solid"
                    borderColor="green.600"
                    align="center"
                    justify="center"
                    flexWrap="wrap"
                  >
                    <Text w="100%" color="#9b9b9b">
                      You sell
                    </Text>
                    <Input
                      fontSize="36px"
                      fontWeight="500"
                      width="270px"
                      cursor="text"
                      display="flex"
                      flexGrow={1}
                      flexShrink={1}
                      fontStyle="normal"
                      position="relative"
                      textAlign="left"
                      textIndent="0px"
                      textOverflow="ellipsis"
                      textShadow="none"
                      whiteSpace="nowrap"
                      variant="ghost"
                      onChange={(e) => setAmount(BigInt(e.target.value))}
                      type="number"
                      placeholder="0"
                    />
                    <Flex>
                      <TokenSelect
                        selectedValue={token0}
                        unselectableValue={token1}
                        tokens={tokens}
                        setter={selectToken0}
                      />
                    </Flex>
                    <Text
                      w="100%"
                      color="#9b9b9b"
                      fontWeight="500"
                      height="16px"
                      display="block"
                      lineHeight="16px"
                    >
                      ${(amount * 12n).toString()}
                    </Text>
                  </Flex>

                  <Flex
                    fontSize="14px"
                    fontWeight="500"
                    lineHeight="20px"
                    padding="16px"
                    position="relative"
                    w="100%"
                    h="120px"
                    rounded="20px"
                    border="1px solid"
                    borderColor="blue.600"
                    align="center"
                    justify="center"
                    flexWrap="wrap"
                  >
                    <Text w="100%" color="#9b9b9b">
                      You get
                    </Text>

                    <Input
                      fontSize="36px"
                      fontWeight="500"
                      width="270px"
                      cursor="text"
                      display="flex"
                      flexGrow={1}
                      flexShrink={1}
                      fontStyle="normal"
                      position="relative"
                      textAlign="left"
                      textIndent="0px"
                      textOverflow="ellipsis"
                      textShadow="none"
                      whiteSpace="nowrap"
                      variant="ghost"
                      type="number"
                      placeholder="0"
                      value={quote.toString()}
                      disabled={true}
                    />
                    <Flex>
                      <TokenSelect
                        selectedValue={token1}
                        unselectableValue={token0}
                        tokens={tokens}
                        setter={selectToken1}
                      />
                    </Flex>
                    <Text
                      w="100%"
                      color="#9b9b9b"
                      fontWeight="500"
                      height="16px"
                      display="block"
                      lineHeight="16px"
                    >
                      ${(quote * 1n).toString()}
                    </Text>
                  </Flex>

                  <Flex w="100%" align="center" justify="center">
                    <Button
                      rounded="16px"
                      h="50px"
                      color="#fff"
                      cursor="pointer"
                      boxSizing="border-box"
                      bg="#000"
                      w="100%"
                      onClick={() => performSwap()}
                    >
                      <Text
                        fontSize="20px"
                        fontWeight="700px"
                        lineHeight="24px"
                      >
                        Swap
                      </Text>
                    </Button>
                  </Flex>
                </Flex>
              </TabPanel>
              <TabPanel h="inherit">
                <Tabs w="100%">
                  <TabList>
                    <Tab>Create</Tab>
                    <Tab>Deposit</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        h="100%"
                        w="full"
                        gap="20px"
                      >
                        {error && (
                          <Alert status="error">
                            <AlertIcon />
                            {error}
                          </Alert>
                        )}

                        <Text
                          w="100%"
                          color="#9b9b9b"
                          fontWeight="500"
                          height="16px"
                          display="block"
                          lineHeight="16px"
                          textAlign="center"
                        >
                          Create a new pair
                        </Text>
                        <Flex w="full" gap="20px">
                          <InputGroup>
                            <TokenSelect
                              selectedValue={token0}
                              unselectableValue={token1}
                              tokens={tokens}
                              setter={selectToken0}
                              placeholder="Select token"
                            />
                          </InputGroup>
                          <InputGroup>
                            <TokenSelect
                              selectedValue={token1}
                              unselectableValue={token0}
                              tokens={tokens}
                              setter={selectToken1}
                              placeholder="Select Numeraire"
                            />
                          </InputGroup>
                        </Flex>
                        <Button
                          rounded="16px"
                          h="50px"
                          color="#fff"
                          cursor="pointer"
                          boxSizing="border-box"
                          bg="#000"
                          w="100%"
                          onClick={() => createPool()}
                        >
                          <Text
                            fontSize="20px"
                            fontWeight="700px"
                            lineHeight="24px"
                          >
                            Create Pool
                          </Text>
                        </Button>
                      </Flex>
                    </TabPanel>
                    <TabPanel>
                      <Text
                        w="100%"
                        color="#9b9b9b"
                        fontWeight="500"
                        height="16px"
                        display="block"
                        lineHeight="16px"
                        textAlign="center"
                      >
                        Active liquidity pools will appear here.
                      </Text>
                      <br />
                      <Stack>
                        {pools.map((pool: any, index: number) => (
                          <Card key={index}>
                            <CardBody>
                              <Text>
                                {findSymbolByAddress(pool.token)} -{' '}
                                {findSymbolByAddress(pool.numeraire)}
                              </Text>
                            </CardBody>
                            <CardFooter>
                              <Input
                                fontSize="36px"
                                fontWeight="500"
                                width="270px"
                                cursor="text"
                                display="flex"
                                flexGrow={1}
                                flexShrink={1}
                                fontStyle="normal"
                                position="relative"
                                textAlign="left"
                                textIndent="0px"
                                textOverflow="ellipsis"
                                textShadow="none"
                                whiteSpace="nowrap"
                                variant="ghost"
                                onChange={(e) =>
                                  setPoolAmount(BigInt(e.target.value))
                                }
                                value={poolAmount.toString()}
                                type="number"
                                placeholder="0"
                              />
                              <TokenSelect
                                selectedValue={token0}
                                unselectableValue=""
                                tokens={tokens}
                                setter={selectToken0}
                              />
                              <Button
                                disabled={!poolAmount}
                                onClick={() => performDeposit()}
                              >
                                Deposit
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </Stack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </Flex>
    </Layout>
  );
}
