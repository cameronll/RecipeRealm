import {useState, useEffect} from 'react';
import {db} from '../../firebaseConfig';
import {IoIosAdd, IoIosRemove} from 'react-icons/io';
import {doc, setDoc} from 'firebase/firestore';

import {
  Progress,
  Box,
  ButtonGroup,
  Button,
  Heading,
  Flex,
  FormControl,
  GridItem,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  InputLeftAddon,
  InputGroup,
  Textarea,
  FormHelperText,
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberIncrementStepper,
  List,
  ListItem,
  ListIcon,
  VStack,
  Stack,
  Text,
  useBreakpointValue,
  HStack,
} from '@chakra-ui/react';
import {Link} from 'react-router-dom';

import {useToast} from '@chakra-ui/react';
import React from 'react';
import {MinusIcon} from '@chakra-ui/icons';
import Navbar from '../../components/Navbar';

// type that holds nutrition facts
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
/* 
  function to get nutrition data from Nutritionix API
  calling with ingredient from ingredient list
  string parameter will be formatted like: "white rice one cup"
  returns a raw JSON string
*/
async function fetchNutritionData(query: string): Promise<string> {
  // headers and body
  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('x-app-id', '3a83fb27');
  myHeaders.append('x-app-key', '135db1d7aaba12d363ad7b2225656590');
  myHeaders.append('search_nutrient', '"protein"');

  var raw = JSON.stringify({
    query: query,
  });

  // variable to hold request data
  var requestOptions: any = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  // call API with request data, store in variable response
  const response = await fetch(
    'https://trackapi.nutritionix.com/v2/natural/nutrients',
    requestOptions,
  );
  // turn the result into a string
  const result = response.text();
  // return the string
  return result;
}

/*
  function to get the nutrition information of a SINGLE ingredient
  string parameter will be formatted like: "white rice one cup"
  returns a type: nutrition
*/
async function getIngredientNutrients(query: string): Promise<nutrition> {
  try {
    // get the raw data with the string
    const data = await fetchNutritionData(query);
    // turn the raw data into a JSON object
    let obj = JSON.parse(data);
    // store the info in a type: nutrition
    let nutrients: nutrition = {
      // since this data is now in a JSON object, the values can be accessed
      // with their keys like fields in a struct
      calories: parseFloat(obj.foods[0].nf_calories.toFixed(2)),
      total_fat: parseFloat(obj.foods[0].nf_total_fat.toFixed(2)),
      saturated_fat: parseFloat(obj.foods[0].nf_saturated_fat.toFixed(2)),
      cholesterol: parseFloat(obj.foods[0].nf_cholesterol.toFixed(2)),
      sodium: parseFloat(obj.foods[0].nf_sodium.toFixed(2)),
      total_carbohydrate: parseFloat(
        obj.foods[0].nf_total_carbohydrate.toFixed(2),
      ),
      dietary_fiber: parseFloat(obj.foods[0].nf_dietary_fiber.toFixed(2)),
      sugars: parseFloat(obj.foods[0].nf_sugars.toFixed(2)),
      protein: parseFloat(obj.foods[0].nf_protein.toFixed(2)),
    };
    // return the nutrition information for this ONE ingredient
    return nutrients;
  } catch (error) {
    console.log(error);
  }

  // empty type: nutrition to return in case of failure
  let nullNutrition = {
    calories: 0,
    total_fat: 0,
    saturated_fat: 0,
    cholesterol: 0,
    sodium: 0,
    total_carbohydrate: 0,
    dietary_fiber: 0,
    sugars: 0,
    protein: 0,
  };
  return nullNutrition;
}

