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
  SimpleGrid,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from '@chakra-ui/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Calendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { AiFillPrinter } from 'react-icons/ai';

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
    if (recipes[i]?.data.recipe_name.localeCompare(recipe_name) === 0) {
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

  const handleRecipeChange = (e: any) => {
    const targ = e.target.value;
    setRecipeName(targ);
  };

  const handleDateChange = (e: any) => {
    const targ = e.target.value;
    setDate(targ);
  };

  const handleSubmit = async (recipe_name: string, date: string) => {
    if (recipes && savedRecipes){
      var index = getRecipeIndex(recipes, recipe_name);
      if (index === -1){
        index = getRecipeIndex(savedRecipes, recipe_name);
        const newEvent:event = {
          recipe: savedRecipes[index].data,
          date: date,
          title: recipe_name
        }
        const docRef = doc(db, 'users', email)
        await updateDoc(docRef, {
          events: arrayUnion(newEvent)
        });
      }
      else{
        const newEvent:event = {
          recipe: recipes[index].data,
          date: date,
          title: recipe_name
        }
        const docRef = doc(db, 'users', email)
        await updateDoc(docRef, {
          events: arrayUnion(newEvent)
        });
      }
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
          size={'md'}
          // finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader 
            bg={'teal'} 
            paddingTop={'40px'} 
            paddingBottom={'40px'}
            fontSize={'30px'}
            textAlign={'center'}
            color={'white'}>
              Choose when to schedule your meal!
            </DrawerHeader>

            <DrawerBody paddingTop={'20px'}>
              <Text padding={'20px'} fontSize={'20px'} fontWeight={'600'}>
                Enter a date: <br/>(include dashes when entering date, <br/>include "T" when specifying time of day)
              </Text>
              <Input outlineColor={'teal'} placeholder='yyyy-mm-ddThh:mm:ss' onChange={handleDateChange}/>
              <Text padding={'25px'} fontSize={'20px'} fontWeight={'600'}>Choose the recipe:</Text>
              <Select
               size={'lg'}
               value={recipeName}
               outlineColor={'teal'}
               placeholder='Click to select...'
               onChange={handleRecipeChange}>
                {recipes?.map(recipe => (
                  <option>{recipe?.data.recipe_name}</option>
                ))}
                {savedRecipes?.map(recipe => (
                  <option>{recipe.data.recipe_name}</option>
                ))}
              </Select>
            </DrawerBody>
  
            <DrawerFooter>
              <Button variant='outline' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='green'
              onClick = {() => handleSubmit(recipeName, date)}>
                Schedule
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  function displayScheduledMeals(){
    //const toast = useToast();
    async function deleteMyRecipe(recipeName: string) {
      if (recipeName === null) {
        recipeName = 'null';
      }
      await deleteDoc(doc(db, 'users/', email, 'Recipes/', recipeName));
    }


    // return(
    //   <VStack spacing={10}>
    //           <Box>
    //             <SimpleGrid
    //               columns={3}
    //               padding={9}
    //               alignContent="center"
    //               display="flex"
    //               justifyContent="center"
    //               alignItems="center">
    //               {recipes?.length === 0 ? (
    //                 <Heading textAlign="center">You have 0 recipes</Heading>
    //               ) : (
    //                 recipes && recipes.map(recipe => (
    //                   <Container
    //                     boxShadow={'2xl'}
    //                     minW="sm"
    //                     borderRadius="lg"
    //                     overflow="hidden"
    //                     justify-content="space-between"
    //                     bg="teal"
    //                     minH="350"
    //                     display="flex"
    //                     flexDirection="column"
    //                     rounded="md"
    //                     padding={4}
    //                     margin={4}
    //                     marginRight={10}
    //                     marginLeft={10}
    //                     shadow={'dark-lg'}>
    //                     <VStack align="2x1">
    //                       <Center>
    //                         <Image
    //                           borderRadius="30px"
    //                           src={recipe.data.pic}
    //                           alt="No Picture"
    //                           w={300}
    //                           mb={15}
    //                         />
    //                       </Center>

    //                       <Button
    //                         variant="link"
    //                         rounded="md"
    //                         as="h3"
    //                         size="lg"
    //                         color="black"
    //                         padding={1}>
    //                         <Center>
    //                           <Text as="b" fontSize="34px" textColor="white">
    //                             {recipe.data.recipe_name}
    //                           </Text>
    //                         </Center>
    //                       </Button>
    //                       {/* <Stack direction="row" spacing={4} align="stretch">
    //                   <Button variant="link" colorScheme="red">
    //                     <AiOutlineHeart style={{fontSize: '34px'}} />
    //                   </Button>
    //                   <Button variant="link" colorScheme="green">
    //                     <BsFillChatDotsFill style={{fontSize: '34px'}} />
    //                   </Button>
    //                 </Stack> */}

    //                       <Box
    //                         boxShadow="xs"
    //                         rounded="md"
    //                         padding="4"
    //                         bg="white"
    //                         color="black"
    //                         maxW="container.sm">
    //                         <Text noOfLines={1}>
    //                           Difficulty: {recipe.data.difficulty}
    //                         </Text>
    //                         <Text noOfLines={1}>
    //                           Time: {recipe.data.cooking_time}
    //                         </Text>
    //                         <Text noOfLines={1}>
    //                           Servings: {recipe.data.servings}
    //                         </Text>
    //                         <Text noOfLines={1}>
    //                           Cost Per Serving: {recipe.data.cost_per_serving}
    //                         </Text>
    //                         <Text noOfLines={1}>
    //                           Cooking Applications:{' '}
    //                           {recipe.data.cooking_applications}
    //                         </Text>
    //                         <Text noOfLines={1}>
    //                           Allergens: {recipe.data.allergens}
    //                         </Text>
    //                       </Box>
    //                       <Accordion allowMultiple>
    //                         <AccordionItem>
    //                           <h2>
    //                             <AccordionButton bg="white">
    //                               <Box as="span" flex="1" textAlign="left">
    //                                 <Text as="b" textColor="black">
    //                                   Nutrition Data
    //                                 </Text>
    //                               </Box>
    //                               <AccordionIcon />
    //                             </AccordionButton>
    //                           </h2>
    //                           <AccordionPanel pb={4}>
    //                             <Box
    //                               padding="4"
    //                               color="black"
    //                               maxW="container.sm">
    //                               <Text noOfLines={1} textColor="white">
    //                                 Calories:{' '}
    //                                 {recipe.data.nutrients.calories.toFixed(2)}{' '}
    //                                 kCal
    //                               </Text>
    //                               <Text noOfLines={1} textColor="white">
    //                                 Protein:{' '}
    //                                 {recipe.data.nutrients.protein.toFixed(2)}g
    //                               </Text>
    //                               <Text noOfLines={1} textColor="white">
    //                                 Carbs:{' '}
    //                                 {recipe.data.nutrients.total_carbohydrate.toFixed(
    //                                   2,
    //                                 )}
    //                                 g
    //                               </Text>
    //                               <Text
    //                                 noOfLines={1}
    //                                 style={{paddingLeft: '20px'}}
    //                                 textColor="white">
    //                                 Sugar:{' '}
    //                                 {recipe.data.nutrients.sugars.toFixed(2)}g
    //                               </Text>
    //                               <Text noOfLines={1} textColor="white">
    //                                 Fat:{' '}
    //                                 {recipe.data.nutrients.total_fat.toFixed(2)}
    //                                 g
    //                               </Text>
    //                               <Text noOfLines={1} textColor="white">
    //                                 Saturated Fat:{' '}
    //                                 {recipe.data.nutrients.saturated_fat.toFixed(
    //                                   2,
    //                                 )}
    //                                 g
    //                               </Text>
    //                               <Text noOfLines={1} textColor="white">
    //                                 Cholesterol:{' '}
    //                                 {recipe.data.nutrients.cholesterol.toFixed(
    //                                   2,
    //                                 )}
    //                                 g
    //                               </Text>
    //                               <Text noOfLines={1} textColor="white">
    //                                 Sodium:{' '}
    //                                 {recipe.data.nutrients.sodium.toFixed(2)}g
    //                               </Text>
    //                               <Text noOfLines={1} textColor="white">
    //                                 Fiber:{' '}
    //                                 {recipe.data.nutrients.dietary_fiber.toFixed(
    //                                   2,
    //                                 )}
    //                                 g
    //                               </Text>
    //                             </Box>
    //                           </AccordionPanel>
    //                         </AccordionItem>
    //                       </Accordion>
    //                       <Accordion allowMultiple>
    //                         <AccordionItem>
    //                           <h2>
    //                             <AccordionButton bg="white">
    //                               <Box as="span" flex="1" textAlign="left">
    //                                 <Text as="b" textColor="black">
    //                                   Instructions:
    //                                 </Text>
    //                               </Box>
    //                               <AccordionIcon />
    //                             </AccordionButton>
    //                           </h2>
    //                           <AccordionPanel pb={4}>
    //                             <Box
    //                               padding="4"
    //                               color="black"
    //                               maxW="container.sm">
    //                               <Text textColor="white">
    //                                 {recipe.data.instructions}
    //                               </Text>
    //                             </Box>
    //                           </AccordionPanel>
    //                         </AccordionItem>
    //                       </Accordion>
    //                     </VStack>
    //                     <HStack align="right" marginTop={2}>
    //                       <Button
    //                         boxShadow="xs"
    //                         rounded="md"
    //                         variant="outline"
    //                         padding="4"
    //                         colorScheme="teal"
    //                         color="white"
    //                         maxW="container.sm"
    //                         onClick={() => {
    //                           //Print Recipe
    //                         }}>
    //                         <AiFillPrinter />
    //                         <Text marginLeft={2}>Print Recipe</Text>
    //                       </Button>
    //                       <Button
    //                         marginLeft={130}
    //                         boxShadow="xs"
    //                         rounded="md"
    //                         padding="4"
    //                         bg={'red.400'}
    //                         _hover={{
    //                           bg: 'red.500',
    //                         }}
    //                         _focus={{
    //                           bg: 'red.500',
    //                         }}
    //                         maxW="container.sm"
    //                         onClick={() => {
    //                           toast({
    //                             title: 'Recipe deleted.',
    //                             description:
    //                               'This recipe has been removed from your recipe book.',
    //                             status: 'success',
    //                             duration: 3000,
    //                             isClosable: true,
    //                           });
    //                           deleteMyRecipe(recipe.data.recipe_name);
    //                         }}>
    //                         <Text textColor="white">Delete Recipe</Text>
    //                       </Button>
    //                     </HStack>
    //                   </Container>
    //                 ))
    //               )}
    //             </SimpleGrid>
    //           </Box>
    //         </VStack>
    // )
  }

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
        <VStack w={'900px'} align={'left'}>
          <Container w={'750px'}>
            <FullCalendar
              plugins={[interactionPlugin, dayGridPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              aspectRatio={.8}
              dateClick={function(info){
                console.log(info)
              }}
              selectAllow={function(selectInfo){
                var startDate = selectInfo.start.getDate()
                var endDate = selectInfo.end.getDate() - 1
                var startMonth = selectInfo.start.getMonth()
                var endMonth = selectInfo.end.getMonth()
                if(startDate == endDate && startMonth == endMonth){
                    return true;
                }else{
                    return false;
                }
              }}
              handleWindowResize={true}
              expandRows={true}
              dayMaxEvents={true}
              events={profile?.events}
              eventDisplay='list-item'
              eventBackgroundColor='teal'
            />
          </Container>
          <Container>
            {ScheduleRecipe()}
          </Container>
        </VStack>
        <Container 
        centerContent={true} 
        border={'solid'} 
        borderColor={'teal'}
        height={'650px'}
        w={'600px'}>
          <Text>
            Select Day to View Meal Plan Info
          </Text>
        </Container>
      </HStack>
    </>
  );
};

export default CalendarPage;
