"use client"

import { memo } from "react"

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

interface Props<T> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
}

export const DataTable = memo(function DataTable<T>({
  data,
  columns,
  keyField,
}: Props<T>) {
  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="text-left px-4 py-3 text-sm font-semibold text-gray-600"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr
              key={String(row[keyField])}
              className="border-t hover:bg-gray-50"
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-sm">
                  {col.render
                    ? col.render(row)
                    : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
