import React, {useEffect, useRef, useState} from 'react';
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
  deleteField,
  Firestore,
  FieldValue,
  arrayRemove,
} from 'firebase/firestore';
import firebase from 'firebase/app';
import Navbar from '../components/Navbar';
import {
  Box,
  Button,
  ButtonGroup,
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
  Spacer,
} from '@chakra-ui/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import {Calendar} from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import {AiFillPrinter} from 'react-icons/ai';
import {render} from '@testing-library/react';
import {SelectedElement} from 'rsuite/esm/Picker';

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

type Recipe = {
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
  pic: string;
};

type event = {
  recipe: Recipe;
  date: string;
  title: string;
};

function getRecipeIndex(recipes: any[], recipe_name: string): number {
  for (let i = 0; i < recipes.length; i++) {
    if (recipes[i]?.data.recipe_name.localeCompare(recipe_name) === 0) {
      return i;
    }
  }
  return -1;
}

const CalendarPage: React.FC = () => {
  const toast = useToast();
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const savedRecipesQuery = query(
    collection(db, 'users/' + email + '/SavedRecipes'),
  );
  const [savedRecipes, savedRecipesLoading, savedRecipesError] =
    useCollectionData(savedRecipesQuery);

  const recipesQuery = query(collection(db, 'users/' + email + '/Recipes'));
  const [recipes, recipesLoading, recipesError] =
    useCollectionData(recipesQuery);

  const [profile, profileLoading, profileError] = useDocumentData(
    doc(db, 'users/', email),
  );

  const [dateEvents, setDateEvents] = useState<any>([]);
  const [date, setDate] = useState('');
  const [recipeName, setRecipeName] = useState<any>();
  const [events, setEvents] = useState<any>([]);
  const [dateSelected, setDateSelected] = useState('');

  /*
  useEffect(() => {
    var tempArray: Recipe[] = [];
    for (let i = 0; i < profile?.events.length; i++) {
      tempArray.push(profile?.events[i].recipe);
    }
    setDateEvents(tempArray);
  }, [profile]);
  */

  function titleSize(title: string) {
    return 34 - title.length * 0.2 + 'px';
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
    if (recipes && savedRecipes) {
      if (date === '') {
        toast({
          //
          title: 'No Time',
          description: 'Please choose a time for your recipe',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      var index = getRecipeIndex(recipes, recipe_name);
      if (index === -1) {
        index = getRecipeIndex(savedRecipes, recipe_name);
        const newEvent: event = {
          recipe: savedRecipes[index].data,
          date: date,
          title: recipe_name,
        };
        const docRef = doc(db, 'users', email);
        await updateDoc(docRef, {
          events: arrayUnion(newEvent),
        });
      } else {
        const newEvent: event = {
          recipe: recipes[index].data,
          date: date,
          title: recipe_name,
        };
        const docRef = doc(db, 'users', email);
        await updateDoc(docRef, {
          events: arrayUnion(newEvent),
        });
      }
      toast({
        //
        title: 'Recipe Created',
        description: 'Recipe added to your calendar.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  /**
   * Method that dispalys the meals from the selected day on the right side of
   * the window. Default display day is current day.
   * @returns
   */
  function displayMeals() {
    var eventsOnSelected;

    if (dateEvents.length == 0) {
    } else {
      eventsOnSelected = dateEvents;
    }
    return (
      <VStack spacing={10}>
        <Box>
          {dateEvents &&
            dateEvents.map((recipe: Recipe) => (
              <Container
                boxShadow={'2xl'}
                maxW="md"
                borderRadius="lg"
                overflow="hidden"
                justify-content="space-between"
                bg="teal"
                minH="350"
                flexDirection="column"
                rounded="md"
                padding={4}
                margin={4}
                shadow={'dark-lg'}>
                <VStack align="2x1">
                  <Center>
                    <Image
                      borderRadius="30px"
                      minH="250px"
                      src={
                        // image attached to the recipe
                        recipe.pic
                      }
                      alt="No Picture"
                      w={300}
                      mb={15}
                    />
                  </Center>

                  <Button
                    variant="link"
                    rounded="md"
                    as="h3"
                    size="lg"
                    color="black"
                    padding={1}>
                    <Center>
                      <Text
                        as="b"
                        fontSize={titleSize(recipe.recipe_name)}
                        textColor="white">
                        {
                          // name of the recipe
                          recipe.recipe_name
                        }
                      </Text>
                    </Center>
                  </Button>
                  <Box
                    boxShadow="xs"
                    rounded="md"
                    padding="4"
                    bg="white"
                    color="black"
                    maxW="container.sm">
                    {/* displaying recipe data */}
                    <Text noOfLines={1}>Difficulty: {recipe.difficulty}</Text>
                    <Text noOfLines={1}>Time: {recipe.cooking_time}</Text>
                    <Text noOfLines={1}>Servings: {recipe.servings}</Text>
                    <Text noOfLines={1}>
                      Cost Per Serving: {recipe.cost_per_serving}
                    </Text>
                    <Text noOfLines={1}>
                      Cooking Applications: {recipe.cooking_applications}
                    </Text>
                    <Text noOfLines={1}>Allergens: {recipe.allergens}</Text>
                  </Box>
                  <Accordion allowMultiple>
                    <AccordionItem>
                      <h2>
                        {/* accordion for nutrition data  */}
                        <AccordionButton bg="white">
                          <Box as="span" flex="1" textAlign="left">
                            <Text as="b" textColor="black">
                              Nutrition Data
                            </Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <Box padding="4" color="black" maxW="container.sm">
                          {/* each accordion panel contains:  */}
                          <Text noOfLines={1} textColor="white">
                            Calories: {recipe.nutrients.calories.toFixed(2)}{' '}
                            kCal
                          </Text>
                          <Text noOfLines={1} textColor="white">
                            Protein: {recipe.nutrients.protein.toFixed(2)}g
                          </Text>
                          <Text noOfLines={1} textColor="white">
                            Carbs:{' '}
                            {recipe.nutrients.total_carbohydrate.toFixed(2)}g
                          </Text>
                          <Text noOfLines={1} textColor="white">
                            Sugar: {recipe.nutrients.sugars.toFixed(2)}g
                          </Text>
                          <Text noOfLines={1} textColor="white">
                            Fat: {recipe.nutrients.total_fat.toFixed(2)}g
                          </Text>
                          <Text noOfLines={1} textColor="white">
                            Saturated Fat:{' '}
                            {recipe.nutrients.saturated_fat.toFixed(2)}g
                          </Text>
                          <Text noOfLines={1} textColor="white">
                            Cholesterol:{' '}
                            {recipe.nutrients.cholesterol.toFixed(2)}g
                          </Text>
                          <Text noOfLines={1} textColor="white">
                            Sodium: {recipe.nutrients.sodium.toFixed(2)}g
                          </Text>
                          <Text noOfLines={1} textColor="white">
                            Fiber: {recipe.nutrients.dietary_fiber.toFixed(2)}g
                          </Text>
                        </Box>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                  <Accordion allowMultiple>
                    <AccordionItem>
                      <h2>
                        <AccordionButton bg="white">
                          <Box as="span" flex="1" textAlign="left">
                            <Text as="b" textColor="black">
                              Ingredients
                            </Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        {recipe.ingredients.map(
                          (ingredient: string, index: number) => (
                            <Text key={index} textColor="whiteAlpha.900">
                              {' '}
                              <li> {ingredient}</li>
                            </Text>
                          ),
                        )}
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                  <Accordion allowMultiple>
                    <AccordionItem>
                      <h2>
                        {/* accordion for the instructions */}
                        <AccordionButton bg="white">
                          <Box as="span" flex="1" textAlign="left">
                            <Text as="b" textColor="black">
                              Instructions:
                            </Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <Box padding="4" color="black" maxW="container.sm">
                          <Text textColor="white">
                            {/* display the instructions */}
                            {recipe.instructions}
                          </Text>
                        </Box>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </VStack>
                <HStack align="right" marginTop={2}>
                  <Button
                    boxShadow="xs"
                    rounded="md"
                    variant="outline"
                    padding="4"
                    colorScheme="teal"
                    color="white"
                    maxW="container.sm"
                    onClick={() => {
                      //Print Recipe
                    }}>
                    <AiFillPrinter />
                    <Text marginLeft={2}>Print Recipe</Text>
                  </Button>
                  <Spacer />
                  <Flex>
                    <Button
                      boxShadow="xs"
                      rounded="md"
                      padding="4"
                      colorScheme="red"
                      color="white"
                      maxW="container.sm"
                      onClick={() => {
                        //Deschedule
                        for (let i = 0; i < profile?.events.length; i++) {
                          if (
                            profile?.events[i].date.includes(dateSelected) &&
                            profile?.events[i].title == recipe.recipe_name
                          ) {
                            console.log(dateSelected);
                            console.log(profile?.events[i]);
                            console.log(profile?.events[i].title);
                            updateDoc(doc(db, 'users/', email), {
                              events: arrayRemove(profile?.events[i]),
                            });
                          }
                        }
                      }}>
                      <Text>De-schedule</Text>
                    </Button>
                  </Flex>
                </HStack>
              </Container>
            ))}
        </Box>
      </VStack>
    );
  }
  /**
   * Function that displays a drawer component when the user clicks on the
   * "Schedule Recipe" button. The drawer displays boxes for the user to fill in
   * date, time, and which meal they want to schedule.
   * @returns
   */
  function ScheduleRecipe() {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const btnRef = React.useRef();

    return (
      <>
        <Button
          alignSelf={'right'}
          /*ref={btnRef}*/ colorScheme="teal"
          onClick={onOpen}>
          Schedule Recipe
        </Button>
        <Drawer
          isOpen={isOpen}
          placement="right"
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
                Enter a date: <br />
                (include dashes when entering date, <br />
                include "T" when specifying time of day)
              </Text>
              <Input
                type="datetime-local"
                outlineColor={'teal'}
                placeholder="Select Date and Time"
                onChange={handleDateChange}
              />
              <Text padding={'25px'} fontSize={'20px'} fontWeight={'600'}>
                Choose the recipe:
              </Text>
              <Select
                size={'lg'}
                value={recipeName}
                outlineColor={'teal'}
                placeholder="Click to select..."
                onChange={handleRecipeChange}>
                {recipes?.map(recipe => (
                  <option>{recipe?.recipe_name}</option>
                ))}
                {savedRecipes?.map(recipe => (
                  <option>{recipe.recipe_name}</option>
                ))}
              </Select>
            </DrawerBody>

            <DrawerFooter>
              <Button variant="outline" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={() => handleSubmit(recipeName, date)}>
                Schedule
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
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
        <VStack w={'50%'} align={'left'}>
          <Container w={'750px'}>
            <FullCalendar
              //ref={calendarRef}
              plugins={[interactionPlugin, dayGridPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              aspectRatio={0.8}
              unselectAuto={false}
              dateClick={function (info) {
                // Function to handle date clicking
                const selectedDate = info.dateStr;
                var tempEvents: Recipe[] = [];
                for (let i = 0; i < profile?.events.length; i++) {
                  if (profile?.events[i].date.includes(info.dateStr)) {
                    tempEvents.push(profile?.events[i].recipe);
                  }
                }
                setDateSelected(selectedDate);
                setDateEvents(tempEvents);
              }}
              selectAllow={function (selectInfo) {
                var startDate = selectInfo.start.getDate();
                var endDate;
                if (selectInfo.end.getDate() === 1) {
                  endDate = startDate;
                } else {
                  endDate = selectInfo.end.getDate() - 1;
                }
                var startMonth = selectInfo.start.getMonth();
                var endMonth;
                if (selectInfo.end.getMonth() === startMonth + 1) {
                  endMonth = startMonth;
                } else {
                  endMonth = selectInfo.end.getMonth();
                }
                if (startDate == endDate && startMonth == endMonth) {
                  return true;
                } else {
                  return false;
                }
              }}
              handleWindowResize={true}
              expandRows={true}
              dayMaxEvents={true}
              events={profile?.events}
              eventDisplay="list-item"
              eventBackgroundColor="teal"
            />
          </Container>
          <Container>{ScheduleRecipe()}</Container>
        </VStack>
        <Container
          id="MealPlanInfo"
          border={'solid'}
          borderColor={'teal'}
          height={'800px'}
          maxH="680px"
          overflowY={'scroll'}
          w={'1000px'}>
          {dateSelected == '' ? (
            // displayMeals()
            //<Button onClick={() => {console.log(dateEvents)}}>thing</Button>
            <Text paddingTop={'200'} paddingLeft={'75'}>
              Select a day to view the meals scheduled
            </Text>
          ) : (
            displayMeals()
          )}
        </Container>
      </HStack>
    </>
  );
};

export default CalendarPage;
