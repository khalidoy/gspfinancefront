import React from "react";
import { useTranslation } from "react-i18next";

const ClassBanner = ({ selectedClass, classes, filteredStudents }) => {
  const { t } = useTranslation();

  return (
    <div className="class-banner mb-4">
      <h2>
        {classes.find((c) => c._id === selectedClass)?.name ||
          t("selected_class")}
      </h2>
      <div className="class-stats">
        <span className="badge bg-primary">
          {filteredStudents.length}{" "}
          {filteredStudents.length === 1 ? t("student") : t("students")}
        </span>
      </div>
    </div>
  );
};

export default ClassBanner;
