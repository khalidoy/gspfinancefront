import React, { memo } from "react";
import { TableCell, TableRow, Checkbox, CircularProgress } from "@mui/material";

// Extract student row rendering to separate component for better memoization
const StudentRow = memo(
  ({
    student,
    months,
    selectedStudentIds,
    onSelectStudent,
    handleRowClick,
    handleCellClick,
    editingCell,
    isSaving,
    tempValue,
    setTempValue,
    handleKeyDown,
    handleBlur,
    displayValue,
    getCellClass,
    getClassNameFromRef,
  }) => {
    // Component for just one row, highly optimized
    // ...extracted from main component

    return <React.Fragment>{/* Student row rendering logic */}</React.Fragment>;
  }
);

export default StudentRow;
