import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState } from "react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart, Bar
} from "recharts";
import { getFormatted30MinWindow } from "../helpers/helpers";
import Link from "next/link";

type IProps = {
  data?: any
};

type RegionalForecastEntry = {
  from: string,
  to: string,
  regions: {
    regionid: number,
    shortname: string,
    dnoregion: string,
    intensity: {
      forecast: number,
      actual?: number,
      index: string
    },
    generationmix: [
      {
        fuel: string,
        perc: number
      }
    ]
  }[]
}

type FormattedRegionalData = {
  from: string,
  to: string,
  coal: number,
  gas: number,
  nuclear: number,
  oil: number,
  solar: number,
  wind: number,
  biomass: number,
  hydro: number,
  imports: number,
  other: number,
}

const toolTipLabels: Record<string, string> = {
  from: "Time Period",
  coal: "Coal",
  gas: "Gas",
  nuclear: "Nuclear",
  oil: "Oil",
  solar: "Solar",
  wind: "Wind",
  biomass: "Biomass",
  hydro: "Hydro",
  imports: "Imports",
  other: "Other",
};
const fuelColours: Record<string, string> = {
  coal: "#646464",
  gas: "#25c5ff",
  nuclear: "#d1ff99",
  oil: "#776556",
  solar: "#FFC425",
  wind: "#bedee5",
  biomass: "#409349",
  hydro: "#69c0ef",
  imports: "#FF6384",
  other: "#9575b9",
}
const fuelMixes = ["biomass", "coal", "gas", "hydro", "imports", "nuclear", "oil", "solar", "wind", "other"];

const RegionalForecast: NextPage<IProps> = ({}) => {
  const [data, setData] = useState<RegionalForecastEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [region1, setRegion1] = useState<number>(1);
  const [region2, setRegion2] = useState<number>(2);
  const now = new Date();
  const lastAvailableForecast = new Date(now.getTime() + 1000 * 60 * 60 * 48)
  useEffect(() => {
    // (async () => {
    const headers = {
      'Accept': 'application/json'
    };
    fetch(`http://localhost:3000/api/regional-forecast?date=${selectedDate.toISOString()}`, {
      method: 'GET',
      headers
    }).then((res) => res.json()).then((data) => {
      setData(data.data)
    });
    // })()
  }, [selectedDate])

  const formatData = (data: RegionalForecastEntry[], regionId: number) => {
    return data.map((entry) => {
      const selectedRegionEntry = entry.regions.find((region) => region.regionid === regionId) || entry.regions[0];
      const formattedEntry: any = {
        from: entry.from,
        to: entry.to,
        name: selectedRegionEntry.shortname,
      }
      fuelMixes.forEach((fuel) => {
        formattedEntry[fuel] = selectedRegionEntry.generationmix.find((mix) => mix.fuel === fuel)?.perc || 0;
      });
      return formattedEntry
    });
  }

  const formattedData1 = formatData(data, region1);
  const formattedData2 = formatData(data, region2);

  return (
    <div className="bg-black h-screen">
      <Head>
        <title>UK Carbon Intensity Forecast</title>
        <meta name="description" content="Displaying data from the CI API made available by National Grid"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main className="bg-black flex justify-center flex-col px-3 sm:px-6 py-3 relative">
        <div className="flex items-end sm:items-start justify-between flex-col-reverse sm:flex-row">
          <h1 className="text-3xl text-white center flex-1 p-4 pt-6">
            Regional Forecast for {selectedDate.toDateString()}
          </h1>
          <Link href={'/'}>See National Forecast</Link>
        </div>

        <div className="flex justify-end items-center">
          <label className="text-white mr-3">Select a date:</label>
          <input className="p-1" max={lastAvailableForecast.toISOString().slice(0, 10)} type="date"
                 value={selectedDate?.toISOString().slice(0, 10)}
                 onChange={(e) => setSelectedDate(e.target.valueAsDate || new Date())}/>
        </div>

        <div className="flex justify-center p-2 sm:p-4 flex-col sm:flex-row">
          <div className="flex flex-col text-white text-2xl" style={{minWidth: '30vh'}}>
            {!data?.length && <h2 className="h-96 flex flex-1 justify-center items-center">Loading...</h2>}
            {data?.length && data[0].regions.map((region) => {
              return <div className="flex justify-between items-center">
                <h4 className="">{region.shortname}</h4>
                <div className="flex">
                  <span className="p-2 cursor-pointer" onClick={() => setRegion1(region.regionid)}>{region.regionid === region1 ? '✅' : '☑️'}</span>
                  <span className="p-2 cursor-pointer" onClick={() => setRegion2(region.regionid)}>{region.regionid === region2 ? '✅' : '☑️'}</span>
                </div>
              </div>
            })}
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex-1 border border-gray-400 mx-2 sm:mx-4 my-3 relative">
              <CompareChart data={formattedData1}/>
            </div>
            <div className="flex-1 border border-gray-400 mx-2 sm:mx-4 my-3 relative">
              <CompareChart data={formattedData2}/>
            </div>
          </div>
        </div>

      </main>

      <footer className="flex py-6 justify-center">
        Powered by the&nbsp;
        <a href="https://carbonintensity.org.uk/" target="_blank" rel="noreferrer">Carbon Intensity API</a>
      </footer>
    </div>
  )
}

const CompareChart: React.FC<{ data: FormattedRegionalData[] }> = ({data}) => {
  return <ResponsiveContainer width="100%" height={400}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3"/>
      <XAxis dataKey="from" tickFormatter={(tick) => {
        if(tick === 'auto') return 'auto';

        return tick && new Date(tick) ? new Date(tick).toISOString().slice(11, 16) : ''
      }}/>
      <YAxis domain={[0, 100]} max={100} tickFormatter={(tick) => Math.floor(tick).toString()}/>
      <Tooltip content={({payload}) => {
        if (!payload?.length) return;

        const payloadData = payload && payload[0]?.payload;
        return <div className="p-2 bg-black bg-opacity-80 shadow">
          <ul className="">
            {Object.entries(payloadData)
              .map(([name, value]) => {
                let formattedVal = value;
                if (['to', 'name'].includes(name)) return;

                if (name === "from") formattedVal = getFormatted30MinWindow(value as string)
                return (
                  <li
                    className="font-bold"
                    key={`item-${name}`}
                    style={{color: fuelColours[name]}}
                  >
                    {`${toolTipLabels[name]}: ${formattedVal}`}
                  </li>
                );
              })}
          </ul>
        </div>
      }}/>
      <Legend margin={{top: 20, bottom: 30}} style={{paddingBottom: '30px'}}/>
      {fuelMixes.map((fuel) => <Bar dataKey={fuel} stackId="a" fill={fuelColours[fuel]}/>)}
    </BarChart>
  </ResponsiveContainer>
}

export default RegionalForecast
