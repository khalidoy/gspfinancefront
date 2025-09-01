import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import EditableStudentModal from "../components/EditableStudentModal";
import AddStudentModalPlain from "../components/AddStudentModalPlain";
// Removed ComprehensiveStudentFilters (replaced by UnpaidMonthFilter)
import UnpaidMonthFilter from "../components/UnpaidMonthFilter";
import StudentStatsComponent from "../components/StudentStatsComponent";
import ClassCardComponent from "../components/ClassCardComponent";
import SearchComponent from "../components/SearchComponent";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Flex,
  Spinner,
  Center,
} from "@chakra-ui/react";

// Import our components
import PaymentGrid from "../components/PaymentGrid";
import { FaHome, FaPlus } from "react-icons/fa";

function Home() {
  // Use static values for colors
  const bgColor = "gray.50";

  // State management
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");

  // Unified filter state - all components modify this one state
  const [filters, setFilters] = useState({
    statisticFilter: "total", // Default to 'total' (all students) when page loads
    unpaidMonth: null, // selected unpaid month key
    searchQuery: "", // search filter for student names/IDs
  });

  // Helper function to update filters
  const updateFilter = (filterKey, value) =>
    setFilters((prev) => ({ ...prev, [filterKey]: value }));

  // Helper function to reset all filters
  // resetAllFilters removed (not used after filter simplification)

  // Dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [studentGrid, setStudentGrid] = useState([]);
  const [months, setMonths] = useState([]);
  const [summary, setSummary] = useState(null);
  // NEW: raw all students for academic year (single source for client filtering)
  const [allStudents, setAllStudents] = useState([]); // unfiltered
  const [filteredStudents, setFilteredStudents] = useState([]); // after applying filters
  const [classBuckets, setClassBuckets] = useState({}); // classId -> {classInfo, students: []}
  const [loadingAllStudents, setLoadingAllStudents] = useState(false);

  // Loading states
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  const [loadingStudentDetail, setLoadingStudentDetail] = useState(false);

  // Error state
  const [error, setError] = useState("");

  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true);
    setError("");

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/home/api/class-summary?academic_year_id=${selectedAcademicYear}`
      );

      if (response.data.classes) {
        setClasses(response.data.classes);
        // Clear previous selections
        setSelectedClassId("");
        setDashboardData(null);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to fetch classes. Please try again.");
    } finally {
      setLoadingClasses(false);
    }
  }, [selectedAcademicYear]);

  // Removed clear-all filters handler (no longer needed with simplified filters)

  const handleStatisticClick = useCallback((filterType) => {
    setFilters((prev) => ({ ...prev, statisticFilter: filterType }));
    setSelectedClassId("");
  }, []);

  // Fetch ALL students once academic year changes (single bulk endpoint)
  useEffect(() => {
    const fetchAll = async () => {
      if (!selectedAcademicYear) return;
      setLoadingAllStudents(true);
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/students/api/all-by-year?academic_year_id=${selectedAcademicYear}`;
        const res = await axios.get(url);
        if (res.data && Array.isArray(res.data.students)) {
          setAllStudents(res.data.students);
        } else {
          setAllStudents([]);
        }
      } catch (e) {
        console.error("Failed loading all students", e);
        setAllStudents([]);
      } finally {
        setLoadingAllStudents(false);
      }
    };
    fetchAll();
  }, [selectedAcademicYear]);

  // Helper: unpaid month predicate (final rule)
  // Final unpaid logic: A student is unpaid for a month IF total paid for that month == 0
  // Fields are: september_tuition, september_transport, etc. (no _real suffix)
  const isUnpaidForMonth = (student, monthKey) => {
    if (!monthKey) return false;
    if (monthKey === "insurance") {
      const paid = Number(student?.financial?.actual?.annual_insurance) || 0;
      return paid === 0;
    }

    const actual = student?.financial?.actual || {};
    const tuitionPaid = Number(actual[`${monthKey}_tuition`]) || 0;
    const transportPaid = Number(actual[`${monthKey}_transport`]) || 0;
    const total = tuitionPaid + transportPaid;

    return total === 0;
  };

  // Derived filtering applied locally
  useEffect(() => {
    // Build active filters
    const { statisticFilter, unpaidMonth, searchQuery } = filters;
    const statType = statisticFilter;
    const active = allStudents.filter((s) => {
      // Search filter (client-side)
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const name = (s.full_name || "").toLowerCase();
        const studentId = (s.student_id || "").toLowerCase();
        if (!name.includes(query) && !studentId.includes(query)) {
          return false;
        }
      }

      // Status filters
      if (statType === "left") {
        const leftStatuses = [
          "WITHDRAWN",
          "SUSPENDED",
          "GRADUATED",
          "TRANSFERRED",
        ];
        if (!leftStatuses.includes(s.enrollment_status)) return false;
      } else if (statType && statType !== "total") {
        // For other filters (except 'total') exclude left students
        const leftStatuses = [
          "WITHDRAWN",
          "SUSPENDED",
          "GRADUATED",
          "TRANSFERRED",
        ];
        if (leftStatuses.includes(s.enrollment_status)) return false;
      }

      // Student type filters
      const typeToken = statType;
      if (typeToken === "new" && !s.is_new_student) return false;
      if (typeToken === "transfer" && !s.is_transfer_student) return false;
      if (typeToken === "returning") {
        if (s.is_new_student || s.is_transfer_student) return false;
      }

      // Registration filters (based on insurance payment)
      if (typeToken === "registered") {
        const insurancePaid = (s.financial?.actual?.annual_insurance || 0) > 0;
        if (!insurancePaid) return false;
      }
      if (typeToken === "notRegistered") {
        const insurancePaid = (s.financial?.actual?.annual_insurance || 0) > 0;
        if (insurancePaid) return false;
      }

      // 'total' filter shows all students (no additional filtering)

      // Unpaid month filter
      if (unpaidMonth && !isUnpaidForMonth(s, unpaidMonth)) return false;
      return true;
    });
    setFilteredStudents(active);

    // Bucket by class
    const buckets = {};
    active.forEach((s) => {
      const cls = s.school_class || {};
      const cid = cls.id || "no-class";
      if (!buckets[cid]) {
        buckets[cid] = { classInfo: cls, students: [] };
      }
      buckets[cid].students.push(s);
    });
    setClassBuckets(buckets);
  }, [allStudents, filters]);

  // When a class card is selected, derive studentGrid locally instead of refetching
  useEffect(() => {
    if (!selectedClassId) {
      setStudentGrid([]);
      setMonths([
        "september",
        "october",
        "november",
        "december",
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "insurance",
      ]);
      setSummary(null);
      return;
    }
    const studentsInClass = filteredStudents.filter(
      (s) => s.school_class?.id === selectedClassId
    );

    // Transform to PaymentGrid expected structure with proper months data
    const grid = studentsInClass.map((s) => {
      const months = {};
      const monthsList = [
        "september",
        "october",
        "november",
        "december",
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
      ];

      // Build months structure for each month
      monthsList.forEach((month) => {
        const financial = s.financial || {};
        const actual = financial.actual || {};
        const agreed = financial.agreed || {};

        const tuitionPaid = actual[`${month}_tuition`] || 0;
        const tuitionAgreed = agreed[`${month}_tuition`] || 0;
        const transportPaid = actual[`${month}_transport`] || 0;
        const transportAgreed = agreed[`${month}_transport`] || 0;

        // Calculate status
        const getTuitionStatus = () => {
          if (tuitionAgreed === 0) return "na";
          if (tuitionPaid >= tuitionAgreed) return "paid";
          if (tuitionPaid > 0) return "partial";
          return "unpaid";
        };

        const getTransportStatus = () => {
          if (transportAgreed === 0) return "na";
          if (transportPaid >= transportAgreed) return "paid";
          if (transportPaid > 0) return "partial";
          return "unpaid";
        };

        months[month] = {
          tuition: {
            agreed: tuitionAgreed,
            paid: tuitionPaid,
            status: getTuitionStatus(),
          },
          transport: {
            agreed: transportAgreed,
            paid: transportPaid,
            status: getTransportStatus(),
          },
          total: {
            agreed: tuitionAgreed + transportAgreed,
            paid: tuitionPaid + transportPaid,
            status:
              tuitionAgreed + transportAgreed === 0
                ? "na"
                : tuitionPaid + transportPaid >= tuitionAgreed + transportAgreed
                ? "paid"
                : tuitionPaid + transportPaid > 0
                ? "partial"
                : "unpaid",
          },
        };
      });

      return {
        id: s.id,
        full_name: s.full_name,
        insurance: {
          agreed: s.financial?.agreed?.annual_insurance || 0,
          paid: s.financial?.actual?.annual_insurance || 0,
        },
        financial_record: {
          // adapt to expected structure in PaymentGrid
          agreed_fees: s.financial?.agreed || {},
          actual_payments: s.financial?.actual || {},
        },
        months: months,
      };
    });
    // Build summary (simple aggregated agreed vs paid)
    const summaryAgg = {
      total_students: grid.length,
      total_agreed: 0,
      total_paid: 0,
    };
    grid.forEach((r) => {
      // approximate sums
      const agreed = Object.entries(r.financial_record.agreed_fees).reduce(
        (a, [k, v]) => a + (typeof v === "number" ? v : 0),
        0
      );
      const paid = Object.entries(r.financial_record.actual_payments).reduce(
        (a, [k, v]) => a + (typeof v === "number" ? v : 0),
        0
      );
      summaryAgg.total_agreed += agreed;
      summaryAgg.total_paid += paid;
    });
    summaryAgg.collection_rate =
      summaryAgg.total_agreed > 0
        ? Math.round((summaryAgg.total_paid / summaryAgg.total_agreed) * 100)
        : 0;
    setStudentGrid(grid);
    setSummary(summaryAgg);
  }, [selectedClassId, filteredStudents]);

  // Provide to ClassCardComponent a lightweight data prop with financial info
  const classCardData = Object.values(classBuckets).map((b) => {
    const students = b.students || [];

    // Calculate financial stats for this class
    let totalAgreed = 0;
    let totalPaid = 0;
    let fullyPaidCount = 0;
    let unpaidCount = 0;

    students.forEach((student) => {
      const financial = student.financial || {};
      const agreed = financial.agreed || {};
      const actual = financial.actual || {};

      // Sum all monthly fees + annual fees
      const monthsAgreed = [
        "september",
        "october",
        "november",
        "december",
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
      ].reduce((sum, month) => {
        return (
          sum +
          (Number(agreed[`${month}_tuition`]) || 0) +
          (Number(agreed[`${month}_transport`]) || 0)
        );
      }, 0);
      const monthsPaid = [
        "september",
        "october",
        "november",
        "december",
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
      ].reduce((sum, month) => {
        return (
          sum +
          (Number(actual[`${month}_tuition`]) || 0) +
          (Number(actual[`${month}_transport`]) || 0)
        );
      }, 0);

      const studentTotalAgreed =
        monthsAgreed +
        (Number(student?.insurance?.agreed) || 0) +
        (Number(agreed.annual_registration) || 0);
      const studentTotalPaid =
        monthsPaid +
        (Number(student?.insurance?.paid) || 0) +
        (Number(actual.annual_registration) || 0);

      totalAgreed += studentTotalAgreed;
      totalPaid += studentTotalPaid;

      if (studentTotalPaid >= studentTotalAgreed && studentTotalAgreed > 0) {
        fullyPaidCount++;
      }
      if (studentTotalPaid === 0 && studentTotalAgreed > 0) {
        unpaidCount++;
      }
    });

    return {
      id: b.classInfo.id,
      name: b.classInfo.name,
      section_name: b.classInfo.section_name,
      student_count: students.length,
      financial_stats: {
        total_agreed: totalAgreed,
        total_paid: totalPaid,
        collection_rate:
          totalAgreed > 0
            ? ((totalPaid / totalAgreed) * 100).toFixed(1)
            : "0.0",
        fully_paid_count: fullyPaidCount,
        unpaid_count: unpaidCount,
      },
    };
  });

  const handleClassCardSelect = useCallback((classId) => {
    console.log("Class card selected:", classId);
    setSelectedClassId(classId);

    // Smooth scroll to payment table
    setTimeout(() => {
      const tableElement = document.getElementById("payment-table-section");
      if (tableElement) {
        tableElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  }, []);

  const fetchStudentDetail = useCallback(async (studentId) => {
    console.log("fetchStudentDetail called with studentId:", studentId);
    setLoadingStudentDetail(true);
    setError("");

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/home/api/student-detail/${studentId}`
      );

      console.log("Student detail response:", response.data);
      if (response.data) {
        setSelectedStudentData(response.data);
      }
    } catch (err) {
      console.error("Error fetching student detail:", err);
      setError("Failed to fetch student details. Please try again.");
    } finally {
      setLoadingStudentDetail(false);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    console.log("fetchDashboardData called with:", {
      selectedAcademicYear,
      selectedClassId,
      filters,
    });
    setLoadingDashboard(true);
    setError("");

    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}/home/api/dashboard-data?academic_year_id=${selectedAcademicYear}&class_id=${selectedClassId}`;

      // Add comprehensive filters - only add non-empty values
      if (filters.searchQuery && filters.searchQuery.trim()) {
        url += `&search_query=${encodeURIComponent(
          filters.searchQuery.trim()
        )}`;
      }

      if (filters.selectedGender && filters.selectedGender !== "") {
        url += `&gender=${filters.selectedGender}`;
      }

      if (filters.selectedStudentType && filters.selectedStudentType !== "") {
        url += `&student_type=${filters.selectedStudentType}`;
      }

      if (filters.selectedUnpaidMonth && filters.selectedUnpaidMonth !== "") {
        url += `&unpaid_month=${filters.selectedUnpaidMonth}`;
      }

      // Add statistic filter only if no manual filters are applied
      if (
        filters.statisticFilter &&
        !filters.selectedStudentType &&
        !filters.selectedUnpaidMonth
      ) {
        switch (filters.statisticFilter) {
          case "new":
            url += "&student_type=new";
            break;
          case "left":
            url += "&student_type=left";
            break;
          case "registered":
            url += "&has_insurance=true";
            break;
          case "notRegistered":
            url += "&has_insurance=false";
            break;
          default:
            break;
        }
      }

      const response = await axios.get(url);

      if (response.data) {
        console.log(
          "Dashboard data received:",
          response.data.student_grid?.length,
          "students"
        );

        // Log active filters
        const activeFilters = [];
        if (filters.searchQuery && filters.searchQuery.trim())
          activeFilters.push(`Search: "${filters.searchQuery}"`);
        if (filters.selectedGender)
          activeFilters.push(`Gender: ${filters.selectedGender}`);
        if (filters.selectedStudentType)
          activeFilters.push(`Type: ${filters.selectedStudentType}`);
        if (filters.selectedUnpaidMonth)
          activeFilters.push(`Unpaid Month: ${filters.selectedUnpaidMonth}`);
        if (
          filters.statisticFilter &&
          !filters.selectedStudentType &&
          !filters.selectedUnpaidMonth
        )
          activeFilters.push(`Statistic: ${filters.statisticFilter}`);

        if (activeFilters.length > 0) {
          console.log(`Active filters: ${activeFilters.join(", ")}`);
        }

        setDashboardData(response.data);
        setStudentGrid(response.data.student_grid || []);
        setMonths(response.data.months || []);
        setSummary(response.data.summary || null);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to fetch dashboard data. Please try again.");
    } finally {
      setLoadingDashboard(false);
    }
  }, [selectedAcademicYear, selectedClassId, filters]);

  const handleStudentClick = useCallback(
    (student) => {
      console.log("handleStudentClick called with student:", student);
      setShowStudentModal(true);
      fetchStudentDetail(student.id);
    },
    [fetchStudentDetail]
  );

  const handleCloseStudentModal = useCallback(() => {
    setShowStudentModal(false);
    setSelectedStudentData(null);
  }, []);

  const handleStudentUpdated = useCallback(
    async (updatedStudent) => {
      console.log("Student updated, refreshing data:", updatedStudent);

      // Update the student in the grid immediately for responsive UI
      setStudentGrid((prevGrid) =>
        prevGrid.map((student) =>
          student.id === updatedStudent.id
            ? { ...student, ...updatedStudent }
            : student
        )
      );

      // Refresh dashboard data in background to update disabled cells and summary statistics
      // This ensures the grid reflects the new enrollment month logic
      if (selectedAcademicYear && selectedClassId) {
        try {
          console.log("Refreshing dashboard data after student update...");
          await fetchDashboardData();
          console.log("Dashboard data refreshed successfully");
        } catch (error) {
          console.error(
            "Error refreshing dashboard after student update:",
            error
          );
        }
      }
    },
    [selectedAcademicYear, selectedClassId, fetchDashboardData]
  );

  // Handle agreed amount editing
  const handleAgreedEdit = useCallback(
    async (studentId, month, paymentType, newAgreedAmount) => {
      console.log("handleAgreedEdit called:", {
        studentId,
        month,
        paymentType,
        newAgreedAmount,
      });

      // Update the studentGrid immediately for UI responsiveness
      setStudentGrid((prevGrid) =>
        prevGrid.map((student) => {
          if (student.id === studentId) {
            // Handle insurance separately
            if (month === "insurance") {
              return {
                ...student,
                financial_record: {
                  ...student.financial_record,
                  agreed_fees: {
                    ...student.financial_record?.agreed_fees,
                    annual_insurance: newAgreedAmount,
                  },
                },
              };
            }

            // Handle monthly payments
            const monthData = student.months?.[month] || {};
            const tuitionData = monthData.tuition || {};
            const transportData = monthData.transport || {};
            const totalData = monthData.total || {};

            const updatedStudent = {
              ...student,
              months: {
                ...student.months,
                [month]: {
                  ...monthData,
                  [paymentType]: {
                    ...monthData[paymentType],
                    agreed: newAgreedAmount,
                  },
                  // Recalculate total agreed
                  total: {
                    ...totalData,
                    agreed:
                      (paymentType === "tuition"
                        ? newAgreedAmount
                        : tuitionData.agreed || 0) +
                      (paymentType === "transport"
                        ? newAgreedAmount
                        : transportData.agreed || 0),
                  },
                },
              },
            };
            return updatedStudent;
          }
          return student;
        })
      );

      try {
        // Call backend API to save the agreed amount
        const currentUserId = "670ac94fc3d3342280ec3d62";

        // Handle insurance separately from monthly payments
        if (month === "insurance") {
          // For insurance, we need to call a different API endpoint or handle it differently
          const insuranceObj = {
            student_id: studentId,
            user_id: currentUserId,
            amount: newAgreedAmount,
            payment_type: "INSURANCE",
            academic_year_id: selectedAcademicYear,
            edit_type: "agreed",
          };

          // Call the insurance agreed amount API
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/payments/update_insurance_agreed`,
            insuranceObj
          );
        } else {
          // Handle monthly payments
          // Map month names to numbers
          const monthMap = {
            september: 9,
            october: 10,
            november: 11,
            december: 12,
            january: 1,
            february: 2,
            march: 3,
            april: 4,
            may: 5,
            june: 6,
          };

          const agreedObj = {
            student_id: studentId,
            user_id: currentUserId,
            amount: newAgreedAmount,
            payment_type: paymentType.toUpperCase(), // "TUITION" or "TRANSPORT"
            month: monthMap[month] || 9,
            academic_year_id: selectedAcademicYear,
            edit_type: "agreed", // New field to indicate we're editing agreed amount
          };

          // Call the agreed amount API (we'll need to create/update this endpoint)
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/payments/update_agreed`,
            agreedObj
          );
        }

        console.log("Agreed amount updated successfully");

        // Update summary state for real-time updates
        setSummary((prevSummary) => {
          if (!prevSummary) return prevSummary;

          // Find the current student and calculate the difference
          const student = studentGrid.find((s) => s.id === studentId);
          let currentAgreed = 0;

          // Handle insurance vs monthly payments differently for getting current agreed amount
          if (month === "insurance") {
            currentAgreed = student?.insurance?.agreed || 0;
          } else {
            currentAgreed = student?.months[month]?.[paymentType]?.agreed || 0;
          }

          const agreedDifference = newAgreedAmount - currentAgreed;

          const newTotalAgreed = prevSummary.total_agreed + agreedDifference;
          const newOutstanding =
            prevSummary.outstanding_balance + agreedDifference;

          // Calculate new collection rate
          const calculateCollectionRate = () => {
            if (newTotalAgreed === 0) return 0;
            return (
              Math.round(
                (prevSummary.total_paid / newTotalAgreed) * 100 * 100
              ) / 100
            );
          };

          return {
            ...prevSummary,
            total_agreed: newTotalAgreed,
            outstanding_balance: newOutstanding,
            collection_rate: calculateCollectionRate(),
          };
        });

        console.log("Summary state updated after agreed amount change");
      } catch (err) {
        console.error("Error updating agreed amount:", err);
        // On error, revert the change in studentGrid
        setStudentGrid((prevGrid) =>
          prevGrid.map((student) => {
            if (student.id === studentId) {
              return {
                ...student,
                months: {
                  ...student.months,
                  [month]: {
                    ...student.months[month],
                    [paymentType]: {
                      ...student.months[month][paymentType],
                      agreed: student.months[month][paymentType]?.agreed || 0, // Revert to original
                    },
                  },
                },
              };
            }
            return student;
          })
        );
      }
    },
    [studentGrid, selectedAcademicYear]
  );

  // Inline Edit Handler - similar to old system
  const handleInlineEdit = useCallback(
    async (
      studentId,
      paymentKey,
      value,
      shouldUpdateAgreedAmounts,
      shouldSetAgreedToSame,
      academicYearId
    ) => {
      console.log("handleInlineEdit called:", {
        studentId,
        paymentKey,
        value,
        shouldUpdateAgreedAmounts,
        shouldSetAgreedToSame,
        academicYearId,
      });

      if (!academicYearId) {
        console.error("No academic year provided");
        return;
      }

      // Parse payment key to extract month and payment type
      // Expected format: "september_tuition_real" or "september_transport_real" or "insurance_insurance_real"
      const parts = paymentKey.split("_");
      const month = parts[0];
      const paymentType = parts[1]; // 'tuition' or 'transport' or 'insurance'
      const numericValue = Number(value) || 0;

      // *** CRITICAL VALIDATION: Prevent payment from exceeding agreed amount ***
      const student = studentGrid.find((s) => s.id === studentId);
      if (student) {
        let agreedAmount = 0;

        if (month === "insurance") {
          agreedAmount = Number(student?.insurance?.agreed) || 0;
        } else {
          // For monthly payments, get agreed amount from months data
          const monthData = student?.months?.[month];
          if (paymentType === "tuition") {
            agreedAmount = Number(monthData?.tuition?.agreed) || 0;
          } else if (paymentType === "transport") {
            agreedAmount = Number(monthData?.transport?.agreed) || 0;
          }
        }

        // Only validate if there's an agreed amount set (> 0)
        if (agreedAmount > 0 && numericValue > agreedAmount) {
          alert(
            `Error: Payment amount (${numericValue} DH) cannot exceed agreed amount (${agreedAmount} DH) for ${paymentType} in ${month}.`
          );
          return; // Stop the payment process
        }
      }

      // Update the studentGrid immediately for UI responsiveness
      setStudentGrid((prevGrid) =>
        prevGrid.map((student) => {
          if (student.id === studentId) {
            // Handle insurance separately
            if (month === "insurance") {
              const updatedFinancialRecord = {
                ...student.financial_record,
                actual_payments: {
                  ...student.financial_record?.actual_payments,
                  annual_insurance: numericValue,
                },
              };

              // If shouldSetAgreedToSame is true, also set the agreed amount to the same value
              if (shouldSetAgreedToSame) {
                updatedFinancialRecord.agreed_fees = {
                  ...student.financial_record?.agreed_fees,
                  annual_insurance: numericValue,
                };
              }

              return {
                ...student,
                financial_record: updatedFinancialRecord,
              };
            }

            // Handle monthly payments
            const monthData = student.months?.[month] || {};
            const tuitionData = monthData.tuition || {};
            const transportData = monthData.transport || {};
            const totalData = monthData.total || {};

            const updatedStudent = {
              ...student,
              months: {
                ...student.months,
                [month]: {
                  ...monthData,
                  [paymentType]: {
                    ...monthData[paymentType],
                    paid: numericValue,
                  },
                  // Recalculate total
                  total: {
                    ...totalData,
                    paid:
                      (paymentType === "tuition"
                        ? numericValue
                        : tuitionData.paid || 0) +
                      (paymentType === "transport"
                        ? numericValue
                        : transportData.paid || 0),
                  },
                },
              },
            };

            // If shouldUpdateAgreedAmounts is true, update agreed amounts for future months
            if (shouldUpdateAgreedAmounts && numericValue > 0) {
              const monthOrder = [
                "september",
                "october",
                "november",
                "december",
                "january",
                "february",
                "march",
                "april",
                "may",
                "june",
              ];
              const currentMonthIndex = monthOrder.indexOf(month);

              if (currentMonthIndex !== -1) {
                // Update agreed amounts for current and future months
                for (let i = currentMonthIndex; i < monthOrder.length; i++) {
                  const futureMonth = monthOrder[i];
                  if (updatedStudent.months[futureMonth]) {
                    const futureMonthData =
                      updatedStudent.months[futureMonth] || {};
                    const futureTuitionData = futureMonthData.tuition || {};
                    const futureTransportData = futureMonthData.transport || {};
                    const futureTotalData = futureMonthData.total || {};

                    updatedStudent.months[futureMonth] = {
                      ...futureMonthData,
                      [paymentType]: {
                        ...futureMonthData[paymentType],
                        agreed: numericValue, // Set the agreed amount to the entered value
                      },
                      // Recalculate total agreed
                      total: {
                        ...futureTotalData,
                        agreed:
                          (paymentType === "tuition"
                            ? numericValue
                            : futureTuitionData.agreed || 0) +
                          (paymentType === "transport"
                            ? numericValue
                            : futureTransportData.agreed || 0),
                      },
                    };
                  }
                }
              }
            }

            return updatedStudent;
          }
          return student;
        })
      );

      try {
        // ALSO update master allStudents state so unpaid filter (which reads financial.actual) stays in sync
        setAllStudents((prev) =>
          prev.map((s) => {
            if (s.id !== studentId) return s;
            const updated = {
              ...s,
              financial: {
                ...(s.financial || {}),
                actual: { ...(s.financial?.actual || {}) },
              },
              insurance: { ...(s.insurance || {}) },
            };
            if (month === "insurance") {
              updated.insurance.paid = numericValue;
            } else {
              if (paymentType === "tuition") {
                updated.financial.actual[`${month}_tuition`] = numericValue;
              } else if (paymentType === "transport") {
                updated.financial.actual[`${month}_transport`] = numericValue;
              }
            }
            return updated;
          })
        );
        // Call backend API to save the payment
        const currentUserId = "670ac94fc3d3342280ec3d62"; // Use the same user ID as old system

        // Handle insurance separately from monthly payments
        if (month === "insurance") {
          // For insurance, we need to call a different API endpoint
          const insuranceObj = {
            student_id: studentId,
            user_id: currentUserId,
            amount: numericValue,
            payment_type: "INSURANCE",
            academic_year_id: academicYearId,
            edit_type: "paid",
            set_agreed_to_same: shouldSetAgreedToSame, // New flag for auto-setting agreed amount
          };

          // Call the insurance payment API
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/payments/update_insurance_payment`,
            insuranceObj
          );
        } else {
          // Handle monthly payments
          // Map month names to numbers
          const monthMap = {
            september: 9,
            october: 10,
            november: 11,
            december: 12,
            january: 1,
            february: 2,
            march: 3,
            april: 4,
            may: 5,
            june: 6,
          };

          const paymentObj = {
            student_id: studentId,
            user_id: currentUserId,
            amount: numericValue,
            payment_type: paymentType.toUpperCase(), // "TUITION" or "TRANSPORT"
            month: monthMap[month] || 9,
            academic_year_id: academicYearId,
            update_agreed_amounts: shouldUpdateAgreedAmounts || false,
          };

          // Call the payment API
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/payments/create_or_update`,
            paymentObj
          );
        }

        console.log("Payment updated successfully");

        // Update summary state for real-time updates
        setSummary((prevSummary) => {
          if (!prevSummary) return prevSummary;

          // Find the current student and calculate the difference
          const student = studentGrid.find((s) => s.id === studentId);
          let currentPaid = 0;

          // Handle insurance vs monthly payments differently for getting current paid amount
          if (month === "insurance") {
            currentPaid = student?.insurance?.paid || 0;
          } else {
            currentPaid = student?.months[month]?.[paymentType]?.paid || 0;
          }

          const paidDifference = numericValue - currentPaid;

          // Calculate agreed difference if we're updating agreed amounts
          let agreedDifference = 0;

          // Handle insurance auto-set agreed amount case
          if (month === "insurance" && shouldSetAgreedToSame) {
            const currentAgreed = student?.insurance?.agreed || 0;
            agreedDifference = numericValue - currentAgreed;
          }
          // Handle monthly payments agreed amount updates
          else if (shouldUpdateAgreedAmounts && numericValue > 0) {
            const monthOrder = [
              "september",
              "october",
              "november",
              "december",
              "january",
              "february",
              "march",
              "april",
              "may",
              "june",
            ];
            const currentMonthIndex = monthOrder.indexOf(month);

            if (currentMonthIndex !== -1) {
              // Count how many future months will get the agreed amount updated
              for (let i = currentMonthIndex; i < monthOrder.length; i++) {
                const futureMonth = monthOrder[i];
                if (student?.months[futureMonth]) {
                  const currentAgreed =
                    student.months[futureMonth]?.[paymentType]?.agreed || 0;
                  if (currentAgreed === 0) {
                    agreedDifference += numericValue; // Adding new agreed amount
                  }
                }
              }
            }
          }

          const newTotalPaid = prevSummary.total_paid + paidDifference;
          const newTotalAgreed = prevSummary.total_agreed + agreedDifference;
          const newOutstanding =
            prevSummary.outstanding_balance - paidDifference + agreedDifference;

          // Calculate new collection rate accounting for updated agreed amounts
          const calculateAdjustedCollectionRate = () => {
            // If total agreed is 0, we can't calculate a meaningful rate
            if (newTotalAgreed === 0) return 0;

            // Standard collection rate calculation with new totals
            const standardRate =
              Math.round((newTotalPaid / newTotalAgreed) * 100 * 100) / 100;
            return standardRate;
          };

          return {
            ...prevSummary,
            total_paid: newTotalPaid,
            total_agreed: newTotalAgreed,
            outstanding_balance: newOutstanding,
            collection_rate: calculateAdjustedCollectionRate(),
          };
        });

        console.log("Summary state updated in real-time");

        // Refresh dashboard data to ensure payments persist across page refreshes
        if (selectedAcademicYear && selectedClassId) {
          try {
            console.log("Refreshing dashboard data after payment update...");
            await fetchDashboardData();
            console.log("Dashboard data refreshed successfully after payment");
          } catch (error) {
            console.error("Error refreshing dashboard after payment:", error);
          }
        }
      } catch (err) {
        console.error("Error updating payment:", err);
        // On error, just log it without triggering re-renders
      }
    },
    [studentGrid, selectedAcademicYear, selectedClassId, fetchDashboardData]
  ); // Dependencies for useCallback

  // Helper function to check if month is before student enrollment
  const isMonthBeforeEnrollment = useCallback((student, month) => {
    const enrollmentMonth = student.joined_month || 9; // Default to September if not set

    // Month order mapping (September = 1st month of academic year)
    const monthOrder = {
      september: 1,
      october: 2,
      november: 3,
      december: 4,
      january: 5,
      february: 6,
      march: 7,
      april: 8,
      may: 9,
      june: 10,
    };

    // Convert enrollment month number to academic year order
    let enrollmentOrder;
    if (enrollmentMonth >= 9) {
      enrollmentOrder = enrollmentMonth - 8; // 9->1, 10->2, 11->3, 12->4
    } else {
      enrollmentOrder = enrollmentMonth + 4; // 1->5, 2->6, 3->7, 4->8, 5->9, 6->10
    }

    const currentMonthOrder = monthOrder[month];
    return currentMonthOrder < enrollmentOrder;
  }, []);

  // Calculate students with not agreed months
  const calculateNotAgreedStudents = useCallback(
    (studentGrid) => {
      if (!studentGrid || studentGrid.length === 0) return 0;

      let studentsWithNotAgreed = 0;

      studentGrid.forEach((student) => {
        let hasNotAgreedMonth = false;

        // Check each month for this student
        Object.keys(student.months || {}).forEach((month) => {
          const monthData = student.months[month];
          // Check if tuition or transport has agreed = 0 but student is enrolled for this month
          const isDisabled = isMonthBeforeEnrollment(student, month);

          if (!isDisabled) {
            const tuitionAgreed = monthData?.tuition?.agreed || 0;
            const transportAgreed = monthData?.transport?.agreed || 0;

            // If either tuition or transport has agreed = 0, this student has "not agreed" months
            if (
              tuitionAgreed === 0 ||
              (transportAgreed === 0 && (monthData?.transport?.paid || 0) > 0)
            ) {
              hasNotAgreedMonth = true;
            }
          }
        });

        if (hasNotAgreedMonth) {
          studentsWithNotAgreed++;
        }
      });

      return studentsWithNotAgreed;
    },
    [isMonthBeforeEnrollment]
  );

  // Load academic years on component mount
  useEffect(() => {
    const fetchAcademicYears = async () => {
      setLoadingAcademicYears(true);
      setError("");

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/academic-years/api/academic-years`
        );

        if (response.data.academic_years) {
          setAcademicYears(response.data.academic_years);

          // Auto-select current year if available
          const currentYear = response.data.academic_years.find(
            (year) => year.is_current_year
          );
          if (currentYear) {
            setSelectedAcademicYear(currentYear.id);
          }
        }
      } catch (err) {
        console.error("Error fetching academic years:", err);
        setError("Failed to fetch academic years. Please try again.");
      } finally {
        setLoadingAcademicYears(false);
      }
    };

    fetchAcademicYears();
  }, []);

  // Load classes when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      fetchClasses();
    }
  }, [selectedAcademicYear, fetchClasses]);

  // Load dashboard data when class is selected
  useEffect(() => {
    // DISABLED: We now use local filtering instead of backend API
    // This prevents the backend from overriding our client-side filtering
    /*
    if (selectedAcademicYear && selectedClassId) {
      fetchDashboardData();
    }
    */
  }, [selectedAcademicYear, selectedClassId, fetchDashboardData]);

  return (
    <Box bg={bgColor} minH="100vh" py={6}>
      <Container maxW="full" px={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={3}>
              <Box p={3} bg="blue.100" borderRadius="lg" color="blue.600">
                <FaHome size={24} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="gray.800">
                  Payment Dashboard
                </Heading>
                <Text color="gray.600">
                  Excel-like view of student payments by month
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={3}>
              <Button
                colorScheme="green"
                onClick={() => setShowAddStudentModal(true)}
                leftIcon={<FaPlus />}
              >
                Add Student
              </Button>
            </HStack>
          </Flex>

          {/* Error Alert */}
          {error && (
            <Box
              p={4}
              bg="red.50"
              borderRadius="md"
              border="1px solid"
              borderColor="red.200"
            >
              <Text color="red.600" fontWeight="bold">
                ⚠️ {error}
              </Text>
            </Box>
          )}

          {/* Student Statistics Component - First Priority */}
          {selectedAcademicYear &&
            (() => {
              // Statistics should ALWAYS show academic year totals, never filtered data
              let statsAllStudents = allStudents;

              // If a class is selected, filter to that class for statistics
              if (selectedClassId) {
                statsAllStudents = allStudents.filter(
                  (s) => s.school_class?.id === selectedClassId
                );
              }

              return (
                <StudentStatsComponent
                  academicYearId={selectedAcademicYear}
                  selectedClassId={selectedClassId}
                  filters={filters}
                  onStatisticClick={handleStatisticClick}
                  allStudents={statsAllStudents}
                  filteredStudents={statsAllStudents} // Same as allStudents - no filtering for stats
                />
              );
            })()}

          {/* Search Component */}
          {selectedAcademicYear && (
            <SearchComponent
              searchQuery={filters.searchQuery}
              onSearchChange={(query) => updateFilter("searchQuery", query)}
              resultCount={filteredStudents.length}
            />
          )}

          {/* Academic Years Display */}
          <Box
            p={4}
            bg="white"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
          >
            <VStack spacing={4} align="stretch">
              <Text fontSize="md" fontWeight="semibold">
                Academic Years
              </Text>

              {loadingAcademicYears ? (
                <Center>
                  <Spinner size="lg" color="blue.500" />
                </Center>
              ) : (
                <VStack spacing={2} align="start">
                  {academicYears.map((year) => (
                    <Box
                      key={year.id}
                      p={3}
                      border="1px solid"
                      borderColor={
                        selectedAcademicYear === year.id
                          ? "blue.500"
                          : "gray.200"
                      }
                      borderRadius="md"
                      bg={
                        selectedAcademicYear === year.id ? "blue.50" : "white"
                      }
                      cursor="pointer"
                      onClick={() => setSelectedAcademicYear(year.id)}
                      _hover={{ bg: "blue.25" }}
                    >
                      <Text
                        fontWeight={year.is_current_year ? "bold" : "normal"}
                      >
                        {year.year_name} {year.is_current_year && "(Current)"}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </VStack>
          </Box>

          {/* Comprehensive Student Filters */}
          {/* Unpaid Month Filter Component (replaces comprehensive filters) */}
          {selectedAcademicYear && (
            <UnpaidMonthFilter
              months={[
                "september",
                "october",
                "november",
                "december",
                "january",
                "february",
                "march",
                "april",
                "may",
                "june",
                "insurance",
              ]}
              students={allStudents}
              selectedMonth={filters.unpaidMonth}
              onSelect={(m) => updateFilter("unpaidMonth", m)}
              isUnpaidForMonth={isUnpaidForMonth}
            />
          )}

          {/* Class Cards Component - Always visible, filtered by statistics and filters */}
          {selectedAcademicYear && (
            <>
              {loadingAllStudents ? (
                <Center py={6}>
                  <Spinner size="lg" />
                </Center>
              ) : (
                <ClassCardComponent
                  academicYearId={selectedAcademicYear}
                  onClassSelect={handleClassCardSelect}
                  selectedClassId={selectedClassId}
                  filters={filters}
                  classesData={classCardData}
                />
              )}
            </>
          )}

          {/* Class Summary and Section Information */}
          {selectedAcademicYear && classes.length > 0 && (
            <Box
              p={4}
              bg="white"
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
            >
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="bold">
                  Class Overview -{" "}
                  {
                    academicYears.find((y) => y.id === selectedAcademicYear)
                      ?.year_name
                  }
                  {filters.searchQuery && (
                    <Text as="span" fontSize="md" color="blue.600" ml={2}>
                      (Filtered: "{filters.searchQuery}")
                    </Text>
                  )}
                </Text>

                {/* Section Summary */}
                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={3}>
                    Sections Summary
                  </Text>
                  {(() => {
                    const displayClasses = classes;
                    const sections = {};
                    displayClasses.forEach((cls) => {
                      const section = cls.education_level || "Other";
                      if (!sections[section]) {
                        sections[section] = {
                          classes: 0,
                          students: 0,
                        };
                      }
                      sections[section].classes += 1;
                      sections[section].students += cls.student_count || 0;
                    });

                    return (
                      <HStack spacing={6} wrap="wrap">
                        {Object.entries(sections).map(([section, data]) => (
                          <Box
                            key={section}
                            p={3}
                            bg="blue.50"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="blue.200"
                            minW="120px"
                          >
                            <VStack spacing={1}>
                              <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                color="blue.700"
                              >
                                {section}
                              </Text>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="blue.800"
                              >
                                {data.students}
                              </Text>
                              <Text fontSize="xs" color="blue.600">
                                students in {data.classes} classes
                              </Text>
                            </VStack>
                          </Box>
                        ))}
                      </HStack>
                    );
                  })()}
                </Box>

                {/* Overall Statistics */}
                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={3}>
                    Overall Statistics
                  </Text>
                  <HStack spacing={6} wrap="wrap">
                    <Box
                      p={3}
                      bg="green.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="green.200"
                      minW="120px"
                    >
                      <VStack spacing={1}>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="green.700"
                        >
                          Total Classes
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.800">
                          {classes.length}
                        </Text>
                      </VStack>
                    </Box>
                    <Box
                      p={3}
                      bg="orange.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="orange.200"
                      minW="120px"
                    >
                      <VStack spacing={1}>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="orange.700"
                        >
                          Total Students
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="orange.800"
                        >
                          {classes.reduce(
                            (sum, cls) => sum + (cls.student_count || 0),
                            0
                          )}
                        </Text>
                      </VStack>
                    </Box>
                  </HStack>
                </Box>
              </VStack>
            </Box>
          )}

          {/* Financial Summary for Selected Class */}
          {selectedClassId && dashboardData && summary && (
            <Box
              p={4}
              bg="white"
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
            >
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="bold">
                  Financial Summary - {dashboardData.class.name}
                  {filters.searchQuery && (
                    <Text as="span" fontSize="md" color="blue.600" ml={2}>
                      (Filtered: "{filters.searchQuery}")
                    </Text>
                  )}
                </Text>

                <HStack spacing={6} wrap="wrap">
                  <Box
                    p={3}
                    bg="blue.50"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="blue.200"
                    minW="150px"
                  >
                    <VStack spacing={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="blue.700"
                      >
                        {filters.searchQuery
                          ? "Filtered Students"
                          : "Total Students"}
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.800">
                        {summary.total_students}
                      </Text>
                      {filters.searchQuery && (
                        <Text fontSize="xs" color="blue.600">
                          matching "{filters.searchQuery}"
                        </Text>
                      )}
                    </VStack>
                  </Box>

                  <Box
                    p={3}
                    bg="yellow.50"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="yellow.200"
                    minW="150px"
                  >
                    <VStack spacing={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="yellow.700"
                      >
                        Not Agreed Students
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="yellow.800">
                        {calculateNotAgreedStudents(studentGrid)}
                      </Text>
                      <Text fontSize="xs" color="yellow.600">
                        Students with months at 0 DH
                      </Text>
                    </VStack>
                  </Box>

                  <Box
                    p={3}
                    bg="green.50"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="green.200"
                    minW="150px"
                  >
                    <VStack spacing={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="green.700"
                      >
                        Total Agreed
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.800">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "MAD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                          .format(summary.total_agreed || 0)
                          .replace("MAD", "DH")}
                      </Text>
                    </VStack>
                  </Box>

                  <Box
                    p={3}
                    bg="purple.50"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="purple.200"
                    minW="150px"
                  >
                    <VStack spacing={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="purple.700"
                      >
                        Total Paid
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="purple.800">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "MAD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                          .format(summary.total_paid || 0)
                          .replace("MAD", "DH")}
                      </Text>
                    </VStack>
                  </Box>

                  <Box
                    p={3}
                    bg="red.50"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="red.200"
                    minW="150px"
                  >
                    <VStack spacing={1}>
                      <Text fontSize="sm" fontWeight="semibold" color="red.700">
                        Outstanding
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="red.800">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "MAD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                          .format(summary.outstanding_balance || 0)
                          .replace("MAD", "DH")}
                      </Text>
                    </VStack>
                  </Box>

                  <Box
                    p={3}
                    bg="teal.50"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="teal.200"
                    minW="150px"
                  >
                    <VStack spacing={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="teal.700"
                      >
                        Collection Rate
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="teal.800">
                        {summary.collection_rate || 0}%
                      </Text>
                      <Text fontSize="xs" color="teal.600">
                        {filters.searchQuery ||
                        filters.selectedGender ||
                        filters.selectedStudentType ||
                        filters.selectedUnpaidMonth
                          ? "For filtered students"
                          : "Includes not agreed debt"}
                      </Text>
                    </VStack>
                  </Box>
                </HStack>

                {/* Additional Information about Not Agreed Students */}
                {calculateNotAgreedStudents(studentGrid) > 0 && (
                  <Box
                    p={3}
                    bg="yellow.25"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="yellow.300"
                  >
                    <VStack spacing={2} align="start">
                      <HStack>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="yellow.800"
                        >
                          ⚠️ Not Agreed Students Alert
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="yellow.700">
                        {calculateNotAgreedStudents(studentGrid)} student(s)
                        {filters.searchQuery ||
                        filters.selectedGender ||
                        filters.selectedStudentType ||
                        filters.selectedUnpaidMonth
                          ? " in filtered results"
                          : ""}
                        have months with agreed amounts set to 0 DH. These
                        students may still owe money even though their agreed
                        amount is 0. The collection rate above accounts for
                        these cases as potential debt.
                      </Text>
                      <Text fontSize="xs" color="yellow.600" fontStyle="italic">
                        Tip: Review these students to set proper agreed amounts
                        or confirm if they are exempt from payment for specific
                        months.
                      </Text>
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>
          )}

          {/* Dashboard Data Display */}
          {selectedClassId && studentGrid && studentGrid.length > 0 && (
            <Box
              id="payment-table-section"
              p={4}
              bg="white"
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
            >
              <VStack spacing={4} align="stretch">
                <PaymentGrid
                  studentGrid={studentGrid}
                  months={months}
                  loading={loadingDashboard}
                  onStudentClick={handleStudentClick}
                  onInlineEdit={(
                    studentId,
                    paymentKey,
                    value,
                    shouldUpdateAgreedAmounts,
                    shouldSetAgreedToSame
                  ) =>
                    handleInlineEdit(
                      studentId,
                      paymentKey,
                      value,
                      shouldUpdateAgreedAmounts,
                      shouldSetAgreedToSame,
                      selectedAcademicYear
                    )
                  }
                  onAgreedEdit={handleAgreedEdit}
                  summary={summary}
                />
              </VStack>
            </Box>
          )}

          {/* Student Detail Modal */}
          <EditableStudentModal
            isOpen={showStudentModal}
            onClose={handleCloseStudentModal}
            studentId={selectedStudentData?.id || selectedStudentData?._id}
            studentData={selectedStudentData}
            loading={loadingStudentDetail}
            onStudentUpdated={handleStudentUpdated}
          />

          {/* Add Student Modal */}
          <AddStudentModalPlain
            isOpen={showAddStudentModal}
            onClose={() => setShowAddStudentModal(false)}
            onStudentAdded={(newStudent) => {
              // Refresh the current class data if a class is selected
              if (selectedClassId) {
                fetchDashboardData();
              }
              // Refresh classes to update student counts
              if (selectedAcademicYear) {
                fetchClasses();
              }
            }}
            academicYearId={selectedAcademicYear}
          />

          {/* Instructions when no class is selected */}
          {selectedAcademicYear && !selectedClassId && !loadingClasses && (
            <Box
              p={8}
              bg="blue.50"
              borderRadius="lg"
              border="1px solid"
              borderColor="blue.200"
              textAlign="center"
            >
              <VStack spacing={3}>
                <Text fontSize="lg" fontWeight="semibold" color="blue.700">
                  Select a Class to View Payment Grid
                </Text>
                <Text color="blue.600">
                  Choose a class from the filters above to view the Excel-like
                  payment dashboard for students in that class.
                </Text>
                <Text fontSize="sm" color="blue.500">
                  The grid will show students based on your current filter
                  settings when you select a class.
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default Home;