/*
  method to get the nutrition facts for the WHOLE recipe

  calls the getIngredientNutrients method on each ingredient
  and stores the sum of each nutrient in a type: nutrition

  returns a type: nutrition that holds the nutrition facts for the entire recipe
*/
async function getTotalNutrients(ingredients: string[]): Promise<nutrition> {
  // variable to store nutrition for whole recipe
  var recipeNutrients = {
    calories: 0,
    total_fat: 0,
    saturated_fat: 0,
    cholesterol: 0,
    sodium: 0,
    total_carbohydrate: 0,
    dietary_fiber: 0,
    sugars: 0,
    protein: 0,
  };
  let nullNutrients = recipeNutrients;
  // for every element in ingredients, add the ingredients nutrients to the recipe nutrient total
  try {
    await Promise.all(
      ingredients.map(async ingredient => {
        let ingredientNutrients: nutrition = await getIngredientNutrients(
          ingredient,
        );
        recipeNutrients.calories += ingredientNutrients.calories;
        recipeNutrients.total_fat += ingredientNutrients.total_fat;
        recipeNutrients.saturated_fat += ingredientNutrients.saturated_fat;
        recipeNutrients.cholesterol += ingredientNutrients.cholesterol;
        recipeNutrients.sodium += ingredientNutrients.sodium;
        recipeNutrients.total_carbohydrate +=
          ingredientNutrients.total_carbohydrate;
        recipeNutrients.dietary_fiber += ingredientNutrients.dietary_fiber;
        recipeNutrients.sugars += ingredientNutrients.sugars;
        recipeNutrients.protein += ingredientNutrients.protein;
      }),
    );
    // return the nutrition facts for the whole recipe
    return recipeNutrients;
  } catch (e) {
    return nullNutrients;
  }
}

/*
  function to send all data to the database
  adds recipe information to the currently logged in user's recipe list
  returns nothing
*/
async function toDB(
  recipe_name: string,
  servings: string,
  allergens: string,
  cooking_applications: string,
  cooking_time: string,
  cost_per_serving: string,
  difficulty: string,
  posted: boolean,
  ingredients: string[],
  instructions: string,
) {
  // if there is a user logged in...
  // store the currently logged in user's email in email
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  // get the total nutrients, pass in the provided ingredients string array
  const nutrients: nutrition = await getTotalNutrients(ingredients);
  const recipe: recipe = {
    recipe_name: recipe_name,
    servings: servings,
    allergens: allergens,
    cooking_applications: cooking_applications,
    cooking_time: cooking_time,
    cost_per_serving: cost_per_serving,
    difficulty: difficulty,
    posted: posted,
    ingredients: ingredients,
    instructions: instructions,
    nutrients: nutrients,
  };
  // call to add a document to the database, uses <email> to get to the actively logged in user's recipes
  // creates a document with name: <recipe_name>
  if (recipe_name === null) {
    recipe_name = 'null';
  }
  await setDoc(doc(db, 'users/' + email + '/Recipes', recipe_name), {
    // name in database: variable
    data: recipe,
  });
  console.log('Document written successfully');
}

const Form1 = () => {
  const [show, setShow] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [cookingTime, setCookingTime] = useState('');

  useEffect(() => {
    const recipe_name_storage: any = window.localStorage.getItem('RECIPENAME');
    const cooking_time_storage: any =
      window.localStorage.getItem('COOKINGTIME');

    setRecipeName(JSON.parse(recipe_name_storage));
    setCookingTime(JSON.parse(cooking_time_storage));
  }, []);

  const handleNameChange = (e: any) => {
    const name = e.target.value;
    window.localStorage.setItem('RECIPENAME', JSON.stringify(name));
    setRecipeName(name);
  };

  const handleTimeChange = (e: any) => {
    const name = e.target.value;
    window.localStorage.setItem('COOKINGTIME', JSON.stringify(name));
    setCookingTime(name);
  };

  return (
    <>
      <Heading w="100%" textAlign={'center'} fontWeight="normal" mb="2%">
        Add
      </Heading>
      <FormControl mt="2%">
        <FormLabel htmlFor="recipeName" fontWeight={'normal'}>
          Recipe Name
        </FormLabel>
        <Input
          id="recipeName"
          type="text"
          value={recipeName}
          onChange={handleNameChange}
        />
        <FormHelperText>max 20 char.</FormHelperText>
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="cookingTime" fontWeight={'normal'} mt="2%">
          Cooking Time
        </FormLabel>
        <InputGroup size="md">
          <Input
            pr="4.5rem"
            placeholder="0 Hours 0 minutes"
            value={cookingTime}
            onChange={handleTimeChange}
          />
        </InputGroup>
      </FormControl>
    </>
  );
};

