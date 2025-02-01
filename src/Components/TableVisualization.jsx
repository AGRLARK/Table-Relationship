import { useState } from "react"
import Sidebar from "./Sidebar"
import GridArea from "./GridArea"
const mockTables = [
  {
    id: "employee_salary",
    name: "employee_salary",
    columns: [
      { name: "age", dataType: "INTEGER", isChecked: true },
      { name: "emp_id", dataType: "INTEGER", isChecked: true },
      { name: "experience", dataType: "INTEGER", isChecked: true },
      { name: "salary", dataType: "INTEGER", isChecked: true },
      { name: "bonus", dataType: "INTEGER", isChecked: true },
    ],
  },
  {
    id: "employee",
    name: "employee",
    columns: [
      { name: "id", dataType: "INTEGER", isChecked: true },
      { name: "name", dataType: "VARCHAR", isChecked: true },
      { name: "department", dataType: "VARCHAR", isChecked: true },
      { name: "salary", dataType: "VARCHAR", isChecked: true },
    ],
  },
  {
    id: "patients",
    name: "patients",
    columns: [
      { name: "id", dataType: "INTEGER", isChecked: true },
      { name: "name", dataType: "VARCHAR", isChecked: true },
      { name: "age", dataType: "INTEGER", isChecked: true },
      { name: "condition", dataType: "VARCHAR", isChecked: true },
      { name: "purpose", dataType: "VARCHAR", isChecked: true },
    ],
  },
]

export default function TableVisualization() {
  const [gridTables, setGridTables] = useState([])

  const handleTableDrop = (table, position) => {
    if (gridTables.some((t) => t.id === table.id)) {
      setGridTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, position } : t)))
    } else {
      setGridTables((prev) => [
        ...prev,
        {
          ...table,
          position,
        },
      ])
    }
  }

  const handleRemoveTable = (id) => {
    setGridTables((prev) => prev.filter((table) => table.id !== id))
  }

  const handleTableMove = (id, newPosition) => {
    setGridTables((prev) => prev.map((table) => (table.id === id ? { ...table, position: newPosition } : table)))
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar tables={mockTables} onTableDragStart={() => { }} />
      <GridArea
        tables={gridTables}
        onDrop={handleTableDrop}
        onRemoveTable={handleRemoveTable}
        onTableMove={handleTableMove}
      />
    </div>
  )
}

