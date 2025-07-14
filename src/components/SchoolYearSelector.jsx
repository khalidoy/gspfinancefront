import React from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { FaPlus, FaCalendarAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const SchoolYearSelector = ({
  loadingSchoolYears,
  schoolYearPeriods,
  selectedSchoolYearPeriod,
  handleSchoolYearChange,
  handleOpenNewSchoolYearModal,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="school-year-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: "linear-gradient(135deg, #f5f7fb 0%, #e8f1ff 100%)",
        backgroundImage:
          'url(\'data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23aacbff" fill-opacity="0.2" fill-rule="evenodd"/%3E%3C/svg%3E\')',
        borderRadius: "20px",
        boxShadow:
          "0 10px 25px rgba(0, 120, 255, 0.15), inset 0 -3px 0 rgba(0, 0, 0, 0.05)",
        padding: "2rem",
        margin: "1.5rem auto",
        border: "3px solid rgba(30, 144, 255, 0.3)",
        borderStyle: "dashed",
        transition: "all 0.3s ease",
        maxWidth: "750px",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(79,195,247,0.3) 0%, rgba(79,195,247,0) 70%)",
          zIndex: 0,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "-30px",
          left: "-30px",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(30,144,255,0.2) 0%, rgba(30,144,255,0) 70%)",
          zIndex: 0,
        }}
      ></div>

      <motion.div
        className="school-year-header"
        style={{
          marginBottom: "2rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.h2
          className="text-center school-year-title"
          style={{
            color: "#18181b",
            fontSize: "1.85rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
            textShadow: "1px 1px 0 rgba(255, 255, 255, 0.8)",
            letterSpacing: "0.5px",
          }}
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 1.5, ease: "easeInOut", delay: 0.3 },
              scale: { duration: 1.2, times: [0, 0.5, 1], ease: "easeInOut" },
              repeat: 0,
            }}
            style={{
              background: "linear-gradient(135deg, #1e90ff 0%, #0063cc 100%)",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 5px 15px rgba(30, 144, 255, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <FaCalendarAlt
              style={{
                color: "white",
                fontSize: "1.8rem",
                filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))",
              }}
            />
          </motion.div>
          {t("school_year_period")}
        </motion.h2>

        {/* Single static underline without hover animations */}
        <div
          style={{
            width: "100px",
            height: "6px",
            background: "linear-gradient(90deg, #1e90ff, #0063cc)",
            margin: "0.75rem auto",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        />
      </motion.div>

      <div
        className="school-year-content"
        style={{
          minHeight: "150px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {loadingSchoolYears ? (
          <motion.div
            className="school-year-loading"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "2.5rem",
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "16px",
              margin: "1rem auto",
              maxWidth: "90%",
              border: "2px dashed rgba(30, 144, 255, 0.3)",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                border: "3px dashed #1e90ff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                animation: "spin 1.5s linear infinite",
              }}
            >
              <Spinner
                animation="border"
                variant="primary"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  opacity: 0.8,
                  color: "#1e90ff",
                }}
              />
            </div>
            <p
              style={{
                marginTop: "1.5rem",
                color: "#18181b",
                fontSize: "1.2rem",
                fontWeight: "500",
              }}
            >
              {t("loading_school_year_data")}...
            </p>
          </motion.div>
        ) : schoolYearPeriods.length === 0 ? (
          <motion.div
            className="no-school-year"
            style={{
              textAlign: "center",
              padding: "2.5rem",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,248,255,0.9) 100%)",
              borderRadius: "16px",
              boxShadow: "0 10px 25px rgba(30, 144, 255, 0.15)",
              margin: "1rem auto",
              maxWidth: "90%",
              border: "2px dashed rgba(30, 144, 255, 0.3)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              style={{
                marginBottom: "1rem",
                fontSize: "3rem",
                color: "rgba(30, 144, 255, 0.3)",
              }}
            >
              ✏️
            </div>
            <p
              style={{
                color: "#18181b",
                fontSize: "1.2rem",
                fontWeight: "500",
                fontStyle: "italic",
                marginBottom: "1.5rem",
              }}
            >
              {t("no_school_year_periods")}
            </p>
            <motion.div>
              <Button
                variant="outline-primary"
                style={{
                  background:
                    "linear-gradient(135deg, #1e90ff 0%, #0063cc 100%)",
                  border: "none",
                  borderRadius: "50px",
                  padding: "0.6rem 1.5rem",
                  fontSize: "1.1rem",
                  color: "white",
                  boxShadow: "0 5px 15px rgba(30, 144, 255, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                }}
                className="position-relative"
                onClick={handleOpenNewSchoolYearModal}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "-20%",
                    left: "-10%",
                    width: "120%",
                    height: "120%",
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)",
                    transform: "rotate(45deg)",
                    zIndex: 0,
                  }}
                ></span>
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <FaPlus style={{ marginRight: "0.5rem" }} />
                  {t("create_first_school_year")}
                </div>
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="school-year-selector"
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              padding: "1.75rem",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(240,248,255,0.85) 100%)",
              borderRadius: "16px",
              boxShadow: "0 10px 25px rgba(30, 144, 255, 0.12)",
              margin: "1rem auto",
              border: "2px dashed rgba(30, 144, 255, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Decorative dots with blue colors */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#1e90ff",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "25px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#4fc3f7",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "40px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#0063cc",
              }}
            ></div>

            <div
              className="school-year-select-container"
              style={{
                flex: 1,
                position: "relative",
              }}
            >
              <motion.div
                style={{
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "5px",
                    background: "linear-gradient(90deg, #1e90ff, #0063cc)",
                    zIndex: 1,
                  }}
                ></div>
                <Form.Select
                  value={selectedSchoolYearPeriod}
                  onChange={handleSchoolYearChange}
                  className="school-year-select"
                  style={{
                    padding: "0.875rem 1.25rem",
                    border: "1px solid rgba(30, 144, 255, 0.2)",
                    borderRadius: "12px",
                    backgroundColor: "white",
                    fontSize: "1.2rem",
                    color: "#18181b",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    height: "60px",
                    fontWeight: "500",
                    paddingTop: "8px",
                    // Hide default arrow with !important
                    appearance: "none !important",
                    WebkitAppearance: "none !important",
                    MozAppearance: "none !important",
                    // Add refined custom arrow using background image
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%230063cc' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M3 6l5 5 5-5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1.5rem center",
                    backgroundSize: "1.1em",
                    paddingRight: "3.5rem",
                  }}
                >
                  {schoolYearPeriods.map((sy) => (
                    <option key={sy._id} value={sy._id}>
                      {sy.name}
                    </option>
                  ))}
                </Form.Select>
              </motion.div>
            </div>
            <motion.div>
              <Button
                variant="primary"
                className="add-school-year-btn"
                onClick={handleOpenNewSchoolYearModal}
                title={t("add_new_school_year_period")}
                style={{
                  borderRadius: "50%",
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(30, 144, 255, 0.2)",
                  background:
                    "linear-gradient(135deg, #0063cc 0%, #1e90ff 100%)",
                  border: "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <motion.div style={{ position: "relative", zIndex: 1 }}>
                  <FaPlus style={{ fontSize: "1.5rem", color: "white" }} />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Additional decorative elements */}
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <style>{`
        .school-year-select {
          background-image: none !important;
        }
      `}</style>
    </motion.div>
  );
};

export default SchoolYearSelector;
