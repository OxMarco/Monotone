import {
  Flex,
  Select,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
} from "@chakra-ui/react";
import { Icon } from '@chakra-ui/react';
import { CiInboxOut } from 'react-icons/ci';
import { useContractWrite, useContractEvent } from 'wagmi';
import { keccak256, encodePacked } from 'viem';
import Layout from "./Layout";
import { useState } from "react";

export default function SwapPage() {
  const [from, setFrom] = useState<string>()
  const [to, setTo] = useState<string>()
  const [amount, setAmount] = useState<bigint>(0n)
  const [pools, setPools] = useState<any[]>([])
  const { data, isError, isLoading, write: redeem } = useContractWrite({
    address: routerAddress,
    abi: routerAbi,
    functionName: 'redeem',
  })
  useContractEvent({
    address: routerAddress,
    abi: routerAbi,
    eventName: 'PoolCreated',
    listener(log: any) {
      setPools((pools) => [...pools, log.poolId])
    },
  })

  const performSwap = async () => {
    const poolId = keccak256(encodePacked(
      ['address', 'address'],
      [from as any, to as any],
    ));
    const minAmountOut = 1n

    redeem({
      args: [
        poolId,
        amount,
        minAmountOut,
      ]
    })
  }
  
  return (
    <Layout>
      <Flex align="center"
            w='full'
            justify="center" minH="90vh" direction="column">
        <Flex
          paddingY="12px"
          paddingX="8px"
          direction="column"
          border="1px solid"
          w={{base:"full", md:"500px"}}
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

            <TabPanels h='inherit'>
              <TabPanel px='0px'>
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
                    <Text
                      fontSize="36px"
                      fontWeight="500"
                      w="270px"
                      cursor="text"
                      display="block"
                      flexBasis="auto"
                      flexGrow="1"
                      flexShrink="1"
                      fontStyle="normal"
                      position="relative"
                      textAlign="left"
                      textIndent="0px"
                      textOverflow="ellipsis"
                      textShadow="none"
                      whiteSpace="collapse"
                    >
                      0
                    </Text>
                    <Flex>
                      <Select
                        placeholder="Select option"
                        rounded="20px"
                        size="lg"
                        bg="gray.700"
                        color="white"
                        onChange={(e) => setFrom(e.target.value)}
                      >
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </Select>
                    </Flex>
                    <Text
                      w="100%"
                      color="#9b9b9b"
                      fontWeight="500"
                      height="16px"
                      display="block"
                      lineHeight="16px"
                    >
                      $0.00
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
                    <Text
                      fontSize="36px"
                      fontWeight="500"
                      w="280px"
                      cursor="text"
                      display="block"
                      flexBasis="auto"
                      flexGrow="1"
                      flexShrink="1"
                      fontStyle="normal"
                      position="relative"
                      textAlign="left"
                      textIndent="0px"
                      textOverflow="ellipsis"
                      textShadow="none"
                      whiteSpace="collapse"
                    >
                      0
                    </Text>
                    <Flex>
                      <Select
                        placeholder="Select option"
                        rounded="20px"
                        size="lg"
                        bg="gray.700"
                        color="white"
                        onChange={(e) => setTo(e.target.value)}
                      >
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </Select>
                    </Flex>
                    <Text
                      w="100%"
                      color="#9b9b9b"
                      fontWeight="500"
                      height="16px"
                      display="block"
                      lineHeight="16px"
                    >
                      $0.00
                    </Text>
                  </Flex>

<Flex w='100%' align='center' justify='center'>
  <Button variant="outline" onClick={() => performSwap()}>Swap</Button>
</Flex>
                </Flex>
              </TabPanel>
              <TabPanel  h='inherit'>
                  <Tabs w='100%'>
                    <TabList>
                      <Tab>Create</Tab>
                      <Tab>Deposit</Tab>
                    </TabList>

                    <TabPanels>
                      <TabPanel>
                        <Flex direction='column' align='center' justify='center' h="100%" w='full' gap="20px">

                        <Icon as={CiInboxOut} boxSize='20' />
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
                          <Button>Create</Button>
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
                          Your active liquidity pools will appear here.
                        </Text>
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