const Form2 = () => {
  const [difficulty, setDifficulty] = useState(' ');
  const [appliances, setAppliances] = useState(' ');
  const [cost, setCost] = useState(' ');
  const [allergens, setAllergens] = useState(' ');
  const [servings, setServings] = useState(' ');

  const toast = useToast();
  const [ingredientCount, setcount] = useState(1);
  const [ingredientString, setIngredientString] = useState<string[]>([]);
  //ingredientHandlerState
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientAmount, setIngredientAmount] = useState(0);
  const [ingredientMeasurement, setIngredientMeasurement] = useState(' ');

  //TO DO
  // FIX LOCAL STORxAGE

  useEffect(() => {
    if (window.localStorage.getItem('DIFFICULTY') !== null) {
      const difficulty_storage: any = window.localStorage.getItem('DIFFICULTY');
      setDifficulty(JSON.parse(difficulty_storage));
    }
    if (window.localStorage.getItem('APPLIANCES') !== null) {
      const appliances_storage: any = window.localStorage.getItem('APPLIANCES');
      setAppliances(JSON.parse(appliances_storage));
    }
    if (window.localStorage.getItem('COST')) {
      const cost_storage: any = window.localStorage.getItem('COST');
      setCost(JSON.parse(cost_storage));
    }
    if (window.localStorage.getItem('ALLERGENS')) {
      const allergens_storage: any = window.localStorage.getItem('ALLERGENS');
      setAllergens(JSON.parse(allergens_storage));
    }
    if (window.localStorage.getItem('SERVINGS')) {
      const servings_storage: any = window.localStorage.getItem('SERVINGS');
      setServings(JSON.parse(servings_storage));
    }
    if (window.localStorage.getItem('INGREDIENTCOUNT')) {
      const ingredientCount_store: any = Number(
        window.localStorage.getItem('INGREDIENTCOUNT'),
      );
      setcount(JSON.parse(ingredientCount_store));
    }
    if (window.localStorage.getItem('INGREDIENTSTRING')) {
      const ingredientString_store: any =
        window.localStorage.getItem('INGREDIENTSTRING');
      setIngredientString(JSON.parse(ingredientString_store));
    }
  }, []);

  const handleDifficultyChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('DIFFICULTY', JSON.stringify(targ));
    setDifficulty(targ);
  };

  const handleAppliancesChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('APPLIANCES', JSON.stringify(targ));
    setAppliances(targ);
  };

  const handleCostChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('COST', JSON.stringify(targ));
    setCost(targ);
  };

  const handleAllergensChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('ALLERGENS', JSON.stringify(targ));
    setAllergens(targ);
  };

  const handleServingsChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('SERVINGS', JSON.stringify(targ));
    setServings(targ);
  };

  //buttonDisable
  const disableAdd = (): boolean | undefined => {
    if (
      ingredientName === '' ||
      ingredientAmount === 0 ||
      ingredientMeasurement === ''
    ) {
      return true;
    }
    return false;
  };
  const disableRemove = (): boolean | undefined => {
    if (ingredientCount == 1) {
      return true;
    }
    return false;
  };
  const handleIName = (e: any) => {
    const newName = e.target.value;
    setIngredientName(newName);
  };

  const handleIAmount = (value: any) => {
    const newAmount = value;
    setIngredientAmount(newAmount);
  };

  const handleIMeasurement = (e: any) => {
    const newMeasurement = e.target.value;
    setIngredientMeasurement(newMeasurement);
  };

  function incrementCount() {
    //create new ingredient String
    const newIngredient = `${ingredientAmount} ${ingredientMeasurement} ${ingredientName}`;

    if (localStorage.getItem('INGREDIENTSTRING') === null) {
      const helperString: string[] = [];
      helperString.push(newIngredient);
      localStorage.setItem('INGREDIENTSTRING', JSON.stringify(helperString));
      setIngredientString(helperString);
    } else {
      let retString = localStorage.getItem('INGREDIENTSTRING');
      let helperString: any = JSON.parse(retString as string);
      helperString.push(newIngredient);
      localStorage.setItem('INGREDIENTSTRING', JSON.stringify(helperString));
      setIngredientString(helperString);
    }
    //clear data
    setIngredientAmount(0);
    setIngredientMeasurement('');
    setIngredientName('');

    //testing
    console.log(ingredientString);

    setcount(ingredientString.length + 2);
    localStorage.setItem('INGREDIENTCOUNT', JSON.stringify(ingredientCount));
  }

  function decrementCount() {
    let retString = localStorage.getItem('INGREDIENTSTRING');
    let helperString: any = JSON.parse(retString as string);
    helperString.pop();
    localStorage.setItem('INGREDIENTSTRING', JSON.stringify(helperString));
    setIngredientString(helperString);
    setcount(ingredientString.length);
    localStorage.setItem('INGREDIENTCOUNT', JSON.stringify(ingredientCount));
  }

  return (
    <>
      <Heading w="100%" textAlign={'center'} fontWeight="normal" mb="2%">
        Meal Details
      </Heading>
      <FormControl as={GridItem} colSpan={[6, 3]}>
        <FormLabel
          htmlFor="difficulty"
          fontSize="sm"
          fontWeight="md"
          color="gray.700"
          _dark={{
            color: 'gray.50',
          }}>
          How difficult is this recipe?
        </FormLabel>
        <Select
          id="difficulty"
          name="difficulty"
          autoComplete="difficulty"
          placeholder="Select option"
          focusBorderColor="brand.400"
          shadow="sm"
          size="sm"
          w="full"
          rounded="md"
          value={difficulty}
          onChange={handleDifficultyChange}>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Seasoned Chef</option>
          <option>Master Chef</option>
        </Select>
      </FormControl>

      <FormControl as={GridItem} colSpan={6}>
        <FormLabel
          htmlFor="costPerServing"
          fontSize="sm"
          fontWeight="md"
          color="gray.700"
          _dark={{
            color: 'gray.50',
          }}
          mt="2%">
          Cost per Serving
        </FormLabel>
        <Input
          type="text"
          name="costPerServing"
          id="costPerServing"
          focusBorderColor="brand.400"
          shadow="sm"
          size="sm"
          w="full"
          rounded="md"
          value={cost}
          onChange={handleCostChange}
        />
      </FormControl>

      <FormControl as={GridItem} colSpan={[6, 6, null, 2]}>
        <FormLabel
          htmlFor="cookingApp"
          fontSize="sm"
          fontWeight="md"
          color="gray.700"
          _dark={{
            color: 'gray.50',
          }}
          mt="2%">
          Cooking Appliances
        </FormLabel>
        <Input
          type="text"
          name="cookingApp"
          id="cookingApp"
          autoComplete="cookingApp"
          focusBorderColor="brand.400"
          shadow="sm"
          size="sm"
          w="full"
          rounded="md"
          value={appliances}
          onChange={handleAppliancesChange}
        />
      </FormControl>

      <FormControl as={GridItem} colSpan={[6, 3, null, 2]}>
        <FormLabel
          htmlFor="allergens"
          fontSize="sm"
          fontWeight="md"
          color="gray.700"
          _dark={{
            color: 'gray.50',
          }}
          mt="2%">
          Allergens
        </FormLabel>
        <Input
          type="text"
          name="allergens"
          id="allergens"
          autoComplete="allergens"
          focusBorderColor="brand.400"
          shadow="sm"
          size="sm"
          w="full"
          rounded="md"
          value={allergens}
          onChange={handleAllergensChange}
        />
      </FormControl>

      <FormControl as={GridItem} colSpan={[6, 3, null, 2]}>
        <FormLabel
          htmlFor="yield"
          fontSize="sm"
          fontWeight="md"
          color="gray.700"
          _dark={{
            color: 'gray.50',
          }}
          mt="2%">
          Yield (ie. 3 people)
        </FormLabel>
        <Input
          type="text"
          name="yield"
          id="yield"
          focusBorderColor="brand.400"
          shadow="sm"
          size="sm"
          w="full"
          rounded="md"
          value={servings}
          onChange={handleServingsChange}
        />
      </FormControl>
      <Heading
        paddingTop={5}
        w="100%"
        textAlign={'center'}
        fontWeight="normal"
        mb="2%">
        Ingredient List
      </Heading>
      <Flex>
        <List spacing={3}>
          {Array.from({length: ingredientCount}).map((_, index) => (
            <ListItem>
              <ListIcon as={MinusIcon} color="green.500" />
              {ingredientString.at(index)}
            </ListItem>
          ))}
        </List>
      </Flex>
      <Flex>
        <React.Fragment>
          <FormControl mr="5%">
            <FormLabel htmlFor={`ingredient-`} fontWeight={'normal'}>
              Ingredient Name #
            </FormLabel>
            <Input
              id={`ingredient-`}
              placeholder="Ingredient..."
              value={ingredientName}
              onChange={handleIName}
              isRequired={true}
            />
          </FormControl>

          <FormControl mr="5%">
            <FormLabel htmlFor={`amount-`} fontWeight={'normal'}>
              Amount
            </FormLabel>
            <NumberInput
              max={999}
              min={0}
              value={ingredientAmount}
              onChange={handleIAmount}
              isRequired={true}>
              <NumberInputField id={`amount-`} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor={`unit-`} fontWeight={'normal'}>
              Unit of Measurement
            </FormLabel>
            <Select
              id={`unit-`}
              placeholder=""
              focusBorderColor="brand.400"
              shadow="sm"
              size="md"
              w="full"
              rounded="md"
              value={ingredientMeasurement}
              onChange={handleIMeasurement}
              isRequired={false}>
              <option> </option>
              <option> </option>
              <option>Ibs</option>
              <option>oz</option>
              <option>grams</option>
              <option>milligrams</option>
              <option>cups</option>
              <option>tablespoon</option>
              <option>teaspoon</option>
            </Select>
          </FormControl>
        </React.Fragment>
      </Flex>
      <Flex>
        <Button
          onClick={decrementCount}
          colorScheme="red"
          variant="solid"
          mt={8}
          w="16rem"
          mr="5%"
          marginLeft="10%"
          isDisabled={disableRemove()}>
          Remove Ingredient <IoIosRemove />
        </Button>
        <Button
          onClick={incrementCount}
          colorScheme="green"
          variant="solid"
          mt={8}
          mr="5%"
          w="16rem"
          marginLeft="5%"
          isDisabled={disableAdd()}>
          Add Ingredient <IoIosAdd />
        </Button>
      </Flex>
    </>
  );
};

