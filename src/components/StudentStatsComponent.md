# Student Statistics Component

## Overview

The StudentStatsComponent provides real-time statistics about students in the GSP Finance system, showing counts for different categories of students based on enrollment status and registration.

## Features

### 📊 **Student Categories**

1. **Left Students** 🚪
   - Students with status: WITHDRAWN, SUSPENDED, GRADUATED, TRANSFERRED
   - Shows students who are no longer actively enrolled

2. **New Students** 🆕
   - Students marked as `is_new_student = true`
   - First-time enrolled students for the current academic year
   - Excludes withdrawn new students

3. **Registered Students** ✅
   - Students who have paid insurance fees
   - Students with payment transactions indicating registration
   - Students with agreed amounts > 0 and some payments

4. **Not Registered Students** ❌
   - Students with insurance fee = 0 DH
   - Students without insurance payment records
   - Students who haven't completed registration process

5. **Total Students** 👥
   - All students matching current filter criteria
   - Base count for percentage calculations

### 📈 **Calculated Metrics**

- **Registration Rate**: (Registered Students / Total Students) × 100%
- **Retention Rate**: ((Total - Left Students) / Total Students) × 100%
- **New Student Rate**: (New Students / Total Students) × 100%

## API Integration

### Endpoint: `/students/api/student-stats`

**Parameters:**

- `academic_year_id` - Filter by academic year
- `class_id` - Filter by specific class
- `search_query` - Search by student name/ID
- `status` - Filter by enrollment status
- `gender` - Filter by gender
- `student_type` - Filter by student type (new/returning/transfer)

**Response:**

```json
{
  "leftStudents": 15,
  "newStudents": 120,
  "registeredStudents": 450,
  "notRegisteredStudents": 30,
  "totalStudents": 480
}
```

## Component Props

| Prop                  | Type   | Description                         |
| --------------------- | ------ | ----------------------------------- |
| `academicYearId`      | string | Required - Academic year to analyze |
| `selectedClassId`     | string | Optional - Specific class filter    |
| `searchQuery`         | string | Optional - Search term filter       |
| `selectedStatus`      | string | Optional - Enrollment status filter |
| `selectedGender`      | string | Optional - Gender filter            |
| `selectedStudentType` | string | Optional - Student type filter      |

## Visual Design

### 🎨 **Color Coding**

- **Red** (#e53e3e) - Left Students (concerning)
- **Green** (#38a169) - New Students (positive)
- **Blue** (#3182ce) - Registered Students (success)
- **Yellow** (#d69e2e) - Not Registered (warning)
- **Purple** (#805ad5) - Total Students (neutral)

### 📱 **Responsive Layout**

- Grid layout adapts to screen size
- Minimum card width: 180px
- Hover effects for interactivity
- Loading states with animation

## Usage Examples

### Basic Usage

```jsx
<StudentStatsComponent academicYearId="670ac94fc3d3342280ec3d62" />
```

### With Filters

```jsx
<StudentStatsComponent
  academicYearId="670ac94fc3d3342280ec3d62"
  selectedClassId="670ac94fc3d3342280ec3d63"
  searchQuery="Ahmed"
  selectedStatus="ACTIVE"
  selectedGender="MALE"
  selectedStudentType="new"
/>
```

## Business Intelligence

### 📊 **Key Insights**

1. **Registration Tracking**
   - Monitor which students haven't completed registration
   - Identify students who need follow-up for insurance payment
   - Track registration completion rates

2. **Enrollment Analysis**
   - Monitor student retention rates
   - Track new student intake
   - Identify dropout patterns

3. **Financial Planning**
   - Understand revenue potential from registered students
   - Identify collection opportunities from unregistered students
   - Plan for new student onboarding costs

### 🎯 **Actionable Metrics**

- **High Not Registered Count**: Follow up with families for insurance payment
- **Low Retention Rate**: Investigate reasons for student departures
- **High New Student Rate**: Ensure adequate resources for onboarding

## Technical Implementation

### Data Sources

- **Student Model**: Enrollment status, student type flags
- **PaymentTransaction Model**: Insurance and registration payments
- **MonthlyFeeStructure Model**: Agreed amounts and fee structures
- **StudentFinancials Model**: Financial summaries

### Performance Optimization

- Server-side filtering to reduce data transfer
- Caching of statistics for frequently accessed data
- Efficient MongoDB aggregation queries
- Real-time updates when filters change

## Future Enhancements

1. **Historical Trends**: Track statistics over time
2. **Comparative Analysis**: Compare across academic years
3. **Export Functionality**: Generate reports for administration
4. **Alerts**: Notify when statistics cross thresholds
5. **Drill-down**: Click to see detailed student lists for each category
