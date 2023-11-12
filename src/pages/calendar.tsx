import React, { useState } from 'react';
import {db, storage} from '../firebaseConfig';
import {Whisper, Popover, Badge} from 'rsuite';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  where,
  query,
  getCountFromServer,
  onSnapshot,
  deleteDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import Navbar from '../components/Navbar';
import {
  Box,
  Button,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
  VStack,
  Flex,
  Stack,
  Text,
  useBreakpointValue,
  Center,
  Image,
  HStack,
  border,
  Input,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Select,
} from '@chakra-ui/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Calendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

// export default class App extends React.Component {
//   render() {
//     return (
//       <HStack>
//         <Box>
//           <FullCalendar
//             plugins={[ dayGridPlugin ]}
//             initialView="dayGridMonth"
//             aspectRatio={3}
//             handleWindowResize={true}
//             //height="auto"
//           />
//         </Box>
//       </HStack>
//     )
//   }//export default Calendar;
// }
type nutrition = {
  calories: number;
  total_fat: number;
  saturated_fat: number;
  cholesterol: number;
  sodium: number;
  total_carbohydrate: number;
  dietary_fiber: number;
  sugars: number;
  protein: number;
};

type recipe = {
  recipe_name: string;
  servings: string;
  allergens: string;
  cooking_applications: string;
  cooking_time: string;
  cost_per_serving: string;
  difficulty: string;
  posted: boolean;
  ingredients: string[];
  instructions: string;
  nutrients: nutrition;
};

type event = {
  recipe: recipe
  date: string
  title: string
};

function getRecipeIndex(recipes: any[], recipe_name: string): number {
  for (let i = 0; i < recipes.length; i++) {
    if (recipes[i]?.data.recipe_name === recipe_name) {
      return i;
    }
  }
  return -1;
}

function getTodoList(date: {getDate: () => any}) {
  const day = date.getDate();

  switch (day) {
    case 10:
      return [
        {time: '10:30 am', title: 'Meeting'},
        {time: '12:00 pm', title: 'Lunch'},
      ];
    case 15:
      return [
        {time: '09:30 pm', title: 'Products Introduction Meeting'},
        {time: '12:30 pm', title: 'Client entertaining'},
        {time: '02:00 pm', title: 'Product design discussion'},
        {time: '05:00 pm', title: 'Product test and acceptance'},
        {time: '06:30 pm', title: 'Reporting'},
        {time: '10:00 pm', title: 'Going home to walk the dog'},
      ];
    default:
      return [];
  }
}

const CalendarPage: React.FC = () => {
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const savedRecipesQuery = query(collection(db, 'users/' + email + '/SavedRecipes'));
  const [savedRecipes, savedRecipesLoading, savedRecipesError] = useCollectionData(savedRecipesQuery);

  const recipesQuery = query(collection(db, 'users/' + email + '/Recipes'));
  const [recipes, recipesLoading, recipesError] = useCollectionData(recipesQuery);

  const [profile, profileLoading, profileError] = useDocumentData(doc(db, 'users/', email));

  const [date, setDate] = useState('');
  const [recipeName, setRecipeName] = useState<any>();
  const [events, setEvents] = useState<any>([]);

  function renderCell(date: any) {
    const list = getTodoList(date);
    const displayList = list.filter((item, index) => index < 2);

    if (list.length) {
      const moreCount = list.length - displayList.length;
      const moreItem = (
        <li>
          <Whisper
            placement="top"
            trigger="click"
            speaker={
              <Popover>
                {list.map((item, index) => (
                  <p key={index}>
                    <b>{item.time}</b> - {item.title}
                  </p>
                ))}
              </Popover>
            }>
            <a>{moreCount} more</a>
          </Whisper>
        </li>
      );
    }
    return null;
  }

  function getSavedRecipes(){
    return(
      <option></option>
    )
  }

  const handleRecipeChange = (e: any) => {
    const targ = e.target.value;
    setRecipeName(targ);
  };

  const handleDateChange = (e: any) => {
    const targ = e.target.value;
    setDate(targ);
  };

  const handleSubmit = async (recipe_name: string, date: string) => {
    if (recipes){
      const newEvent:event = {
        recipe: recipes[getRecipeIndex(recipes, recipe_name)].data,
        date: date,
        title: recipe_name
      }
      const docRef = doc(db, 'users', email)
      await updateDoc(docRef, {
        events: arrayUnion(newEvent)
      });
    }
  };

  function ScheduleRecipe() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = React.useRef()

    return (
      <>
        <Button alignSelf={'right'} /*ref={btnRef}*/ colorScheme='teal' onClick={onOpen}>
          Schedule Recipe
        </Button>
        <Drawer
          isOpen={isOpen}
          placement='right'
          onClose={onClose}
          size={'sm'}
          // finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Schedule a recipe for a specific time!</DrawerHeader>

            <DrawerBody>
              <Text padding={'15px'}>Pick a date:</Text>
              <Input placeholder='Enter date here...' onChange={handleDateChange}/>
              <Text padding={'15px'}>Choose the recipe:</Text>
              <Select
               size={'md'}
               value={recipeName}
               onChange={handleRecipeChange}>
                {/* {savedRecipes?.map(recipe => (
                  <option>{recipe.data.recipe_name}</option>
                ))} */}
                {/* This block belowwwww*/}
                {recipes?.map(recipe => (
                  <option>{recipe?.data.recipe_name}</option>
                ))}
                {/*This block right here Brody^^^^^^*/}
              </Select>
            </DrawerBody>
  
            <DrawerFooter>
              <Button variant='outline' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='green'
              onClick = {() => handleSubmit(recipeName, date)}>
                Save</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    )
  }
  //ScheduleRecipe()

  return (
    <>
      <Navbar />
      <Flex
        w={'full'}
        h={'100'}
        backgroundSize={'cover'}
        backgroundPosition={'center center'}
        alignContent={'flex-end'}
        backgroundColor="rgba(0, 128, 128, 0.7)">
        <VStack
          w={'full'}
          px={useBreakpointValue({base: 4, md: 8})}
          backgroundColor="rgba(0, 128, 128, 0.7)">
          <Stack maxW={'2xl'} spacing={6}>
            <Text textAlign="center" fontSize="6xl" as="b" textColor="white">
              Calendar
            </Text>
          </Stack>
        </VStack>
      </Flex>
      <HStack height={'auto'} padding={'25px'}>
        <VStack w={'50%'} align={'left'}>
          <Container>
            <FullCalendar
              plugins={[interactionPlugin, dayGridPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              aspectRatio={.95}
              handleWindowResize={true}
              expandRows={true}
              dayMaxEvents={true}
              events={profile?.events}
            />
          </Container>
          <Container>
            {ScheduleRecipe()}
          </Container>
        </VStack>
        <Container textAlign={"center"}>
          <Text>
            Select Day to View Meal Plan Info
          </Text>
        </Container>
      </HStack>
    </>
  );
};

export default CalendarPage;
