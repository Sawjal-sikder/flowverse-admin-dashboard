import React from 'react';

const Table = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className={`min-w-full table-auto divide-y divide-gray-300 ${className}`}>
        {children}
      </table>
    </div>
  );
};

const TableHead = ({ children }) => {
  return (
    <thead className="bg-gray-50">
      {children}
    </thead>
  );
};

const TableBody = ({ children }) => {
  return (
    <tbody className="divide-y divide-gray-200 bg-white">
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = '' }) => {
  return (
    <tr className={className}>
      {children}
    </tr>
  );
};

const TableHeader = ({ children, className = '', width = 'auto' }) => {
  const widthClass = width === 'auto' ? 'w-auto' : width;
  return (
    <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${widthClass} ${className}`}>
      {children}
    </th>
  );
};

const TableCell = ({ children, className = '', allowWrap = false }) => {
  const whiteSpaceClass = allowWrap ? 'whitespace-normal' : 'whitespace-nowrap';
  return (
    <td className={`px-3 sm:px-6 py-4 ${whiteSpaceClass} text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
};

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Header = TableHeader;
Table.Cell = TableCell;

export default Table;