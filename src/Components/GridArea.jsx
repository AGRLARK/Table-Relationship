import { useState, useRef, useCallback, useEffect } from "react"
import TableCard from "./TableCard"
import Xarrow, { Xwrapper, useXarrow } from "react-xarrows"  
import { toast } from "react-hot-toast"

const GRID_SIZE = 20

export default function GridArea({ tables, onDrop, onRemoveTable, onTableMove }) {
    const updateXarrow = useXarrow(); 
    const gridRef = useRef(null)
    const [isDraggingOver, setIsDraggingOver] = useState(false)
    const [relationships, setRelationships] = useState([])
    const [draggingTableId, setDraggingTableId] = useState(null)
    const [tablePositions, setTablePositions] = useState({})

    useEffect(() => {
        updateXarrow();
    }, [tablePositions, updateXarrow]);

    const updateTablePosition = useCallback((tableId, position) => {
        setTablePositions(prev => ({
            ...prev,
            [tableId]: position
        }));
        updateXarrow();
    }, [updateXarrow])

    useEffect(() => {
        const positions = {}
        tables.forEach(table => {
            positions[table.id] = table.position
        })
        setTablePositions(positions)
    }, [tables])

    const snapToGrid = (x, y) => {
        return {
            x: Math.round(x / GRID_SIZE) * GRID_SIZE,
            y: Math.round(y / GRID_SIZE) * GRID_SIZE,
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDraggingOver(false)

        const tableData = e.dataTransfer.getData("table")
        if (!tableData || !gridRef.current) return

        const table = JSON.parse(tableData)
        const rect = gridRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const { x: gridX, y: gridY } = snapToGrid(x, y)

        if (tables.some((t) => t.id === table.id)) {
            toast.error("Table already exists in the grid")
            const existingTable = document.getElementById(`table-${table.id}`)
            if (existingTable) {
                existingTable.classList.add("highlight-table")
                setTimeout(() => {
                    existingTable.classList.remove("highlight-table")
                }, 2000)
            }
        } else {
            onDrop(table, { x: gridX, y: gridY, width: "20%", height: "35%" })
        }
    }

    const handleColumnDrop = (sourceTableId, sourceColumnName, targetTableId, targetColumnName) => {
        const relationshipId = `${sourceTableId}-${sourceColumnName}-${targetTableId}-${targetColumnName}`
        const reverseId = `${targetTableId}-${targetColumnName}-${sourceTableId}-${sourceColumnName}`

        if (!relationships.some((rel) => rel.id === relationshipId || rel.id === reverseId)) {
            setRelationships((prev) => [
                ...prev,
                {
                    id: relationshipId,
                    start: `${sourceTableId}-${sourceColumnName}`,
                    end: `${targetTableId}-${targetColumnName}`,
                },
            ])
        }
    }
 
    const handleTableDrag = useCallback((e, tableId) => {
        if (!gridRef.current) return

        const rect = gridRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const { x: gridX, y: gridY } = snapToGrid(x, y)
        updateTablePosition(tableId, {
            ...tablePositions[tableId],
            x: gridX,
            y: gridY
        });
        requestAnimationFrame(updateXarrow);
    }, [tablePositions, updateTablePosition, updateXarrow])

    const handleTableDragEnd = (e, tableId) => {
        if (!gridRef.current) return

        const rect = gridRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const { x: gridX, y: gridY } = snapToGrid(x, y)

        onTableMove(tableId, {
            ...tablePositions[tableId],
            x: gridX,
            y: gridY
        })
        setDraggingTableId(null)
    }

    const handleTableResize = useCallback(
        (tableId, size) => {
            updateTablePosition(tableId, {
                ...tablePositions[tableId],
                width: size.width,
                height: size.height
            })
            onTableMove(tableId, {
                ...tablePositions[tableId],
                width: size.width,
                height: size.height
            })
            updateXarrow();
        },
        [onTableMove, tablePositions, updateTablePosition, updateXarrow]
    )

    return (
        <div
            ref={gridRef}
            className={`flex-1 p-6 relative overflow-auto min-h-screen ${isDraggingOver ? "bg-accent/10" : ""}`}
            style={{
                backgroundImage:
                    "linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)",
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            }}
            onDragOver={(e) => {
                e.preventDefault()
                setIsDraggingOver(true)
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
        >
            <Xwrapper>
                {tables.map((table) => (
                    <TableCard
                        key={table.id}
                        table={table}
                        onClose={() => {
                            setRelationships((prev) =>
                                prev.filter((rel) => !rel.start.startsWith(table.id) && !rel.end.startsWith(table.id)),
                            )
                            onRemoveTable(table.id)
                        }}
                        onColumnDrop={handleColumnDrop}
                        style={{
                            position: "absolute",
                            left: tablePositions[table.id]?.x ?? table.position.x,
                            top: tablePositions[table.id]?.y ?? table.position.y,
                            width: tablePositions[table.id]?.width ?? (table.position.width || "20%"),
                            height: tablePositions[table.id]?.height ?? (table.position.height || "35%"),
                            transition: draggingTableId === table.id ? "none" : "all 0.2s ease",
                            zIndex: draggingTableId === table.id ? 10 : 1,
                        }}
                        onDrag={(e) => handleTableDrag(e, table.id)}
                        onDragEnd={(e) => {
                            handleTableDragEnd(e, table.id);
                            updateXarrow();
                        }}
                        onResize={(tableId, size) => {
                            handleTableResize(tableId, size);
                            updateXarrow();
                        }}
                    />
                ))}
                {relationships.map((rel) => (
                    <Xarrow
                        key={rel.id}
                        start={rel.start}
                        end={rel.end}
                        color="#f97316"
                        strokeWidth={2}
                        path="smooth"
                        startAnchor="right"
                        endAnchor="left"
                        showHead={false}
                        animateDrawing={0.2}
                    />
                ))}
            </Xwrapper>
        </div>
    )
}