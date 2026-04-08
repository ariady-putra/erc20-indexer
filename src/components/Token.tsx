import { useEffect, useState } from "react";
import { Box, Flex, Highlight, Image, SkeletonCircle, SkeletonText, VStack } from "@chakra-ui/react";
import { Alchemy, Utils, type TokenBalance, type TokenMetadataResponse } from "alchemy-sdk";

export default function Token(props: { alchemy: Alchemy, token: TokenBalance; }) {
  const { alchemy, token } = props;

  const [metadata, setMetadata] = useState<TokenMetadataResponse>();

  useEffect(() => {
    alchemy.core
      .getTokenMetadata(token.contractAddress)
      .then(setMetadata)
      .catch(console.error);
  }, []);

  if (!metadata) return <VStack
    borderRadius="md"
    aspectRatio="square"
    bg="blue.muted"
    m="4"
    p="4"
  >
    <SkeletonText noOfLines={2} />
    <SkeletonCircle size="1/2" my="auto" />
  </VStack>;

  return <Flex
    borderRadius="md"
    flexDir="column"
    color="white"
    bg="blue.muted"
    m="4"
    p="4"
  >
    <Box fontWeight="bold">
      <Highlight query="Symbol: " styles={{ fontWeight: "normal" }}>
        {`Symbol: ${metadata.symbol}`}
      </Highlight>
    </Box>

    <Box fontWeight="bold">
      <Highlight query="Balance: " styles={{ fontWeight: "normal" }}>
        {`Balance: ${Utils.formatUnits(
          `${token.tokenBalance}`,
          `${metadata.decimals}`,
        )}`}
      </Highlight>
    </Box>

    <Image src={`${metadata.logo}`} fit="scale-down" />
  </Flex>;
}
