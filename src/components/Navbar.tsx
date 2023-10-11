import {Image, Link, Switch} from '@chakra-ui/react';
import {Link as ReactRouterLink} from 'react-router-dom';
import {Link as ChakraLink, LinkProps} from '@chakra-ui/react';
//import Calendar from './pages/Calendar';
//import Profile from './pages/profile';

<ChakraLink as={ReactRouterLink} to="/home">
  Home
</ChakraLink>;

import {
  Router,
  Route,
  Routes,
  useResolvedPath,
  useMatch,
} from 'react-router-dom';
import {FaBars, FaTimes} from 'react-icons/fa';

export default function Navbar() {
  return (
    <nav>
      <Image borderRadius="30px" src="logo192.png" alt="Logo" w={550} mb={15} />
      <ul style={{listStyle: 'none', display: 'flex', gap: '20px'}}>
        <ChakraLink as={ReactRouterLink} to="Calendar">
          Home
        </ChakraLink>
        <ChakraLink as={ReactRouterLink} to="./pages/Recipes">
          Home
        </ChakraLink>
        <ChakraLink as={ReactRouterLink} to="./pages/">
          Home
        </ChakraLink>
        <ChakraLink as={ReactRouterLink} to="./pages/">
          Home
        </ChakraLink>
      </ul>
    </nav>
  );
}
