import React, {useState, useEffect, useRef} from 'react';
import {db} from '../firebaseConfig';
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
} from '@chakra-ui/react';
import {Link} from 'react-router-dom';

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(JSON.parse(localStorage.getItem('EMAIL') as string));
  }, []);

  useEffect(() => {
    async function getRecipes() {
      const querySnapshot = await getDocs(
        collection(db, 'users/' + email + '/Recipes'),
      );
      const recipesData = querySnapshot.docs.map(doc => doc.data());
      setRecipes(recipesData);
    }
    getRecipes();
  }, [email]);

  const recipesList = recipes.map(recipe => (
    <li key="{recipe.data.recipe_name}">{["Name: ", recipe.data.recipe_name, "    Difficulty: ", recipe.data.difficulty]}</li>
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
          }}>
          Create Recipe
        </Button>
        <ul>{recipesList}</ul>
      </Link>
    </>
  );
};
export default Recipes;