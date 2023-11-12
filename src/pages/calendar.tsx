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
import { useCollectionData } from 'react-firebase-hooks/firestore';

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
  const [recipes, setRecipes] = useState<any[]>([]);


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
              <Input placeholder='Enter date here...' />
              <Text padding={'15px'}>Choose the recipe:</Text>
              <Select size={'md'}>
                {savedRecipes?.map(recipe => (
                  <option>{recipe.data.recipe_name}</option>
                ))}
                {/* This block belowwwww*/}
                {recipes.map(recipe => (
                  <option>{recipe?.data.recipe_name}</option>
                ))}
                {/*This block right here Brody^^^^^^*/}
              </Select>
            </DrawerBody>
  
            <DrawerFooter>
              <Button variant='outline' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='green'>Save</Button>
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
              aspectRatio={.9}
              handleWindowResize={true}
              expandRows={true}
              dayMaxEvents={true}
              events={[
                {title: 'event 1', date: '2023-11-01'},
                {title: 'event 2', date: '2023-11-01'},
                {title: 'event 3', date: '2023-11-01'},
              ]}
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
