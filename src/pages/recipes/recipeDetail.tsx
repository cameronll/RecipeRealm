import React, {useState, useEffect, useRef} from 'react';
import {
  Box,
  Button,
  Center,
  HStack,
  VStack,
  Image,
  Heading,
  Text,
  Container,
} from '@chakra-ui/react';
import {useReactToPrint} from 'react-to-print';
import Navbar from '../../components/Navbar';
import {AiFillPrinter} from 'react-icons/ai';

const RecipeDetail: React.FC = () => {
  const componentRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current!,
    documentTitle: 'emp-data',
    onAfterPrint: () => alert('Print Success'),
  });

  function recipeSize(ing: number) {
    return 17 - ing * 0.2 + 'px';
  }

  return (
    <>
      <Navbar />
      {/* <Box ref={componentRef}> Bigger page of all Details of Recipe</Box> */}
      <Center>
        <Button
          marginTop={3}
          boxShadow="xs"
          rounded="md"
          variant="solid"
          colorScheme="teal"
          marginBottom={3}
          padding={5}
          width={1000}
          maxW="container.lg"
          onClick={handlePrint}>
          <AiFillPrinter />
          <Text marginLeft={2}>Print Recipe</Text>
        </Button>
      </Center>
      <Center>
        <Box w="60%" p={4} rounded={40}>
          <Center>
            <Box
              ref={componentRef}
              bg="lightgray"
              w="100%"
              p={4}
              color="white"
              rounded={40}>
              <VStack>
                <Box w="100%" bgColor={'#36989c'} rounded={40}>
                  <Image
                    borderRadius="30px"
                    src={'newlogoteal.png'}
                    alt="Logo"
                    w={120}
                  />
                </Box>
                <Heading>
                  {
                    JSON.parse(
                      window.localStorage.getItem('VIEWRECIPE') as string,
                    ).recipe_name
                  }
                </Heading>
                <HStack alignItems={'start'} width="100%" paddingBottom={8}>
                  <Box
                    w="60%"
                    padding="8"
                    boxShadow="xs"
                    rounded="md"
                    marginRight={10}
                    bg="white"
                    color="black"
                    minHeight="400">
                    <Text noOfLines={2} fontSize={25} marginBottom={5}>
                      Ingredients:
                    </Text>
                    <ul>
                      <li>Ingredient 1</li>Ingredient 1<li>Ingredient 1</li>
                      Ingredient 1<li>Ingredient 1</li>Ingredient 1
                      <li>Ingredient 1</li>
                    </ul>
                  </Box>

                  <Container>
                    <Center>
                      <Image
                        borderRadius="30px"
                        src={
                          JSON.parse(
                            window.localStorage.getItem('VIEWRECIPE') as string,
                          ).pic
                        }
                        alt="Logo"
                        w={480}
                        height={400}
                      />
                    </Center>
                  </Container>
                </HStack>
              </VStack>
              <HStack width="100%">
                <VStack>
                  <Box
                    boxShadow="xs"
                    rounded="md"
                    marginRight={10}
                    bg="white"
                    color="black"
                    width="90%"
                    marginBottom={5}
                    padding={5}>
                    {/* displaying recipe data */}
                    <Text noOfLines={2} fontSize={17}>
                      Difficulty:{' '}
                      {
                        JSON.parse(
                          window.localStorage.getItem('VIEWRECIPE') as string,
                        ).difficulty
                      }
                    </Text>
                    <Text noOfLines={2} fontSize={17}>
                      Time:{' '}
                      {
                        JSON.parse(
                          window.localStorage.getItem('VIEWRECIPE') as string,
                        ).cooking_time
                      }
                    </Text>
                    <Text noOfLines={2} fontSize={17}>
                      Servings:{' '}
                      {
                        JSON.parse(
                          window.localStorage.getItem('VIEWRECIPE') as string,
                        ).servings
                      }
                    </Text>
                    <Text noOfLines={2} fontSize={17}>
                      Cost Per Serving:{' '}
                      {
                        JSON.parse(
                          window.localStorage.getItem('VIEWRECIPE') as string,
                        ).cost
                      }
                    </Text>
                    <Text noOfLines={2} fontSize={17}>
                      Cooking Applications:{' '}
                      {
                        JSON.parse(
                          window.localStorage.getItem('VIEWRECIPE') as string,
                        ).cooking_applications
                      }
                    </Text>
                    <Text noOfLines={2} fontSize={17}>
                      Allergens:{' '}
                      {
                        JSON.parse(
                          window.localStorage.getItem('VIEWRECIPE') as string,
                        ).allergens
                      }
                    </Text>
                  </Box>
                  <Box
                    boxShadow="xs"
                    rounded="md"
                    marginRight={10}
                    bg="white"
                    color="black"
                    width="90%"
                    height="188px"
                    marginBottom={5}
                    padding={5}
                    paddingBlock={2}>
                    <Text noOfLines={2} fontSize={20}>
                      Notes
                    </Text>
                  </Box>
                </VStack>
                <Box
                  w="60%"
                  padding="8"
                  boxShadow="xs"
                  rounded="md"
                  marginRight={10}
                  bg="white"
                  color="black"
                  minHeight="400">
                  {' '}
                  <Text noOfLines={2} fontSize={25} marginBottom={5}>
                    Instructions:
                  </Text>
                  {
                    JSON.parse(
                      window.localStorage.getItem('VIEWRECIPE') as string,
                    ).instructions
                  }
                </Box>
              </HStack>
            </Box>
          </Center>
        </Box>
      </Center>
    </>
  );
};

export default RecipeDetail;
