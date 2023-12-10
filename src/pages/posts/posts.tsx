import React, {useState, useEffect} from 'react';
import {db, storage} from '../../firebaseConfig';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import {useNavigate} from 'react-router-dom';
import Navbar from '../../components/Navbar';
import {useToast} from '@chakra-ui/react';
import {Link} from 'react-router-dom';
import {
  Box,
  Stack,
  Text,
  Button,
  Flex,
  Input,
  Heading,
  Center,
  FormControl,
  FormLabel,
  Textarea,
  FormHelperText,
  Select,
  HStack,
  Image,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';

// function to get the index of a recipe using its name
function getRecipeIndex(recipes: any[], recipe_name: string): number {
  for (let i = 0; i < recipes.length; i++) {
    // if the name matches, return the index
    if (recipes[i]?.data.recipe_name === recipe_name) {
      return i;
    }
  }
  return -1;
}

// function to send data to the database (db)
async function toDB(
  // parameters that will be sent to db
  title: string,
  description: string,
  recipe: any,
  pic: string,
) {
  // get the active user's account using their email
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  const getUser = doc(db, 'users/', email);
  const getUserData = await getDoc(getUser);
  // get their username
  const username = getUserData?.data()?.username;
  // get the current date
  const date = new Date();

  // update the recipe that is being posted
  const recipeDoc = doc(
    db,
    'users/',
    email,
    'Recipes/',
    recipe.data.recipe_name,
  );
  // change posted to true, indicating that this recipe has been posted
  const updated = await updateDoc(recipeDoc, {
    posted: true,
  });
  const comments: any[] = [];
  // create a document, assign these variables
  await addDoc(collection(db, 'posts'), {
    // name in database: variable
    email: email,
    username: username,
    date_time: date,
    title: title,
    description: description,
    recipe: recipe,
    likes: 0,
    pic: pic,
    comments: comments,
  });
}
const Posts: React.FC = () => {
  // toast for popups
  const toast = useToast();

  // useState's to create variables
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [recipeName, setRecipeName] = useState<any>();
  const [postRecipe, setPostRecipe] = useState<any>();
  // selected file is for immediate display
  const [selectedFile, setSelectedFile] = useState<any>();
  // fileLink is for the db
  const [fileLink, setFileLink] = useState<any>();

  // get the current user from db
  const email = JSON.parse(localStorage.getItem('EMAIL') as string);
  // navigate to switch pages
  const navigate = useNavigate();

  useEffect(() => {
    // create listener to db
    const recipesQuery = query(collection(db, 'users/' + email + '/Recipes'));
    const recipesSnapshot = onSnapshot(recipesQuery, querySnapshot => {
      const temp: any[] = [];
      var tempNum = 0;
      querySnapshot.forEach(doc => {
        temp.push(doc.data());
      });
      // set data to: recipes
      setRecipes(temp);
    });
    // pull any data that has been stored in local storage
    if (window.localStorage.getItem('TITLE')) {
      const title_store: any = window.localStorage.getItem('TITLE');
      setTitle(JSON.parse(title_store));
    }
    if (window.localStorage.getItem('DESCRIPTION')) {
      const description_store: any = window.localStorage.getItem('DESCRIPTION');
      setDescription(JSON.parse(description_store));
    }
    if (window.localStorage.getItem('RECIPE')) {
      const recipe_store: any = window.localStorage.getItem('RECIPE');
      setPostRecipe(JSON.parse(recipe_store));
    }
  }, []);

  // function to uplaod an image to firebase storage and firestore
  async function uploadImage(file: any) {
    // storageRef created with random key
    const storageRef = ref(storage, Math.random().toString(16).slice(2));
    // 'file' comes from the Blob or File API
    // upload the file to storage
    uploadBytes(storageRef, file).then(async snapshot => {
      // once the file has been uploaded, set fileLink to the downloadURL
      await getDownloadURL(snapshot.ref).then(link => {
        setFileLink(link);
      });
    });
  }

  //Disables submit button
  const isDisabled = () => {
    if (
      title === '' ||
      description === '' ||
      recipeName === '' ||
      selectedFile === ''
    ) {
      return true;
    } else {
      return false;
    }
  };

  // methods to handle input changes (title, description, recipe)
  // store the updates in local storage and the useStates
  const handleTitleChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('TITLE', JSON.stringify(targ));
    setTitle(targ);
  };
  /**
   * 
   * @param e 
   */
  const handleDescriptionChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('DESCRIPTION', JSON.stringify(targ));
    setDescription(targ);
  };
