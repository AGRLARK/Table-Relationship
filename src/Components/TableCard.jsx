import { X } from "lucide-react"
import React, { useState, useCallback } from "react"
import { Resizable } from "react-resizable"
import "react-resizable/css/styles.css"

export default function TableCard({ table, onClose, style, onColumnDrop, onDragStart, onDragEnd, onResize }) {
  const [draggedOver, setDraggedOver] = useState(null)
  const [size, setSize] = useState({ width: style.width || "20%", height: style.height || "35%" })
  const [isResizing, setIsResizing] = useState(false)

  const handleResizeStart = useCallback(() => {
    setIsResizing(true)
  }, [])

  const handleResizeStop = useCallback(() => {
    setIsResizing(false)
  }, [])

  const handleResize = useCallback(
    (event, { size }) => {
      setSize({ width: size.width, height: size.height })
      onResize(table.id, size)
    },
    [table.id, onResize],
  )

  const handleColumnDragStart = (column) => (e) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        tableId: table.id,
        columnName: column.name,
        columnType: column.dataType,
      }),
    )
  }

  const handleColumnDragOver = (columnName) => (e) => {
    e.preventDefault()
    setDraggedOver(columnName)
  }

  const handleColumnDrop = (targetColumn) => (e) => {
    e.preventDefault()
    setDraggedOver(null)

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"))
      if (data.tableId === table.id) return

      onColumnDrop && onColumnDrop(data.tableId, data.columnName, table.id, targetColumn.name)
    } catch (err) {
      console.error("Failed to parse drag data:", err)
    }
  }

  return (
    <Resizable
      width={Number.parseFloat(size.width)}
      height={Number.parseFloat(size.height)}
      onResize={handleResize}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      draggableOpts={{ grid: [20, 20] }}
      minConstraints={[200, 100]}
      maxConstraints={[800, 600]}
    >
      <div
        className="bg-white border rounded-lg shadow-lg overflow-hidden cursor-move"
        style={{
          ...style,
          width: size.width,
          height: size.height,
          position: "absolute",
          left: style.left,
          top: style.top,
          cursor: isResizing ? 'se-resize' : 'move'
        }}
        id={`table-${table.id}`}
        draggable={!isResizing}
        onDragStart={!isResizing ? onDragStart : undefined}
        onDragEnd={!isResizing ? onDragEnd : undefined}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium">{table.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="divide-y">
          <div className="px-4 py-2 bg-gray-100 flex">
            <div className="w-12">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 font-medium">Column</div>
            <div className="w-1/3 font-medium">Data Type</div>
          </div>
          <div className="max-h-[calc(100%-80px)] overflow-y-auto">
            {table.columns.map((column) => (
              <div
                key={column.name}
                id={`${table.id}-${column.name}`}
                className={`px-4 py-2 flex hover:bg-gray-50 cursor-move
                  ${draggedOver === column.name ? "bg-blue-50" : ""}`}
                draggable="true"
                onDragStart={handleColumnDragStart(column)}
                onDragOver={handleColumnDragOver(column.name)}
                onDragLeave={() => setDraggedOver(null)}
                onDrop={handleColumnDrop(column)}
              >
                <div className="w-12">
                  <input
                    type="checkbox"
                    checked={column.isChecked}
                    className="form-checkbox h-4 w-4 text-blue-600"
                    readOnly
                  />
                </div>
                <div className="flex-1">{column.name}</div>
                <div className="w-1/3 text-gray-500">{column.dataType}</div>
              </div>
            ))}
          </div>
        </div>
        {table.columns.length > 4 && (
          <div className="px-4 py-2 border-t text-center text-sm text-gray-500">Scroll to see more columns</div>
        )}
      </div>
    </Resizable>
  )
}

