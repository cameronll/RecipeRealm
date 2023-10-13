import React from 'react';
import {Flex, Box, Input, Button, Image, Spacer} from '@chakra-ui/react';
import {NavLink, Outlet} from 'react-router-dom';

function RootLayout(): React.JSX.Element {
  return (
    <Flex>
      <header>
        <nav>
          <NavLink to="/">Calendar</NavLink>
          <NavLink to="Profile">Profile</NavLink>
          <NavLink to="Recipes">My Recipes</NavLink>
          <NavLink to="Login">Login</NavLink>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </Flex>
  );
}
export default RootLayout;
