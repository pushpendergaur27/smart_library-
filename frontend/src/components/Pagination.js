import React from 'react';
import { Pagination as BSPagination } from 'react-bootstrap';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    pages.push(
      <BSPagination.Item key={1} active={1 === currentPage} onClick={() => onPageChange(1)}>
        1
      </BSPagination.Item>
    );
    if (startPage > 2) {
      pages.push(<BSPagination.Ellipsis key="start-ellipsis" />);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <BSPagination.Item key={i} active={i === currentPage} onClick={() => onPageChange(i)}>
        {i}
      </BSPagination.Item>
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(<BSPagination.Ellipsis key="end-ellipsis" />);
    }
    pages.push(
      <BSPagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => onPageChange(totalPages)}>
        {totalPages}
      </BSPagination.Item>
    );
  }

  return (
    <div className="d-flex justify-content-center mt-4">
      <BSPagination>
        <BSPagination.Prev disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} />
        {pages}
        <BSPagination.Next disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} />
      </BSPagination>
    </div>
  );
};

export default Pagination;
