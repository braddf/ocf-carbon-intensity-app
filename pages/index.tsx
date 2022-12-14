import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState } from "react";
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Legend
} from "recharts";
import { calculatePercentageDifference, getFormatted30MinWindow } from "../helpers/helpers";
import Link from "next/link";
import { LoadingSpinner } from "../components/LoadingSpinner";

type IProps = {
  data?: any
};

type ForecastEntry = {
  from: string,
  to: string,
  intensity: {
    forecast: number,
    actual: number,
    index: string
  }
}

const toolTipLabels: Record<string, string> = {
  FROM: "Time",
  ACTUAL: "Actual",
  FORECAST: "Forecast",
  PERCENTAGE: "% Difference",
  INDEX: "Carbon Intensity Index",
};
const legendLabels: Record<string, string> = {
  ACTUAL: "Actual / gCO2/kWh",
  FORECAST: "Forecast / gCO2/kWh",
  PERCENTAGE: "Forecast / gCO2/kWh",
};
const graphColors: Record<string, string> = {
  ACTUAL: "#2a68b4",
  FORECAST: "#FFC425",
  INDEX: "white",
  PERCENTAGE: "white",
};

const Home: NextPage<IProps> = ({}) => {
  const [data, setData] = useState<ForecastEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const now = new Date();
  const lastAvailableForecast = new Date(now.getTime() + 1000 * 60 * 60 * 48)
  useEffect(() => {
    // (async () => {
    setLoading(true);
    const headers = {
      'Accept': 'application/json'
    };
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/daily-forecast?date=${selectedDate.toISOString()}`, {
      method: 'GET',
      headers
    }).then((res) => res.json()).then((data) => {
      setData(data.data)
      setLoading(false);
    }).catch((err) => {
      console.log(err)
      setLoading(false);
    });
    // })()
  }, [selectedDate])
  return (
    <div className="bg-black h-screen">
      <Head>
        <title>UK Carbon Intensity Forecast</title>
        <meta name="description" content="Displaying data from the CI API made available by National Grid"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main className="bg-black flex justify-center flex-col px-2 sm:px-6 py-3 relative">
        <div className="flex items-end sm:items-start justify-between flex-col-reverse sm:flex-row">
          <h1 className="text-3xl text-white center flex-1 p-4 pt-6">
            UK Daily Forecast for {selectedDate.toDateString()}
          </h1>
          <Link href={'/regional'}>See Regional Forecasts</Link>
        </div>

        <div className="flex justify-end items-center">
          <label className="text-white mr-3">Select a date:</label>
          <input className="p-1" max={lastAvailableForecast.toISOString().slice(0, 10)} type="date"
                 value={selectedDate?.toISOString().slice(0, 10)}
                 onChange={(e) => setSelectedDate(e.target.valueAsDate || new Date())}/>
        </div>

        {!data?.length && <h2 className="h-96 flex justify-center items-center">Loading...</h2>}

        {loading && <LoadingSpinner/>}
        {data && data[0] && <ForecastLineChart data={data} selectedDate={selectedDate as Date}/>}

      </main>

      <footer className="flex py-6 justify-center">
        Powered by the&nbsp;
        <a href="https://carbonintensity.org.uk/" target="_blank" rel="noreferrer">Carbon Intensity API</a>
      </footer>
    </div>
  )
}

const ForecastLineChart: React.FC<{ data: ForecastEntry[], selectedDate: Date }> = ({data, selectedDate}) => {
  let startOfDay = new Date(data[0].from).setHours(0, 0, 0, 0);
  let nowDate = new Date()
  const now = nowDate.getTimezoneOffset() ? nowDate.getTime() : nowDate.getTime() + 1000 * 60 * 60
  let endOfToday = startOfDay + 1000 * 60 * 60 * 24
  const dayTicks = [
    new Date(startOfDay).setHours(1, 0, 0, 0),
    new Date(startOfDay).setHours(5, 0, 0, 0),
    new Date(startOfDay).setHours(9, 0, 0, 0),
    new Date(startOfDay).setHours(13, 0, 0, 0),
    new Date(startOfDay).setHours(17, 0, 0, 0),
    new Date(startOfDay).setHours(21, 0, 0, 0),
    endOfToday + 1000 * 60 * 60
  ];

  return <ResponsiveContainer width="100%" aspect={1.5}>
    <LineChart
      width={500}
      height={400}
      data={data.map(d => {
        let from = new Date(d.from)
        if (from.getTimezoneOffset() < 0) {
          from.setHours(from.getHours() + 1);
        }
        return {
          FROM: from.getTime(),
          FORECAST: d.intensity.forecast,
          ACTUAL: d.intensity.actual,
          INDEX: d.intensity.index,
          PERCENTAGE: `${calculatePercentageDifference(d.intensity.actual, d.intensity.forecast)}%`
        }
      })}
    >
      <CartesianGrid verticalFill={["#545454", "#6C6C6C"]} fillOpacity={0.5}/>
      <XAxis
        dataKey="FROM"
        type="number"
        domain={[selectedDate.setHours(1, 0, 0, 0), endOfToday]}
        ticks={dayTicks}
        tickFormatter={(tick) => new Date(tick).toISOString().slice(11, 16)}
      />
      <YAxis/>

      {selectedDate.getDate() === new Date().getDate() && <ReferenceLine
        x={now}
        stroke="white"
        strokeWidth={1}
        strokeDasharray="3 3"
      />}

      <Line type="monotone" dataKey="FORECAST" stroke={graphColors['FORECAST']} activeDot={{r: 8}}/>
      <Line type="monotone" dataKey="ACTUAL" stroke={graphColors['ACTUAL']}/>

      <Tooltip
        content={({payload}) => {
          const data = payload && payload[0]?.payload;
          if (!data) return <div></div>;
          return (
            <div className="p-2 bg-black bg-opacity-80 shadow">
              <ul className="">
                {Object.entries(data)
                  .map(([name, value]) => {
                    let formattedVal = value;
                    if (name === "FROM") formattedVal = getFormatted30MinWindow(value as string)
                    if (name === "PERCENTAGE" && typeof value === 'string' && value.includes('Infinity')) return;

                    return (
                      <li
                        className="font-bold"
                        key={`item-${name}`}
                        style={{color: graphColors[name]}}
                      >
                        {`${toolTipLabels[name]}: ${formattedVal}`}
                      </li>
                    );
                  })}
              </ul>
            </div>
          );
        }}
      />
      <Legend verticalAlign="top" align="right" formatter={(value) => legendLabels[value]}/>
    </LineChart>
  </ResponsiveContainer>
}

export default Home
