import {Select} from '@chakra-ui/react';

const TokenSelect = ({
  tokens,
  selectedValue,
  setter,
    placeholder
}: {
  tokens: any[];
  selectedValue: string;
  setter: (e: any) => void;
  placeholder?: string
}) => {
  console.log(tokens)
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
        {tokens.map((token: any, index: number) => (
            <option key={index} value={token.address}>
              {/*<Avatar*/}
              {/*size={'sm'}*/}
              {/*src={`https://icons.llamao.fi/icons/chains/rsz_${token.symbol}.jpg`}*/}
              {/*/>*/}
              {token.symbol}
            </option>
        ))}
      </Select>
  )
};

export default TokenSelect;
