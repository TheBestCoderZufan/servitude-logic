// src/components/ui/Search.js
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import styled from "styled-components";
import { Input, Select, Button, Badge } from "@/components/ui";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiCalendar,
  FiCheck,
  FiMinus,
} from "react-icons/fi";

// Search Input Component
const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: ${({ maxWidth = "400px" }) => maxWidth};
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  width: 16px;
  height: 16px;
  pointer-events: none;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  padding: 2px;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: ${({ show }) => (show ? "flex" : "none")};
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const SearchInput = styled(Input)`
  padding-left: 40px;
  padding-right: ${({ hasClearButton }) => (hasClearButton ? "40px" : "12px")};
`;

export const SearchBox = ({
  value,
  onChange,
  placeholder = "Search...",
  maxWidth,
  onClear,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || "");
  const [debouncedValue, setDebouncedValue] = useState(value || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(internalValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [internalValue]);

  useEffect(() => {
    if (onChange && debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value || "");
    }
  }, [value]);

  const handleInputChange = (e) => {
    setInternalValue(e.target.value);
  };

  const handleClear = () => {
    setInternalValue("");
    setDebouncedValue("");
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange("");
    }
  };

  return (
    <SearchContainer maxWidth={maxWidth}>
      <SearchIcon />
      <SearchInput
        value={internalValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        hasClearButton={!!internalValue}
        {...props}
      />
      <ClearButton show={!!internalValue} onClick={handleClear}>
        <FiX size={14} />
      </ClearButton>
    </SearchContainer>
  );
};

// Advanced Filter Component
const FilterContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const FilterButton = styled(Button)`
  position: relative;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterBadge = styled(Badge)`
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  min-width: 320px;
  max-width: 400px;
  margin-top: 8px;
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    position: fixed;
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    max-height: 80vh;
    overflow-y: auto;
    margin-top: 0;
  }
`;

const FilterSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterSectionTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FilterSectionToggle = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  padding: 2px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const FilterGroup = styled.div`
  display: ${({ isCollapsed }) => (isCollapsed ? "none" : "block")};
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }

  input {
    margin: 0;
  }
`;

const FilterOptionText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  flex: 1;
`;

const FilterOptionCount = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radii.full};
`;

const FilterActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const DateRangeContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: end;
`;

