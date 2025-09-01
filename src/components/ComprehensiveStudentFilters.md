# ComprehensiveStudentFilters Component

## Overview

A comprehensive filtering component for the GSP Finance student management system. This component provides advanced filtering capabilities with a clean, modern interface using plain CSS styling.

## Features

### 🔍 **Search Functionality**

- Search students by name, ID, or email
- Real-time search with visual feedback
- Search icon and placeholder text

### 📅 **Academic Year Filtering**

- Dropdown with all available academic years
- Shows current year indicator
- Loading state while fetching data
- Add new academic year button (optional)

### 📊 **Status Filtering**

Based on backend `ENROLLMENT_STATUS` options:

- **All Students** - No filter applied
- **Active Students** - Currently enrolled
- **Left Students** - Withdrawn from school
- **Suspended Students** - Temporarily suspended
- **Graduated Students** - Completed their studies
- **Transferred Students** - Moved to another school

### 🏫 **Class Filtering**

- Dropdown with all available school classes
- Loading state while fetching data
- Add new class button (optional)

### 👥 **Advanced Filters** (Expandable)

- **Gender Filter**: All Genders, Male, Female
- **Student Type Filter**: All Types, New Students, Returning Students, Transfer Students
- **More Filters**: Placeholder for future enhancements

### 🎯 **Active Filters Display**

- Visual badges showing currently applied filters
- Click to remove individual filters
- Clear all filters button
- Filter statistics showing filtered vs total students

## Props

| Prop                   | Type     | Required | Description                         |
| ---------------------- | -------- | -------- | ----------------------------------- |
| `searchTerm`           | string   | ✅       | Current search term                 |
| `onSearchChange`       | function | ✅       | Callback when search changes        |
| `selectedAcademicYear` | string   | ✅       | Selected academic year ID           |
| `onAcademicYearChange` | function | ✅       | Callback when academic year changes |
| `academicYears`        | array    | ❌       | Array of academic year objects      |
| `loadingAcademicYears` | boolean  | ❌       | Loading state for academic years    |
| `selectedStatus`       | string   | ✅       | Selected enrollment status          |
| `onStatusChange`       | function | ✅       | Callback when status changes        |
| `selectedClass`        | string   | ✅       | Selected class ID                   |
| `onClassChange`        | function | ✅       | Callback when class changes         |
| `classes`              | array    | ❌       | Array of class objects              |
| `loadingClasses`       | boolean  | ❌       | Loading state for classes           |
| `selectedGender`       | string   | ✅       | Selected gender filter              |
| `onGenderChange`       | function | ✅       | Callback when gender changes        |
| `selectedStudentType`  | string   | ✅       | Selected student type filter        |
| `onStudentTypeChange`  | function | ✅       | Callback when student type changes  |
| `onClearFilters`       | function | ❌       | Callback to clear all filters       |
| `onAddNewAcademicYear` | function | ❌       | Callback to add new academic year   |
| `onAddNewClass`        | function | ❌       | Callback to add new class           |
| `totalStudents`        | number   | ❌       | Total number of students            |
| `filteredStudents`     | number   | ❌       | Number of filtered students         |

## Data Structure

### Academic Year Object

```javascript
{
  id: string,
  year_name: string,
  is_current_year: boolean
}
```

### Class Object

```javascript
{
  id: string,
  class_name: string
}
```

## Usage Example

```jsx
import ComprehensiveStudentFilters from "./components/ComprehensiveStudentFilters";

function StudentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ACTIVE");
  // ... other state

  return (
    <ComprehensiveStudentFilters
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      selectedStatus={selectedStatus}
      onStatusChange={setSelectedStatus}
      // ... other props
      totalStudents={500}
      filteredStudents={45}
    />
  );
}
```

## Backend Integration

The component is designed to work with the GSP Finance backend:

### API Endpoints Used:

- `/academic_years/api/academic-years` - Get academic years
- `/classes/api/classes` - Get school classes
- `/students/api` - Get filtered students

### Filter Parameters:

- `search` - Search term
- `academic_year` - Academic year ID
- `status` - Enrollment status
- `school_class` - Class ID
- `gender` - Gender filter
- `is_new_student` - Boolean for new students
- `is_transfer_student` - Boolean for transfer students

## Styling

The component uses plain CSS with inline styles for:

- ✅ **Responsiveness** - Grid layouts that adapt to screen size
- ✅ **Modern Design** - Clean borders, shadows, and spacing
- ✅ **Interactive Elements** - Hover effects and focus states
- ✅ **Loading States** - Spinning animations and disabled states
- ✅ **Visual Feedback** - Color-coded status indicators

## Advanced Features

### 🎛️ **Collapsible Advanced Filters**

- Toggle between basic and advanced view
- Saves space when not needed
- Maintains state when collapsed

### 🏷️ **Filter Tags**

- Visual representation of active filters
- One-click removal of individual filters
- Batch clear all functionality

### 📈 **Real-time Statistics**

- Shows filtered vs total counts
- Updates as filters change
- Helpful for understanding filter impact

## Customization

The component is designed to be easily customizable:

1. **Colors**: Update CSS color values in styles
2. **Layout**: Modify grid templates for different arrangements
3. **Icons**: Replace emoji icons with icon libraries
4. **Additional Filters**: Add new filter types in advanced section

## Performance Considerations

- ✅ Filter state is managed externally for better parent control
- ✅ Loading states prevent multiple API calls
- ✅ Efficient re-rendering with proper dependency arrays
- ✅ Debounced search recommendations for large datasets

## Future Enhancements

- 🔄 **Filter Presets**: Save and load common filter combinations
- 📱 **Mobile Optimization**: Better mobile layout and touch interactions
- 🔍 **Advanced Search**: Multiple field search with operators
- 📊 **Filter Analytics**: Track most used filters
- 💾 **Filter Memory**: Remember last used filters
