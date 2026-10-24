"use client";

import {
  CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import type { HistoryPoint } from "../lib/calc";
import { fullDate, money, shortDate } from "../lib/format";
import type { MarketEvent } from "../lib/timeline";

type Props = {
  points: {date:number; supply:number|null}[];
  high: HistoryPoint;
  low: HistoryPoint;
  description: string;
  events?: MarketEvent[];
};
const exactMoney = new Intl.NumberFormat("en-US", {
  style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2,
});

export default function HistoricalChart({points,high,low,description,events=[]}:Props) {
  return <div className="interactive-history">
    <div className="history-plot">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{width:900,height:340}}>
        <LineChart data={points} margin={{top:18,right:16,bottom:12,left:0}}
          accessibilityLayer aria-label={`${description} Use left and right arrow keys to inspect snapshots.`}>
          <CartesianGrid vertical={false} stroke="var(--sb-line)"/>
          <XAxis dataKey="date" type="number" domain={["dataMin","dataMax"]}
            tickFormatter={shortDate} minTickGap={44} tickLine={false} axisLine={false}
            stroke="var(--sb-muted)" tick={{fontSize:11}}/>
          <YAxis domain={["auto","auto"]} tickFormatter={money} width={72}
            tickLine={false} axisLine={false} stroke="var(--sb-muted)" tick={{fontSize:11}}/>
          <Tooltip isAnimationActive={false} filterNull={false}
            cursor={{stroke:"var(--sb-muted)",strokeDasharray:"3 3"}}
            labelFormatter={label=>`${fullDate(Number(label))} UTC`}
            formatter={value=>[typeof value==="number"?exactMoney.format(value):"Unavailable","Circulating value"]}
            contentStyle={{background:"var(--sb-paper)",border:"1px solid var(--sb-line)",borderRadius:8,padding:"12px 16px",fontSize:12,lineHeight:1.7,width:220,maxWidth:"calc(100vw - 140px)",whiteSpace:"normal"}}
            labelStyle={{color:"var(--sb-muted)"}} itemStyle={{color:"var(--sb-silo)"}}
            wrapperStyle={{maxWidth:"100%",outline:"none"}}/>
          <Line type="linear" dataKey="supply" name="Circulating value" stroke="var(--sb-silo)" strokeWidth={2}
            dot={false} activeDot={{r:5,fill:"var(--sb-harvest)",stroke:"var(--sb-silo)",strokeWidth:2}}
            connectNulls={false} isAnimationActive={false}/>
          {events.map((event,index)=><ReferenceLine key={event.id} x={Date.parse(`${event.date}T00:00:00Z`)} stroke="var(--sb-muted)" strokeDasharray="4 4"
            label={{value:String(index+1),position:"insideBottomRight",fill:"var(--sb-silo)",fontSize:11}}/>)}
          <ReferenceDot x={high.date} y={high.supply} r={4} fill="var(--sb-silo)" stroke="var(--sb-paper)" strokeWidth={2}/>
          <ReferenceDot x={low.date} y={low.supply} r={4} fill="var(--sb-silo)" stroke="var(--sb-paper)" strokeWidth={2}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>;
}
