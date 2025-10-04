// src/components/ui/Search.js
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Input, Select, Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

export const SearchBox = ({
  value,
  onChange,
  placeholder = "Search...",
  maxWidth,
  onClear,
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || "");
  const [debouncedValue, setDebouncedValue] = useState(value || "");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(internalValue), 300);
    return () => clearTimeout(timer);
  }, [internalValue]);

  useEffect(() => {
    if (onChange && debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  useEffect(() => {
    if (value === undefined) {
      return;
    }
    setInternalValue(value || "");
    setDebouncedValue(value || "");
  }, [value]);

  const handleInputChange = (event) => {
    setInternalValue(event.target.value);
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
    <div
      className={cn("relative flex-1", className)}
      style={maxWidth ? { maxWidth } : undefined}
    >
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <Input
        value={internalValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground shadow-sm",
          internalValue && "pr-10",
        )}
        {...props}
      />
      <button
        type="button"
        onClick={handleClear}
        className={cn(
          "absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full p-1 text-muted transition hover:bg-surface-hover hover:text-foreground",
          internalValue && "flex",
        )}
        aria-label="Clear search"
      >
        <FiX size={14} />
      </button>
    </div>
  );
};

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
    return Object.entries(activeFilters).reduce((count, [, value]) => {
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
      <div key={filter.key} className="mb-6 last:mb-0">
        <div className="mb-4 flex items-center justify-between text-sm font-semibold text-foreground">
          {filter.label}
          {filter.collapsible && (
            <button
              type="button"
              onClick={() => toggleSection(filter.key)}
              className="rounded-full p-1 text-muted transition hover:text-foreground"
            >
              {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
            </button>
          )}
        </div>

        <div className={cn(isCollapsed && "hidden", "space-y-2")}
        >
          {filter.type === "select" && (
            <Select
              value={currentValue || ""}
              onChange={(event) => handleFilterChange(filter.key, event.target.value)}
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
              <label
                key={option.value}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-surface"
              >
                <input
                  type="checkbox"
                  className="rounded border-border text-primary"
                  checked={(currentValue || []).includes(option.value)}
                  onChange={() => handleFilterChange(filter.key, option.value, true)}
                />
                <span className="flex-1 text-left text-sm text-muted">
                  {option.label}
                </span>
                {option.count !== undefined && (
                  <span className="rounded-full bg-surface px-2 py-1 text-xs text-muted">
                    {option.count}
                  </span>
                )}
              </label>
            ))}

          {filter.type === "radio" &&
            filter.options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-surface"
              >
                <input
                  type="radio"
                  className="rounded border-border text-primary"
                  name={filter.key}
                  checked={currentValue === option.value}
                  onChange={() => handleFilterChange(filter.key, option.value)}
                />
                <span className="flex-1 text-left text-sm text-muted">
                  {option.label}
                </span>
                {option.count !== undefined && (
                  <span className="rounded-full bg-surface px-2 py-1 text-xs text-muted">
                    {option.count}
                  </span>
                )}
              </label>
            ))}

          {filter.type === "dateRange" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  From
                </label>
                <Input
                  type="date"
                  value={currentValue?.from || ""}
                  onChange={(event) =>
                    handleFilterChange(filter.key, {
                      ...currentValue,
                      from: event.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  To
                </label>
                <Input
                  type="date"
                  value={currentValue?.to || ""}
                  onChange={(event) =>
                    handleFilterChange(filter.key, {
                      ...currentValue,
                      to: event.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={filterRef} className="relative inline-block">
      <Button
        type="button"
        variant="outline"
        className="relative flex items-center gap-2 rounded-xl"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <FiFilter />
        Filters
        {activeFilterCount > 0 && (
          <Badge
            variant="primary"
            className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      <div
        className={cn(
          "absolute right-0 top-full z-[1000] mt-2 min-w-[320px] max-w-[400px] rounded-3xl border border-border bg-surface p-6 shadow-xl",
          isOpen ? "block" : "hidden",
        )}
      >
        {filters.map(renderFilterSection)}
        {children}

        <div className="mt-6 flex gap-3 border-t border-border pt-6">
          <Button size="sm" onClick={handleApply}>
            Apply Filters
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
};

export const SearchAndFilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  quickFilters = [],
  activeQuickFilter,
  onQuickFilterChange,
  filters = [],
  activeFilters = {},
  onFiltersChange,
  activeFilterLabels = [],
  children,
}) => {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-border bg-surface px-6 py-6">
        <SearchBox
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          maxWidth="400px"
        />

        {quickFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {quickFilters.map((filter) => (
              <Button
                key={filter.key}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full",
                  activeQuickFilter === filter.key &&
                    "border-transparent bg-primary text-primary-foreground",
                )}
                onClick={() => onQuickFilterChange(filter.key)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        )}

        {filters.length > 0 && (
          <AdvancedFilter
            filters={filters}
            activeFilters={activeFilters}
            onFiltersChange={onFiltersChange}
          />
        )}

        {children}
      </div>

      {activeFilterLabels.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted">Active filters:</span>
          {activeFilterLabels.map((filter) => (
            <Badge
              key={filter.key}
              variant="primary"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
            >
              {filter.label}
              <button
                type="button"
                onClick={filter.onRemove}
                className="rounded-full p-1 text-primary-foreground transition hover:bg-primary/10"
              >
                <FiX size={12} />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={() => onFiltersChange({})}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export const useSearchAndFilter = (data = [], searchFields = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [quickFilter, setQuickFilter] = useState(null);

  const filteredData = useMemo(() => {
    let filtered = [...data];

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

    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;

      if (Array.isArray(value) && value.length > 0) {
        filtered = filtered.filter((item) => {
          const itemValue = key.split(".").reduce((obj, k) => obj?.[k], item);
          return value.includes(itemValue);
        });
      } else if (value && !Array.isArray(value)) {
        if (typeof value === "object" && value.from && value.to) {
          filtered = filtered.filter((item) => {
            const itemValue = new Date(
              key.split(".").reduce((obj, k) => obj?.[k], item),
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
