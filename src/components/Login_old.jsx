import React, { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  Text,
  Flex,
  Link,
  Checkbox,
  InputGroup,
  IconButton,
  Container,
  Center
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Configure axios with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
});

function Login({ onLoginSuccess }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember_me: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.username.trim() || !formData.password) {
        setError('Please enter both username and password');
        setLoading(false);
        return;
      }

      const response = await api.post('/login', formData);
      
      if (response.data && response.data.user) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Call success callback
        if (onLoginSuccess) {
          onLoginSuccess(response.data.user);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" h="100vh">
      <Center h="100%">
        <Box 
          w="100%" 
          maxW="400px" 
          bg="white" 
          shadow="xl" 
          borderRadius="lg" 
          overflow="hidden"
        >
          <Box textAlign="center" p={6} pb={2}>
            <Heading size="lg" color="blue.600">
              {t('login.title', 'GSP Finance')}
            </Heading>
            <Text fontSize="sm" color="gray.600" mt={2}>
              {t('login.subtitle', 'Sign in to your account')}
            </Text>
          </Box>
          
          <Box p={6} pt={4}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                {error && (
                  <Box 
                    bg="red.50" 
                    border="1px" 
                    borderColor="red.200" 
                    borderRadius="md" 
                    p={3} 
                    w="100%"
                  >
                    <Text fontSize="sm" color="red.600">{error}</Text>
                  </Box>
                )}

                <Box w="100%">
                  <Input
                    name="username"
                    placeholder={t('login.username', 'Username or Email')}
                    value={formData.username}
                    onChange={handleChange}
                    isRequired
                    autoComplete="username"
                  />
                </Box>

                <Box w="100%">
                  <InputGroup>
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('login.password', 'Password')}
                      value={formData.password}
                      onChange={handleChange}
                      isRequired
                      autoComplete="current-password"
                      pr={10}
                    />
                    <Box position="absolute" right={2} top="50%" transform="translateY(-50%)">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="sm"
                      />
                    </Box>
                  </InputGroup>
                </Box>

                <Flex w="100%" justify="space-between" align="center">
                  <Checkbox
                    name="remember_me"
                    isChecked={formData.remember_me}
                    onChange={handleChange}
                    size="sm"
                  >
                    {t('login.remember', 'Remember me')}
                  </Checkbox>
                  
                  <Link
                    href="#"
                    fontSize="sm"
                    color="blue.500"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {t('login.forgot', 'Forgot password?')}
                  </Link>
                </Flex>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="100%"
                  isLoading={loading}
                  loadingText={t('login.signingIn', 'Signing in...')}
                >
                  {t('login.signin', 'Sign In')}
                </Button>
              </VStack>
            </form>
          </Box>
        </Box>
      </Center>
    </Container>
  );
}

export default Login;
