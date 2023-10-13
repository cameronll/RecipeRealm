import React from 'react';
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
  return (
    <>
      <Navbar />
      <Link to="/CreateRecipe">
        <Button>Create Recipe</Button>
      </Link>
    </>
  );
};

export default Recipes;
