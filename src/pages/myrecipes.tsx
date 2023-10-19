import React, { useState, useEffect, useRef } from 'react';
import {db} from '../firebaseConfig';
import {collection, addDoc, doc, setDoc, getDoc, getDocs} from "firebase/firestore";
import { browserLocalPersistence, getAuth, onAuthStateChanged, setPersistence } from "firebase/auth";
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

const auth = getAuth();
const user = auth.currentUser;

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const email_from_storage:any = window.localStorage.getItem('EMAIL')
    if (email_from_storage !== 'null'){
      setEmail(JSON.parse(email_from_storage));
    }
  }, [])

  useEffect(() => {
    if (user){
      setEmail(user.email);
    }
    async function getRecipes() {
      window.localStorage.setItem('EMAIL', JSON.stringify(email));
      const querySnapshot = await getDocs(collection(db, "users/" + email + "/Recipes"));
      const recipesData = querySnapshot.docs.map((doc) => doc.data());
      setRecipes(recipesData);
    }
    getRecipes();
  }, [email]);

  return (
    <>
      <Navbar />
      <Link to="/CreateRecipe">
        <Button
        onClick={() => {
          console.log(recipes);
        }}>
          Create Recipe
        </Button>
      </Link>
        <Button
        onClick={() => {
          for (let i = 0; i < recipes.length; i++){
            console.log(recipes[i]);
          }
        }}>
          Test
        </Button>
    </>
  );
};
export default Recipes;