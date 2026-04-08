import { useEffect, useState } from "react";
import { Button, Flex, Heading } from "@chakra-ui/react";
import { useConnect, useConnectors, type Connector } from "wagmi";

export function WalletsOption() {
  const connectors = useConnectors();
  const connect = useConnect();

  function WalletOption(props: { connector: Connector; onClick: () => void; }) {
    const { connector, onClick } = props;
    const [ready, setReady] = useState(false);

    useEffect(() => {
      if (!ready) connector
        .getProvider()
        .then(
          (provider) =>
            setReady(() => !!provider)
        )
        .catch(console.error);
    }, [connector]);

    return <Button
      my={1.5}
      fontSize={20}
      bgColor="blue"
      disabled={!ready}
      onClick={onClick}
    >
      {connector.name}
    </Button>;
  }

  return <Flex alignItems="center" justifyContent="center" flexDirection="column" gap="1.5">
    <Heading>Connect your wallet:</Heading>
    {connectors.map(
      (connector) =>
        <WalletOption
          key={connector.uid}
          connector={connector}
          onClick={
            () =>
              connect.mutate({ connector })
          }
        />
    )}
  </Flex>;
}
