import { Avatar, Select } from '@chakra-ui/react';

const TokenSelect = ({
  tokens,
  selectedValue,
  unselectableValue,
  setter,
  placeholder,
}: {
  tokens: any[];
  selectedValue: string;
  unselectableValue: string;
  setter: (e: any) => void;
  placeholder?: string;
}) => {
  return (
    <Select
      placeholder={placeholder || 'Select Options'}
      rounded="20px"
      size="lg"
      bg="gray.700"
      color="white"
      onChange={(e) => setter(e.target.value)}
      value={selectedValue}
    >
      {tokens
        .filter((token) => token.address !== unselectableValue)
        .map((token: any, index: number) => (
          <option key={index} value={token.address}>
            {token.symbol}
          </option>
        ))}
    </Select>
  );
};

export default TokenSelect;
