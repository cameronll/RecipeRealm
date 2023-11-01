import React, {useState, useEffect, useRef} from 'react';
import {db} from '../firebaseConfig';
import {AiOutlineHeart} from 'react-icons/ai';
import {CgBowl} from 'react-icons/cg';
import {BsWindow, BsFillChatDotsFill, BsKanbanFill} from 'react-icons/bs';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
} from 'firebase/auth';
import Navbar from '../components/Navbar';
import {
  Box,
  useColorModeValue,
  Stack,
  Avatar,
  Text,
  Button,
  VStack,
  Container,
  Flex,
  SimpleGrid,
  HStack,
  Input,
  Heading,
  Center,
  Badge,
  FormControl,
  FormLabel,
  Textarea,
  FormHelperText,
  AbsoluteCenter,
  Select,
  Icon,
  Image,
  StackDivider,
} from '@chakra-ui/react';
import {Link} from 'react-router-dom';

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>();
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);

  useEffect(() => {
    async function getRecipes() {
      const querySnapshot = await getDocs(
        collection(db, 'users/' + email + '/Recipes'),
      );
      const recipesData = querySnapshot.docs.map(doc => doc.data());
      setRecipes(recipesData);
    }
    async function getProfile() {
      const docRef = doc(db, 'users/', email);
      const docSnap = await getDoc(docRef);
      setProfile(docSnap.data());
    }
    getProfile();
    getRecipes();
  }, []);

  /*
  data that can be displayed: 
  recipe.data.<recipe_name, difficulty, allergens, cooking_time, cost_per_serving, instructions, servings>
  recipe.data.nutrients.<calories, cholesterol, 
      dietary_fiber, protein, saturated_fat, sodium, sugars, total_carbohydrate, total_fat>
  */

  // example display
  const recipesList = recipes.map(recipe => (
    <div id="my-recipe-tiles" key={recipe.data.recipe_name}>
      {[
        'Name: ',
        recipe.data.recipe_name,
        ' Difficulty: ',
        recipe.data.difficulty,
        ' Calories: ',
        recipe.data.nutrients.calories,
      ]}
    </div>
  ));

  return (
    <>
      <Navbar />
      <Container maxW={'5xl'} py={12}>
        <HStack spacing="65px">
          <Stack spacing={4}>
            <Text
              textTransform={'uppercase'}
              color={'blue.400'}
              fontWeight={600}
              fontSize={'sm'}
              bg={useColorModeValue('blue.50', 'blue.900')}
              p={2}
              alignSelf={'flex-start'}
              rounded={'md'}>
              {}
            </Text>
            <Heading>{profile?.username}'s Page</Heading>
            <h1>{recipes.length} Recipes</h1>
            <Text color={'gray.500'} fontSize={'lg'}>
              {profile?.biography}
            </Text>
            <Stack
              spacing={4}
              divider={
                <StackDivider
                  borderColor={useColorModeValue('gray.100', 'gray.700')}
                />
              }>
              {/* <Box
                icon={
                  <Icon
                    as={IoAnalyticsSharp}
                    color={'yellow.500'}
                    w={5}
                    h={5}
                  />
                }
                iconBg={useColorModeValue('yellow.100', 'yellow.900')}
                text={'Business Planning'}
              />
              <Feature
                icon={
                  <Icon as={IoLogoBitcoin} color={'green.500'} w={5} h={5} />
                }
                iconBg={useColorModeValue('green.100', 'green.900')}
                text={'Financial Planning'}
              />
              <Feature
                icon={
                  <Icon as={IoSearchSharp} color={'purple.500'} w={5} h={5} />
                }
                iconBg={useColorModeValue('purple.100', 'purple.900')}
                text={'Market Analysis'}
              /> */}
            </Stack>
          </Stack>
          <Stack>
            <Image
              rounded={'md'}
              alt={'feature image'}
              src={
                'https://i.ytimg.com/vi/3EDFSswI29c/hqdefault.jpg?sqp=-oaymwE9CNACELwBSFryq4qpAy8IARUAAAAAGAElAADIQj0AgKJDeAHwAQH4AbYIgALQBYoCDAgAEAEYZSBZKEgwDw==&rs=AOn4CLDJAwWFyjufCBlFlIm1PDteqDDfCA'
              }
              objectFit={'cover'}
            />
          </Stack>
          <Stack>
            <Link to="/CreateRecipe">
              <Button
                w="200px"
                rightIcon={<CgBowl />}
                colorScheme="teal"
                onClick={() => {
                  window.localStorage.removeItem('RECIPENAME');
                  window.localStorage.removeItem('COOKINGTIME');
                  window.localStorage.removeItem('DIFFICULTY');
                  window.localStorage.removeItem('APPLIANCES');
                  window.localStorage.removeItem('COST');
                  window.localStorage.removeItem('ALLERGENS');
                  window.localStorage.removeItem('SERVINGS');
                  window.localStorage.removeItem('INSTRUCTIONS');
                  window.localStorage.removeItem('INGREDIENTSTRING');
                  window.localStorage.removeItem('INGREDIENTCOUNT');
                }}>
                Create Recipe
              </Button>
            </Link>
            <Link to="/Posts">
              <Button w="200px" rightIcon={<BsWindow />} colorScheme="gray">
                Create Post
              </Button>
            </Link>
          </Stack>
        </HStack>
      </Container>
      <VStack
        w={'full'}
        h={'100'}
        backgroundImage={
          'url(https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.dreamstime.com%2Fphotos-images%2Ffood-background.html&psig=AOvVaw19YTiVWLg69rXtH_pxsMAt&ust=1698854868045000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCLjS8djVoIIDFQAAAAAdAAAAABAJ)'
        }
        bgGradient="linear(to-t, teal.200, gray)"
        dropShadow="lg">
        <Box margin={4} textAlign="center">
          <Heading
            size="lg"
            fontSize="50px"
            textAlign="center"
            alignSelf={'center'}>
            {profile?.username}'s Recipes
          </Heading>
        </Box>
      </VStack>

      <HStack spacing={10}>
        <Box>
          <SimpleGrid columns={3} padding={3}>
            {recipes.map(recipe => (
              <Container
                minW="sm"
                borderRadius="lg"
                overflow="hidden"
                justify-content="space-between"
                backgroundColor="rgba(0, 128, 128, 0.7)"
                minH="350"
                display="flex"
                flexDirection="column"
                boxShadow="xs"
                rounded="md"
                padding={4}
                margin={4}
                marginRight={10}
                marginLeft={10}>
                <VStack shadow={'xs'} align="stretch">
                  <Box rounded="md" bg="#D3D3D3" w="100%" p={4} color="white">
                    <Button
                      variant="link"
                      rounded="md"
                      as="h3"
                      size="lg"
                      color="black"
                      padding={1}>
                      {recipe.data.recipe_name}
                    </Button>
                  </Box>
                  <Stack direction="row" spacing={4} align="stretch">
                    <Button variant="link" colorScheme="red">
                      <AiOutlineHeart style={{fontSize: '34px'}} />
                    </Button>
                    <Button variant="link" colorScheme="green">
                      <BsFillChatDotsFill style={{fontSize: '34px'}} />
                    </Button>
                  </Stack>

                  <Box
                    boxShadow="xs"
                    rounded="md"
                    padding="4"
                    bg="blue.400"
                    color="black"
                    maxW="container.sm">
                    <h1>Difficulty: {recipe.data.difficulty}</h1>
                    <h1>Time: {recipe.data.cooking_time}</h1>
                    <h1>Servings: {recipe.data.servings}</h1>
                    <h1>Cost Per Serving: {recipe.data.cost_per_serving}</h1>
                    <h1>
                      Cooking Applications: {recipe.data.cooking_applications}
                    </h1>
                    <h1>Allergens: {recipe.data.allergens}</h1>
                  </Box>
                  {/* <Box
                    padding="4"
                    bg="blue.200"
                    color="black"
                    maxW="container.sm">
                    <h1>Calories: {recipe.data.nutrients.calories}</h1>
                    <h1>Protein: {recipe.data.nutrients.protein}</h1>
                    <h1>Carbs: {recipe.data.nutrients.total_carbohydrate}</h1>
                    <h1>Sugar: {recipe.data.nutrients.sugars}</h1>
                    <h1>Fat: {recipe.data.nutrients.total_fat}</h1>
                    <h1>
                      Saturated Fat: {recipe.data.nutrients.saturated_fat}
                    </h1>
                    <h1>Cholesterol: {recipe.data.nutrients.cholesterol}</h1>
                    <h1>Sodium: {recipe.data.nutrients.sodium}</h1>
                    <h1>Fiber: {recipe.data.nutrients.dietary_fiber}</h1>
                  </Box>

                  <Box
                    padding="4"
                    bg="blue.100"
                    color="black"
                    maxW="container.sm">
                    <h1>Instructions: {recipe.data.instructions}</h1>
                  </Box> */}
                </VStack>
              </Container>
            ))}
          </SimpleGrid>
        </Box>
      </HStack>
    </>
  );
};
export default Recipes;
