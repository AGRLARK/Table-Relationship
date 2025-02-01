import React, { useState } from "react";
import { FaSearch, FaChevronRight, FaDatabase, FaTable } from "react-icons/fa";

const Sidebar = ({ tables, onTableDragStart }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <FaSearch className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by Table Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2 py-1 border rounded"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filteredTables.map((table) => (
          <div key={table.id} className="mb-1">
            <div
              className="flex items-center px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer group"
              onClick={() => toggleExpand(table.id)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("table", JSON.stringify(table));
                onTableDragStart(table);
              }}
            >
              <FaChevronRight
                className={`h-4 w-4 mr-1 transition-transform ${expandedItems.has(table.id) ? "transform rotate-90" : ""
                  }`}
              />
              <FaDatabase className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm">{table.name}</span>
            </div>
            {expandedItems.has(table.id) && (
              <div className="ml-6 mt-1">
                {table.columns.map((column) => (
                  <div
                    key={column.name}
                    className="flex items-center px-2 py-1 rounded-md hover:bg-gray-100 text-sm text-gray-600"
                  >
                    <FaTable className="h-3 w-3 mr-2" />
                    {column.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <button className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md flex items-center justify-center">
          <FaDatabase className="h-4 w-4 mr-2" />
          Browse Workbooks
        </button>
      </div>
    </div>
  );
};

export default Sidebar;