/**
 * 
 * @param e 
 */
  const handleRecipeChange = (e: any) => {
    const targ = e.target.value;
    window.localStorage.setItem('RECIPE', JSON.stringify(targ));
    setRecipeName(targ);
  };

  // function to handle the submission of the form
  const handleSubmit = () => {
    // get the title, description, and recipe data
    const title = JSON.parse(localStorage.getItem('TITLE') as string);
    const description = JSON.parse(
      localStorage.getItem('DESCRIPTION') as string,
    );
    // recipe data is found using the getRecipeIndex function
    const recipe =
      recipes[
        getRecipeIndex(
          recipes,
          JSON.parse(localStorage.getItem('RECIPE') as string),
        )
      ];
    // send this data to the DB!
    toDB(title, description, recipe, fileLink as string);
    console.log('Document created!');
    navigate('/explore');
  };

  return (
    <>
      <Navbar />
      <Flex
        w={'full'}
        h={'100'}
        backgroundImage={
          'url(https://hips.hearstapps.com/hmg-prod/images/wdy050113taco-01-1624540365.jpg)'
        }
        backgroundSize={'cover'}
        backgroundPosition={'center center'}
        alignContent={'flex-end'}
        backgroundColor="rgba(0, 128, 128, 0.7)">
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
                {/* title */}
                Create Post
              </Text>
            </Stack>
          </VStack>
        </Flex>
      </Flex>

      <Center minH="80vh">
        <Box
          boxShadow="dark-lg"
          rounded="md"
          padding="4"
          color="black"
          minW="container.sm">
          <Heading w="100%" textAlign={'center'} fontWeight="normal" mb="2%">
            {/* form to give details for the post */}
            Post Details
          </Heading>
          <FormControl mt={1}>
            <HStack>
              <FormLabel
                fontSize="lg"
                fontWeight="md"
                color="gray.700"
                _dark={{
                  color: 'gray.50',
                }}>
                Title
              </FormLabel>
              <Input
                variant="flushed"
                // on change (when they type), call the handleTitleChange method
                onChange={handleTitleChange}
                // the default value is the title variable
                value={title}></Input>
            </HStack>
          </FormControl>
          <FormControl mt={1}>
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}>
              {/* input for the post's caption */}
              Caption
            </FormLabel>
            <Textarea
              placeholder="Add a caption"
              rows={3}
              shadow="sm"
              focusBorderColor="brand.400"
              fontSize={{
                sm: 'sm',
              }}
              // when changed, call the handleDescriptionChange method
              onChange={handleDescriptionChange}
              // the default value is the description variable
              value={description}
            />
          </FormControl>
          <FormControl mt={1}>
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}>
              {/* dropdown to choose recipe */}
              Recipe
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
              // on change (when they type), call handleRecipeChange
              onChange={handleRecipeChange}
              // default value is the recipeName variable
              value={recipeName}>
              {/* map the recipes to the dropdown */}
              {recipes.map(recipe => (
                <option>{recipe?.data.recipe_name}</option>
              ))}
            </Select>
            <FormHelperText>
              *You can only choose from your recipe list
            </FormHelperText>
          </FormControl>
          <FormControl mt={1}>
            <FormLabel
              fontSize="sm"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}>
              {/* image input */}
              Image
            </FormLabel>
            <Box>
              <Center>
                {
                  // display the selectedFile when it loads
                  selectedFile && (
                    <div>
                      <Image
                        alt="No Image"
                        width="250px"
                        src={
                          // the src is always selectedFile, updates immediately
                          selectedFile
                        }
                      />
                      <br />
                      <button
                        onClick={
                          // remove button, deletes the file when clicked
                          () => setSelectedFile(undefined)
                        }>
                        Remove
                      </button>
                    </div>
                  )
                }
              </Center>
            </Box>
            <input
              // image input!
              type="file"
              name="myImage"
              onChange={
                // when an image is selected...
                event => {
                  if (event?.target?.files) {
                    // set the chosen file to selectedFile
                    setSelectedFile(URL.createObjectURL(event.target.files[0]));
                    // upload the image
                    uploadImage(event.target.files[0]);
                  }
                }
              }
            />
          </FormControl>

          <Flex justifyContent="right" paddingTop={3}>
            <Link to="/recipes">
              <Button colorScheme="red">Back</Button>
            </Link>
            <Button
              colorScheme="teal"
              isDisabled={isDisabled()}
              onClick={() => {
                // when they submit, handleSubmit and give them a popup
                handleSubmit();
                toast({
                  title: 'Recipe created.',
                  description: "We've created your recipe for you.",
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
              }}
              ml="auto">
              Create Post
            </Button>
          </Flex>
        </Box>
      </Center>
    </>
  );
};

export default Posts;
