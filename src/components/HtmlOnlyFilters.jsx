import React from "react";

const HtmlOnlyFilters = ({
  filters = {},
  onFiltersChange = () => {},
  statistics = null,
  totalStudents = 0,
  loadingSchoolYears = false,
  schoolYearPeriods = [],
  selectedSchoolYearPeriod = "",
  handleSchoolYearChange = () => {},
  handleOpenNewSchoolYearModal = () => {},
}) => {
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const containerStyle = {
    marginBottom: '16px',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    color: '#2d3748'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none'
  };

  const buttonStyle = {
    padding: '8px 12px',
    backgroundColor: '#38a169',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    marginLeft: '8px'
  };

  const statsStyle = {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#718096'
  };

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        
        {/* School Year Selection */}
        <div>
          <div style={labelStyle}>
            🎓 School Year Period
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {loadingSchoolYears ? (
              <span style={{ fontSize: '14px' }}>Loading...</span>
            ) : schoolYearPeriods.length === 0 ? (
              <span style={{ fontSize: '14px' }}>No school year periods</span>
            ) : (
              <select
                value={selectedSchoolYearPeriod}
                onChange={(e) => handleSchoolYearChange(e)}
                style={{ ...inputStyle, flex: '1' }}
              >
                {schoolYearPeriods.map((sy) => (
                  <option key={sy._id?.$oid || sy._id} value={sy._id?.$oid || sy._id}>
                    {sy.name}
                  </option>
                ))}
              </select>
            )}
            
            <button
              style={buttonStyle}
              onClick={handleOpenNewSchoolYearModal}
              title="Add new school year period"
            >
              ➕
            </button>
          </div>
        </div>

        {/* Search Input Field */}
        <div>
          <div style={labelStyle}>
            🔍 Search by Name
          </div>
          
          <input
            type="text"
            placeholder="Enter student name..."
            value={filters.searchText || ""}
            onChange={(e) => updateFilter("searchText", e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Status Filter */}
        <div>
          <div style={labelStyle}>
            🔧 Filter by Status
          </div>
          
          <select
            value={filters.statusFilter || "active"}
            onChange={(e) => updateFilter("statusFilter", e.target.value)}
            style={inputStyle}
          >
            <option value="active">Active</option>
            <option value="left">Left</option>
            <option value="new">New</option>
            <option value="all">All</option>
          </select>
        </div>
        
      </div>

      {/* Statistics Display */}
      {statistics && (
        <div style={statsStyle}>
          Showing {statistics.filtered} of {statistics.total} students
        </div>
      )}
    </div>
  );
};

export default HtmlOnlyFilters;
