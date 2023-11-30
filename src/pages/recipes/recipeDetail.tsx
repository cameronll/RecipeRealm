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

const RecipeDetail: React.FC = () => {
  const componentRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current!,
    documentTitle: 'emp-data',
    onAfterPrint: () => alert('Print Success'),
  });

  return (
    <>
      <Navbar />
      {/* <Box ref={componentRef}> Bigger page of all Details of Recipe</Box> */}
      <Center>
        <Box w="60%" p={4}>
          <Center>
            <Box ref={componentRef} bg="lightgray" w="100%" p={4} color="white">
              <VStack>
                <Box w="100%" bgColor={'teal.500'}>
                  <Image
                    borderRadius="30px"
                    src="newlogoteal.png"
                    alt="Logo"
                    w={120}
                  />
                </Box>
                <Heading>Recipe Title</Heading>
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
                        src="Baked-Stuffed-Pork-Chops-square.jpg"
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
                    marginBottom={5}>
                    {/* displaying recipe data */}
                    <Text noOfLines={2} fontSize={20}>
                      Difficulty: recipe.data.difficulty
                    </Text>
                    <Text noOfLines={2} fontSize={20}>
                      Time: recipe.data.cooking_time
                    </Text>
                    <Text noOfLines={2} fontSize={20}>
                      Servings: recipe.data.servings
                    </Text>
                    <Text noOfLines={2} fontSize={20}>
                      Cost Per Serving: recipe.data.cost_per_serving
                    </Text>
                    <Text noOfLines={2} fontSize={20}>
                      Cooking Applications: recipe.data.cooking_applications
                    </Text>
                    <Text noOfLines={2} fontSize={20}>
                      Allergens: recipe.data.allergens
                    </Text>
                  </Box>
                  <Box
                    boxShadow="xs"
                    rounded="md"
                    marginRight={10}
                    bg="white"
                    color="black"
                    width="90%"
                    height="170px"
                    marginBottom={5}
                    paddingBlock={2}>
                    Notes
                    <Text noOfLines={2} fontSize={20}></Text>
                  </Box>
                </VStack>
                <Box
                  w="50%"
                  padding="8"
                  boxShadow="xs"
                  rounded="md"
                  marginRight={10}
                  bg="white"
                  color="black"
                  minHeight="400">
                  {' '}
                  <Text noOfLines={2} fontSize={25} marginBottom={5}>
                    Ingredients:
                  </Text>
                  Pink ponies and purple giraffes roamed the field. Cotton candy
                  grew from the ground as a chocolate river meandered off to the
                  side. What looked like stones in the pasture were actually
                  rock candy. Everything in her dream seemed to be perfect
                  except for the fact that she had no mouth.
                </Box>
              </HStack>
            </Box>
          </Center>
        </Box>
      </Center>
      <Button onClick={handlePrint}> Print this out</Button>
    </>
  );
};

export default RecipeDetail;
