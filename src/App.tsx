import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaAddressCard as AddressIcon } from "react-icons/fa";
import { Box, Button, Center, Field, Flex, Heading, Input, InputGroup, SimpleGrid, Text } from "@chakra-ui/react";
import { Alchemy, Network, type TokenBalancesResponseErc20 } from "alchemy-sdk";
import { useConnection, useDisconnect, useEnsName } from "wagmi";
import { WalletsOption } from "@/components/WalletsOption";
import Token from "@/components/Token";

const alchemy = new Alchemy({
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
});

function App() {
  const userWallet = useConnection();
  const ens = useEnsName({
    address: userWallet.address
  });
  const disconnect = useDisconnect();

  const [erc20Tokens, setERC20Tokens] = useState<TokenBalancesResponseErc20>();
  const [isQuerying, setIsQuerying] = useState(false);

  interface QueryForm { userAddress: string; };
  const queryForm = useForm<QueryForm>();

  useEffect(() => {
    setERC20Tokens(() => undefined);
    setIsQuerying(() => false);
  }, [userWallet.isDisconnected]);

  function getTokenBalance({ userAddress }: QueryForm) {
    setIsQuerying(() => true);
    setERC20Tokens(() => undefined);
    alchemy.core
      .getTokenBalances(userAddress)
      .then(setERC20Tokens)
      .catch(console.error)
      .finally(
        () => setIsQuerying(() => false)
      );
  }

  if (!userWallet.isConnected) return <Box w="100vw">
    <WalletsOption />
  </Box>;

  if (ens.status === "pending") return <Box w="100vw">
    <Center>
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Text>Loading ENS name</Text>
      </Flex>
    </Center>
  </Box>;

  if (ens.status === "error") return <Box w="100vw">
    <Center>
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Text>Error fetching ENS name: {ens.error.message}</Text>
      </Flex>
    </Center>
  </Box>;

  return <Box w="100vw">
    <Button
      position="absolute"
      top={3}
      right={3}
      fontSize={20}
      bgColor="blue"
      onClick={() => disconnect.mutate({ connector: userWallet.connector })}
    >
      Disconnect
    </Button>

    <Center>
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Heading mt={10} fontSize={36}>ERC-20 Token Indexer</Heading>
        <Text>Plug in an address and this website will return all of its ERC-20 tokens balance!</Text>
      </Flex>
    </Center>

    <form onSubmit={queryForm.handleSubmit(getTokenBalance)}>
      <Flex
        mb="3"
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Heading mt={42}>Get the balance of all ERC-20 tokens of this address:</Heading>
        <Center>
          <Field.Root invalid={!!queryForm.formState.errors.userAddress}>
            <InputGroup startElement={<AddressIcon />}>
              <Input
                {...queryForm.register("userAddress", {
                  required: {
                    value: true,
                    message: "Address is required",
                  },
                })}
                defaultValue={ens.data || userWallet.address}
                placeholder="0xUserAddress or ENS.eth"
                _placeholder={
                  { color: "transparent" }
                }
                _hover={
                  {
                    _placeholder: { color: "fg.muted" }
                  }
                }
                readOnly={isQuerying}
                color="black"
                w="600px"
                p={4}
                bgColor="white"
                fontSize={21}
              />
            </InputGroup>
            {queryForm.formState.errors.userAddress?.message && <Field.ErrorText alignSelf="center">
              <Field.ErrorIcon />{`${queryForm.formState.errors.userAddress?.message}`}
            </Field.ErrorText>}
          </Field.Root>
        </Center>
        <Button
          type="submit"
          fontSize={20}
          my={18}
          bgColor="blue"
          disabled={isQuerying}
          loading={isQuerying}
          loadingText="Checking ERC-20 Tokens Balance..."
        >
          Check ERC-20 Tokens Balance
        </Button>

        <Heading>ERC-20 tokens balance:</Heading>
        {isQuerying
          ? <Text>This might take a while...</Text>
          : !erc20Tokens
            ? <Text>Please make a query!</Text>
            : !erc20Tokens.tokenBalances.length
              ? <Text>{erc20Tokens.address} doesn't have any ERC-20 token</Text>
              : <SimpleGrid w="90vw" columns={4}>
                {erc20Tokens.tokenBalances
                  .filter(
                    ({ error }) => !error
                  )
                  .map(
                    (token) => <Token
                      key={token.contractAddress}
                      token={token}
                      alchemy={alchemy}
                    />
                  )}
              </SimpleGrid>
        }
      </Flex>
    </form>
  </Box>;
}

export default App;
