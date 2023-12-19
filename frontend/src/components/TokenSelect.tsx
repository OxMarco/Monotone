import { Select } from '@chakra-ui/react';

const TokenSelect = ({
  tokens,
  selectedValue,
  setter,
}: {
  tokens: any[];
  selectedValue: string;
  setter: (e: any) => void;
}) => (
  <Select
    placeholder="Select option"
    rounded="20px"
    size="lg"
    bg="gray.700"
    color="white"
    onChange={(e) => setter(e.target.value)}
    value={selectedValue}
  >
    {tokens.map((token: any, index: number) => (
      <option key={index} value={token.address}>
        {token.symbol}
      </option>
    ))}
  </Select>
);

export default TokenSelect;
