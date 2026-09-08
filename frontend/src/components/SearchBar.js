import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ onSearch, placeholder = 'Search...', filters, initialFilters = {} }) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [activeFilters, setActiveFilters] = useState(initialFilters);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search: searchTerm, ...activeFilters });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onSearch({ search: searchTerm, ...newFilters });
  };

  return (
    <div className="mb-3">
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <InputGroup.Text>
            <FiSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" type="submit">
            Search
          </Button>
        </InputGroup>
      </Form>
      {filters && filters.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-2">
          {filters.map((filter) => (
            <Form.Select
              key={filter.key}
              size="sm"
              style={{ width: 'auto', minWidth: '150px' }}
              value={activeFilters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
