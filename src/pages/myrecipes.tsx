import React, {useState, useEffect, useRef} from 'react';
import {db} from '../firebaseConfig';
import {AiOutlineHeart} from 'react-icons/ai';
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
} from '@chakra-ui/react';
import {Link} from 'react-router-dom';

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);

  useEffect(() => {
    async function getRecipes() {
      const querySnapshot = await getDocs(
        collection(db, 'users/' + email + '/Recipes'),
      );
      const recipesData = querySnapshot.docs.map(doc => doc.data());
      setRecipes(recipesData);
    }
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
      <Link to="/CreateRecipe">
        <Button
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
      <VStack>
        {recipes.map(recipe => (
          <Container
            maxW="container.sm"
            bg="blue.600"
            color="white"
            minH="350"
            display="flex"
            flexDirection="column"
            boxShadow="xs"
            rounded="md"
            padding="4">
            <div style={{flex: 1, fontSize: '24px'}}>
              {recipe.data.recipe_name}
            </div>

            <AiOutlineHeart style={{fontSize: '24px'}} />
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
              <h1>Cooking Applications: {recipe.data.cooking_applications}</h1>
              <h1>Allergens: {recipe.data.allergens}</h1>
            </Box>
            <Box padding="4" bg="blue.200" color="black" maxW="container.sm">
              <h1>Calories: {recipe.data.nutrients.calories}</h1>
              <h1>Protein: {recipe.data.nutrients.protein}</h1>
              <h1>Carbs: {recipe.data.nutrients.total_carbohydrate}</h1>
              <h1>Fat: {recipe.data.nutrients.total_fat}</h1>
            </Box>
            
            <Box padding="4" bg="blue.100" color="black" maxW="container.sm">
              <h1>Instructions: {recipe.data.instructions}</h1>
            </Box>
          </Container>
        ))}
      </VStack>
    </>
  );
};
export default Recipes;
