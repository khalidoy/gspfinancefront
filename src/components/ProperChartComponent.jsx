import React, { useState } from "react";
import {
  Box,
  HStack,
  Button,
  Text,
  VStack,
  Wrap,
  WrapItem,
  Badge,
} from "@chakra-ui/react";
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaRegCircle,
  FaDotCircle,
  FaCircle,
} from "react-icons/fa";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Bar, Line, Pie, Doughnut, PolarArea, Radar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProperChartComponent = ({ data, question, aiResponse }) => {
  const [chartType, setChartType] = useState("bar");

  if (!data || data.length === 0) {
    return (
      <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
        <Text>No chart data available</Text>
      </Box>
    );
  }

  // Prepare chart data with enhanced colors
  const chartData = {
    labels: data.map(
      (item) => item.month || item.grade || item.category || "Unknown"
    ),
    datasets: [
      {
        label: "Payments (€)",
        data: data.map(
          (item) => item.payments || item.amount || item.value || 0
        ),
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)", // Blue
          "rgba(255, 99, 132, 0.7)", // Red
          "rgba(255, 206, 86, 0.7)", // Yellow
          "rgba(75, 192, 192, 0.7)", // Teal
          "rgba(153, 102, 255, 0.7)", // Purple
          "rgba(255, 159, 64, 0.7)", // Orange
          "rgba(201, 203, 207, 0.7)", // Grey
          "rgba(255, 99, 255, 0.7)", // Pink
          "rgba(99, 255, 132, 0.7)", // Green
          "rgba(99, 132, 255, 0.7)", // Light Blue
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(201, 203, 207, 1)",
          "rgba(255, 99, 255, 1)",
          "rgba(99, 255, 132, 1)",
          "rgba(99, 132, 255, 1)",
        ],
        borderWidth: 2,
        tension: 0.4, // For line charts
        fill: chartType === "line" ? false : true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Payment Data Visualization",
      },
    },
    scales: !["pie", "doughnut", "polarArea", "radar"].includes(chartType)
      ? {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "€" + value.toLocaleString();
              },
            },
          },
        }
      : chartType === "radar"
        ? {
            r: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return "€" + value.toLocaleString();
                },
              },
            },
          }
        : undefined,
  };

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return <Line data={chartData} options={chartOptions} />;
      case "pie":
        return <Pie data={chartData} options={chartOptions} />;
      case "doughnut":
        return <Doughnut data={chartData} options={chartOptions} />;
      case "polarArea":
        return <PolarArea data={chartData} options={chartOptions} />;
      case "radar":
        return <Radar data={chartData} options={chartOptions} />;
      case "bar":
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  return (
    <Box
      p={4}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      bg="white"
    >
      {/* Chart Type Selection */}
      <Box mb={4}>
        <Text fontWeight="bold" mb={2} fontSize="md" color="gray.700">
          📊 Chart Type Selection:
        </Text>
        <Wrap spacing={2}>
          <WrapItem>
            <Button
              size="sm"
              leftIcon={<FaChartBar />}
              colorScheme={chartType === "bar" ? "blue" : "gray"}
              onClick={() => setChartType("bar")}
              variant={chartType === "bar" ? "solid" : "outline"}
            >
              Bar Chart
            </Button>
          </WrapItem>
          <WrapItem>
            <Button
              size="sm"
              leftIcon={<FaChartLine />}
              colorScheme={chartType === "line" ? "green" : "gray"}
              onClick={() => setChartType("line")}
              variant={chartType === "line" ? "solid" : "outline"}
            >
              Line Chart
            </Button>
          </WrapItem>
          <WrapItem>
            <Button
              size="sm"
              leftIcon={<FaChartPie />}
              colorScheme={chartType === "pie" ? "purple" : "gray"}
              onClick={() => setChartType("pie")}
              variant={chartType === "pie" ? "solid" : "outline"}
            >
              Pie Chart
            </Button>
          </WrapItem>
          <WrapItem>
            <Button
              size="sm"
              leftIcon={<FaRegCircle />}
              colorScheme={chartType === "doughnut" ? "orange" : "gray"}
              onClick={() => setChartType("doughnut")}
              variant={chartType === "doughnut" ? "solid" : "outline"}
            >
              Doughnut
            </Button>
          </WrapItem>
          <WrapItem>
            <Button
              size="sm"
              leftIcon={<FaDotCircle />}
              colorScheme={chartType === "polarArea" ? "teal" : "gray"}
              onClick={() => setChartType("polarArea")}
              variant={chartType === "polarArea" ? "solid" : "outline"}
            >
              Polar Area
            </Button>
          </WrapItem>
          <WrapItem>
            <Button
              size="sm"
              leftIcon={<FaCircle />}
              colorScheme={chartType === "radar" ? "red" : "gray"}
              onClick={() => setChartType("radar")}
              variant={chartType === "radar" ? "solid" : "outline"}
            >
              Radar Chart
            </Button>
          </WrapItem>
        </Wrap>

        {/* Active chart type indicator */}
        <Box mt={2}>
          <Badge
            colorScheme={
              chartType === "bar"
                ? "blue"
                : chartType === "line"
                  ? "green"
                  : chartType === "pie"
                    ? "purple"
                    : chartType === "doughnut"
                      ? "orange"
                      : chartType === "polarArea"
                        ? "teal"
                        : chartType === "radar"
                          ? "red"
                          : "gray"
            }
            fontSize="xs"
          >
            Currently viewing:{" "}
            {chartType === "bar"
              ? "Bar Chart"
              : chartType === "line"
                ? "Line Chart"
                : chartType === "pie"
                  ? "Pie Chart"
                  : chartType === "doughnut"
                    ? "Doughnut Chart"
                    : chartType === "polarArea"
                      ? "Polar Area Chart"
                      : chartType === "radar"
                        ? "Radar Chart"
                        : "Unknown"}
          </Badge>
        </Box>
      </Box>

      {/* Chart Display */}
      <Box height="400px" width="100%">
        {renderChart()}
      </Box>

      {/* Enhanced Summary */}
      <Box
        mt={4}
        p={4}
        bg="blue.50"
        borderRadius="md"
        borderLeft="4px solid"
        borderColor="blue.400"
      >
        <VStack align="start" spacing={2}>
          <Text fontSize="md" fontWeight="bold" color="blue.800">
            📊 Chart Analysis Summary
          </Text>
          <HStack spacing={4} wrap="wrap">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                Data Points:
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.900">
                {data.length}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                Total Value:
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.900">
                €
                {data
                  .reduce(
                    (sum, item) =>
                      sum + (item.payments || item.amount || item.value || 0),
                    0
                  )
                  .toFixed(2)}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                Average:
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.900">
                €
                {(
                  data.reduce(
                    (sum, item) =>
                      sum + (item.payments || item.amount || item.value || 0),
                    0
                  ) / data.length
                ).toFixed(2)}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                Chart Type:
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.900">
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
              </Text>
            </Box>
          </HStack>

          {/* Chart type description */}
          <Box
            mt={2}
            p={2}
            bg="white"
            borderRadius="md"
            border="1px solid"
            borderColor="blue.200"
          >
            <Text fontSize="xs" color="blue.600">
              <strong>Chart Info:</strong>{" "}
              {chartType === "bar"
                ? "Bar charts are ideal for comparing discrete categories of data."
                : chartType === "line"
                  ? "Line charts show trends and changes over time."
                  : chartType === "pie"
                    ? "Pie charts display proportions and percentages of a whole."
                    : chartType === "doughnut"
                      ? "Doughnut charts are like pie charts but with a hollow center, great for showing multiple datasets."
                      : chartType === "polarArea"
                        ? "Polar area charts combine features of pie and radar charts, showing data in a circular format."
                        : chartType === "radar"
                          ? "Radar charts display multivariate data in a 2D format, useful for comparing multiple variables."
                          : "Select a chart type to see more information."}
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default ProperChartComponent;
