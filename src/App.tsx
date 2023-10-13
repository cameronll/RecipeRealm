import * as React from 'react';
import {ChakraProvider, theme} from '@chakra-ui/react';
import Login from './pages/login/login';
import Footer from './components/Footer';
import LoginNavbar from './components/LoginNav';
import CalendarPage from './pages/calendar';
import Profile from './pages/profile';
import Recipes from './pages/myrecipes';
// import {
//   createBrowserRouter,
//   Route,
//   createRoutesFromElements,
//   RouterProvider,
// } from 'react-router-dom';
// import RootLayout from './layouts/RootLayout';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import SignUp from './pages/login/signup';
import CreateRecipe from './pages/recipes/CreateRecipe';
import Explore from './pages/explore';

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/" element={<RootLayout />}>
//       <Route index element={<Calendar />} />
//       <Route path="Profile" element={<Profile />} />
//       <Route path="Recipes" element={<Recipes />} />
//       <Route path="Login" element={<Login />} />
//     </Route>,
//   ),
// );

export const App = () => (
  <ChakraProvider theme={theme}>
    {/* <RouterProvider router={router} /> */}
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
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
