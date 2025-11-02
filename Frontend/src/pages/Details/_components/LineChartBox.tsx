import type { FC } from 'react'
import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Label,
  Legend,
  type LegendPayload,
} from 'recharts'

interface MultiPinWeatherData {
  date: string
  temperature?: number
  humidity?: number
  wind_speed?: number
  precipitation?: number
  pinId: string
  locationName: string
}

interface LineChartBoxProps {
  metric: keyof Pick<
    MultiPinWeatherData,
    'temperature' | 'humidity' | 'wind_speed' | 'precipitation'
  >
  data: MultiPinWeatherData[]
  color?: string
}

type FormattedDataRow = {
  date: string
  [key: string]: string | number | undefined
}

const metricLabels: Record<string, string> = {
  temperature: 'Temperature (°C)',
  humidity: 'Humidity (%)',
  wind_speed: 'Wind Speed (m/s)',
  precipitation: 'Precipitation (mm)',
}

const colors = ['#007acc', '#e67e22']

const LineChartBox: FC<LineChartBoxProps> = ({ metric, data }) => {
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const [showExtra, setShowExtra] = useState(false)

  // Get unique pin names
  const pins: string[] = Array.from(new Set(data.map((d) => d.locationName)))
  const locations = Array.from(new Set(data.map((d) => d.locationName)))
    .filter(Boolean)
    .slice(0, 2)

  // Group data by pin
  const groupedData: Record<string, MultiPinWeatherData[]> = {}
  for (const d of data) {
    if (!groupedData[d.locationName]) groupedData[d.locationName] = []
    groupedData[d.locationName].push(d)
  }

  // Collect all dates across pins
  const allDates: string[] = Array.from(new Set(data.map((d) => d.date))).sort()

  // Merge into a single dataset for Recharts
  const mergedData = allDates.map((date: string) => {
    const entry: Record<string, string | number | undefined> = { date }
    for (const pin of pins) {
      const found = groupedData[pin]?.find(
        (d: MultiPinWeatherData) => d.date === date,
      )
      if (found) entry[pin] = found[metric]
    }
    return entry
  })

  // Handle no data / no pins case
  const hasData = data.length > 0 && locations.length > 0

  if (!hasData) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '16px',
          fontWeight: 500,
        }}
      >
        Please select a location
      </div>
    )
  }

  // Handle legend click
  const handleLegendClick = (o: LegendPayload) => {
    const key = o.dataKey as string
    setHighlighted((prev) => (prev === key ? null : key))
  }

  // Format x-axis labels
  const years = data.map((row) => row.date.split('-')[0])
  const uniqueYears = Array.from(new Set(years))
  const multipleYears = uniqueYears.length > 1

  // Regression function
  const computeRegression = (data: { date: string; value: number }[]) => {
    const n = data.length
    if (n === 0) return []

    const xVals = data.map((_, idx) => idx)
    const yVals = data.map((d) => d.value)
    const xMean = xVals.reduce((sum, x) => sum + x, 0) / n
    const yMean = yVals.reduce((sum, y) => sum + y, 0) / n

    let numerator = 0
    let denominator = 0
    for (let i = 0; i < n; i++) {
      numerator += (xVals[i] - xMean) * (yVals[i] - yMean)
      denominator += (xVals[i] - xMean) ** 2
    }
    const slope = numerator / denominator
    const intercept = yMean - slope * xMean

    return data.map((d, i) => ({ date: d.date, value: slope * i + intercept }))
  }

  // // Format for display
  // const formattedData: FormattedDataRow[] = mergedData.map((row) => {
  //   const [year, month] = String(row.date).split('-')
  //   const monthName = new Date(`${year}-${month}-01`).toLocaleString('en-US', {
  //     month: 'short',
  //     year: multipleYears ? 'numeric' : undefined,
  //   })

  //   return {
  //     ...row,
  //     // keep full ISO date for sorting and unique key
  //     fullDate: `${year}-${month}-01`,
  //     displayDate: monthName,
  //   }
  // })

  const formattedData: FormattedDataRow[] = mergedData.map((row) => {
    const [year, month] = String(row.date).split('-')
    const monthName = new Date(`${year}-${month}-01`).toLocaleString('en-US', {
      month: 'short',
      year: multipleYears ? 'numeric' : undefined,
    })

    return {
      ...row,
      date: monthName, // this replaces "2025-01-01" with "Jan"
    }
  })

  /// For each location, compute regression and map date value
  const regressionByLocation = Object.fromEntries(
    locations.map((loc) => {
      const reg = computeRegression(
        formattedData.map((d) => ({
          date: d.date, // keep as string, not new Date()
          value: Number(d[loc]),
        })),
      )

      // Convert to lookup by time for merging
      const lookup = Object.fromEntries(
        reg.map((r) => [new Date(r.date).getTime(), r.value]),
      )

      return [loc, lookup]
    }),
  )

  // Merge regression data back into formattedData
  const combinedData = formattedData.map((d) => {
    const time = new Date(d.date).getTime()
    const regressionValues = Object.fromEntries(
      locations.map((loc) => [
        `${loc}_reg`,
        regressionByLocation[loc]?.[time] ?? null,
      ]),
    )
    return { ...d, ...regressionValues }
  })

  console.log(combinedData)

  // const statsData: StatsDataRow[] = formattedData.map(d => {
  //   const values = locations.map(loc => Number(d[loc])).filter(v => !isNaN(v))
  //   const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  //   const std =
  //     Math.sqrt(
  //       values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  //     ) || 0
  //   return {
  //     date: d.date,
  //     mean,
  //     std
  //   }
  // })

  // If two locations exist, compute difference (A - B)
  if (locations.length === 2) {
    const [locA, locB] = locations
    combinedData.forEach((d) => {
      const a = Number(d[locA]) || Number(d[locB]) || 0
      const b = Number(d[locB]) || Number(d[locA]) || 0
      d.difference = Math.abs(a - b)
    })
  }

  // Compute min/max from main lines only
  const allValues: number[] = []
  locations.forEach((loc) => {
    formattedData.forEach((d) => {
      const val = Number(d[loc])
      if (!isNaN(val)) allValues.push(val)
    })
  })
  const yMin = Math.min(...allValues)
  const yMax = Math.max(...allValues)
  const paddingFactor = 0.1 // 10%
  const yMinPadded = yMin - (yMax - yMin) * paddingFactor
  const yMaxPadded = yMax + (yMax - yMin) * paddingFactor

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <button
        onClick={() => setShowExtra((prev) => !prev)}
        style={{ marginBottom: 8 }}
      >
        {showExtra ? 'Hide Extra Details' : 'Show Extra Details'}
      </button>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={combinedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          {/* Grid */}
          <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />

          {/* X Axis */}
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#555' }}
            interval={Math.floor(formattedData.length / 6)}
          >
            <Label
              value="Month"
              offset={-10}
              position="insideBottom"
              style={{ fontWeight: 'bold', fill: '#333' }}
            />
          </XAxis>

          {/* Y Axis */}
          <YAxis
            tick={{ fontSize: 12, fill: '#555' }}
            domain={[Math.round(yMinPadded), Math.round(yMaxPadded)]}
            tickFormatter={(value: number) => value.toFixed(1)}
          >
            <Label
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: 'middle', fontWeight: 'bold', fill: '#333' }}
              value={metricLabels[metric]}
            />
          </YAxis>

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: '#f0f8ff',
              borderRadius: '8px',
              border: '1px solid #007acc',
            }}
            labelStyle={{ fontWeight: 'bold' }}
          />

          {/* Legend */}
          <Legend verticalAlign="top" height={36} onClick={handleLegendClick} />

          {/* Each line now uses a field in formattedData */}
          {locations.map((loc, idx) => (
            <Line
              key={loc}
              type="monotone"
              dataKey={loc} //  this references the mergedData column
              name={loc}
              stroke={colors[idx]}
              strokeWidth={highlighted === loc ? 3 : 2}
              strokeOpacity={highlighted && highlighted !== loc ? 0.3 : 1}
              dot={false}
              onClick={() =>
                setHighlighted((prev) => (prev === loc ? null : loc))
              }
              style={{ cursor: 'pointer' }}
            />
          ))}

          {/* Dotted difference line */}
          {locations.length === 2 && (
            <Line
              type="monotone"
              dataKey="difference"
              stroke="#555"
              strokeWidth={highlighted === 'difference' ? 3 : 2}
              strokeDasharray="5 5"
              dot={false}
              opacity={highlighted && highlighted !== 'difference' ? 0.3 : 0.6}
              name={`Difference`}
              onClick={() =>
                setHighlighted((prev) =>
                  prev === 'difference' ? null : 'difference',
                )
              }
              style={{ cursor: 'pointer' }}
            />
          )}

          {/* Regression line */}
          {showExtra &&
            locations.map((loc, idx) => (
              <Line
                key={`regression-${loc}`}
                type="linear"
                dataKey={`${loc}_reg`} //  use merged field name
                name={`${loc} Trend`}
                stroke={colors[idx]}
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                opacity={0.6}
              />
            ))}

          {/* std band */}
          {/* {showExtra && (
            <div>
              <Area
              type="monotone"
              dataKey={(row) => row.mean + row.std}
              data={statsData}
              stroke="none"
              fill="#8884d8"
              fillOpacity={0.2}
              />
              <Area
                type="monotone"
                dataKey={(row) => row.mean - row.std}
                data={statsData}
                stroke="none"
                fill="#fff"
                fillOpacity={1}
              />
            </div>
            
          )} */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LineChartBox
