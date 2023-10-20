import {useState, useEffect} from 'react';
import {db} from '../../firebaseConfig';
import {IoIosAdd, IoIosRemove} from 'react-icons/io';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import {getAuth, onAuthStateChanged} from 'firebase/auth';
import {useFormik} from 'formik';

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
} from '@chakra-ui/react';

import {useToast} from '@chakra-ui/react';
import React from 'react';

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
      calories: obj.foods[0].nf_calories,
      total_fat: obj.foods[0].nf_total_fat,
      saturated_fat: obj.foods[0].nf_saturated_fat,
      cholesterol: obj.foods[0].nf_cholesterol,
      sodium: obj.foods[0].nf_sodium,
      total_carbohydrate: obj.foods[0].nf_total_carbohydrate,
      dietary_fiber: obj.foods[0].nf_dietary_fiber,
      sugars: obj.foods[0].nf_sugars,
      protein: obj.foods[0].nf_protein,
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
  // for every element in ingredients, add the ingredients nutrients to the recipe nutrient total
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
      recipeNutrients.total_carbohydrate += ingredientNutrients.total_carbohydrate;
      recipeNutrients.dietary_fiber += ingredientNutrients.dietary_fiber;
      recipeNutrients.sugars += ingredientNutrients.sugars;
      recipeNutrients.protein += ingredientNutrients.protein;
    }),
  );
  // return the nutrition facts for the whole recipe
  return recipeNutrients;
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
  instructions: string
  ) {
  // get the current user
  const auth = getAuth();
  const user = auth.currentUser;
  // if there is a user logged in...
  if (user !== null) {
    // store the currently logged in user's email in email
    const email = user.email;
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
    await setDoc(doc(db, 'users/' + email + '/Recipes', recipe_name), {
      // name in database: variable
      data: recipe,
    });
    console.log('Document written successfully');
  }
}