const Form3 = () => {
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    const instructions_storage: any =
      window.localStorage.getItem('INSTRUCTIONS');
    setInstructions(JSON.parse(instructions_storage));
  }, []);

  const handleInstructionsChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('INSTRUCTIONS', JSON.stringify(targ));
    setInstructions(targ);
  };
  return (
    <>
      <Heading w="100%" textAlign={'center'} fontWeight="normal">
        Cooking Instructions
      </Heading>
      <SimpleGrid columns={1} spacing={6}>
        <FormControl id="instructions" mt={1}>
          <FormLabel
            fontSize="sm"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}>
            Instructions
          </FormLabel>
          <Textarea
            placeholder="Step 1:"
            rows={3}
            shadow="sm"
            focusBorderColor="brand.400"
            fontSize={{
              sm: 'sm',
            }}
            value={instructions}
            onChange={handleInstructionsChange}
          />
          <FormHelperText>
            Instructions on how to make the recipe
          </FormHelperText>
        </FormControl>
      </SimpleGrid>
    </>
  );
};

export default function Multistep() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33.33);
  const recipeFromStorage: any = window.localStorage.getItem('RECIPENAME');
  const recipeName = JSON.parse(recipeFromStorage);
  const cookingTimeStorage: any = window.localStorage.getItem('COOKINGTIME');
  const cookingTime = JSON.parse(cookingTimeStorage);
  const difficultyStorage: any = window.localStorage.getItem('DIFFICULTY');
  const difficulty = JSON.parse(difficultyStorage);
  const appliancesStorage: any = window.localStorage.getItem('APPLIANCES');
  const appliances = JSON.parse(appliancesStorage);
  const costStorage: any = window.localStorage.getItem('COST');
  const cost = JSON.parse(costStorage);
  const allergensStorage: any = window.localStorage.getItem('ALLERGENS');
  const allergens = JSON.parse(allergensStorage);
  const servingsStorage: any = window.localStorage.getItem('SERVINGS');
  const servings = JSON.parse(servingsStorage);
  const ingredientsStorage: any =
    window.localStorage.getItem('INGREDIENTSTRING');
  const ingredients = JSON.parse(ingredientsStorage);

  return (
    <>
      <Navbar />
      <Flex
        w={'full'}
        h={'100'}
        backgroundImage={
          'url(https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.dreamstime.com%2Fphotos-images%2Ffood-background.html&psig=AOvVaw19YTiVWLg69rXtH_pxsMAt&ust=1698854868045000&source=images&cd=vfe&ved=0CBEQjRxqFwoTCLjS8djVoIIDFQAAAAAdAAAAABAJ)'
        }
        backgroundSize={'cover'}
        backgroundPosition={'center center'}
        alignContent={'flex-end'}
        backgroundColor="rgba(0, 128, 128, 0.7)"
        marginBottom={10}>
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
            // bgGradient={'linear(to-r, blackAlpha.600, transparent)'}
          >
            <Stack maxW={'2xl'} spacing={6}>
              <Text textAlign="center" fontSize="6xl" as="b" color="white">
                Create My Recipe
              </Text>
            </Stack>
          </VStack>
        </Flex>
      </Flex>
      <Box>
        <Box
          borderWidth="1px"
          rounded="lg"
          shadow="1px 1px 3px rgba(0,0,0,0.3)"
          maxWidth={800}
          p={6}
          m="10px auto"
          as="form"
          marginBottom={180}>
          <Progress
            hasStripe
            colorScheme="red"
            value={progress}
            mb="5%"
            mx="5%"
            isAnimated></Progress>
          {step === 1 ? <Form1 /> : step === 2 ? <Form2 /> : <Form3 />}
          <ButtonGroup mt="5%" w="100%">
            <Flex w="100%" justifyContent="space-between">
              <Flex>
                <VStack>
                  <HStack>
                    <Button
                      onClick={() => {
                        setStep(step - 1);
                        setProgress(progress - 33.33);
                      }}
                      isDisabled={step === 1}
                      colorScheme="teal"
                      variant="solid"
                      w="7rem"
                      mr="5%">
                      Back
                    </Button>
                    <Button
                      w="7rem"
                      isDisabled={step === 3}
                      onClick={() => {
                        setStep(step + 1);
                        if (step === 3) {
                          setProgress(100);
                        } else {
                          setProgress(progress + 33.33);
                        }
                        console.log(window.localStorage.getItem('RECIPENAME'));
                      }}
                      colorScheme="teal"
                      variant="outline">
                      Next
                    </Button>
                  </HStack>
                  <Link to="/recipes">
                    <Button colorScheme="red" alignSelf="right" w="auto">
                      Return to Recipe Book
                    </Button>
                  </Link>
                </VStack>
              </Flex>
              {step === 3 ? (
                <Link to="../recipes">
                  <Button
                    w="7rem"
                    colorScheme="green"
                    variant="solid"
                    onClick={() => {
                      const instructionsStorage: any =
                        window.localStorage.getItem('INSTRUCTIONS');
                      const instructions = JSON.parse(instructionsStorage);
                      toast({
                        title: 'Recipe created.',
                        description: "We've created your recipe for you.",
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                      // TODO
                      // replace hardcoded data with user inputted data from the form
                      // replace hardcoded ingredients list with user inputted data

                      // call to the DB with hardcoded data (for now)
                      toDB(
                        recipeName,
                        servings,
                        allergens,
                        appliances,
                        cookingTime,
                        cost,
                        difficulty,
                        false,
                        ingredients,
                        instructions,
                      );
                      window.localStorage.removeItem('RECIPENAME');
                      window.localStorage.removeItem('COOKINGTIME');
                      window.localStorage.removeItem('DIFFICULTY');
                      window.localStorage.removeItem('APPLIANCES');
                      window.localStorage.removeItem('COST');
                      window.localStorage.removeItem('ALLERGENS');
                      window.localStorage.removeItem('SERVINGS');
                      window.localStorage.removeItem('INSTRUCTIONS');
                      window.localStorage.removeItem('INGREDIENTSTRING');
                      window.localStorage.removeItem('INGREDIENTCOUNT');
                    }}>
                    Submit
                  </Button>
                </Link>
              ) : null}
            </Flex>
          </ButtonGroup>
        </Box>
      </Box>
    </>
  );
}
