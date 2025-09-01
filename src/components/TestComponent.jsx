import React from 'react';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

const TestComponent = () => {
  const quickFilters = [
    {
      label: "Test",
      icon: FaFilter,
      color: "blue",
      onClick: () => console.log('clicked'),
      isActive: false
    }
  ];

  return (
    <div>
      {quickFilters.map((filter, index) => {
        const IconComponent = filter.icon;
        return (
          <button key={index} onClick={filter.onClick}>
            <IconComponent />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

export default TestComponent;