const Form1 = () => {
  const [show, setShow] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [cookingTime, setCookingTime] = useState('');

  useEffect(() => {
    const recipe_name_storage: any = window.localStorage.getItem('RECIPENAME');
    const cooking_time_storage: any =
      window.localStorage.getItem('COOKINGTIME');
    if (recipe_name_storage !== 'null') {
      setRecipeName(JSON.parse(recipe_name_storage));
      setCookingTime(JSON.parse(cooking_time_storage));
    }
  }, []);
  // const handleSubmit = (e: {preventDefault: () => void}) => {
  //   e.preventDefault();
  //   console.log(JSON.stringify(form1));
  // };

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
        Recipe Creator
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
  const [difficulty, setDifficulty] = useState('');
  const [appliances, setAppliances] = useState('');
  const [cost, setCost] = useState('');
  const [allergens, setAllergens] = useState('');
  const [servings, setServings] = useState('');

  useEffect(() => {
    const difficulty_storage: any = window.localStorage.getItem('DIFFICULTY');
    const appliances_time_storage: any = window.localStorage.getItem('APPLIANCES');
    const cost_storage: any = window.localStorage.getItem('COST');
    const allergens_storage: any = window.localStorage.getItem('ALLERGENS');
    const servings_storage: any = window.localStorage.getItem('SERVINGS');
    if (difficulty_storage !== 'null') {
      setDifficulty(JSON.parse(difficulty_storage));
      setAppliances(JSON.parse(appliances_time_storage));
      setCost(JSON.parse(cost_storage));
      setAllergens(JSON.parse(allergens_storage));
      setServings(JSON.parse(servings_storage));
    }

      //const ingredientCount_store: any = Number(
      //     window.localStorage.getItem('INGREDIENTCOUNT'),
      //   );
      //   const ingredientString_store: any =
      //     window.localStorage.getItem('INGREDIENTSTRING');
      //   const ingredientName_store: any =
      //     window.localStorage.getItem('INGREDIENTNAME');
      //   const ingredientAmount_store: any =
      //     window.localStorage.getItem('INGREDIENTAMOUNT');
      //   const ingredientMeasurement_store: any = window.localStorage.getItem(
      //     'INGREDIENTMEASUREMENT',
      //   );
      //   if (ingredientCount_store !== 'null') {
      //     setcount(JSON.parse(ingredientCount_store) + 1);
      //     setIngredientString(JSON.parse(ingredientString_store));
      //     setIngredientName(JSON.parse(ingredientName_store));
      //     setIngredientAmount(JSON.parse(ingredientAmount_store));
      //     setIngredientMeasurement(JSON.parse(ingredientMeasurement_store));
      //   }
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
  const disabled = (index: number): boolean => {
    if (ingredientCount - 1 !== index) {
      return true;
    }
    return false;
  };
  const handleIName = (e: any) => {
    const newName = e.target.value;
    window.localStorage.setItem('INGREDIENTNAME', JSON.stringify(newName));
    setIngredientName(newName);
  };

  const handleIAmount = (value: any) => {
    const newAmount = value;
    window.localStorage.setItem('INGREDIENTAMOUNT', JSON.stringify(newAmount));
    setIngredientAmount(newAmount);
  };

  const handleIMeasurement = (e: any) => {
    const newMeasurement = e.target.value;
    window.localStorage.setItem(
      'INGREDIENTMEASUREMENT',
      JSON.stringify(newMeasurement),
    );
    setIngredientMeasurement(newMeasurement);
  };

  function incrementCount() {
    //create new ingredient String
    const newIngredient =
      ingredientName + ' ' + ingredientAmount + ' ' + ingredientMeasurement;
    //set previous names
    // setprevIngredientName(ingredientName);
    // setprevIngredientAmount(ingredientAmount);
    // setprevIngredientMeasurement(ingredientMeasurement);
    //append to back of ingredeitn string state
    const helperString = ingredientString;
    helperString.push(newIngredient);
    setIngredientString(helperString);
    //clear data
    setIngredientAmount(0);
    setIngredientMeasurement('');
    setIngredientName('');

    //testing
    console.log(ingredientString);

    setcount(prevCount => prevCount + 1);
  }

  function decrementCount() {
    ingredientString.pop();
    console.log(ingredientString);
    setcount(prevCount => {
      if (prevCount > 1) {
        // setIngredientMeasurement(previngredientMeasurement);
        // setIngredientAmount(previngredientAmount);
        // setIngredientName(previngredientName);

        return prevCount - 1;
      }
      return prevCount;
    });
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
      {Array.from({length: ingredientCount}).map((_, index) => (
        <Flex key={index}>
          <React.Fragment>
            <FormControl mr="5%">
              <FormLabel htmlFor={`ingredient-${index}`} fontWeight={'normal'}>
                Ingredient Name #{`${index}`}
              </FormLabel>
              <Input
                id={`ingredient-${index}`}
                placeholder="Ingredient..."
                onChange={handleIName}
                isDisabled={disabled(index)}
                isRequired={true}
              />
            </FormControl>

            <FormControl mr="5%">
              <FormLabel htmlFor={`amount-${index}`} fontWeight={'normal'}>
                Amount
              </FormLabel>
              <NumberInput
                max={999}
                min={0}
                onChange={handleIAmount}
                isDisabled={disabled(index)}
                isRequired={true}>
                <NumberInputField id={`amount-${index}`} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor={`unit-${index}`} fontWeight={'normal'}>
                Unit of Measurement
              </FormLabel>
              <Select
                id={`unit-${index}`}
                placeholder=""
                focusBorderColor="brand.400"
                shadow="sm"
                size="md"
                w="full"
                rounded="md"
                onChange={handleIMeasurement}
                isDisabled={disabled(index)}
                isRequired={true}>
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
      ))}
      <Flex>
        <Button
          onClick={incrementCount}
          colorScheme="green"
          variant="solid"
          mt={8}
          w="16rem"
          mr="5%"
          marginLeft="10%"
          isDisabled={disableAdd()}>
          Add Ingredient <IoIosAdd />
        </Button>
        <Button
          onClick={decrementCount}
          colorScheme="red"
          variant="solid"
          mt={8}
          mr="5%"
          w="16rem"
          marginLeft="5%"
          isDisabled={disableRemove()}>
          Remove Ingredient <IoIosRemove />
        </Button>
      </Flex>
    </>
  );
};

const Form3 = () => {
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    const instructions_storage: any = window.localStorage.getItem('INSTRUCTIONS');
    if (instructions !== 'null') {
      setInstructions(JSON.parse(instructions_storage));
    }
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
  const recipeFromStorage:any = window.localStorage.getItem('RECIPENAME');
  const recipeName = JSON.parse(recipeFromStorage);
  const cookingTimeStorage:any = window.localStorage.getItem('COOKINGTIME');
  const cookingTime = JSON.parse(cookingTimeStorage);
  const difficultyStorage:any = window.localStorage.getItem('DIFFICULTY');
  const difficulty = JSON.parse(difficultyStorage);
  const appliancesStorage:any = window.localStorage.getItem('APPLIANCES');
  const appliances = JSON.parse(appliancesStorage);
  const costStorage:any = window.localStorage.getItem('COST');
  const cost = JSON.parse(costStorage);
  const allergensStorage:any = window.localStorage.getItem('ALLERGENS');
  const allergens = JSON.parse(allergensStorage);
  const servingsStorage:any = window.localStorage.getItem('SERVINGS');
  const servings = JSON.parse(servingsStorage);
  const instructionsStorage:any = window.localStorage.getItem('INSTRUCTIONS');
  const instructions = JSON.parse(instructionsStorage);

  return (
    <>
      <Box
        borderWidth="1px"
        rounded="lg"
        shadow="1px 1px 3px rgba(0,0,0,0.3)"
        maxWidth={800}
        p={6}
        m="10px auto"
        as="form">
        <Progress
          hasStripe
          value={progress}
          mb="5%"
          mx="5%"
          isAnimated></Progress>
        {step === 1 ? <Form1 /> : step === 2 ? <Form2 /> : <Form3 />}
        <ButtonGroup mt="5%" w="100%">
          <Flex w="100%" justifyContent="space-between">
            <Flex>
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
            </Flex>
            {step === 3 ? (
              <Button
                w="7rem"
                colorScheme="red"
                variant="solid"
                onClick={() => {
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
                  let ingredients: string[] = [
                    'cooked rice one cup',
                    'chicken breast one pound',
                    'broccoli half cup',
                  ];
                  toDB(recipeName, servings, allergens, appliances, cookingTime, cost, difficulty, false, ingredients, instructions);
                  window.localStorage.clear();
                }}>
                Submit
              </Button>
            ) : null}
          </Flex>
        </ButtonGroup>
      </Box>
    </>
  );
}
