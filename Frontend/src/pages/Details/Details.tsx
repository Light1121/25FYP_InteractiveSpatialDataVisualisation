import type { FC } from 'react'
import { useState, useEffect } from 'react'
import LineChartBox from './_components/LineChartBox'
import { FullScreenLayout, MainLayout } from '@/_components'
import { usePinContext } from '@/_components/ContextHooks/usePinContext'
import type { PinData } from '@/_components/ContextHooks/contexts'
import type { RawWeatherEntry } from '@/pages/Details/_components/types'
import {
  DetailsContainer,
  FadeDiv,
  HeaderSection,
  Title,
  ContentGrid,
  GraphSection,
  GraphTitle,
  GraphBox,
  SliderContainer,
  SliderLabel,
  // TimeSlider,
  Spinner,
  TimeDisplay,
} from './_components/styles'

import TimeRangeSlider from './_components/TimeRangeSlider'

// ---------- Main Component ----------
const Details: FC = () => {
  const [contentVisible, setContentVisible] = useState(false)

  // ---------- Fade in ----------
  useEffect(() => {
    const fadeInContent = setTimeout(() => setContentVisible(true), 300)
    return () => clearTimeout(fadeInContent)
  }, [])

  // ---------- Year Range State ----------
  const [yearRanges, setYearRanges] = useState<Array<[number, number]>>([
    [2015, 2025], // Graph 0
    [2015, 2025], // Graph 1
    [2015, 2025], // Graph 2
    [2015, 2025], // Graph 3
  ])

  // Slider onChange handler
  const handleSliderChange = (
    graphIndex: number,
    newStart: number,
    newEnd: number,
  ) => {
    const updatedRanges = [...yearRanges]
    updatedRanges[graphIndex] = [newStart, newEnd]
    setYearRanges(updatedRanges)
  }

  // ---------- Fetch Weather Data ----------
  // const { locationOnePin, locationTwoPin } = usePinContext()
  // const selectedPin = locationOnePin ?? locationTwoPin
  // const [loading, setLoading] = useState(false)
  // const [error, setError] = useState<string | null>(null)
  const { locationOnePin, locationTwoPin } = usePinContext()
  // const selectedPin = locationOnePin ?? locationTwoPin
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState<
    {
      date: string
      temperature: number
      humidity: number
      wind_speed: number
      precipitation: number
      pinId: string
      locationName: string
    }[]
  >([])

  useEffect(() => {
    const pins = [locationOnePin, locationTwoPin].filter(Boolean) as PinData[]
    if (pins.length === 0) return

    const fetchWeatherForPin = async (pin: PinData) => {
      /// Step 1: Get nearest station for this pin
      const nearestRes = await fetch(
        `https://weatherjyjam-production.up.railway.app/api/weather/nearest?lat=${pin.position.lat}&lng=${pin.position.lng}`,
      )
      if (!nearestRes.ok)
        throw new Error(`Failed to fetch nearest station: ${nearestRes.status}`)

      const nearestJson = await nearestRes.json()
      if (nearestJson.status !== 'success') throw new Error(nearestJson.message)

      const stationName = nearestJson.data['Station Name']

      // Step 2: Get detailed weather data
      const stationRes = await fetch(
        `https://weatherjyjam-production.up.railway.app/api/weather/avg_${encodeURIComponent(stationName)}`,
      )
      if (!stationRes.ok)
        throw new Error(`Failed to fetch weather data: ${stationRes.status}`)

      const stationJson = await stationRes.json()
      if (stationJson.length === 0)
        throw new Error('Failed to retrieve weather data')

      // Step 3: Transform and tag data
      return stationJson.map((entry: RawWeatherEntry) => ({
        date: entry['Date'],
        temperature: Number(entry['Avg_Temperature']),
        humidity: Number(entry['Avg_Relative_Humidity']),
        wind_speed: Number(entry['Avg_Wind_Speed']),
        precipitation: Number(entry['Avg_Rainfall']),
        pinId: pin.id,
        locationName: pin.locationName,
      }))
    }

    const fetchAllWeatherData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch in parallel for all available pins
        const results = await Promise.all(pins.map(fetchWeatherForPin))
        // Combine both (or single) datasets into one
        const combined = results.flat()
        setWeatherData(combined)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'An unexpected error occurred')
        } else {
          setError('An unexpected error occurred')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAllWeatherData()
  }, [locationOnePin, locationTwoPin])

  // // Fetch data when selectedPin changes
  // useEffect(() => {
  //   if (!selectedPin) return
  //   const fetchWeatherData = async () => {
  //     setLoading(true)
  //     setError(null)

  //     try {
  //       // Step 1: Get nearest station
  //       const nearestRes = await fetch(
  //         `https://weatherjyjam-production.up.railway.app/api/weather/nearest?lat=${selectedPin.position.lat}&lng=${selectedPin.position.lng}`,
  //       )
  //       if (!nearestRes.ok)
  //         throw new Error(
  //           `Failed to fetch nearest station: ${nearestRes.status}`,
  //         )
  //       const nearestJson = await nearestRes.json()
  //       if (nearestJson.status !== 'success')
  //         throw new Error(nearestJson.message)

  //       const stationName = nearestJson.data['Station Name']

  //       // Step 2: Get detailed weather data by station name
  //       console.log(`https://weatherjyjam-production.up.railway.app/api/weather/avg_${encodeURIComponent(stationName)}`)
  //       const stationRes = await fetch(
  //         `https://weatherjyjam-production.up.railway.app/api/weather/avg_${encodeURIComponent(stationName)}`,
  //       )
  //       if (!stationRes.ok)
  //         throw new Error(`Failed to fetch weather data: ${stationRes.status}`)
  //       const stationJson = await stationRes.json()

  //       if (stationJson.length === 0)
  //         throw new Error('Failed to retrieve weather data')

  //       // Transform the data
  //       const formatted: FormattedWeatherData[] = stationJson.map(
  //         (entry: RawWeatherEntry) => ({
  //           date: entry['Date']!,
  //           temperature: Number(entry['Avg_Temperature'])!,
  //           humidity: Number(entry['Avg_Relative_Humidity'])!,
  //           wind_speed: Number(entry['Avg_Wind_Speed'])!,
  //           precipitation: Number(entry['Avg_Rainfall'])!,
  //         }),
  //       )

  //       setWeatherData(formatted)
  //     } catch (err: unknown) {
  //       if (err instanceof Error) {
  //         setError(err.message)
  //       } else {
  //         setError(String(err))
  //       }
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  //   fetchWeatherData()
  // }, [selectedPin])

  // ---------- Graph Component ----------

  const GraphComponent: FC<{
    title: string
    graphIndex: number
    metric: 'temperature' | 'humidity' | 'wind_speed' | 'precipitation'
  }> = ({ title, graphIndex, metric }) => {
    const [startYear, endYear] = yearRanges[graphIndex] || [2015, 2025]

    // Filter weatherData according to the selected range
    const filteredData = weatherData.filter((entry) => {
      const year = Number(entry.date.split('-')[0])
      return year >= startYear && year <= endYear
    })

    return (
      <GraphSection>
        <GraphTitle>{title}</GraphTitle>

        <GraphBox>
          {/* Linechart box itself*/}
          {loading ? (
            <div>
              <Spinner />
              <p
                style={{
                  textAlign: 'center',
                  fontWeight: 500,
                  color: '#007acc',
                }}
              >
                Loading weather data...
              </p>
            </div>
          ) : error ? (
            <p style={{ textAlign: 'center', color: 'red' }}>Error: {error}</p>
          ) : (
            <div>
              <LineChartBox metric={metric} data={filteredData} />
            </div>
          )}
        </GraphBox>
        <SliderContainer>
          <SliderLabel>Select Year Range</SliderLabel>

          <TimeRangeSlider
            graphIndex={graphIndex}
            yearRange={yearRanges[graphIndex]}
            onYearRangeChange={(range) =>
              handleSliderChange(graphIndex, range[0], range[1])
            }
            minYear={2015}
            maxYear={2025}
          />
          <TimeDisplay>
            {startYear} - {endYear}
          </TimeDisplay>
        </SliderContainer>
      </GraphSection>
    )
  }

  // ---------- Main Render ----------
  return (
    <FullScreenLayout>
      <MainLayout>
        <DetailsContainer>
          <HeaderSection>
            <Title>Weather Data Analysis</Title>
          </HeaderSection>

          <FadeDiv $visible={contentVisible} $delay={200}>
            <ContentGrid>
              <GraphComponent
                title="Temperature Trends"
                graphIndex={0}
                metric="temperature"
              />
              <GraphComponent
                title="Humidity Patterns"
                graphIndex={1}
                metric="humidity"
              />
              <GraphComponent
                title="Wind Speed Analysis"
                graphIndex={2}
                metric="wind_speed"
              />
              <GraphComponent
                title="Precipitation Data"
                graphIndex={3}
                metric="precipitation"
              />
            </ContentGrid>
          </FadeDiv>
        </DetailsContainer>
      </MainLayout>
    </FullScreenLayout>
  )
}

export default Details
