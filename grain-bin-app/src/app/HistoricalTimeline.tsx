"use client";
import {useState} from "react";
import type {HistoryPoint} from "../lib/calc";
import {buildTimeline,eventsInWindow,type MarketEvent} from "../lib/timeline";
import {fullDate,money} from "../lib/format";
import HistoricalChart from "./HistoricalChart";
import "./HistoricalTimeline.css";

export default function HistoricalTimeline({history,events}:{history:HistoryPoint[];events:MarketEvent[]}) {
  const [range,setRange]=useState<"all"|"year">("all");
  const m=buildTimeline(history,range);
  if(m.start===null||m.end===null||!m.high||!m.low)return <p className="empty-data">Not enough valid aggregate history to chart.</p>;
  const shown=eventsInWindow(events,m.start,m.end).map((event,index)=>({...event,markerNumber:index+1}));
  const markers=shown.filter(event=>(event.importance??1)<=(range==="year"?2:1));
  return <>
    <div className="timeline-range" role="group" aria-label="Historical chart range">
      <button type="button" aria-pressed={range==="year"} onClick={()=>setRange("year")}>1 year</button>
      <button type="button" aria-pressed={range==="all"} onClick={()=>setRange("all")}>All history</button>
    </div>
    <p className="chart-topline">{fullDate(m.start)} – {fullDate(m.end)} UTC · Source: DefiLlama</p>
    {m.points.length>1?<HistoricalChart points={m.points} high={m.high} low={m.low} events={markers}
      description={`Historical USD-pegged circulating value from ${fullDate(m.start)} to ${fullDate(m.end)}. Missing observations are gaps. ${shown.length} editorial event annotations are available below; proximity does not establish causation.`}/>:<p className="empty-data">Not enough observations to chart this range.</p>}
    <p className="data-note chart-extrema tabular"><span>Low {money(m.low.supply)} · {fullDate(m.low.date)}</span><span>High {money(m.high.supply)} · {fullDate(m.high.date)}</span></p>
    {shown.length?<details className="timeline-event-disclosure"><summary>Explore {shown.length} historical events</summary><ol className="timeline-events" aria-label="Historical events">{shown.map(event=><li key={event.id}><div><time dateTime={event.datePrecision==="month"?event.date.slice(0,7):event.date}>{event.datePrecision==="month"?new Intl.DateTimeFormat("en-US",{month:"short",year:"numeric",timeZone:"UTC"}).format(Date.parse(`${event.date}T00:00:00Z`)):fullDate(Date.parse(`${event.date}T00:00:00Z`))}</time><strong>{event.label}</strong>{event.summary&&<p>{event.summary}</p>}</div></li>)}</ol></details>:<p className="data-note">No event annotations in this range.</p>}

    <p className="data-note">The axis starts at the earliest available aggregate observation. Earlier supply is unavailable, not zero. Provider coverage can change over time; these values reflect the reported dataset. Event timing provides context and does not establish a cause for market moves.</p>
  </>;
}
