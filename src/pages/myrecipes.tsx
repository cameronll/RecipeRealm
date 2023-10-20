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
  var auth:any;
  var user:any;

  useEffect(() => {
    auth = getAuth();
  }, []);

  useEffect(() => {
    user = auth.currentUser;
    console.log(user);
    const email_from_storage: any = window.localStorage.getItem('EMAIL');
    if (email_from_storage !== null) {
      setEmail(JSON.parse(email_from_storage));
    }
    if (user){
      setEmail(user.email);
    }
  }, [auth]);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      window.localStorage.setItem('EMAIL', JSON.stringify(user.email));
    }

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
            window.localStorage.clear();
          }}>
          Create Recipe
        </Button>
        <ul>{recipesList}</ul>
      </Link>
    </>
  );
};
export default Recipes;