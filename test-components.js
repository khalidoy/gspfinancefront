const chakra = require('@chakra-ui/react');

const imports = [
  'Box', 'VStack', 'HStack', 'Text', 'Input', 'Button', 'Badge',
  'Collapsible', 'CollapsibleContent', 'IconButton', 'Checkbox',
  'Slider', 'SliderTrack', 'SliderRange', 'SliderThumb', 'Flex',
  'InputGroup', 'InputElement', 'SimpleGrid', 'Wrap', 'WrapItem',
  'Separator', 'NativeSelect'
];

console.log('Component availability check:');
imports.forEach(comp => {
  if (!chakra[comp]) {
    console.log('❌ MISSING:', comp);
  } else {
    console.log('✅ OK:', comp);
  }
});
