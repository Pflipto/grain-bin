"use client";
import {Area,AreaChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis} from "recharts";
import type {SharePoint} from "../lib/share-history";
import {fullDate,shortDate} from "../lib/format";
import "./ShareHistoryChart.css";
export default function ShareHistoryChart({points,description}:{points:SharePoint[];description:string}) {
  return <>
    <div className="share-history-chart"><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{width:650,height:310}}>
      <AreaChart data={points} stackOffset="expand" margin={{top:12,right:10,bottom:8,left:0}} accessibilityLayer aria-label={`${description} Use arrow keys to inspect dated shares.`}>
        <CartesianGrid vertical={false} stroke="var(--sb-line)"/>
        <XAxis dataKey="date" type="number" domain={["dataMin","dataMax"]} tickFormatter={shortDate} minTickGap={44} tick={{fontSize:10}} tickLine={false} axisLine={false} stroke="var(--sb-muted)"/>
        <YAxis domain={[0,1]} ticks={[0,.25,.5,.75,1]} tickFormatter={v=>`${v*100}%`} width={42} tick={{fontSize:10}} tickLine={false} axisLine={false} stroke="var(--sb-muted)"/>
        <Tooltip isAnimationActive={false} filterNull={false} labelFormatter={label=>`${fullDate(Number(label))} UTC`}
          formatter={value=>typeof value==="number"?`${value.toFixed(2)}%`:"Unavailable"}
          contentStyle={{background:"var(--sb-paper)",border:"1px solid var(--sb-line)",borderRadius:8,fontSize:11,width:175,maxWidth:"calc(100vw - 120px)",whiteSpace:"normal"}}
          labelStyle={{color:"var(--sb-muted)"}} itemStyle={{color:"var(--sb-silo)"}}/>
        <Area type="linear" dataKey="usdt" name="USDT" stackId="market" stroke="var(--sb-silo)" strokeWidth={1} fill="var(--sb-harvest)" fillOpacity={.85} connectNulls={false} isAnimationActive={false}/>
        <Area type="linear" dataKey="usdc" name="USDC" stackId="market" stroke="var(--sb-silo)" strokeWidth={1} fill="var(--sb-sage)" fillOpacity={.85} connectNulls={false} isAnimationActive={false}/>
        <Area type="linear" dataKey="others" name="Other coins" stackId="market" stroke="var(--sb-silo)" strokeWidth={1} fill="var(--sb-oxblood)" fillOpacity={.85} connectNulls={false} isAnimationActive={false}/>
      </AreaChart>
    </ResponsiveContainer></div>
    <div className="share-series" aria-label="Series"><span><i style={{background:"var(--sb-harvest)"}} aria-hidden="true"/>USDT</span><span><i style={{background:"var(--sb-sage)"}} aria-hidden="true"/>USDC</span><span><i style={{background:"var(--sb-oxblood)"}} aria-hidden="true"/>Other coins</span></div>
  </>;
}
