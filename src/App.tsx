import * as React from 'react';
import {ChakraProvider, theme} from '@chakra-ui/react';
import Posts from './pages/posts/posts';
import Feed from './pages/posts/feed';
import Friends from './pages/friends';
import Login from './pages/login/login';
import Footer from './components/Footer';
import LoginNavbar from './components/LoginNav';
import CalendarPage from './pages/calendar';
import Profile from './pages/profile';
import Recipes from './pages/myrecipes';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import SignUp from './pages/login/signup';
import CreateRecipe from './pages/recipes/CreateRecipe';
import Explore from './pages/explore';
//Theme

export const App = () => (
  <ChakraProvider theme={theme}>
    {/* <RouterProvider router={router} /> */}
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
        <Route path="Feed" element={<Feed />} />
        <Route path="Posts" element={<Posts />} />
        <Route path="Friends" element={<Friends />} />
        <Route path="Calendar" element={<CalendarPage />} />
        <Route path="Profile" element={<Profile />} />
        <Route path="Recipes" element={<Recipes />} />
        <Route path="Login" element={<Login />} />
        <Route path="Signup" element={<SignUp />} />
        <Route path="Explore" element={<Explore />} />
        <Route path="CreateRecipe" element={<CreateRecipe />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </ChakraProvider>
);
