import { IconButton, Skeleton, Span } from '@chakra-ui/react'
import * as React from 'react'
import { FaMoon, FaSun } from 'react-icons/fa'

// Simple color mode context for React (not Next.js)
const ColorModeContext = React.createContext()

export function ColorModeProvider({ children }) {
  const [colorMode, setColorMode] = React.useState('light')
  
  const toggleColorMode = () => {
    setColorMode(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <ColorModeContext.Provider value={{ colorMode, setColorMode, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  )
}

export function useColorMode() {
  const context = React.useContext(ColorModeContext)
  if (!context) {
    throw new Error('useColorMode must be used within a ColorModeProvider')
  }
  return context
}

export function useColorModeValue(light, dark) {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? dark : light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? <FaMoon /> : <FaSun />
}

export const ColorModeButton = React.forwardRef(
  function ColorModeButton(props, ref) {
    const { toggleColorMode } = useColorMode()
    return (
      <IconButton
        onClick={toggleColorMode}
        variant='ghost'
        aria-label='Toggle color mode'
        size='sm'
        ref={ref}
        {...props}
        css={{
          _icon: {
            width: '5',
            height: '5',
          },
        }}
      >
        <ColorModeIcon />
      </IconButton>
    )
  },
)

export const LightMode = React.forwardRef(function LightMode(props, ref) {
  return (
    <Span
      color='fg'
      display='contents'
      className='chakra-theme light'
      colorPalette='gray'
      colorScheme='light'
      ref={ref}
      {...props}
    />
  )
})

export const DarkMode = React.forwardRef(function DarkMode(props, ref) {
  return (
    <Span
      color='fg'
      display='contents'
      className='chakra-theme dark'
      colorPalette='gray'
      colorScheme='dark'
      ref={ref}
      {...props}
    />
  )
})