const DateInput = styled(Input)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const AdvancedFilter = ({
  filters = [],
  activeFilters = {},
  onFiltersChange,
  onApply,
  onClear,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(activeFilters);
  const [collapsedSections, setCollapsedSections] = useState({});
  const filterRef = useRef(null);

  const activeFilterCount = useMemo(() => {
    return Object.entries(activeFilters).reduce((count, [key, value]) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }
      return value ? count + 1 : count;
    }, 0);
  }, [activeFilters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleFilterChange = (filterKey, value, isMultiple = false) => {
    setTempFilters((prev) => {
      if (isMultiple) {
        const currentValues = prev[filterKey] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        return { ...prev, [filterKey]: newValues };
      }
      return { ...prev, [filterKey]: value };
    });
  };

  const handleApply = () => {
    if (onFiltersChange) {
      onFiltersChange(tempFilters);
    }
    if (onApply) {
      onApply(tempFilters);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearedFilters = {};
    setTempFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
    if (onClear) {
      onClear();
    }
  };

  const toggleSection = (sectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const renderFilterSection = (filter) => {
    const isCollapsed = collapsedSections[filter.key];
    const currentValue = tempFilters[filter.key];

    return (
      <FilterSection key={filter.key}>
        <FilterSectionTitle>
          {filter.label}
          {filter.collapsible && (
            <FilterSectionToggle onClick={() => toggleSection(filter.key)}>
              {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
            </FilterSectionToggle>
          )}
        </FilterSectionTitle>

        <FilterGroup isCollapsed={isCollapsed}>
          {filter.type === "select" && (
            <Select
              value={currentValue || ""}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            >
              <option value="">All {filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}

          {filter.type === "checkbox" &&
            filter.options.map((option) => (
              <FilterOption key={option.value}>
                <input
                  type="checkbox"
                  checked={(currentValue || []).includes(option.value)}
                  onChange={() =>
                    handleFilterChange(filter.key, option.value, true)
                  }
                />
                <FilterOptionText>{option.label}</FilterOptionText>
                {option.count !== undefined && (
                  <FilterOptionCount>{option.count}</FilterOptionCount>
                )}
              </FilterOption>
            ))}

          {filter.type === "radio" &&
            filter.options.map((option) => (
              <FilterOption key={option.value}>
                <input
                  type="radio"
                  name={filter.key}
                  checked={currentValue === option.value}
                  onChange={() => handleFilterChange(filter.key, option.value)}
                />
                <FilterOptionText>{option.label}</FilterOptionText>
                {option.count !== undefined && (
                  <FilterOptionCount>{option.count}</FilterOptionCount>
                )}
              </FilterOption>
            ))}

          {filter.type === "dateRange" && (
            <DateRangeContainer>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  From
                </label>
                <DateInput
                  type="date"
                  value={currentValue?.from || ""}
                  onChange={(e) =>
                    handleFilterChange(filter.key, {
                      ...currentValue,
                      from: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  To
                </label>
                <DateInput
                  type="date"
                  value={currentValue?.to || ""}
                  onChange={(e) =>
                    handleFilterChange(filter.key, {
                      ...currentValue,
                      to: e.target.value,
                    })
                  }
                />
              </div>
            </DateRangeContainer>
          )}
        </FilterGroup>
      </FilterSection>
    );
  };

  return (
    <FilterContainer ref={filterRef}>
      <FilterButton variant="outline" onClick={() => setIsOpen(!isOpen)}>
        <FiFilter />
        Filters
        {activeFilterCount > 0 && (
          <FilterBadge variant="primary">{activeFilterCount}</FilterBadge>
        )}
      </FilterButton>

      <FilterDropdown isOpen={isOpen}>
        {filters.map(renderFilterSection)}
        {children}

        <FilterActions>
          <Button size="sm" onClick={handleApply}>
            Apply Filters
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear All
          </Button>
        </FilterActions>
      </FilterDropdown>
    </FilterContainer>
  );
};

// Search and Filter Bar Component
const SearchFilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const QuickFiltersContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  flex-wrap: wrap;
`;

const QuickFilterButton = styled(Button)`
  ${({ isActive, theme }) =>
    isActive &&
    `
    background-color: ${theme.colors.primary};
    color: ${theme.colors.text.white};
    border-color: ${theme.colors.primary};
  `}
`;

const ActiveFiltersContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ActiveFilterBadge = styled(Badge)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
`;

const FilterRemoveButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 2px;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export const SearchAndFilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  activeFilters = {},
  onFiltersChange,
  quickFilters = [],
  activeQuickFilter,
  onQuickFilterChange,
  showActiveFilters = true,
  children,
}) => {
  const getActiveFilterLabels = () => {
    const labels = [];

    Object.entries(activeFilters).forEach(([key, value]) => {
      const filter = filters.find((f) => f.key === key);
      if (!filter || !value) return;

      if (Array.isArray(value) && value.length > 0) {
        value.forEach((val) => {
          const option = filter.options?.find((opt) => opt.value === val);
          if (option) {
            labels.push({
              key: `${key}-${val}`,
              label: `${filter.label}: ${option.label}`,
              onRemove: () => {
                const newValues = value.filter((v) => v !== val);
                onFiltersChange({
                  ...activeFilters,
                  [key]: newValues.length > 0 ? newValues : undefined,
                });
              },
            });
          }
        });
      } else if (value && !Array.isArray(value)) {
        if (filter.type === "dateRange" && (value.from || value.to)) {
          const dateLabel = [
            value.from && `From: ${value.from}`,
            value.to && `To: ${value.to}`,
          ]
            .filter(Boolean)
            .join(", ");

          labels.push({
            key: `${key}-daterange`,
            label: `${filter.label}: ${dateLabel}`,
            onRemove: () => {
              onFiltersChange({
                ...activeFilters,
                [key]: undefined,
              });
            },
          });
        } else {
          const option = filter.options?.find((opt) => opt.value === value);
          if (option) {
            labels.push({
              key: `${key}-${value}`,
              label: `${filter.label}: ${option.label}`,
              onRemove: () => {
                onFiltersChange({
                  ...activeFilters,
                  [key]: undefined,
                });
              },
            });
          }
        }
      }
    });

    return labels;
  };

  const activeFilterLabels = showActiveFilters ? getActiveFilterLabels() : [];

  return (
    <div>
      <SearchFilterContainer>
        <SearchBox
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          maxWidth="400px"
        />

        {quickFilters.length > 0 && (
          <QuickFiltersContainer>
            {quickFilters.map((filter) => (
              <QuickFilterButton
                key={filter.key}
                variant="outline"
                size="sm"
                isActive={activeQuickFilter === filter.key}
                onClick={() => onQuickFilterChange(filter.key)}
              >
                {filter.label}
              </QuickFilterButton>
            ))}
          </QuickFiltersContainer>
        )}

        {filters.length > 0 && (
          <AdvancedFilter
            filters={filters}
            activeFilters={activeFilters}
            onFiltersChange={onFiltersChange}
          />
        )}

        {children}
      </SearchFilterContainer>

      {activeFilterLabels.length > 0 && (
        <ActiveFiltersContainer>
          <span
            style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}
          >
            Active filters:
          </span>
          {activeFilterLabels.map((filter) => (
            <ActiveFilterBadge key={filter.key} variant="primary">
              {filter.label}
              <FilterRemoveButton onClick={filter.onRemove}>
                <FiX size={12} />
              </FilterRemoveButton>
            </ActiveFilterBadge>
          ))}
          <Button variant="ghost" size="sm" onClick={() => onFiltersChange({})}>
            Clear all
          </Button>
        </ActiveFiltersContainer>
      )}
    </div>
  );
};

// Utility hook for managing search and filter state
export const useSearchAndFilter = (data = [], searchFields = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [quickFilter, setQuickFilter] = useState(null);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const value = field.split(".").reduce((obj, key) => obj?.[key], item);
          return value
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;

      if (Array.isArray(value) && value.length > 0) {
        filtered = filtered.filter((item) => {
          const itemValue = key.split(".").reduce((obj, k) => obj?.[k], item);
          return value.includes(itemValue);
        });
      } else if (value && !Array.isArray(value)) {
        if (typeof value === "object" && value.from && value.to) {
          // Date range filter
          filtered = filtered.filter((item) => {
            const itemValue = new Date(
              key.split(".").reduce((obj, k) => obj?.[k], item)
            );
            return (
              itemValue >= new Date(value.from) &&
              itemValue <= new Date(value.to)
            );
          });
        } else {
          filtered = filtered.filter((item) => {
            const itemValue = key.split(".").reduce((obj, k) => obj?.[k], item);
            return itemValue === value;
          });
        }
      }
    });

    return filtered;
  }, [data, searchTerm, filters, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    quickFilter,
    setQuickFilter,
    filteredData,
    hasActiveFilters: Object.values(filters).some(Boolean) || !!searchTerm,
  };
};
